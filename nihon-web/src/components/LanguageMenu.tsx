import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

/** The learning language, in the top bar: shows the current one and opens a short list to switch. */
export default function LanguageMenu({ onChange }: { onChange: () => void }) {
  const { language, supportedLanguages, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const current = supportedLanguages.find(item => item.id === language) ?? supportedLanguages[0];

  useEffect(() => {
    if (!isOpen) return;
    const closeOutside = (event: PointerEvent) => { if (event.target instanceof Node && !container.current?.contains(event.target)) setIsOpen(false); };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setIsOpen(false); };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", closeOnEscape); };
  }, [isOpen]);

  const choose = (id: string) => {
    setIsOpen(false);
    if (id === language) return;
    setLanguage(id);
    onChange();
  };

  return <div ref={container} className="relative">
    <button type="button" onClick={() => setIsOpen(open => !open)} aria-expanded={isOpen} aria-haspopup="true" aria-label={`Learning language: ${current.name}. Change`}
      className={`flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer ${focus}`}>
      <span aria-hidden="true" className="text-lg leading-none">{current.flag}</span><span aria-hidden="true" className="hidden lg:inline">{current.name}</span><span aria-hidden="true" className="text-xs text-gray-400">▾</span>
    </button>
    {isOpen && <div className="absolute left-0 top-12 z-50 w-60 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
      <p id="language-menu-heading" className="px-3 pb-1 pt-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">Learning language</p>
      <ul aria-labelledby="language-menu-heading" className="space-y-1">{supportedLanguages.map(item => <li key={item.id}>
        <button type="button" disabled={!item.enabled} aria-current={item.id === language ? "true" : undefined} onClick={() => choose(item.id)}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm ${focus} ${item.enabled ? "cursor-pointer" : "cursor-not-allowed opacity-45"} ${item.id === language ? "bg-emerald-50 font-bold text-emerald-800" : "text-gray-600 hover:bg-gray-100"}`}>
          <span className="flex items-center gap-3"><span aria-hidden="true" className="text-lg">{item.flag}</span>{item.name}</span>
          {item.id === language ? <span aria-hidden="true">✓</span> : !item.enabled && <span className="text-[10px] font-bold">Soon</span>}
        </button>
      </li>)}</ul>
    </div>}
  </div>;
}
