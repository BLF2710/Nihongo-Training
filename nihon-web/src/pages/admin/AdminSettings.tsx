import { useState } from 'react';
import type { FormEvent } from 'react';
import { saveSettings } from '../../api/admin';
import type { Settings } from '../../api/admin';
import { adminError, button, card, input, useAdminData } from './adminData';
export default function AdminSettings(){
  const result=useAdminData<Settings>('/admin/settings');
  return <>{result.error&&<p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-800">{result.error} <button className={button} onClick={result.reload}>Retry</button></p>}{result.loading&&<p role="status">Loading settings…</p>}{result.data&&<SettingsForm initial={result.data}/>}</>;
}
function SettingsForm({initial}:{initial:Settings}){
  const [settings,setSettings]=useState(initial);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState('');
  async function save(event:FormEvent){event.preventDefault();if(busy)return;setBusy(true);setMessage('');setError('');try{setSettings(await saveSettings(settings));setMessage('Settings saved. Learners receive these settings on their next page navigation.');}catch(error){setError(adminError(error));}finally{setBusy(false);}}
  return <form className={card+' max-w-3xl'} onSubmit={save}><fieldset disabled={busy} className="space-y-6"><legend className="mb-5 text-xl font-bold">Platform settings</legend><label className="flex items-start gap-3"><input type="checkbox" className="mt-1 h-5 w-5 accent-emerald-600" checked={settings.registration_enabled} onChange={event=>setSettings({...settings,registration_enabled:event.target.checked})}/><span><strong>Allow new registrations</strong><span className="mt-1 block text-sm text-gray-500">Existing accounts can still sign in when registration is closed.</span></span></label><label className="block text-sm font-bold">Learner announcement<textarea rows={4} maxLength={500} className={input} value={settings.announcement} onChange={event=>setSettings({...settings,announcement:event.target.value})}/><span className="mt-1 block text-xs font-normal text-gray-500">Shown above learner pages. Leave blank to remove it. {settings.announcement.length}/500</span></label><button className={button+' border-emerald-500 text-emerald-800'}>{busy?'Saving…':'Save settings'}</button></fieldset>{error&&<p role="alert" className="mt-5 text-red-700">{error}</p>}{message&&<p role="status" className="mt-5 text-emerald-700">{message}</p>}<p className="mt-5 text-xs text-gray-500">Last updated: {new Date(settings.updated_at).toLocaleString()}</p></form>;
}
