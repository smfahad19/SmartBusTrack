import { useOutletContext } from 'react-router-dom';
import InstituteScope from './InstituteScope';
export default function PageToolbar({ children, search }) {
  const { scope, changeScope, isSuperadmin } = useOutletContext();
  return <div className="page-controls">{children&&<div className="page-toolbar-actions">{children}</div>}{(isSuperadmin || search) && <div className="page-toolbar">{isSuperadmin && <InstituteScope value={scope} onChange={changeScope}/>} {search && <div className="toolbar-search">{search}</div>}</div>}</div>;
}
