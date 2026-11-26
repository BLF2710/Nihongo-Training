import { lazy, Suspense } from "react";
import GuestLandingPage from "./GuestLandingPage";
import LoadingPage from "../components/LoadingPage";
import { useLanguage } from "../context/LanguageContext";
import { hasSession } from "../lib/authStorage";

// Each language's learner is at home on its own island: the Japanese on the island map (the dashboard is a step off
// it, at /dashboard), the English on the English Isle.
const IslandMapPage = lazy(() => import("./IslandMapPage"));
const EnglishIslandPage = lazy(() => import("./EnglishIslandPage"));

export default function HomePage() {
  return hasSession() ? <LearnerHome /> : <GuestLandingPage />;
}

function LearnerHome() {
  const { language } = useLanguage();
  const isEnglish = language === "english";
  return <Suspense fallback={<LoadingPage label={isEnglish ? "Loading the island…" : "Loading map…"} />}>
    {isEnglish ? <EnglishIslandPage /> : <IslandMapPage />}
  </Suspense>;
}
