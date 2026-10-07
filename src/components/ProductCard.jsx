import { Link } from 'react-router-dom';
import { formatPrice } from '../config/site';
import { isOnSale, isPreorder, isSoldOut } from '../data/products';
import { ratingFor, useReviews } from '../services/api';
import { useStore } from '../context/StoreContext';
import ProductImage from './ProductImage';
import { Stars } from './ui';
import { BellIcon, EyeIcon, HeartIcon, PlusIcon } from './Icons';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted, openQuickView, openNotify } = useStore();
  const reviews = useReviews();
  const { average, count } = ratingFor(reviews, product.id);
  const sale = isOnSale(product);
  const soldOut = isSoldOut(product);
  const off = sale ? Math.round((1 - product.price / product.compareAt) * 100) : 0;

  return (
    <article className={`card ${soldOut ? 'sold-out' : ''}`}>
      <div className="card-media">
        <Link to={`/products/${product.slug}`} aria-label={product.name}>
          <ProductImage product={product} />
        </Link>
        <div className="badges">
          {soldOut && <span className="badge badge-soldout">Sold Out</span>}
          {isPreorder(product) && <span className="badge badge-pre">Pre-Order</span>}
          {product.isNew && <span className="badge badge-new">New</span>}
          {sale && <span className="badge badge-sale">-{off}%</span>}
        </div>
        <div className="card-actions">
          <button
            className={`wish-btn ${isWishlisted(product.id) ? 'active' : ''}`}
            onClick={() => toggleWishlist(product.id)}
            aria-label="Toggle wishlist"
          >
            <HeartIcon filled={isWishlisted(product.id)} width={18} height={18} />
          </button>
          <button className="wish-btn quick-btn" onClick={() => openQuickView(product.id)} aria-label="Quick view">
            <EyeIcon width={18} height={18} />
          </button>
        </div>
      </div>
      <div className="card-body">
        <p className="card-brand">{product.brand}</p>
        <Link to={`/products/${product.slug}`} className="card-title">{product.name}</Link>
        {count > 0 && <Stars value={average} count={count} size={13} />}
        <div className="price-row">
          <span className="price">{formatPrice(product.price)}</span>
          {sale && <span className="compare">{formatPrice(product.compareAt)}</span>}
        </div>
        {soldOut ? (
          <button className="btn btn-block btn-sm btn-outline" onClick={() => openNotify(product.id)}>
            <BellIcon width={16} height={16} />
            Notify Me
          </button>
        ) : (
          <button className="btn btn-block btn-sm" onClick={() => addToCart(product.id)}>
            <PlusIcon width={16} height={16} />
            {isPreorder(product) ? 'Pre-Order Now' : 'Add To Cart'}
          </button>
        )}
      </div>
    </article>
  );
}
