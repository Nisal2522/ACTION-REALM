import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { SITE } from '../config/site';
import { CATEGORIES, FRANCHISES, getBrands, useProducts } from '../data/products';
import { collectionUrl } from '../data/collections';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import useTheme from '../hooks/useTheme';
import SearchBox from './SearchBox';
import { CartIcon, ChevronIcon, CloseIcon, HeartIcon, MenuIcon, MoonIcon, SunIcon, UserIcon } from './Icons';

export default function Header() {
  const { cartCount, wishlist, setCartOpen } = useStore();
  const { user, isAdmin } = useAuth();
  const products = useProducts();
  const [theme, toggleTheme] = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const location = useLocation();

  const mega = [
    { label: 'Brands', items: getBrands(products) },
    { label: 'Categories', items: CATEGORIES },
    { label: 'Franchises', items: FRANCHISES },
  ];

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
        <Link to="/" className="logo">
          <img src="/logo-256.png" alt="" className="logo-mark" />
          <span className="logo-text">{SITE.name}<span>{SITE.tagline}</span></span>
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
            <span className="logo">
              <img src="/logo-256.png" alt="" className="logo-mark" />
              <span className="logo-text">{SITE.name}</span>
            </span>
            <button className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu"><CloseIcon /></button>
          </div>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/collections/in-stock">In Stock Now</NavLink>
          <NavLink to="/collections/pre-orders">Pre-Orders</NavLink>
          <NavLink to="/collections/new-arrivals">New Arrivals</NavLink>
          {mega.map((m) => (
            <div className={`has-mega ${expanded === m.label ? 'expanded' : ''}`} key={m.label}>
              <button className="nav-trigger" onClick={() => setExpanded(expanded === m.label ? null : m.label)}>{m.label} <ChevronIcon width={14} height={14} /></button>
              <div className="mega">
                {m.items.map((item) => (
                  <Link key={item} to={collectionUrl(item)}>{item}</Link>
                ))}
              </div>
            </div>
          ))}
          <NavLink to="/collections/sale">Sale</NavLink>
          <div className="mobile-only nav-extra">
            <NavLink to={user ? '/account' : '/login'}>{user ? 'My Account' : 'Log In / Register'}</NavLink>
            <NavLink to="/track-order">Track Order</NavLink>
            <NavLink to="/contact">Contact Us</NavLink>
            {isAdmin && <NavLink to="/admin">Admin Panel</NavLink>}
          </div>
        </div>
      </nav>
      {menuOpen && <div className="overlay mobile-only" onClick={() => setMenuOpen(false)} />}
    </header>
  );
}
