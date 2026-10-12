import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../config/site';
import { useProducts } from '../data/products';
import ProductImage from './ProductImage';
import { SearchIcon } from './Icons';

const matches = (p, q) => [p.name, p.brand, p.category, p.franchise].join(' ').toLowerCase().includes(q);

// Search input with a live dropdown of matching products.
export default function SearchBox() {
  const products = useProducts();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const navigate = useNavigate();
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  // Start with the search box selected so visitors can type straight away.
  // Desktop only: on phones this would pop the keyboard open over the page.
  useEffect(() => {
    if (window.matchMedia('(min-width: 861px)').matches) inputRef.current?.focus({ preventScroll: true });
  }, []);

  const query = q.trim().toLowerCase();
  const results = query.length >= 2 ? products.filter((p) => matches(p, query)).slice(0, 6) : [];
  const total = query.length >= 2 ? products.filter((p) => matches(p, query)).length : 0;

  useEffect(() => {
    const onDoc = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    setActive(-1);
  }, [query]);

  const reset = () => {
    setQ('');
    setOpen(false);
  };

  const submit = (e) => {
    e.preventDefault();
    if (active >= 0 && results[active]) {
      navigate(`/products/${results[active].slug}`);
    } else if (query) {
      navigate(`/collections/all?q=${encodeURIComponent(q.trim())}`);
    }
    reset();
    document.activeElement?.blur();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <form className="search" onSubmit={submit} ref={boxRef} role="search">
      <input
        ref={inputRef}
        id="site-search"
        type="search"
        value={q}
        autoComplete="off"
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => q && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search figures, statues, brands…"
        aria-label="Search"
        aria-expanded={open && results.length > 0}
        aria-controls="search-suggestions"
      />
      <button aria-label="Search"><SearchIcon width={18} height={18} /></button>

      {open && query.length >= 2 && (
        <div className="suggest" id="search-suggestions" role="listbox">
          {results.length ? (
            <>
              {results.map((p, i) => (
                <Link
                  key={p.id}
                  to={`/products/${p.slug}`}
                  className={`suggest-item ${i === active ? 'active' : ''}`}
                  onClick={reset}
                  role="option"
                  aria-selected={i === active}
                >
                  <span className="suggest-img"><ProductImage product={p} /></span>
                  <span className="suggest-text">
                    <span className="suggest-name">{p.name}</span>
                    <span className="muted small">{p.brand} · {p.category}</span>
                  </span>
                  <span className="suggest-price">{formatPrice(p.price)}</span>
                </Link>
              ))}
              <button className="suggest-all">See all {total} results for “{q.trim()}” →</button>
            </>
          ) : (
            <p className="suggest-empty">No products found for “{q.trim()}”</p>
          )}
        </div>
      )}
    </form>
  );
}
