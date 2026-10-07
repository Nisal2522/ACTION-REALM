import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { SITE } from './config/site';
import { trackPageView } from './services/analytics';
import { useStore } from './context/StoreContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import BottomNav from './components/BottomNav';
import { NewsletterPopup, NotifyModal, QuickView } from './components/Modals';
import { WhatsAppIcon } from './components/Icons';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductPage from './pages/ProductPage';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import { OrderConfirmation, TrackOrder } from './pages/OrderPages';
import { Account, Login } from './pages/AccountPages';
import { Contact, InfoPage, Rewards } from './pages/InfoPages';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

function RouteEffects() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    trackPageView(pathname + search);
  }, [pathname, search]);
  return null;
}

export default function App() {
  const { toast } = useStore();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      <RouteEffects />
      <a href="#main" className="skip-link">Skip to content</a>
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections/:slug" element={<Shop />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:id" element={<OrderConfirmation />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/pages/:slug" element={<InfoPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <BottomNav />
      <QuickView />
      <NotifyModal />
      {!isAdmin && <NewsletterPopup />}
      {!isAdmin && (
        <a className="whatsapp" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
          <WhatsAppIcon />
        </a>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
