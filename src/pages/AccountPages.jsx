import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { SITE, formatPrice, isValidPhone } from '../config/site';
import { useCollection } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import OrderView from '../components/OrderView';
import { EyeIcon, EyeOffIcon, LockIcon, LogoutIcon, MailIcon, PhoneIcon, UserIcon } from '../components/Icons';
import useTitle from '../hooks/useTitle';

export function Login() {
  const { login, register, user } = useAuth();
  const [params] = useSearchParams();
  // Admins go straight to the admin panel; customers to their account (unless a page asked to come back).
  const destination = (u) => params.get('next') || (u?.role === 'admin' ? '/admin' : '/account');
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Lock the page: no scrolling, and the login area fills exactly the space under the header.
  useEffect(() => {
    const header = document.querySelector('.site-header');
    const fit = () => document.documentElement.style.setProperty('--header-h', `${header?.offsetHeight || 0}px`);
    fit();
    const ro = header && 'ResizeObserver' in window ? new ResizeObserver(fit) : null;
    ro?.observe(header);
    document.body.classList.add('auth-lock');
    return () => {
      ro?.disconnect();
      document.body.classList.remove('auth-lock');
    };
  }, []);
  useTitle(mode === 'login' ? 'Log In' : 'Create Account');

  if (user) return <Navigate to={destination(user)} replace />;

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
      const loggedIn = mode === 'login' ? await login(form.email, form.password) : await register(form);
      navigate(destination(loggedIn), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const isLogin = mode === 'login';
  const switchMode = (m) => { setMode(m); setError(''); };

  return (
    <div className="auth-page">
      {/* Photo on the left that fades into the background; the form sits on the right */}
      <div className="auth-visual" aria-hidden="true">
        {SITE.login.image && <img src={SITE.login.image} alt="" />}
      </div>

      <div className="auth-card">
        <div className="auth-head">
          <h1>{isLogin ? SITE.login.loginTitle : SITE.login.registerTitle}</h1>
        </div>

        <div className={`auth-switch ${isLogin ? '' : 'right'}`} role="tablist">
          <span className="auth-switch-pill" aria-hidden="true" />
          <button type="button" role="tab" aria-selected={isLogin} onClick={() => switchMode('login')}>Log in</button>
          <button type="button" role="tab" aria-selected={!isLogin} onClick={() => switchMode('register')}>Register</button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {!isLogin && (
            <>
              <label className="auth-field">
                <UserIcon width={18} height={18} />
                <input required placeholder="Full name" value={form.name} onChange={set('name')} autoComplete="name" />
              </label>
              <label className="auth-field">
                <PhoneIcon width={18} height={18} />
                <input required inputMode="tel" placeholder="Mobile number (07X XXX XXXX)" value={form.phone} onChange={set('phone')} autoComplete="tel" />
              </label>
            </>
          )}
          <label className="auth-field">
            <MailIcon width={18} height={18} />
            <input required type="email" placeholder="Email address" value={form.email} onChange={set('email')} autoComplete="email" />
          </label>
          <label className="auth-field">
            <LockIcon width={18} height={18} />
            <input required type={showPw ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={set('password')} autoComplete={isLogin ? 'current-password' : 'new-password'} />
            <button type="button" className="auth-eye" onClick={() => setShowPw(!showPw)} aria-label={showPw ? 'Hide password' : 'Show password'}>
              {showPw ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
            </button>
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" disabled={busy}>
            {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
          </button>
        </form>

        <p className="auth-alt">
          {isLogin ? "Don't have an account? " : 'Already a member? '}
          <button type="button" onClick={() => switchMode(isLogin ? 'register' : 'login')}>{isLogin ? 'Create one' : 'Log in'}</button>
        </p>
        {SITE.login.showDemo && <p className="auth-demo">Demo admin: admin@actionrealm.lk / admin123</p>}
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
  if (isAdmin) return <Navigate to="/admin" replace />; // admins manage everything from the admin panel

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
