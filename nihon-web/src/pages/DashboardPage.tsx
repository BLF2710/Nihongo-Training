import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import JapaneseDashboard from "./JapaneseDashboard";

const EnglishDashboard = lazy(() => import("./english/EnglishDashboard"));

/** The dashboard (/dashboard): every tool and statistic on one page, a step off the island. The Japanese and English
 *  courses each have one; anyone else is sent to their home page. */
export default function DashboardPage() {
  const { language } = useLanguage();
  if (language === "japanese") return <JapaneseDashboard />;
  if (language === "english") return <Suspense fallback={<p role="status" className="p-8 text-gray-500">Loading your dashboard…</p>}><EnglishDashboard /></Suspense>;
  return <Navigate to="/" replace />;
}
