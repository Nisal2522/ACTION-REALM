import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { SITE, formatPrice } from '../config/site';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../data/products';
import { useCollection } from '../services/db';
import useTitle from '../hooks/useTitle';
import useTheme from '../hooks/useTheme';
import Dashboard from '../admin/Dashboard';
import { Coupons, Orders, Products, ReviewsAdmin } from '../admin/StoreAdmin';
import PagesCMS from '../admin/PagesCMS';
import { BankAdmin, ExpensesAdmin, IncomeAdmin } from '../admin/FinanceAdmin';
import { PageActionsSlot } from '../admin/PageActions';
import { resizeImage } from '../admin/fields';
import BrandLogo from '../components/BrandLogo';
import {
  BagIcon, BankIcon, BoxIcon, CloseIcon, DashboardIcon, ExpenseIcon, FileIcon, HomeIcon, IncomeIcon, LogoutIcon,
  CameraIcon, ChevronIcon, MenuIcon, MoonIcon, SearchIcon, StarIcon, SunIcon, TagIcon, TrashIcon,
} from '../components/Icons';

// Everything shown on the website is managed from here.
const NAV = [
  { group: null, items: [{ id: 'dashboard', label: 'Dashboard', Icon: DashboardIcon, Component: Dashboard, hideHeader: true }] },
  {
    group: 'Sales',
    items: [
      { id: 'orders', label: 'Orders', Icon: BagIcon, Component: Orders, badge: 'orders', desc: 'Process orders, update payment and delivery status.' },
      { id: 'coupons', label: 'Discounts', Icon: TagIcon, Component: Coupons, desc: 'Coupon codes for the cart and checkout.' },
    ],
  },
  {
    group: 'Catalogue',
    items: [
      { id: 'products', label: 'Products', Icon: BoxIcon, Component: Products, desc: 'Everything you sell: prices, stock, photos and pre-orders.' },
      { id: 'reviews', label: 'Reviews', Icon: StarIcon, Component: ReviewsAdmin, desc: 'Moderate product reviews from customers.' },
    ],
  },
  {
    group: 'Finance',
    items: [
      { id: 'income', label: 'Income', Icon: IncomeIcon, Component: IncomeAdmin, desc: 'Record money coming in: store sales, transfers, wholesale and more.' },
      { id: 'expenses', label: 'Expenses', Icon: ExpenseIcon, Component: ExpensesAdmin, desc: 'Record money going out: stock, shipping, customs, rent and more.' },
      { id: 'bank', label: 'Bank & Profit', Icon: BankIcon, Component: BankAdmin, desc: 'Debit and credit by date or shipment, with your profit and loss.' },
    ],
  },
  {
    group: 'Website',
    items: [
      { id: 'pages', label: 'Pages', Icon: FileIcon, Component: PagesCMS, desc: 'Edit the content of every page on your website.' },
    ],
  },
];
const ALL = NAV.flatMap((g) => g.items);

