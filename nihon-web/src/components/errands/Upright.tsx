import type { ReactNode } from "react";
import type { Vector } from "../../lib/errands/movement";
import { STAND_UP } from "./scene3d";

type UprightProps = { feet: Vector; width: number; height: number; tile: number; className?: string; children: ReactNode };

/** A card standing on the ground with its bottom edge centred on `feet` (in tiles), facing the viewer. */
export function Upright({ feet, width, height, tile, className, children }: UprightProps) {
  return <div className={`village-upright ${className ?? ""}`} style={{ left: (feet.x - width / 2) * tile, top: (feet.y - height) * tile, width: width * tile, height: height * tile, transform: STAND_UP }}>{children}</div>;
}
