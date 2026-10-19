import { Link } from 'react-router-dom';
import { formatPrice } from '../config/site';
import { isOnSale, isPreorder, isSoldOut } from '../data/products';
import { useStore } from '../context/StoreContext';
import ProductImage from './ProductImage';
import { BellIcon, EyeIcon, HeartIcon, PlusIcon } from './Icons';

// Image-first cards for featured homepage rows.
// variant 'showcase': full-bleed photo with a frosted info panel (Collector's Picks).
// variant 'ranked':   big chart number beside the card (Trending).
export default function ShowcaseCard({ product, variant = 'showcase', rank }) {
  const { addToCart, toggleWishlist, isWishlisted, openQuickView, openNotify } = useStore();
  const sale = isOnSale(product);
  const soldOut = isSoldOut(product);
  const preorder = isPreorder(product);
  const off = sale ? Math.round((1 - product.price / product.compareAt) * 100) : 0;
  const wished = isWishlisted(product.id);

  const action = soldOut ? (
    <button className="sc-cta ghost" onClick={() => openNotify(product.id)} aria-label="Notify me" title="Notify me"><BellIcon width={15} height={15} /> <span className="sc-cta-text">Notify me</span></button>
  ) : (
    <button className="sc-cta" onClick={() => addToCart(product.id)} aria-label={preorder ? 'Pre-order' : 'Add to cart'} title={preorder ? 'Pre-order' : 'Add to cart'}>
      <PlusIcon width={15} height={15} /> <span className="sc-cta-text">{preorder ? 'Pre-order' : 'Add to cart'}</span>
    </button>
  );

  return (
    <article className={`sc sc-${variant} ${soldOut ? 'sold-out' : ''}`}>
      {variant === 'ranked' && <span className="sc-rank" aria-hidden="true">{String(rank).padStart(2, '0')}</span>}
      <div className="sc-frame">
        <Link to={`/products/${product.slug}`} className="sc-img" aria-label={product.name}>
          <ProductImage product={product} />
        </Link>
        <div className="sc-top">
          <span className="sc-tags">
            {soldOut && <span className="sc-tag dark">Sold out</span>}
            {preorder && <span className="sc-tag blue">Pre-order</span>}
            {product.isNew && <span className="sc-tag green">New</span>}
            {sale && <span className="sc-tag orange">−{off}%</span>}
          </span>
          <span className="sc-icons">
            <button className={`sc-icon ${wished ? 'active' : ''}`} onClick={() => toggleWishlist(product.id)} aria-label="Toggle wishlist">
              <HeartIcon filled={wished} width={16} height={16} />
            </button>
            <button className="sc-icon" onClick={() => openQuickView(product.id)} aria-label="Quick view"><EyeIcon width={16} height={16} /></button>
          </span>
        </div>
        <div className="sc-panel">
          <span className="sc-brand">{product.brand}</span>
          <Link to={`/products/${product.slug}`} className="sc-title">{product.name}</Link>
          <div className="sc-foot">
            <span className="sc-price">
              {formatPrice(product.price)}
              {sale && <s>{formatPrice(product.compareAt)}</s>}
            </span>
            {action}
          </div>
        </div>
      </div>
    </article>
  );
}
