import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { SITE, formatPrice, isValidPhone } from '../config/site';
import { useCollection } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import OrderView from '../components/OrderView';
import { LogoutIcon } from '../components/Icons';
import useTitle from '../hooks/useTitle';

export function Login() {
  const { login, register, user } = useAuth();
  const [params] = useSearchParams();
  const nextUrl = params.get('next') || '/account';
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useTitle(mode === 'login' ? 'Log In' : 'Create Account');

  if (user) return <Navigate to={nextUrl} replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'register') {
      if (!isValidPhone(form.phone)) return setError('Enter a valid Sri Lankan mobile number (07X XXX XXXX).');
      if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    }
    setBusy(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form);
      navigate(nextUrl, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container auth-page">
      <div className="auth-card">
        <img src="/logo-256.png" alt="" className="auth-logo" />
        <div className="tabs auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); }}>Log In</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); }}>Register</button>
        </div>
        <form className="stack" onSubmit={submit}>
          {mode === 'register' && (
            <>
              <input className="input" required placeholder="Full name" value={form.name} onChange={set('name')} autoComplete="name" />
              <input className="input" required placeholder="Mobile number (07X XXX XXXX)" value={form.phone} onChange={set('phone')} autoComplete="tel" />
            </>
          )}
          <input className="input" required type="email" placeholder="Email" value={form.email} onChange={set('email')} autoComplete="email" />
          <input className="input" required type="password" placeholder="Password" value={form.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          {error && <p className="error">{error}</p>}
          <button className="btn btn-block btn-lg" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}</button>
        </form>
        {mode === 'register' && <p className="muted small center">Members earn {SITE.coinsName} on every order and can track orders anytime.</p>}
        <p className="muted small center demo-note">Demo admin: admin@actionrealm.lk / admin123</p>
      </div>
    </div>
  );
}

export function Account() {
  const { user, logout, updateProfile, isAdmin } = useAuth();
  const { wishlist } = useStore();
  const orders = useCollection('orders');
  const [tab, setTab] = useState('orders');
  const [profile, setProfile] = useState(() => ({ name: user?.name || '', phone: user?.phone || '', password: '' }));
  const [saved, setSaved] = useState(false);
  useTitle('My Account');

  if (!user) return <Navigate to="/login?next=/account" replace />;

  const mine = orders.filter((o) => o.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const save = async (e) => {
    e.preventDefault();
    await updateProfile({ name: profile.name, phone: profile.phone, ...(profile.password ? { password: profile.password } : {}) });
    setProfile({ ...profile, password: '' });
    setSaved(true);
  };

  return (
    <div className="container page">
      <div className="account-head">
        <div>
          <h1>Hi, {user.name.split(' ')[0]}</h1>
          <p className="muted">{user.email}</p>
        </div>
        <div className="row-gap">
          {isAdmin && <Link to="/admin" className="btn">Admin Panel</Link>}
          <button className="btn btn-outline" onClick={logout}><LogoutIcon width={16} height={16} /> Log Out</button>
        </div>
      </div>

      <div className="stat-cards">
        <div className="stat"><span className="muted small">{SITE.coinsName}</span><strong>{user.coins || 0}</strong><span className="muted small">= {formatPrice((user.coins || 0) * SITE.coinValue)} off</span></div>
        <div className="stat"><span className="muted small">Orders</span><strong>{mine.length}</strong></div>
        <Link to="/wishlist" className="stat"><span className="muted small">Wishlist</span><strong>{wishlist.length}</strong></Link>
      </div>

      <div className="tabs left">
        {[['orders', 'My Orders'], ['addresses', 'Addresses'], ['profile', 'Profile']].map(([k, l]) => (
          <button key={k} className={tab === k ? 'active' : ''} onClick={() => { setTab(k); setSaved(false); }}>{l}</button>
        ))}
      </div>

      {tab === 'orders' && (
        mine.length ? mine.map((o) => <OrderView key={o.id} order={o} />) : (
          <div className="empty"><p>No orders yet.</p><Link to="/collections/in-stock" className="btn">Start Shopping</Link></div>
        )
      )}

      {tab === 'addresses' && (
        user.addresses?.length ? (
          <div className="address-list">
            {user.addresses.map((a) => (
              <div key={`${a.line}${a.city}`} className="address-card">
                <p>{a.line}<br />{a.city}, {a.district} {a.postal}</p>
              </div>
            ))}
          </div>
        ) : <p className="muted">Addresses you use at checkout are saved here automatically.</p>
      )}

      {tab === 'profile' && (
        <form className="stack narrow-form" onSubmit={save}>
          <label className="field"><span className="field-label">Name</span><input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></label>
          <label className="field"><span className="field-label">Mobile</span><input className="input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></label>
          <label className="field"><span className="field-label">New password (leave blank to keep)</span><input className="input" type="password" value={profile.password} onChange={(e) => setProfile({ ...profile, password: e.target.value })} autoComplete="new-password" /></label>
          {saved && <p className="notice notice-ok">Profile saved.</p>}
          <button className="btn">Save Changes</button>
        </form>
      )}
    </div>
  );
}
