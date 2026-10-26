import { Navigate, useLocation } from "react-router-dom";
import { loginPathFor } from "../lib/returnTo";
import { hasSession } from "../lib/authStorage";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({
  children
}: Props) {

  const location = useLocation();
  // Signing in returns to the page that was asked for (an invite link, for example).
  if (!hasSession()) {
    return (
      <Navigate
        to={loginPathFor(location.pathname + location.search)}
        replace
      />
    );
  }

  return children;
}