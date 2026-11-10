import type { ReactNode } from "react";
import "./clipboard.css";

/** A sheet of paper held on a clipboard: the frame of the guest's name card and of the sign-in and sign-up forms. */
export function Clipboard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`clipboard ${className}`}>
    <span aria-hidden="true" className="clipboard-clip" />
    <div className="clipboard-paper">{children}</div>
  </div>;
}
