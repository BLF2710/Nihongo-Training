import { Navigate } from "react-router-dom";
import { hasSession } from "../lib/authStorage";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({
  children
}: Props) {

  if (!hasSession()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}