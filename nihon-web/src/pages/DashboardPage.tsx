import { Navigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import JapaneseDashboard from "./JapaneseDashboard";

/** The dashboard (/dashboard): every tool and statistic on one page, a step off the island map. Only the Japanese
 *  course has one; anyone else is sent to their home page. */
export default function DashboardPage() {
  const { language } = useLanguage();
  return language === "japanese" ? <JapaneseDashboard /> : <Navigate to="/" replace />;
}
