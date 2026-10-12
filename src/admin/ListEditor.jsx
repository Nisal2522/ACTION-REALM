import { useState } from 'react';
import { db, useCollection } from '../services/db';
import SidePanel from './SidePanel';
import { EditIcon, PlusIcon, TrashIcon } from '../components/Icons';
import { Field } from './fields';

// Generic add / edit / delete / reorder editor for any content collection.
// fields: [{ key, label, type, ... }]  columns: [{ label, render(item) }]
export default function ListEditor({ collection, title, intro, fields, columns, newItem = {}, sortable = true, validate, itemName = 'item' }) {
  const items = useCollection(collection);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const move = (index, dir) => {
    const next = [...items];
    [next[index], next[index + dir]] = [next[index + dir], next[index]];
    db.replaceAll(collection, next);
  };

  const remove = (item) => {
    if (window.confirm(`Delete this ${itemName}?`)) db.remove(collection, item.id);
  };

  const save = (e) => {
    e.preventDefault();
    const problem = validate?.(editing, items);
    if (problem) return setError(problem);
    const { id, createdAt, updatedAt, ...data } = editing; // eslint-disable-line no-unused-vars
    if (id) db.update(collection, id, data);
    else db.insert(collection, data);
    setEditing(null);
  };

  return (
    <div className="list-editor">
      <div className="admin-toolbar between">
        <div>
          {title && <h3 className="no-margin">{title}</h3>}
          {intro && <p className="muted small no-margin">{intro}</p>}
        </div>
        <button className="btn" onClick={() => { setEditing({ ...newItem }); setError(''); }}><PlusIcon width={16} height={16} /> Add {itemName}</button>
      </div>
      {items.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {sortable && <th className="narrow-col">Order</th>}
                {columns.map((c) => <th key={c.label}>{c.label}</th>)}
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id}>
                  {sortable && (
                    <td className="order-btns">
                      <button className="icon-btn sm" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
                      <button className="icon-btn sm" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
                    </td>
                  )}
                  {columns.map((c) => <td key={c.label}>{c.render(item)}</td>)}
                  <td className="actions">
                    <button className="icon-btn sm" onClick={() => { setEditing(item); setError(''); }} aria-label="Edit"><EditIcon width={16} height={16} /></button>
                    <button className="icon-btn sm danger" onClick={() => remove(item)} aria-label="Delete"><TrashIcon width={16} height={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="empty"><p>Nothing here yet.</p></div>}

      <SidePanel
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        onSubmit={save}
        title={editing?.id ? `Edit ${itemName}` : `Add ${itemName}`}
        footer={(
          <>
            {error && <p className="error sp-error">{error}</p>}
            <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn">Save</button>
          </>
        )}
      >
        {editing && (
          <div className="form-grid">
            {fields.map((f) => (
              <Field key={f.key} field={f} value={editing[f.key]} onChange={(v) => setEditing({ ...editing, [f.key]: v })} />
            ))}
          </div>
        )}
      </SidePanel>
    </div>
  );
}
