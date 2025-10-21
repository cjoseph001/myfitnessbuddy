import { useContext } from "react";
import { AuthContext } from "../context/authcontext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/" replace />;
  return children;
}
