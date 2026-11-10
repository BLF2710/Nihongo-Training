import { GuestIsland } from "../components/guest/GuestIsland";

/** The home page for visitors: only the island, filling the screen, with no site bar (signing in is in the welcome).
 *  The first lesson, the speed quizzes and the cast's introductions open from its islands. */
export default function GuestLandingPage() {
  return <div className="flex h-dvh flex-col bg-gray-50 text-gray-900">
    <main className="min-h-0 flex-1"><GuestIsland /></main>
  </div>;
}
