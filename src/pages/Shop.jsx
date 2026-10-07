import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { formatPrice } from '../config/site';
import { isAvailableNow, isSoldOut, useProducts } from '../data/products';
import { getCollection } from '../data/collections';
import ProductCard from '../components/ProductCard';
import { CloseIcon, FilterIcon } from '../components/Icons';
import { SaleCountdown } from '../components/ui';
import useTitle from '../hooks/useTitle';
import NotFound from './NotFound';

const PAGE_SIZE = 12;

const SORTS = {
  featured: { label: 'Featured', fn: (a, b) => Number(b.featured) - Number(a.featured) },
  newest: { label: 'Newest', fn: (a, b) => b.id - a.id },
  'price-asc': { label: 'Price: Low to High', fn: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price: High to Low', fn: (a, b) => b.price - a.price },
  name: { label: 'Name: A–Z', fn: (a, b) => a.name.localeCompare(b.name) },
};

const AVAILABILITY = {
  instock: { label: 'In Stock', fn: isAvailableNow },
  preorder: { label: 'Pre-Order', fn: (p) => p.status === 'preorder' },
  soldout: { label: 'Sold Out', fn: isSoldOut },
};

// Filters live in the URL (?brand=NECA,Funko&cat=Statues&avail=instock&max=5000&sort=price-asc)
// so they survive refreshes and can be shared.
const readList = (params, key) => (params.get(key) ? params.get(key).split(',') : []);

export default function Shop() {
  const { slug = 'all' } = useParams();
  const [params, setParams] = useSearchParams();
  const products = useProducts();
  const collection = getCollection(slug);
  const qRaw = params.get('q') || '';
  const q = qRaw.toLowerCase();
  const brands = readList(params, 'brand');
  const categories = readList(params, 'cat');
  const availability = AVAILABILITY[params.get('avail')] ? params.get('avail') : 'all';
  const maxParam = Number(params.get('max')) || Infinity;
  const sort = SORTS[params.get('sort')] ? params.get('sort') : 'featured';

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  useTitle(q ? `Search: ${qRaw}` : collection?.title);

  const paramsKey = params.toString();
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [paramsKey, slug]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => {
      if (v === null || v === '' || (Array.isArray(v) && !v.length)) next.delete(k);
      else next.set(k, Array.isArray(v) ? v.join(',') : v);
    });
    setParams(next, { replace: true });
  };
  const toggleIn = (key, list, value) =>
    update({ [key]: list.includes(value) ? list.filter((x) => x !== value) : [...list, value] });

  const base = useMemo(() => {
    if (!collection) return [];
    return products.filter(collection.filter).filter(
      (p) => !q || [p.name, p.brand, p.category, p.franchise].join(' ').toLowerCase().includes(q),
    );
  }, [collection, q, products]);

  if (!collection) return <NotFound />;

  const brandOptions = [...new Set(base.map((p) => p.brand))].sort();
  const categoryOptions = [...new Set(base.map((p) => p.category))].sort();
  const priceCeil = Math.max(1000, ...base.map((p) => p.price));
  const effectiveMax = Math.min(maxParam, priceCeil);

  const results = base
    .filter((p) => !brands.length || brands.includes(p.brand))
    .filter((p) => !categories.length || categories.includes(p.category))
    .filter((p) => availability === 'all' || AVAILABILITY[availability].fn(p))
    .filter((p) => p.price <= effectiveMax)
    .sort(SORTS[sort].fn);

  const chips = [
    ...(availability !== 'all' ? [{ label: AVAILABILITY[availability].label, clear: () => update({ avail: null }) }] : []),
    ...categories.map((c) => ({ label: c, clear: () => toggleIn('cat', categories, c) })),
    ...brands.map((b) => ({ label: b, clear: () => toggleIn('brand', brands, b) })),
    ...(maxParam < priceCeil ? [{ label: `Under ${formatPrice(maxParam)}`, clear: () => update({ max: null }) }] : []),
  ];
  const clearAll = () => update({ avail: null, cat: null, brand: null, max: null });

  return (
    <div className="container shop">
      <nav className="crumbs"><Link to="/">Home</Link> / <span>{collection.title}</span></nav>
      <div className="shop-head">
        <h1>{q ? `Search: “${qRaw}”` : collection.title}</h1>
        <p className="muted">{results.length} products</p>
      </div>
      {slug === 'sale' && <SaleCountdown />}

      <div className="shop-toolbar">
        <button className="btn btn-outline btn-sm mobile-only" onClick={() => setFiltersOpen(true)}>
          <FilterIcon width={16} height={16} /> Filters{chips.length > 0 && ` (${chips.length})`}
        </button>
        <label className="sort">
          Sort by
          <select value={sort} onChange={(e) => update({ sort: e.target.value === 'featured' ? null : e.target.value })}>
            {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
          </select>
        </label>
      </div>

      {chips.length > 0 && (
        <div className="chips">
          {chips.map((c) => (
            <button key={c.label} className="chip" onClick={c.clear}>
              {c.label} <CloseIcon width={14} height={14} />
            </button>
          ))}
          <button className="link-btn" onClick={clearAll}>Clear all</button>
        </div>
      )}

      <div className="shop-layout">
        <div className={`overlay filters-overlay ${filtersOpen ? 'show' : ''}`} onClick={() => setFiltersOpen(false)} />
        <aside className={`filters ${filtersOpen ? 'open' : ''}`} aria-label="Filters">
          <div className="filters-head mobile-only">
            <h3>Filters</h3>
            <button className="icon-btn" onClick={() => setFiltersOpen(false)} aria-label="Close filters"><CloseIcon /></button>
          </div>
          <div className="filters-body">
            <div className="filter-group">
              <h4>Availability</h4>
              {[['all', 'All'], ...Object.entries(AVAILABILITY).map(([k, v]) => [k, v.label])].map(([v, l]) => (
                <label key={v}>
                  <input type="radio" name="avail" checked={availability === v} onChange={() => update({ avail: v === 'all' ? null : v })} /> {l}
                </label>
              ))}
            </div>
            {categoryOptions.length > 1 && (
              <div className="filter-group">
                <h4>Category</h4>
                {categoryOptions.map((c) => (
                  <label key={c}><input type="checkbox" checked={categories.includes(c)} onChange={() => toggleIn('cat', categories, c)} /> {c}</label>
                ))}
              </div>
            )}
            {brandOptions.length > 1 && (
              <div className="filter-group">
                <h4>Brand</h4>
                {brandOptions.map((b) => (
                  <label key={b}><input type="checkbox" checked={brands.includes(b)} onChange={() => toggleIn('brand', brands, b)} /> {b}</label>
                ))}
              </div>
            )}
            <div className="filter-group">
              <h4>Max Price: {formatPrice(effectiveMax)}</h4>
              <input
                type="range"
                min="1000"
                max={priceCeil}
                step="500"
                value={effectiveMax}
                onChange={(e) => update({ max: Number(e.target.value) >= priceCeil ? null : e.target.value })}
              />
            </div>
          </div>
          <div className="filters-foot mobile-only">
            <button className="btn btn-outline" onClick={clearAll}>Clear</button>
            <button className="btn grow" onClick={() => setFiltersOpen(false)}>Show {results.length} results</button>
          </div>
        </aside>

        <div>
          {results.length ? (
            <>
              <div className="grid">{results.slice(0, visible).map((p) => <ProductCard key={p.id} product={p} />)}</div>
              {visible < results.length && (
                <div className="center load-more">
                  <p className="muted small">Showing {visible} of {results.length}</p>
                  <button className="btn btn-outline" onClick={() => setVisible(visible + PAGE_SIZE)}>Load More</button>
                </div>
              )}
            </>
          ) : (
            <div className="empty">
              <p>No products match these filters.</p>
              {chips.length > 0
                ? <button className="btn" onClick={clearAll}>Clear Filters</button>
                : <Link to="/collections/all" className="btn">Browse All Products</Link>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
