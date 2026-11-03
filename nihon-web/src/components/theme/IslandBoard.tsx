import type { ReactNode } from "react";
import { BOARDS } from "../../lib/islandBoards";
import type { IslandId } from "../../lib/islandMap";
import "./islandBoard.css";

/** A paper sheet pinned to an island board: one section of a page. */
export const SHEET = "notice-sheet p-5 pt-6 sm:p-6 sm:pt-7";

/** The board an island's page is laid out on, in that island's material, with its Japanese name on the plaque.
 *  Its sections are sheets (SHEET) pinned to it. */
export function IslandBoard({ island, children, className = "" }: { island: IslandId; children: ReactNode; className?: string }) {
  const { material, plaque } = BOARDS[island];
  return <div data-material={material} className={`notice-board ${className}`}>
    <p aria-hidden="true" lang="ja" className="notice-board-plaque">{plaque}</p>
    {children}
  </div>;
}
