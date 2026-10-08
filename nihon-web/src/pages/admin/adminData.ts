import { useEffect, useState } from 'react';
import { fetchAdmin } from '../../api/admin';
import { apiErrorMessage } from '../../api/errors';
export const adminError=(error:unknown)=>apiErrorMessage(error,'The request failed. Please try again.');
export const button='inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-emerald-600';
export const input='mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 focus-visible:outline-2 focus-visible:outline-emerald-600';
export const card='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6';
export function useAdminData<T>(path:string) {
  const [data,setData]=useState<T|null>(null);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const [version,setVersion]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    fetchAdmin<T>(path,controller.signal).then(result=>{if(!controller.signal.aborted){setData(result);setError('');}}).catch(error=>{if(!controller.signal.aborted)setError(adminError(error));}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return ()=>controller.abort();
  },[path,version]);
  return {data,error,loading,reload:()=>{setLoading(true);setVersion(value=>value+1);}};
}
