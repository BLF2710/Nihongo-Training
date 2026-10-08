import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { fetchSite } from "../api/site";
import type { SiteInfo } from "../api/site";

// A disabled page also covers its detail pages (/learn/hiragana/12), but Kanji practice is managed on its own.
const covers = (managedPath: string, pathname: string) =>
  pathname === managedPath || (pathname.startsWith(`${managedPath}/`) && !pathname.endsWith("/practice"));

/** Applies administrator settings to learner pages: the announcement banner and content that is switched off. */
export default function SiteGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [site, setSite] = useState<SiteInfo | null>(null);
  // Refreshed on every navigation so administrator changes reach learners without a reload.
  useEffect(() => {
    const controller = new AbortController();
    // If the settings cannot be loaded the last known state stays in effect; the API still enforces availability.
    fetchSite(controller.signal).then(setSite).catch(() => undefined);
    return () => controller.abort();
  }, [pathname]);

  if (pathname.startsWith("/admin")) return children;
  const unavailable = site?.disabled?.find(item => item.paths.some(path => covers(path, pathname)));
  return <>
    {site?.announcement && <p role="status" className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-900">📣 {site.announcement}</p>}
    {unavailable ? <div className="min-h-screen bg-gray-50"><Navbar /><main className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-black text-gray-900">Temporarily unavailable</h1>
        <p className="mt-3 text-gray-600">{unavailable.title} has been switched off by an administrator. Your progress is saved and will be here when it returns.</p>
        <Link to="/" className="mt-6 inline-block rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">Return to dashboard</Link>
      </section>
    </main></div> : children}
  </>;
}
