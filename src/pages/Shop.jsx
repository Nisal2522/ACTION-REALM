import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { SITE, formatPrice } from '../config/site';
import { isAvailableNow, isSoldOut, useProducts } from '../data/products';
import { getCollection } from '../data/collections';
import ProductCard from '../components/ProductCard';
import { ProductRail } from '../components/HomeSections';
import { CloseIcon, FilterIcon, SearchIcon } from '../components/Icons';
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
  new: { label: 'New Arrivals', fn: (p) => p.isNew },
};

// Filters live in the URL (?brand=NECA,Funko&cat=Statues&avail=instock&max=5000&sort=price-asc)
// so they survive refreshes and can be shared.
const readList = (params, key) => (params.get(key) ? params.get(key).split(',') : []);
const plural = (n) => `${n} ${n === 1 ? 'product' : 'products'}`;
const countBy = (list, fn) => list.reduce((m, p) => m.set(fn(p), (m.get(fn(p)) || 0) + 1), new Map());

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

  // Each filter is kept separate so the sidebar can show how many products
  // every option would give with the other filters still applied.
  const tests = {
    brand: (p) => !brands.length || brands.includes(p.brand),
    cat: (p) => !categories.length || categories.includes(p.category),
    avail: (p) => availability === 'all' || AVAILABILITY[availability].fn(p),
    max: (p) => p.price <= effectiveMax,
  };
  const without = (skip) => base.filter((p) => Object.entries(tests).every(([k, t]) => k === skip || t(p)));
  const brandCounts = countBy(without('brand'), (p) => p.brand);
  const categoryCounts = countBy(without('cat'), (p) => p.category);
  const availPool = without('avail');
  const availOptions = Object.entries(AVAILABILITY)
    .map(([key, a]) => ({ key, label: a.label, count: availPool.filter(a.fn).length }))
    .filter((a) => a.count > 0 || a.key === availability);

  const results = without(null).sort(SORTS[sort].fn);

  const chips = [
    ...(availability !== 'all' ? [{ label: AVAILABILITY[availability].label, clear: () => update({ avail: null }) }] : []),
    ...categories.map((c) => ({ label: c, clear: () => toggleIn('cat', categories, c) })),
    ...brands.map((b) => ({ label: b, clear: () => toggleIn('brand', brands, b) })),
    ...(maxParam < priceCeil ? [{ label: `Under ${formatPrice(maxParam)}`, clear: () => update({ max: null }) }] : []),
  ];
  const clearAll = () => update({ avail: null, cat: null, brand: null, max: null });

  // A short result list leaves the page empty, so suggest close matches
  // (same franchise or category first, then featured items).
  const shown = new Set(results.map((p) => p.id));
  const near = new Set(results.flatMap((p) => [p.franchise, p.category]));
  const score = (p) => near.has(p.franchise) + near.has(p.category) + Number(p.featured) * 0.5;
  const related = results.length < 4
    ? products.filter((p) => !shown.has(p.id)).sort((a, b) => score(b) - score(a)).slice(0, 10)
    : [];

  return (
    <>
      <div className="container shop">
        <header className="shop-head">
          <div className="shop-title">
            <span className="shop-eyebrow">{q ? 'Search results' : 'Collection'}</span>
            <h1>{q ? `“${qRaw}”` : collection.title}</h1>
            <p className="muted">
              {plural(results.length)}
              {q && slug !== 'all' && <> in {collection.title}</>}
            </p>
          </div>
          {q && <RefineSearch key={qRaw} initial={qRaw} onClear={() => update({ q: null })} />}
        </header>
        {slug === 'sale' && <SaleCountdown />}

        <div className="shop-layout">
          <div className={`overlay filters-overlay ${filtersOpen ? 'show' : ''}`} onClick={() => setFiltersOpen(false)} />
          <aside className={`filters ${filtersOpen ? 'open' : ''}`} aria-label="Filters">
            <div className="filters-head">
              <h3><FilterIcon width={18} height={18} /> Filters</h3>
              {chips.length > 0 && <button className="link-btn desktop-only" onClick={clearAll}>Clear all</button>}
              <button className="icon-btn mobile-only" onClick={() => setFiltersOpen(false)} aria-label="Close filters"><CloseIcon /></button>
            </div>
            <div className="filters-body">
              {availOptions.length > 0 && (
                <div className="filter-group">
                  <h4>Availability</h4>
                  <div className="filter-pills">
                    <button className={availability === 'all' ? 'active' : ''} onClick={() => update({ avail: null })}>
                      All <span>{availPool.length}</span>
                    </button>
                    {availOptions.map((a) => (
                      <button key={a.key} className={availability === a.key ? 'active' : ''} onClick={() => update({ avail: availability === a.key ? null : a.key })}>
                        {a.label} <span>{a.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <CheckGroup title="Category" options={categoryOptions} counts={categoryCounts} selected={categories} onToggle={(c) => toggleIn('cat', categories, c)} />
              <CheckGroup title="Brand" options={brandOptions} counts={brandCounts} selected={brands} onToggle={(b) => toggleIn('brand', brands, b)} />
              {priceCeil > 1000 && (
                <div className="filter-group">
                  <h4>Price</h4>
                  <p className="price-readout">Up to <strong>{formatPrice(effectiveMax)}</strong></p>
                  <input
                    type="range"
                    min="1000"
                    max={priceCeil}
                    step="500"
                    value={effectiveMax}
                    onChange={(e) => update({ max: Number(e.target.value) >= priceCeil ? null : e.target.value })}
                    style={{ '--fill': `${((effectiveMax - 1000) / (priceCeil - 1000)) * 100}%` }}
                    aria-label="Maximum price"
                  />
                  <div className="range-ends muted small"><span>{formatPrice(1000)}</span><span>{formatPrice(priceCeil)}</span></div>
                </div>
              )}
            </div>
            <div className="filters-foot mobile-only">
              <button className="btn btn-outline" onClick={clearAll}>Clear</button>
              <button className="btn grow" onClick={() => setFiltersOpen(false)}>Show {plural(results.length)}</button>
            </div>
          </aside>

          <div className="shop-main">
            <div className="shop-toolbar">
              <button className="btn btn-outline btn-sm mobile-only" onClick={() => setFiltersOpen(true)}>
                <FilterIcon width={16} height={16} /> Filters{chips.length > 0 && ` (${chips.length})`}
              </button>
              <p className="muted small desktop-only">
                {results.length ? `Showing ${Math.min(visible, results.length)} of ${plural(results.length)}` : 'No matches'}
              </p>
              <label className="sort">
                Sort by
                <select value={sort} onChange={(e) => update({ sort: e.target.value === 'featured' ? null : e.target.value })}>
                  {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
                </select>
              </label>
            </div>

            {results.length ? (
              <>
                <div className="grid shop-grid">{results.slice(0, visible).map((p) => <ProductCard key={p.id} product={p} />)}</div>
                {visible < results.length && (
                  <div className="center load-more">
                    <p className="muted small">Showing {visible} of {results.length}</p>
                    <button className="btn btn-outline" onClick={() => setVisible(visible + PAGE_SIZE)}>Load More</button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty shop-empty">
                <SearchIcon width={36} height={36} />
                <h3>{chips.length ? 'No products match these filters' : q ? `Nothing found for “${qRaw}”` : 'Nothing here yet'}</h3>
                <p className="muted">{chips.length ? 'Try removing a filter or raising the price limit.' : 'Check the spelling, or try a character, brand or franchise name.'}</p>
                {chips.length > 0
                  ? <button className="btn" onClick={clearAll}>Clear Filters</button>
                  : <Link to="/collections/all" className="btn">Browse All Products</Link>}
              </div>
            )}

          </div>
        </div>
      </div>
      {related.length > 0 && <ProductRail title={results.length ? 'You Might Also Like' : SITE.homeTitles.picks} products={related} />}
    </>
  );
}

function CheckGroup({ title, options, counts, selected, onToggle }) {
  if (!options.length) return null;
  return (
    <div className="filter-group">
      <h4>{title}</h4>
      {options.map((o) => (
        <label key={o} className={!counts.get(o) && !selected.includes(o) ? 'is-empty' : ''}>
          <input type="checkbox" checked={selected.includes(o)} onChange={() => onToggle(o)} />
          <span className="grow">{o}</span>
          <span className="filter-count">{counts.get(o) || 0}</span>
        </label>
      ))}
    </div>
  );
}

// Lets shoppers change the search words without going back to the header.
function RefineSearch({ initial, onClear }) {
  const [value, setValue] = useState(initial);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const submit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (value.trim()) next.set('q', value.trim());
    else next.delete('q');
    navigate({ search: next.toString() }, { replace: true });
  };
  return (
    <form className="refine-search" onSubmit={submit} role="search">
      <SearchIcon width={18} height={18} />
      <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Search again" aria-label="Search products" />
      {value && <button type="button" className="icon-btn sm" onClick={onClear} aria-label="Clear search"><CloseIcon width={16} height={16} /></button>}
      <button type="submit" className="btn btn-sm">Search</button>
    </form>
  );
}
