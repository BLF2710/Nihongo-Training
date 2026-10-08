import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { clearSession, saveUserRole } from '../../lib/authStorage';
import { button, useAdminData } from './adminData';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminContent from './AdminContent';
import AdminSettings from './AdminSettings';
const links=[['/admin','Overview'],['/admin/users','Manage users'],['/admin/content','Manage content'],['/admin/system/status','System status'],['/admin/system/settings','System settings'],['/admin/system/roles','User roles']];
export default function AdminPage(){
  const access=useAdminData<{id:number;username:string;role:string}>('/admin/access');
  const [open,setOpen]=useState(false);
  const location=useLocation();
  const navigate=useNavigate();
  const role=access.data?.role;
  // Keeps the stored role in step with the server, so a demoted account is no longer sent here.
  useEffect(()=>{if(role)saveUserRole(role);},[role]);
  const logout=()=>{clearSession();navigate('/login');};
  if(access.loading&&!access.data)return <main className="mx-auto max-w-lg p-8"><p role="status">Checking administrator access…</p></main>;
  if(access.error||access.data?.role!=='admin')return <main className="mx-auto max-w-lg p-8"><h1 className="text-2xl font-black">Administrator access required</h1><p role="alert" className="my-5">{access.error||'This account does not have permission to use the admin area.'}</p><button className={button} onClick={access.reload}>Retry</button> {access.data?<Link className={button} to="/">Return to learning</Link>:<button className={button} onClick={logout}>Log out</button>}</main>;
  const title=links.find(([path])=>path===location.pathname)?.[1] ?? 'Page not found';
  return <div className="min-h-screen bg-gray-50 text-gray-900">
    <header className="sticky top-0 z-30 flex h-18 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 sm:px-6"><div className="flex items-center gap-3"><button className={button+' lg:hidden'} aria-label="Toggle admin navigation" aria-expanded={open} onClick={()=>setOpen(!open)}>☰</button><Link to="/admin" className="text-xl font-black">Lingo<span className="text-emerald-600">Hub</span> <span className="text-sm font-semibold text-gray-500">Admin</span></Link></div><button className={button} onClick={logout}>Log out</button></header>
    {open&&<button className="fixed inset-0 top-18 z-30 bg-black/30 lg:hidden" aria-label="Close admin navigation" onClick={()=>setOpen(false)}/>}
    <aside aria-label="Admin sidebar" className={`fixed bottom-0 left-0 top-18 z-40 w-64 border-r border-gray-200 bg-white p-5 transition-transform lg:translate-x-0 ${open?'translate-x-0':'-translate-x-full'}`}><p className="mb-4 truncate text-sm font-semibold text-gray-500">Signed in as {access.data?.username}</p><nav aria-label="Admin navigation" className="space-y-2">{links.map(([path,label])=><NavLink key={path} end to={path} onClick={()=>setOpen(false)} className={({isActive})=>`block rounded-xl px-4 py-3 text-sm font-bold ${isActive?'bg-emerald-50 text-emerald-800':'text-gray-600 hover:bg-gray-50'}`}>{label}</NavLink>)}</nav></aside>
    <main className="min-w-0 px-4 py-8 sm:px-8 lg:ml-64"><div className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Administration</p><h1 className="mb-7 mt-2 text-3xl font-black">{title}</h1><div key={location.pathname}>
      {location.pathname==='/admin'?<AdminOverview/>:location.pathname==='/admin/users'?<AdminUsers currentId={access.data!.id}/>:location.pathname==='/admin/content'?<AdminContent/>:location.pathname==='/admin/system/status'?<AdminOverview statusOnly/>:location.pathname==='/admin/system/settings'?<AdminSettings/>:location.pathname==='/admin/system/roles'?<AdminUsers currentId={access.data!.id} rolesOnly/>:<Link to="/admin" className={button}>Go to overview</Link>}
    </div></div></main>
  </div>;
}
