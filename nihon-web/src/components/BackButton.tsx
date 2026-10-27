import { useNavigate } from "react-router-dom";
import { useBack } from "../lib/useBack";

/** Where Back leads on a page that has a fixed parent, and whether leaving is allowed right now. */
export type BackTarget = { to: string; canLeave?: () => boolean };

type Props = { className?: string; fallback?: string; target?: BackTarget };

/** Goes back in history, or to the page's fixed parent when it has one (e.g. Settings → your profile). */
export default function BackButton({ className = "text-sm font-semibold text-gray-600 hover:underline", fallback = "/", target }: Props) {
  const back = useBack(fallback);
  const navigate = useNavigate();
  const go = () => {
    if (!target) return back();
    if (target.canLeave && !target.canLeave()) return;
    navigate(target.to);
  };
  return <button type="button" onClick={go} className={className}>← Back</button>;
}
