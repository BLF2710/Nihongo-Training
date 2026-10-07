import { useEffect, useRef } from "react";
import type { Kanji } from "../data/kanji";
import { KanjiStudyCard } from "./KanjiFlashcards";

export default function LessonKanjiDialog({ kanji, onClose }: { kanji: Kanji; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => { dialog?.close(); document.body.style.overflow = overflow; previous?.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={ref} aria-label={`Kanji ${kanji.character}`} onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }}
    className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-2xl overflow-y-auto rounded-3xl border border-gray-200 bg-gray-50 p-4 text-gray-900 shadow-xl backdrop:bg-gray-950/50 sm:p-6">
    <div className="mb-4 flex items-center justify-between gap-3"><p className="font-bold">Kanji study</p><button type="button" onClick={onClose} className="rounded-xl border bg-white px-4 py-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-emerald-600">Close Kanji card ✕</button></div>
    <KanjiStudyCard kanji={kanji} showPractice={false} />
    <p className="mt-4 text-xs text-gray-500">Close this card to continue your lesson. Vocabulary links open the vocabulary page.</p>
  </dialog>;
}
