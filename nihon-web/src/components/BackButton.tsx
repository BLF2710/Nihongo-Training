import { useBack } from "../lib/useBack";

export default function BackButton({ className = "text-sm font-semibold text-gray-600 hover:underline", fallback = "/" }: { className?: string; fallback?: string }) {
  const back = useBack(fallback);
  return <button type="button" onClick={back} className={className}>← Back</button>;
}
