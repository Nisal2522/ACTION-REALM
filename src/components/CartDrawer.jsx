import { Link, useNavigate } from 'react-router-dom';
import { SITE, formatPrice } from '../config/site';
import { isAvailableNow, useProducts } from '../data/products';
import { priceOrder } from '../services/api';
import { track } from '../services/analytics';
import { useStore } from '../context/StoreContext';
import ProductImage from './ProductImage';
import CouponBox from './CouponBox';
import { CloseIcon, PlusIcon } from './Icons';

export default function CartDrawer() {
  const { cartItems, cartOpen, setCartOpen, updateQty, removeFromCart, couponCode, addToCart } = useStore();
  const products = useProducts();
  const navigate = useNavigate();
  const pricing = priceOrder(cartItems, { couponCode });

  // Upsell: affordable in-stock items from the same franchises, not already in the cart.
  const inCart = new Set(cartItems.map((i) => i.id));
  const franchises = new Set(cartItems.map((i) => i.product.franchise));
  const upsell = products
    .filter((p) => !inCart.has(p.id) && isAvailableNow(p) && p.price <= 20000)
    .sort((a, b) => Number(franchises.has(b.franchise)) - Number(franchises.has(a.franchise)))
    .slice(0, 3);

  const checkout = () => {
    track('begin_checkout', { value: pricing.total, items: cartItems.map((i) => ({ ...i.product, qty: i.qty })) });
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div className={`overlay ${cartOpen ? 'show' : ''}`} onClick={() => setCartOpen(false)} />
      <aside className={`drawer ${cartOpen ? 'open' : ''}`} aria-hidden={!cartOpen}>
        <div className="drawer-head">
          <h3>Your Cart</h3>
          <button className="icon-btn" onClick={() => setCartOpen(false)} aria-label="Close cart"><CloseIcon /></button>
        </div>

        {cartItems.length === 0 ? (
          <div className="drawer-empty">
            <p>Your cart is empty.</p>
            <Link to="/collections/in-stock" className="btn" onClick={() => setCartOpen(false)}>Start Shopping</Link>
          </div>
        ) : (
          <>
            <div className="drawer-items">
              {cartItems.map(({ id, qty, product }) => (
                <div className="line" key={id}>
                  <Link to={`/products/${product.slug}`} onClick={() => setCartOpen(false)} className="line-img">
                    <ProductImage product={product} />
                  </Link>
                  <div className="line-info">
                    <p className="line-title">{product.name}</p>
                    {product.status === 'preorder' && (
                      <p className="muted small">Pre-order · ETA {product.eta} · {Math.round(SITE.depositRate * 100)}% deposit</p>
                    )}
                    <p className="price">{formatPrice(product.price)}</p>
                    <div className="line-actions">
                      <div className="qty">
                        <button onClick={() => updateQty(id, qty - 1)} aria-label="Decrease">−</button>
                        <span>{qty}</span>
                        <button onClick={() => updateQty(id, qty + 1)} aria-label="Increase">+</button>
                      </div>
                      <button className="link-btn" onClick={() => removeFromCart(id)}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}

              {upsell.length > 0 && (
                <div className="upsell">
                  <h4>You may also like</h4>
                  {upsell.map((p) => (
                    <div className="upsell-item" key={p.id}>
                      <Link to={`/products/${p.slug}`} onClick={() => setCartOpen(false)} className="upsell-img"><ProductImage product={p} /></Link>
                      <div className="upsell-info">
                        <span className="line-title">{p.name}</span>
                        <span className="price small">{formatPrice(p.price)}</span>
                      </div>
                      <button className="icon-btn sm bordered-sm" onClick={() => addToCart(p.id)} aria-label={`Add ${p.name}`}><PlusIcon width={16} height={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="drawer-foot">
              <CouponBox subtotal={pricing.subtotal} />
              <div className="row-between"><span>Subtotal</span><span>{formatPrice(pricing.subtotal)}</span></div>
              {pricing.discount > 0 && <div className="row-between discount"><span>Discount</span><span>−{formatPrice(pricing.discount)}</span></div>}
              <div className="row-between total"><span>Total</span><strong>{formatPrice(pricing.total)}</strong></div>
              {pricing.hasPreorder && (
                <p className="muted small">Due now: <strong>{formatPrice(pricing.payNow)}</strong> · Balance on arrival: {formatPrice(pricing.payLater)}</p>
              )}
              <p className="muted small">Free island-wide delivery · Earn {pricing.coinsEarned} {SITE.coinsName}</p>
              <button className="btn btn-block" onClick={checkout}>Checkout</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
