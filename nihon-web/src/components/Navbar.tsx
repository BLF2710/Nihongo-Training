import BackButton from "./BackButton";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { clearSession, getToken, getUserEmail, getUserName, isAdmin } from "../lib/authStorage";
import { useUserHandle } from "../lib/userHandle";
import NotificationBell from "./NotificationBell";
import LiveNotifications from "./LiveNotifications";
import { useCourseLevel } from "../lib/courseLevel";
import { useInboxSummary } from "../lib/inbox";
import { syncTimeZone } from "../lib/timeZone";
import { ThemeButton, ThemeChoice } from "./ThemeToggle";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, supportedLanguages, setLanguage } = useLanguage();
  const courseLevel = useCourseLevel();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState({ language: true, learn: true, practice: true, games: true, community: true });
  const inbox = useInboxSummary();
  useEffect(() => { syncTimeZone(); }, []);
  const handle = useUserHandle();
  const token = getToken();
  const userName = getUserName() || "Learner";
  const userEmail = getUserEmail() || "";

  const go = (path: string) => { navigate(path); setSidebarOpen(false); };
  const selectLanguage = (id: string) => { setLanguage(id); go("/"); };
  const logout = () => { clearSession(); go("/"); };
  const active = (isActive: boolean) => isActive
    ? "bg-indigo-50 text-indigo-700 font-bold"
    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen((open) => ({ ...open, [section]: !open[section] }));
  };
  // A header shortcut: icon only (with a tooltip) until there is room for its label; a red count when something waits.
  const headerLink = (path: string, icon: string, label: string, isActive: boolean, count = 0, countLabel = "") => (
    <button onClick={() => go(path)} title={label} aria-label={`${label}${count ? `, ${count} ${countLabel}` : ""}`} aria-current={isActive ? "page" : undefined}
      className={`relative rounded-lg px-2 py-2 text-sm font-semibold transition cursor-pointer sm:px-3 ${active(isActive)}`}>
      <span aria-hidden="true">{icon}</span><span aria-hidden="true" className="hidden xl:inline"> {label}</span>
      {count > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 text-center text-[11px] font-bold leading-5 text-white">{count > 9 ? "9+" : count}</span>}
    </button>
  );
  const sectionButton = (label: string, section: keyof typeof sectionsOpen) => (
    <button onClick={() => toggleSection(section)} className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold tracking-wider uppercase text-gray-400 hover:text-gray-700 transition cursor-pointer" aria-expanded={sectionsOpen[section]}>
      {label}<span className="text-base leading-none">{sectionsOpen[section] ? "−" : "+"}</span>
    </button>
  );

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-3">
            {token && <button onClick={() => setSidebarOpen((open) => !open)} className="relative w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition cursor-pointer" aria-label="Toggle navigation sidebar" aria-expanded={sidebarOpen}>☰</button>}
            <button onClick={() => go("/")} className="flex items-center gap-2 sm:gap-2.5 text-lg sm:text-2xl font-black text-gray-900 tracking-tight cursor-pointer">
              <span className="w-9 h-9 bg-linear-to-br from-indigo-600 to-emerald-500 rounded-xl flex items-center justify-center text-white text-lg shadow-sm">🌐</span>
              <span className="max-[420px]:sr-only">Lingo<span className="text-emerald-600">Hub</span></span>
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 xl:gap-3">
            <span className="hidden sm:inline-flex"><ThemeButton /></span>
            {token && !isAdmin() && <NotificationBell inbox={inbox} />}
            {token && <>
              {headerLink("/friends", "👥", "Friends", location.pathname.startsWith("/friends") || location.pathname.startsWith("/u/"), inbox?.friendRequests ?? 0, "friend requests")}
              {headerLink("/messages", "✉️", "Messages", location.pathname.startsWith("/messages"), inbox?.total ?? 0, "unread")}
              {headerLink("/assistant", "🤖", "Study assistant", location.pathname.startsWith("/assistant"))}
              {headerLink(language === "english" ? "/statistics/english" : "/statistics/japanese", "📊", "Statistics", location.pathname.startsWith("/statistics"))}
            </>}
            {token ? <>
              <button onClick={() => setProfileOpen((open) => !open)} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition cursor-pointer" aria-label="Open account details" aria-expanded={profileOpen}>
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">{userName.charAt(0).toUpperCase()}</span>
                <span className="text-sm font-semibold text-gray-700 max-w-28 truncate">{userName}</span>
              </button>
              <button onClick={logout} className="hidden sm:inline-flex bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 px-2.5 sm:px-3.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer">Logout</button>
            </> : <button onClick={() => go("/login")} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xs transition cursor-pointer">Sign In</button>}
          </div>
        </div>
      </header>

      {token && profileOpen && <div className="fixed top-16 right-4 sm:right-6 z-50 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl p-4">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-full bg-linear-to-br from-emerald-500 to-indigo-600 text-white flex items-center justify-center text-lg font-black">{userName.charAt(0).toUpperCase()}</span>
          <div className="min-w-0"><p className="font-bold text-gray-900 truncate">{userName}</p>{handle && <p className="text-sm text-gray-600 truncate">@{handle}</p>}<p className="text-xs text-gray-500 truncate">{userEmail || "Signed-in learner"}</p></div>
        </div>
        {handle && <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">Friends add you with your username <b className="text-gray-900">@{handle}</b>; your display name can be anything.</p>}
        <button onClick={() => go("/profile")} className="mt-4 w-full rounded-lg bg-emerald-600 py-2 text-sm font-bold text-white">View profile & settings</button>
        <button onClick={() => go("/friends")} className="mt-2 w-full rounded-lg border border-gray-200 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50">Friends{inbox?.friendRequests ? ` · ${inbox.friendRequests} new` : ""}</button>
      </div>}

      {token && !isAdmin() && <LiveNotifications />}
      {sidebarOpen && <button className="fixed inset-0 bg-black/25 z-30 cursor-default" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      {token && <aside className={`fixed top-18 left-0 bottom-0 z-40 w-72 bg-white border-r border-gray-200 shadow-xl transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
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
            {language === "japanese" && <button onClick={() => go("/levels")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition cursor-pointer ${active(location.pathname === "/levels")}`}><span lang="ja">道</span> Level <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800">{courseLevel} · Change</span></button>}
            <button onClick={() => language === "japanese" && go("/lessons")} disabled={language !== "japanese"} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition ${language === "japanese" ? `cursor-pointer ${active(location.pathname.startsWith("/lessons"))}` : "text-gray-400 cursor-not-allowed"}`}><span>📖</span> Lessons {language !== "japanese" && <span className="ml-auto text-[10px]">Soon</span>}</button>
            <button onClick={() => language === "japanese" && go("/vocabulary")} disabled={language !== "japanese"} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition ${language === "japanese" ? `cursor-pointer ${active(location.pathname.startsWith("/vocabulary"))}` : "text-gray-400 cursor-not-allowed"}`}><span>🧠</span> Vocabulary</button>
            <button onClick={() => language === "japanese" && go("/grammar")} disabled={language !== "japanese"} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition ${language === "japanese" ? `cursor-pointer ${active(location.pathname.startsWith("/grammar"))}` : "text-gray-400 cursor-not-allowed"}`}><span>✍️</span> Grammar</button>
            {language === "japanese" && <>
              <button onClick={() => go("/learn/hiragana")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition cursor-pointer ${active(location.pathname.startsWith("/learn/hiragana") || location.pathname.startsWith("/learn/katakana"))}`}><span>あ</span> Kana</button>
              <button onClick={() => language === "japanese" && go("/learn/kanji")} disabled={language !== "japanese"} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition ${language === "japanese" ? `cursor-pointer ${active(location.pathname.startsWith("/learn/kanji"))}` : "text-gray-400 cursor-not-allowed"}`}><span>漢</span> Kanji {language !== "japanese" && <span className="ml-auto text-[10px]">Soon</span>}</button>
            </>}
          </div>}</div>
          <div>{sectionButton("Practice", "practice")}{sectionsOpen.practice && <div className="mt-1 space-y-1">
            <div>{sectionButton("🎮 Games", "games")}{sectionsOpen.games && <div className="ml-3 mt-1 space-y-1 border-l border-gray-100 pl-2">
              {language === "english" ? <button onClick={() => go("/arcade")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition cursor-pointer ${active(location.pathname.startsWith("/arcade"))}`}><span>🧩</span> English Arcade</button> : <>
                <button onClick={() => go("/practice?type=hiragana")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition cursor-pointer ${active(location.pathname === "/practice")}`}><span>あ</span> Hiragana Speed Quiz</button>
                <button onClick={() => go("/practice?type=katakana")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition cursor-pointer ${active(location.pathname === "/practice")}`}><span>ア</span> Katakana Speed Quiz</button>
              </>}
            </div>}</div>
            <button onClick={() => language === "japanese" && go("/quizzes")} disabled={language !== "japanese"} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition ${language === "japanese" ? `cursor-pointer ${active(location.pathname.startsWith("/quizzes"))}` : "text-gray-400 cursor-not-allowed"}`}><span>📝</span> Quizzes {language !== "japanese" && <span className="ml-auto text-[10px]">Soon</span>}</button>
            <button onClick={() => language === "japanese" && go("/listening")} disabled={language !== "japanese"} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition ${language === "japanese" ? `cursor-pointer ${active(location.pathname.startsWith("/listening"))}` : "text-gray-400 cursor-not-allowed"}`}><span>🎧</span> Listening {language !== "japanese" && <span className="ml-auto text-[10px]">Soon</span>}</button>
            <button onClick={() => language === "japanese" && go("/speaking")} disabled={language !== "japanese"} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition ${language === "japanese" ? `cursor-pointer ${active(location.pathname.startsWith("/speaking"))}` : "text-gray-400 cursor-not-allowed"}`}><span>🎤</span> Speaking {language !== "japanese" && <span className="ml-auto text-[10px]">Soon</span>}</button>
            <button onClick={() => language === "japanese" && go("/reading")} disabled={language !== "japanese"} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition ${language === "japanese" ? `cursor-pointer ${active(location.pathname.startsWith("/reading"))}` : "text-gray-400 cursor-not-allowed"}`}><span>📄</span> Reading {language !== "japanese" && <span className="ml-auto text-[10px]">Soon</span>}</button>
            <button onClick={() => language === "japanese" && go("/review")} disabled={language !== "japanese"} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition ${language === "japanese" ? `cursor-pointer ${active(location.pathname === "/review")}` : "text-gray-400 cursor-not-allowed"}`}><span>🔄</span> Review {language !== "japanese" && <span className="ml-auto text-[10px]">Soon</span>}</button>
          </div>}</div>
          <div className="mt-4 px-3"><p className="mb-2 text-[11px] font-bold tracking-wider uppercase text-gray-400">Display</p><ThemeChoice /></div>
          <div className="mt-4">{sectionButton("Community", "community")}{sectionsOpen.community && <div className="mt-1 space-y-1">
            {[["/support", "🛟", "Help & support", inbox?.support ?? 0]].map(([path, icon, label, unread]) =>
              <button key={path as string} onClick={() => go(path as string)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition cursor-pointer ${active(location.pathname.startsWith(path as string))}`}>
                <span>{icon}</span> {label}{(unread as number) > 0 && <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">{unread}<span className="sr-only">{" unread"}</span></span>}
              </button>)}
          </div>}</div>
          <button onClick={logout} className="mt-6 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-left text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 transition cursor-pointer sm:hidden">Log out</button>
        </div>
      </aside>}
      {location.pathname !== "/" && <nav aria-label="Page navigation" className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 lg:px-8"><BackButton className="inline-flex min-h-10 items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-emerald-600" /></nav>}
    </>
  );
}
