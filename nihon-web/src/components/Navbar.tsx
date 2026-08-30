import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, supportedLanguages, setLanguage } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState({ language: true, learn: true, practice: true, games: true });
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("user_name") || "Learner";
  const userEmail = localStorage.getItem("user_email") || "";

  const go = (path: string) => { navigate(path); setSidebarOpen(false); };
  const selectLanguage = (id: string) => { setLanguage(id); go("/"); };
  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user_name"); localStorage.removeItem("user_email"); go("/"); };
  const active = (isActive: boolean) => isActive
    ? "bg-indigo-50 text-indigo-700 font-bold"
    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen((open) => ({ ...open, [section]: !open[section] }));
  };
  const sectionButton = (label: string, section: keyof typeof sectionsOpen) => (
    <button onClick={() => toggleSection(section)} className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold tracking-wider uppercase text-gray-400 hover:text-gray-700 transition cursor-pointer" aria-expanded={sectionsOpen[section]}>
      {label}<span className="text-base leading-none">{sectionsOpen[section] ? "−" : "+"}</span>
    </button>
  );

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen((open) => !open)} className="w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition cursor-pointer" aria-label="Toggle navigation sidebar" aria-expanded={sidebarOpen}>☰</button>
            <button onClick={() => go("/")} className="flex items-center gap-2.5 text-xl sm:text-2xl font-black text-gray-900 tracking-tight cursor-pointer">
              <span className="w-9 h-9 bg-linear-to-br from-indigo-600 to-emerald-500 rounded-xl flex items-center justify-center text-white text-lg shadow-sm">🌐</span>
              <span>Lingo<span className="text-emerald-600">Hub</span></span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {token && <button onClick={() => go(language === "english" ? "/statistics/english" : "/statistics/japanese")} className={`px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${active(location.pathname.startsWith("/statistics"))}`}><span className="hidden sm:inline">📊 </span>Statistics</button>}
            {token ? <>
              <button onClick={() => setProfileOpen((open) => !open)} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition cursor-pointer" aria-label="Open account details" aria-expanded={profileOpen}>
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">{userName.charAt(0).toUpperCase()}</span>
                <span className="text-sm font-semibold text-gray-700 max-w-28 truncate">{userName}</span>
              </button>
              <button onClick={logout} className="bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 px-3.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer">Logout</button>
            </> : <button onClick={() => go("/login")} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xs transition cursor-pointer">Sign In</button>}
          </div>
        </div>
      </header>

      {token && profileOpen && <div className="fixed top-16 right-4 sm:right-6 z-50 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl p-4">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-full bg-linear-to-br from-emerald-500 to-indigo-600 text-white flex items-center justify-center text-lg font-black">{userName.charAt(0).toUpperCase()}</span>
          <div className="min-w-0"><p className="font-bold text-gray-900 truncate">{userName}</p><p className="text-xs text-gray-500 truncate">{userEmail || "Signed-in learner"}</p></div>
        </div>
        <button onClick={() => go("/profile")} className="mt-4 w-full rounded-lg bg-emerald-600 py-2 text-sm font-bold text-white">View profile & settings</button>
      </div>}

      {sidebarOpen && <button className="fixed inset-0 bg-black/25 z-30 cursor-default" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      <aside className={`fixed top-18 left-0 bottom-0 z-40 w-72 bg-white border-r border-gray-200 shadow-xl transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full overflow-y-auto p-4 flex flex-col">
          <div className="mb-5"><p className="px-3 text-[11px] font-bold tracking-wider uppercase text-gray-400">Navigation</p>
            <button onClick={() => go("/")} className={`mt-2 w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm transition cursor-pointer ${active(location.pathname === "/")}`}><span>⌂</span> Dashboard</button>
          </div>
          <div className="mb-4">{sectionButton("Learning language", "language")}{sectionsOpen.language && <div className="mt-1 space-y-1">
            {supportedLanguages.map((item) => <button key={item.id} disabled={!item.enabled} onClick={() => item.enabled && selectLanguage(item.id)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm transition ${item.enabled ? "cursor-pointer" : "cursor-not-allowed opacity-45"} ${language === item.id ? "bg-emerald-50 text-emerald-800 font-bold" : "text-gray-600 hover:bg-gray-100"}`}>
              <span className="flex items-center gap-3"><span className="text-lg">{item.flag}</span>{item.name}</span>{language === item.id ? <span>✓</span> : !item.enabled && <span className="text-[10px] font-bold">Soon</span>}
            </button>)}
          </div>}</div>
          <div className="mb-4">{sectionButton("Learn", "learn")}{sectionsOpen.learn && <div className="mt-1 space-y-1">
            <button onClick={() => language === "japanese" && go("/lessons")} disabled={language !== "japanese"} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition ${language === "japanese" ? `cursor-pointer ${active(location.pathname.startsWith("/lessons"))}` : "text-gray-400 cursor-not-allowed"}`}><span>📖</span> Lessons {language !== "japanese" && <span className="ml-auto text-[10px]">Soon</span>}</button>
            <button disabled className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-gray-400 cursor-not-allowed"><span>🧠</span> Vocabulary <span className="ml-auto text-[10px]">Soon</span></button>
            <button disabled className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-gray-400 cursor-not-allowed"><span>✍️</span> Grammar <span className="ml-auto text-[10px]">Soon</span></button>
            {language === "japanese" && <>
              <button disabled className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-gray-400 cursor-not-allowed"><span>あ</span> Kana <span className="ml-auto text-[10px]">Soon</span></button>
              <button disabled className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-gray-400 cursor-not-allowed"><span>漢</span> Kanji <span className="ml-auto text-[10px]">Soon</span></button>
            </>}
          </div>}</div>
          <div>{sectionButton("Practice", "practice")}{sectionsOpen.practice && <div className="mt-1 space-y-1">
            <div>{sectionButton("🎮 Games", "games")}{sectionsOpen.games && <div className="ml-3 mt-1 space-y-1 border-l border-gray-100 pl-2">
              {language === "english" ? <button onClick={() => go("/arcade")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition cursor-pointer ${active(location.pathname.startsWith("/arcade"))}`}><span>🧩</span> English Arcade</button> : <>
                <button onClick={() => go("/practice?type=hiragana")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition cursor-pointer ${active(location.pathname === "/practice")}`}><span>あ</span> Hiragana Speed Quiz</button>
                <button onClick={() => go("/practice?type=katakana")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition cursor-pointer ${active(location.pathname === "/practice")}`}><span>ア</span> Katakana Speed Quiz</button>
              </>}
            </div>}</div>
            <button disabled className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-gray-400 cursor-not-allowed"><span>📝</span> Quizzes <span className="ml-auto text-[10px]">Soon</span></button>
            <button disabled className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-gray-400 cursor-not-allowed"><span>🔄</span> Review <span className="ml-auto text-[10px]">Soon</span></button>
          </div>}</div>
        </div>
      </aside>
    </>
  );
}
