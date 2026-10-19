// Finance: income & expense entries (entered in the admin) and the bank ledger built from them.
import { registerSeed } from '../services/db';

export const INCOME_METHODS = ['Cash', 'Bank transfer', 'Card (PayHere)', 'Cash on delivery', 'Store sale', 'Other'];
export const EXPENSE_METHODS = ['Supplier payment', 'Shipping & courier', 'Customs & duty', 'Packaging', 'Marketing', 'Rent', 'Salaries', 'Utilities', 'Other'];

const dayStr = (daysAgo) => new Date(Date.now() - daysAgo * 864e5).toISOString().slice(0, 10);
const e = (id, method, description, daysAgo, amount, shipmentNo = '', orderNo = '') => ({
  id, method, description, date: dayStr(daysAgo), amount, shipmentNo, orderNo, createdAt: new Date(Date.now() - daysAgo * 864e5).toISOString(),
});

// Sample entries — delete them from the Income / Expenses pages when you start using real figures.
registerSeed('income', () => [
  e('in1', 'Store sale', 'Colombo store walk-in sales', 2, 48500, 'SHP-003'),
  e('in2', 'Bank transfer', 'Wholesale order, Kandy collector club', 9, 125000, 'SHP-003', 'AR10031'),
  e('in3', 'Cash', 'Comic-con stall sales', 21, 86400, 'SHP-002'),
  e('in4', 'Card (PayHere)', 'Online sales settlement, week 2', 33, 212300, 'SHP-002'),
  e('in5', 'Store sale', 'Kandy store weekend sales', 47, 39800, 'SHP-001'),
  e('in6', 'Bank transfer', 'Corporate gift order (24 Funko Pops)', 58, 96000, 'SHP-001', 'AR10012'),
  e('in7', 'Cash on delivery', 'Courier COD remittance', 70, 154750, 'SHP-001'),
]);

registerSeed('expenses', () => [
  e('ex1', 'Supplier payment', 'Hot Toys & Iron Studios stock, batch 3', 6, 410000, 'SHP-003'),
  e('ex2', 'Customs & duty', 'Customs clearance, batch 3', 4, 92500, 'SHP-003'),
  e('ex3', 'Shipping & courier', 'Air freight HK to CMB, batch 3', 5, 68000, 'SHP-003'),
  e('ex4', 'Marketing', 'Facebook & Instagram ads, October', 10, 35000),
  e('ex5', 'Supplier payment', 'NECA & McFarlane stock, batch 2', 36, 265000, 'SHP-002'),
  e('ex6', 'Customs & duty', 'Customs clearance, batch 2', 34, 61200, 'SHP-002'),
  e('ex7', 'Packaging', 'Double-wall boxes & foam (500 pcs)', 30, 27500),
  e('ex8', 'Rent', 'Colombo store rent, September', 40, 120000),
  e('ex9', 'Supplier payment', 'Funko & Bandai stock, batch 1', 75, 180000, 'SHP-001'),
  e('ex10', 'Shipping & courier', 'Sea freight, batch 1', 72, 38500, 'SHP-001'),
]);

// One ledger row per money movement. Debit = expenses. Credit = income + pre-order amounts from shop orders.
export function buildLedger({ income, expenses, orders }) {
  const rows = [
    ...expenses.map((x) => ({ ...x, kind: 'debit', source: 'Expense', debit: Number(x.amount) || 0, credit: 0 })),
    ...income.map((x) => ({ ...x, kind: 'credit', source: 'Income', debit: 0, credit: Number(x.amount) || 0 })),
    ...orders
      .filter((o) => o.hasPreorder && o.status !== 'Cancelled' && o.payNow > 0)
      .map((o) => ({
        id: `po-${o.id}`,
        kind: 'credit',
        source: 'Pre-order',
        method: 'Pre-order payment',
        description: `Pre-order deposit from ${o.customer.name}`,
        date: o.createdAt.slice(0, 10),
        createdAt: o.createdAt,
        shipmentNo: o.shipmentNo || '',
        orderNo: o.id,
        debit: 0,
        credit: o.payNow,
      })),
  ];
  return rows.sort((a, b) => a.date.localeCompare(b.date) || (a.createdAt || '').localeCompare(b.createdAt || ''));
}
