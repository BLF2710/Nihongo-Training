import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, currentLanguageConfig, supportedLanguages, setLanguage } = useLanguage();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isHome = location.pathname === "/";
  const isArcade = location.pathname.startsWith("/arcade") || location.pathname.startsWith("/games");
  const isStatistics = location.pathname.startsWith("/statistics");

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo & Universal Language Dropdown */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 text-xl sm:text-2xl font-black text-gray-900 tracking-tight hover:opacity-90 transition cursor-pointer"
          >
            <span className="w-9 h-9 bg-linear-to-br from-indigo-600 to-emerald-500 rounded-xl flex items-center justify-center text-white text-lg shadow-sm">
              🌐
            </span>
            <span>
              Lingo<span className="text-emerald-600">Hub</span>
            </span>
          </button>

          {/* Universal Language Dropdown Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-800 transition cursor-pointer shadow-xs"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <span className="text-base">{currentLanguageConfig.flag}</span>
              <span className="hidden sm:inline">{currentLanguageConfig.name}</span>
              <span className="text-gray-400 text-xs ml-0.5">▼</span>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Select Target Language
                </div>

                <div className="divide-y divide-gray-50">
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.id}
                      disabled={!lang.enabled}
                      onClick={() => {
                        if (lang.enabled) {
                          setLanguage(lang.id);
                          setDropdownOpen(false);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-sm transition ${
                        lang.enabled
                          ? language === lang.id
                            ? "bg-emerald-50 text-emerald-800 font-bold cursor-pointer"
                            : "text-gray-700 hover:bg-gray-50 cursor-pointer"
                          : "text-gray-300 bg-gray-50/50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{lang.flag}</span>
                        <div>
                          <div className="font-semibold">{lang.name}</div>
                          <div className="text-[11px] text-gray-400">{lang.nativeName}</div>
                        </div>
                      </div>

                      {language === lang.id && (
                        <span className="text-emerald-600 font-bold text-xs">✓ Active</span>
                      )}

                      {!lang.enabled && (
                        <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                          Soon
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Universal Navigation Links & User Controls */}
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => navigate("/")}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                isHome
                  ? "bg-gray-100 text-gray-900 font-bold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => {
                if (language === "english") {
                  navigate("/arcade");
                } else {
                  navigate("/practice?type=hiragana");
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                isArcade
                  ? "bg-indigo-50 text-indigo-700 font-bold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span>🎮</span>
              <span>Arcade & Games</span>
            </button>

            {token && (
              <button
                onClick={() => navigate("/statistics")}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                  isStatistics
                    ? "bg-emerald-50 text-emerald-700 font-bold"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Statistics
              </button>
            )}
          </nav>

          <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />

          {/* User Auth Buttons */}
          {token ? (
            <button
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition cursor-pointer"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xs transition cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}