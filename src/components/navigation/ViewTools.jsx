import { useContext } from 'react';
import { createPortal } from 'react-dom';
import { ViewToolsContext } from './viewToolsContext';

/** Render view actions below navigation while preserving their local state. */
export default function ViewTools({ children }) {
  const target = useContext(ViewToolsContext);
  return target ? createPortal(children, target) : null;
}
