import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getProduct, isSoldOut, useProducts } from '../data/products';
import { track } from '../services/analytics';

const StoreContext = createContext(null);
const MAX_QTY = 5;

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export function StoreProvider({ children }) {
  const products = useProducts(); // re-render when the admin edits products
  const [cart, setCart] = useState(() => load('store_cart', []));
  const [wishlist, setWishlist] = useState(() => load('store_wishlist', []));
  const [recent, setRecent] = useState(() => load('store_recent', []));
  const [couponCode, setCouponCode] = useState(() => load('store_coupon', ''));
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [quickViewId, setQuickViewId] = useState(null);
  const [notifyId, setNotifyId] = useState(null);

  useEffect(() => {
    save('store_cart', cart);
  }, [cart]);
  useEffect(() => {
    save('store_wishlist', wishlist);
  }, [wishlist]);
  useEffect(() => {
    save('store_recent', recent);
  }, [recent]);
  useEffect(() => {
    save('store_coupon', couponCode);
  }, [couponCode]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const value = useMemo(() => {
    const cartItems = cart
      .map((i) => ({ ...i, product: products.find((p) => p.id === i.id) }))
      .filter((i) => i.product);
    const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
    const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

    return {
      cartItems,
      subtotal,
      cartCount,
      wishlist,
      recent,
      couponCode,
      setCouponCode,
      cartOpen,
      toast,
      setCartOpen,
      quickViewId,
      openQuickView: setQuickViewId,
      notifyId,
      openNotify: setNotifyId,
      addToCart(id, qty = 1, { open = true } = {}) {
        const product = getProduct(id);
        if (!product || isSoldOut(product)) return;
        setCart((c) => {
          const existing = c.find((i) => i.id === id);
          if (existing) return c.map((i) => (i.id === id ? { ...i, qty: Math.min(i.qty + qty, MAX_QTY) } : i));
          return [...c, { id, qty: Math.min(qty, MAX_QTY) }];
        });
        track('add_to_cart', { value: product.price * qty, items: [{ ...product, qty }] });
        if (open) setCartOpen(true);
        else setToast('Added to cart');
      },
      updateQty(id, qty) {
        if (qty < 1) return setCart((c) => c.filter((i) => i.id !== id));
        setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, MAX_QTY) } : i)));
      },
      removeFromCart(id) {
        setCart((c) => c.filter((i) => i.id !== id));
      },
      clearCart() {
        setCart([]);
        setCouponCode('');
      },
      isWishlisted: (id) => wishlist.includes(id),
      toggleWishlist(id) {
        const had = wishlist.includes(id);
        setWishlist((w) => (had ? w.filter((x) => x !== id) : [...w, id]));
        setToast(had ? 'Removed from wishlist' : 'Added to wishlist');
      },
      markViewed(id) {
        setRecent((r) => (r[0] === id ? r : [id, ...r.filter((x) => x !== id)].slice(0, 12)));
      },
      showToast: setToast,
    };
  }, [products, cart, wishlist, recent, couponCode, cartOpen, toast, quickViewId, notifyId]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
