import { JSX } from "react";
import { Navigate } from "react-router-dom";

function isJwtExpired(token: string | null) {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (!parts || parts.length !== 3 || !parts[1]) return true;
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(b64);
    const payload = JSON.parse(decoded);
    if (!payload || typeof payload.exp !== 'number') return true;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (e) {
    return true;
  }
}

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("accessToken");
  const expired = isJwtExpired(token);
  return !expired ? (children as React.ReactElement) : <Navigate to="/" replace />;
}
