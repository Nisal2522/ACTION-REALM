import { createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

// The admin page header provides a slot (a DOM node) for page-level buttons such as "Add product".
export const PageActionsSlot = createContext(null);

// Render children into the page header, aligned with the page title.
export default function PageActions({ children }) {
  const node = useContext(PageActionsSlot);
  return node ? createPortal(children, node) : null;
}
