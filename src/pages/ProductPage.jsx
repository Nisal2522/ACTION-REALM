import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SITE, deliveryText, formatPrice } from '../config/site';
import { getProductBySlug, isOnSale, isPreorder, isSoldOut, productPhotos, useProducts } from '../data/products';
import { collectionUrl } from '../data/collections';
import { ratingFor, useReviews } from '../services/api';
import { track } from '../services/analytics';
import { useStore } from '../context/StoreContext';
import { ProductRail, RecentlyViewed } from '../components/HomeSections';
import { BoughtTogether, Reviews, StickyBuyBar, ZoomImage, reviewsLink } from '../components/ProductExtras';
import { Countdown, SaleCountdown, Stars } from '../components/ui';
import { BellIcon, HeartIcon, PlusIcon, ShieldIcon, TruckIcon } from '../components/Icons';
import NotFound from './NotFound';
import useTitle from '../hooks/useTitle';

export default function ProductPage() {
  const { slug } = useParams();
  const products = useProducts();
  const product = getProductBySlug(slug);
  const reviews = useReviews();
  const { addToCart, toggleWishlist, isWishlisted, openNotify, markViewed } = useStore();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [photo, setPhoto] = useState(0);
  const [showSticky, setShowSticky] = useState(false);
  const buyRef = useRef(null);

  useTitle(product?.name, { description: product?.description, image: product?.image });

  useEffect(() => {
    setQty(1);
    setPhoto(0);
    if (!product) return;
    markViewed(product.id);
    track('view_item', { value: product.price, items: [product] });
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show the sticky mobile buy bar when the main buttons are off-screen.
  useEffect(() => {
    const el = buyRef.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [slug, product]);

  if (!product) return <NotFound />;

  const sale = isOnSale(product);
  const preorder = isPreorder(product);
  const soldOut = isSoldOut(product);
  const { average, count } = ratingFor(reviews, product.id);
  const related = products.filter((p) => p.id !== product.id && (p.franchise === product.franchise || p.brand === product.brand)).slice(0, 8);
  const coins = Math.floor(product.price * SITE.coinsRate);
  const deposit = Math.round(product.price * SITE.depositRate);
  const mainLabel = preorder ? 'Pre-Order Now' : 'Add To Cart';
  const photos = productPhotos(product);

  return (
    <>
      <div className="container">
        <div className="pdp">
          <div className={`gallery ${photos.length > 1 ? 'has-thumbs' : ''}`}>
            <ZoomImage product={{ ...product, image: photos[Math.min(photo, photos.length - 1)] || product.image }} />
            {photos.length > 1 && (
              <div className="thumbs">
                {photos.map((src, i) => (
                  <button key={`${i}-${src.length}`} className={i === photo ? 'active' : ''} onClick={() => setPhoto(i)} aria-label={`Photo ${i + 1}`}>
                    <img src={src} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pdp-info">
            <Link to={collectionUrl(product.brand)} className="card-brand">{product.brand}</Link>
            <h1>{product.name}</h1>
            {count > 0 && <div className="rating-line"><Stars value={average} size={16} /> {reviewsLink(count)}</div>}
            <div className="price-row big">
              <span className="price">{formatPrice(product.price)}</span>
              {sale && <span className="compare">{formatPrice(product.compareAt)}</span>}
              {sale && <span className="badge badge-sale">Save {formatPrice(product.compareAt - product.price)}</span>}
            </div>
            <p className="muted small">Inclusive of all taxes · {deliveryText()}</p>
            {sale && <SaleCountdown />}

            {soldOut ? (
              <div className="notice notice-low">Sold out · Tap “Notify Me” to get an alert when it's back</div>
            ) : preorder ? (
              <div className="notice notice-pre">
                <div>Pre-order · Expected release: <strong>{product.eta}</strong></div>
                <div className="deposit-split">
                  <span>Pay now <strong>{formatPrice(deposit)}</strong> ({Math.round(SITE.depositRate * 100)}%)</span>
                  <span>On arrival <strong>{formatPrice(product.price - deposit)}</strong></span>
                </div>
                {product.releaseDate && <Countdown target={product.releaseDate} label="Release in" compact />}
              </div>
            ) : product.stock <= 2 ? (
              <div className="notice notice-low">Hurry! Only {product.stock} left in stock</div>
            ) : (
              <div className="notice notice-ok">In stock · Ships in 1–2 business days</div>
            )}

            {product.price >= SITE.installmentThreshold && (
              <p className="emi-note">0% installments from {formatPrice(Math.ceil(product.price / 12))}/month (12 months)</p>
            )}
            <p className="muted small">Earn <strong>{coins} {SITE.coinsName}</strong> with this purchase</p>

            <div className="buy-row" ref={buyRef}>
              {!soldOut && (
                <div className="qty">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(Math.min(5, qty + 1))} aria-label="Increase">+</button>
                </div>
              )}
              {soldOut ? (
                <button className="btn btn-lg grow btn-outline" onClick={() => openNotify(product.id)}>
                  <BellIcon width={18} height={18} />
                  Notify Me
                </button>
              ) : (
                <button className="btn btn-lg grow" onClick={() => addToCart(product.id, qty)}>
                  <PlusIcon width={18} height={18} />
                  {mainLabel}
                </button>
              )}
              <button className={`icon-btn bordered ${isWishlisted(product.id) ? 'active' : ''}`} onClick={() => toggleWishlist(product.id)} aria-label="Toggle wishlist">
                <HeartIcon filled={isWishlisted(product.id)} />
              </button>
            </div>
            {!soldOut && (
              <button className="btn btn-outline btn-block" onClick={() => { addToCart(product.id, qty, { open: false }); navigate('/checkout'); }}>
                Buy It Now
              </button>
            )}

            <div className="trust">
              <span><TruckIcon width={18} height={18} /> {SITE.deliveryFee ? 'Insured island-wide delivery' : 'Free insured delivery'}</span>
              <span><ShieldIcon width={18} height={18} /> 100% authentic</span>
            </div>

            <details open>
              <summary>Description</summary>
              <p>{product.description}</p>
            </details>
            <details>
              <summary>Specifications</summary>
              <ul className="specs">
                <li><span>Brand</span>{product.brand}</li>
                <li><span>Category</span>{product.category}</li>
                <li><span>Franchise</span>{product.franchise}</li>
                <li><span>SKU</span>SKU-{String(product.id).padStart(5, '0')}</li>
              </ul>
            </details>
            <details>
              <summary>Delivery & Returns</summary>
              <p>{deliveryText()}. Colombo {SITE.deliveryDays.colombo} days, other districts {SITE.deliveryDays.other} days. Orders are double-boxed and insured. Report any transit damage within 48 hours with an unboxing video for a replacement or refund.</p>
            </details>
          </div>
        </div>
      </div>
      <BoughtTogether key={product.id} product={product} />
      <Reviews key={`r${product.id}`} product={product} />
      <ProductRail title="You May Also Like" products={related} />
      <RecentlyViewed excludeId={product.id} />
      {!soldOut && (
        <StickyBuyBar product={product} visible={showSticky} label={preorder ? 'Pre-Order' : 'Add'} onAdd={() => addToCart(product.id, qty)} />
      )}
    </>
  );
}
