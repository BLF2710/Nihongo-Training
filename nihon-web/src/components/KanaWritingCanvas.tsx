import { useRef, useState } from "react";

type Props = { character: string };

export default function KanaWritingCanvas({ character }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [hasInk, setHasInk] = useState(false);
  const [message, setMessage] = useState("");

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) };
  };
  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!; const ctx = canvas.getContext("2d"); if (!ctx) return;
    if (!event.isPrimary || event.button !== 0) return;
    drawingRef.current = true; canvas.setPointerCapture(event.pointerId); const p = point(event);
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineWidth = 12; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#ffffff"; ctx.lineTo(p.x + 0.01, p.y); ctx.stroke(); setHasInk(true);
  };
  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!event.isPrimary || !drawingRef.current) return; const ctx = canvasRef.current?.getContext("2d"); if (!ctx) return; const p = point(event); ctx.lineTo(p.x, p.y); ctx.stroke(); setHasInk(true);
  };
  const stop = (event: React.PointerEvent<HTMLCanvasElement>) => { if (!event.isPrimary) return; drawingRef.current = false; if (canvasRef.current?.hasPointerCapture(event.pointerId)) canvasRef.current.releasePointerCapture(event.pointerId); };
  const clear = () => { const canvas = canvasRef.current; if (!canvas) return; canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height); setHasInk(false); setMessage(""); };
  const check = () => setMessage(hasInk ? "Practice captured. Automatic handwriting grading is not available yet—compare your writing with the guide above." : "Draw the character first, then check your practice.");

  return <div><div className="relative mx-auto max-w-xl overflow-hidden rounded-2xl border-2 border-gray-700 bg-black"><svg aria-hidden="true" viewBox="0 0 600 600" className="pointer-events-none select-none absolute inset-0 h-full w-full"><text x="300" y="310" textAnchor="middle" dominantBaseline="central" fill="#666666" fontSize={character.length > 1 ? 245 : 490} fontFamily="'Noto Sans JP', 'Yu Gothic', sans-serif">{character}</text></svg><canvas ref={canvasRef} width={600} height={600} onPointerDown={start} onPointerMove={draw} onPointerUp={stop} onPointerCancel={stop} className="relative block aspect-square h-auto w-full cursor-crosshair touch-none" aria-label={`Writing canvas for ${character}`} /></div><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={clear} className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50">Clear</button><button type="button" onClick={check} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">Check</button></div>{message && <p className="mt-3 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">{message}</p>}</div>;
}
