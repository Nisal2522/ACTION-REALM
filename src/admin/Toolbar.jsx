import { ChevronIcon, CloseIcon, FilterIcon, SearchIcon } from '../components/Icons';

// Search box with a magnifier icon and a one-click clear (✕) button.
export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="tb-search">
      <SearchIcon width={16} height={16} className="tb-search-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onChange('')}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button type="button" className="tb-clear" onClick={() => onChange('')} aria-label="Clear search" title="Clear">
          <CloseIcon width={14} height={14} />
        </button>
      )}
    </div>
  );
}

// Dropdown filter with an icon, a custom arrow, and a highlight when a filter is active.
// options: [{ value, label }] — the first option is the "show everything" choice.
export function FilterSelect({ value, onChange, options, label, icon: Icon = FilterIcon }) {
  const active = value !== options[0].value;
  return (
    <label className={`tb-select ${active ? 'active' : ''}`} title={label}>
      <Icon width={15} height={15} className="tb-select-icon" />
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronIcon width={14} height={14} className="tb-select-arrow" />
    </label>
  );
}
