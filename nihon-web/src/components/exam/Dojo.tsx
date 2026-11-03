import type { ReactNode } from "react";
import "./exam.css";

/** The dojo where unit assessments are held: a wooden hall with the 試練 ("trial") scroll between two lanterns on the
 *  right, and on the left what is said there (Kurama's welcome). */
export function DojoHall({ children }: { children: ReactNode }) {
  return <div className="dojo-hall relative min-h-24 overflow-hidden rounded-2xl">
    <svg viewBox="0 0 640 80" preserveAspectRatio="xMaxYMid slice" className="absolute inset-0 block size-full" aria-hidden="true">
      <rect width="640" height="80" fill="var(--dojo-wall)" />
      {Array.from({ length: 32 }, (_, index) => <path key={index} d={`M${index * 20 + 10},0 V64`} stroke="var(--dojo-seam)" strokeWidth="1" />)}
      <rect y="8" width="640" height="4" fill="var(--dojo-beam)" />
      <rect y="64" width="640" height="16" fill="var(--dojo-tatami)" />
      <path d="M0,64 H640 M160,64 V80 M320,64 V80 M480,64 V80" stroke="var(--dojo-seam)" strokeWidth="1.2" />
      <rect x="561" y="12" width="28" height="48" rx="1" fill="#f7f2e7" stroke="#2e2a26" strokeWidth="1" />
      <rect x="559" y="11" width="32" height="3" rx="1.5" fill="#6b5139" />
      <rect x="559" y="58" width="32" height="3" rx="1.5" fill="#6b5139" />
      <text x="575" y="32" textAnchor="middle" fontSize="15" fontWeight="900" fill="#2e2a26" lang="ja">試</text>
      <text x="575" y="51" textAnchor="middle" fontSize="15" fontWeight="900" fill="#2e2a26" lang="ja">練</text>
      {[515, 626].map(x => <g key={x} className="dojo-lantern">
        <path d={`M${x},12 V20`} stroke="#2e2a26" strokeWidth="1" />
        <ellipse cx={x} cy="30" rx="9" ry="11" fill="#c94f35" stroke="#2e2a26" strokeWidth="1" />
        <path d={`M${x - 8},25 H${x + 8} M${x - 8.6},30 H${x + 8.6} M${x - 8},35 H${x + 8}`} stroke="#2e2a26" strokeWidth="0.6" opacity="0.5" />
        <rect x={x - 4} y="18" width="8" height="2.5" fill="#2e2a26" /><rect x={x - 4} y="40" width="8" height="2.5" fill="#2e2a26" />
      </g>)}
    </svg>
    <div className="relative p-3 sm:pr-40">{children}</div>
  </div>;
}

/** A red seal stamped onto a passed trial: 合格, "passed". */
export function PassSeal() {
  return <span aria-hidden="true" lang="ja" className="pass-seal inline-grid size-20 shrink-0 place-items-center rounded-xl text-2xl font-black leading-none">合<br />格</span>;
}
