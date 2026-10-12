// Microsoft Excel logo (simplified official mark).
export function ExcelLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path fill="#185C37" d="M19.6 15.3 8.3 13.3v14.8c0 .7.5 1.2 1.2 1.2h19.6c.7 0 1.2-.5 1.2-1.2v-5.4z" />
      <path fill="#21A366" d="M19.6 2.7H9.5c-.7 0-1.2.5-1.2 1.2V9.3L19.6 16l6 2 4.6-2V9.3z" />
      <path fill="#107C41" d="M8.3 9.3h11.3V16H8.3z" />
      <path fill="#33C481" d="M29.1 2.7h-9.5v6.6h10.7V3.9c0-.7-.5-1.2-1.2-1.2z" />
      <path fill="#107C41" d="M19.6 16h10.7v6.7H19.6z" />
      <rect fill="#107C41" x="1.7" y="8.7" width="14.6" height="14.6" rx="1.4" />
      <path fill="#fff" d="m4.8 19.9 3.1-4.9-2.9-4.9h2.3l1.6 3.1c.1.3.2.5.3.7.1-.2.2-.5.3-.7l1.7-3.1h2.2L10.5 15l3 4.9h-2.3l-1.8-3.4-.2-.5-.3.5-1.8 3.4z" />
    </svg>
  );
}

// Download rows (first row = headings) as a file that opens in Excel.
// Uses CSV with a UTF-8 BOM so names and "Rs." show correctly in Excel.
export function downloadExcel(filename, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `${filename}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// Square button with the Excel logo, used wherever data can be exported.
export default function ExcelButton({ onClick, label = 'Export to Excel', small = false }) {
  return (
    <button type="button" className={`excel-btn ${small ? 'sm' : ''}`} onClick={onClick} aria-label={label} title={label}>
      <ExcelLogo size={small ? 18 : 22} />
    </button>
  );
}
