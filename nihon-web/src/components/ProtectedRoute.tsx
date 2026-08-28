import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({
  children
}: Props) {

  const token = localStorage.getItem("token");

  if (!token || token === "undefined" || token === "null") {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}