export default function Admin() {
  const { user, isAdmin, logout } = useAuth();
  const [params, setParams] = useSearchParams();
  const orders = useCollection('orders');
  const [navOpen, setNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('ar_admin_nav') === 'mini';
    } catch {
      return false;
    }
  });
  const toggleCollapsed = () => setCollapsed((c) => {
    try {
      localStorage.setItem('ar_admin_nav', c ? 'full' : 'mini');
    } catch {
      /* storage unavailable */
    }
    return !c;
  });
  const [actionsNode, setActionsNode] = useState(null);
  const [theme, toggleTheme] = useTheme();
  const current = ALL.find((i) => i.id === params.get('tab')) || ALL[0];
  useTitle(`${current.label} · Admin`);

  useEffect(() => {
    document.body.classList.add('adm-body');
    return () => document.body.classList.remove('adm-body');
  }, []);

  if (!user) return <Navigate to="/login?next=/admin" replace />;
  if (!isAdmin) {
    return (
      <div className="container narrow center-page">
        <h1>Admins only</h1>
        <p className="muted">Log in with an admin account to manage the store.</p>
        <Link to="/" className="btn">Back to Shop</Link>
      </div>
    );
  }

  // go('orders') or go('orders', 'AR10001') to open a record.
  const go = (id, record, extra = {}) => {
    setParams({ tab: id, ...(record ? { open: record } : {}), ...extra });
    setNavOpen(false);
    window.scrollTo(0, 0);
  };
  const badges = {
    orders: orders.filter((o) => o.status === 'Placed').length,
  };
  const { Component } = current;

  return (
    <div className={`adm ${collapsed ? 'nav-mini' : ''}`}>
      <aside className={`adm-side ${navOpen ? 'open' : ''}`}>
        <div className="adm-brand">
          <Link to="/" className="adm-brand-link" title="Go to the shop homepage">
            <BrandLogo size="admin" />
          </Link>
          <button className="adm-icon-btn adm-only-mobile" onClick={() => setNavOpen(false)} aria-label="Close menu"><CloseIcon width={18} height={18} /></button>
        </div>
        <button className="adm-collapse adm-hide-mobile" onClick={toggleCollapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <ChevronIcon dir={collapsed ? 'right' : 'left'} width={14} height={14} />
        </button>
        <nav className="adm-nav" aria-label="Admin sections">
          {NAV.map((g, gi) => (
            <div key={g.group || gi} className="adm-nav-group">
              {g.group && <span className="adm-nav-title">{g.group}</span>}
              {g.items.map(({ id, label, Icon, badge }) => (
                <button key={id} className={current.id === id ? 'active' : ''} onClick={() => go(id)} aria-current={current.id === id ? 'page' : undefined} title={collapsed ? label : undefined} data-label={label}>
                  <span className="adm-nav-icon"><Icon width={18} height={18} /></span>
                  <span className="adm-nav-label">{label}</span>
                  {badge && badges[badge] > 0 && <span className="adm-badge">{badges[badge]}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="adm-side-foot">
          <UserMenu user={user} logout={logout} />
        </div>
      </aside>
      {navOpen && <div className="adm-scrim" onClick={() => setNavOpen(false)} />}

      <div className="adm-main">
        <header className="adm-top">
          <div className="adm-top-left">
            <button className="adm-icon-btn adm-only-mobile" onClick={() => setNavOpen(true)} aria-label="Open menu"><MenuIcon /></button>
          </div>
          <GlobalSearch go={go} />
          <div className="adm-top-actions">
            <button className="adm-icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode">{theme === 'dark' ? <SunIcon width={18} height={18} /> : <MoonIcon width={18} height={18} />}</button>
          </div>
        </header>

        <main className="adm-content">
          {!current.hideHeader && (
            <div className="adm-page-head">
              <div>
                <h1>{current.label}</h1>
                {current.desc && <p>{current.desc}</p>}
              </div>
              <div className="adm-page-actions" ref={setActionsNode} />
            </div>
          )}
          <PageActionsSlot.Provider value={current.hideHeader ? null : actionsNode}>
            <Component go={go} />
          </PageActionsSlot.Provider>
        </main>
      </div>
    </div>
  );
}

function UserMenu({ user, logout }) {
  const { updateProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const ref = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  const initials = user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  // Profile photo: shrunk to a small square and saved on the account.
  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      await updateProfile({ avatar: await resizeImage(file, 256) });
      setPhotoError('');
      setOpen(false);
    } catch (err) {
      setPhotoError(err.message);
    }
  };

  return (
    <div className="adm-user" ref={ref}>
      <button className="adm-user-btn" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Account menu">
        <span className={`adm-avatar ${user.avatar ? 'has-photo' : ''}`}>
          {user.avatar ? <img src={user.avatar} alt="" /> : initials}
          <span className="adm-avatar-status" aria-hidden="true" />
        </span>
        <span className="adm-user-text">
          <strong>{user.name}</strong>
          <span>{user.role === 'admin' ? 'Administrator' : 'Staff'}</span>
        </span>
        <span className="adm-user-caret" aria-hidden="true">⋯</span>
      </button>
      {open && (
        <div className="adm-menu up">
          <div className="adm-menu-head adm-menu-profile">
            <span className={`adm-avatar lg ${user.avatar ? 'has-photo' : ''}`}>{user.avatar ? <img src={user.avatar} alt="" /> : initials}</span>
            <span><strong>{user.name}</strong><span className="muted small">{user.email}</span></span>
          </div>
          <label className="adm-menu-item">
            <CameraIcon width={16} height={16} /> {user.avatar ? 'Change profile photo' : 'Add profile photo'}
            <input type="file" accept="image/*" hidden onChange={uploadPhoto} />
          </label>
          {user.avatar && <button onClick={() => { updateProfile({ avatar: '' }); setOpen(false); }}><TrashIcon width={16} height={16} /> Remove photo</button>}
          {photoError && <p className="error small adm-menu-error">{photoError}</p>}
          <Link to="/" onClick={() => setOpen(false)}><HomeIcon width={16} height={16} /> Go to shop homepage</Link>
          <button onClick={() => { logout(); navigate('/'); }}><LogoutIcon width={16} height={16} /> Log out</button>
        </div>
      )}
    </div>
  );
}

// Search orders and products from anywhere in the admin.
function GlobalSearch({ go }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const orders = useCollection('orders');
  const products = useProducts();

  useEffect(() => {
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const key = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        ref.current?.querySelector('input')?.focus();
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', key);
    };
  }, []);

  const n = q.trim().toLowerCase();
  const hit = (...fields) => fields.join(' ').toLowerCase().includes(n);
  const results = n.length < 2 ? [] : [
    ...orders.filter((o) => hit(o.id, o.customer.name, o.customer.phone)).slice(-4).reverse()
      .map((o) => ({ key: `o${o.id}`, type: 'Order', title: `#${o.id} · ${o.customer.name}`, sub: formatPrice(o.total), Icon: BagIcon, act: () => go('orders', o.id) })),
    ...products.filter((p) => hit(p.name, p.brand)).slice(0, 4)
      .map((p) => ({ key: `p${p.id}`, type: 'Product', title: p.name, sub: formatPrice(p.price), Icon: BoxIcon, act: () => go('products', String(p.id)) })),
  ];

  return (
    <div className="adm-search" ref={ref}>
      <SearchIcon width={16} height={16} />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) { results[0].act(); setQ(''); setOpen(false); } }}
        placeholder="Search orders and products…"
        aria-label="Search admin"
      />
      <kbd className="adm-hide-mobile">Ctrl K</kbd>
      {open && n.length >= 2 && (
        <div className="adm-search-results">
          {results.length ? results.map((r) => (
            <button key={r.key} onClick={() => { r.act(); setQ(''); setOpen(false); }}>
              <span className="sr-icon"><r.Icon width={16} height={16} /></span>
              <span className="sr-text"><strong>{r.title}</strong><span className="muted small">{r.type} · {r.sub}</span></span>
            </button>
          )) : <p className="muted small">No results for “{q}”</p>}
        </div>
      )}
    </div>
  );
}
