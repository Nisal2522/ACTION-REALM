import { NavLink } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { GridIcon, HeartIcon, HomeIcon, SearchIcon, UserIcon } from './Icons';

// Mobile-only app-style navigation bar. (The cart stays in the header.)
export default function BottomNav() {
  const { wishlist } = useStore();
  const { user } = useAuth();

  const focusSearch = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('site-search')?.focus();
  };

  return (
    <nav className="bottom-nav" aria-label="Quick navigation">
      <NavLink to="/" end><HomeIcon /><span>Home</span></NavLink>
      <NavLink to="/collections/all"><GridIcon /><span>Shop</span></NavLink>
      <button onClick={focusSearch}><SearchIcon /><span>Search</span></button>
      <NavLink to="/wishlist">
        <span className="bn-icon"><HeartIcon />{wishlist.length > 0 && <span className="count">{wishlist.length}</span>}</span>
        <span>Wishlist</span>
      </NavLink>
      <NavLink to={user ? '/account' : '/login'}>
        <span className="bn-icon"><UserIcon />{user && <span className="dot" />}</span>
        <span>{user ? 'Account' : 'Log In'}</span>
      </NavLink>
    </nav>
  );
}
