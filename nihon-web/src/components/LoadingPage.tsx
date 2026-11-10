import Navbar from "./Navbar";

/** A page while its code is still arriving: the navigation bar and what is loading. */
export default function LoadingPage({ label }: { label: string }) {
  return <div className="min-h-screen bg-gray-50"><Navbar /><p role="status" className="mx-auto max-w-6xl p-8">{label}</p></div>;
}
