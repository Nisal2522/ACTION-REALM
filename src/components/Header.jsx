import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { SITE } from '../config/site';
import { getFranchises } from '../data/products';
import { collectionUrl } from '../data/collections';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import useTheme from '../hooks/useTheme';
import SearchBox from './SearchBox';
import BrandLogo from './BrandLogo';
import { CartIcon, ChevronIcon, CloseIcon, HeartIcon, MenuIcon, MoonIcon, SunIcon, UserIcon } from './Icons';

export default function Header() {
  const { cartCount, wishlist, setCartOpen } = useStore();
  const { user, isAdmin } = useAuth();
  const [theme, toggleTheme] = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const location = useLocation();

  const menu = SITE.headerMenu.filter((m) => m.enabled !== false);

  useEffect(() => {
    setMenuOpen(false);
    setExpanded(null);
  }, [location]);

  return (
    <header className="site-header">
      <div className="header-main container">
        <button className="icon-btn mobile-only" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <MenuIcon />
        </button>
        <Link to="/" className="logo" aria-label={`${SITE.name} home`}>
          <BrandLogo />
        </Link>
        <SearchBox />
        <div className="header-icons">
          <button className="icon-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title="Toggle dark mode">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <Link to={user ? '/account' : '/login'} className="icon-btn desktop-only" aria-label={user ? 'My account' : 'Log in'} title={user ? user.name : 'Log in'}>
            <UserIcon />
            {user && <span className="dot" />}
          </Link>
          <Link to="/wishlist" className="icon-btn desktop-only" aria-label="Wishlist">
            <HeartIcon />
            {wishlist.length > 0 && <span className="count">{wishlist.length}</span>}
          </Link>
          <button className="icon-btn" onClick={() => setCartOpen(true)} aria-label="Cart">
            <CartIcon />
            {cartCount > 0 && <span className="count">{cartCount}</span>}
          </button>
        </div>
      </div>

      <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
        <div className="nav-inner container">
          <div className="nav-mobile-head mobile-only">
            <span className="logo"><BrandLogo size="sm" slogan={false} /></span>
            <button className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu"><CloseIcon /></button>
          </div>
          {menu.map((m) => {
            if (m.type === 'franchises') {
              return (
                <div className={`has-mega ${expanded === m.id ? 'expanded' : ''}`} key={m.id}>
                  <button className="nav-trigger" onClick={() => setExpanded(expanded === m.id ? null : m.id)}>{m.label} <ChevronIcon width={14} height={14} /></button>
                  <div className="mega">
                    {getFranchises().map((item) => <Link key={item} to={collectionUrl(item)}>{item}</Link>)}
                  </div>
                </div>
              );
            }
            if (m.type === 'dropdown') {
              return (
                <div className={`has-mega nav-drop ${expanded === m.id ? 'expanded' : ''}`} key={m.id}>
                  <span className="nav-drop-head">
                    <NavLink to={m.url || '/'} end className="nav-drop-link">{m.label}</NavLink>
                    <button className="nav-drop-toggle" onClick={() => setExpanded(expanded === m.id ? null : m.id)} aria-label={`Show ${m.label} options`} aria-expanded={expanded === m.id}>
                      <ChevronIcon width={14} height={14} />
                    </button>
                  </span>
                  <div className="mega single">
                    {(m.children || []).map((c) => <NavLink key={c.url} to={c.url}>{c.label}</NavLink>)}
                  </div>
                </div>
              );
            }
            if (/^https?:/.test(m.url)) return <a key={m.id} href={m.url} target="_blank" rel="noreferrer">{m.label}</a>;
            return <NavLink key={m.id} to={m.url || '/'} end={m.url === '/'}>{m.label}</NavLink>;
          })}
          <div className="mobile-only nav-extra">
            <NavLink to={user ? '/account' : '/login'}>{user ? 'My Account' : 'Log In / Register'}</NavLink>
            <NavLink to="/track-order">Track Order</NavLink>
            {isAdmin && <NavLink to="/admin">Admin Panel</NavLink>}
          </div>
        </div>
      </nav>
      {menuOpen && <div className="overlay mobile-only" onClick={() => setMenuOpen(false)} />}
    </header>
  );
}
