import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isAdmin } from "../lib/authStorage";

/** Learner pages are not part of an administrator's workspace; administrators are sent to the admin area. */
export default function LearnerRoute({ children }: { children: ReactNode }) {
  if (isAdmin()) return <Navigate to="/admin" replace />;
  return children;
}
