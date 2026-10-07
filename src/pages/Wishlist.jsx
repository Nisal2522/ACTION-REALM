import { Link } from 'react-router-dom';
import { useProducts } from '../data/products';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import useTitle from '../hooks/useTitle';

export default function Wishlist() {
  const { wishlist } = useStore();
  useTitle('My Wishlist');
  const products = useProducts();
  const items = wishlist.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  return (
    <div className="container shop">
      <div className="shop-head">
        <h1>My Wishlist</h1>
        <p className="muted">{items.length} saved items</p>
      </div>
      {items.length ? (
        <div className="grid">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      ) : (
        <div className="empty">
          <p>You haven't saved anything yet. Tap the heart on any product to save it here.</p>
          <Link to="/collections/all" className="btn">Explore Collectibles</Link>
        </div>
      )}
    </div>
  );
}
