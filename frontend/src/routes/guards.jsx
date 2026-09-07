import React from "react";
import { Navigate } from "react-router-dom";
import { getSession } from "../lib/auth";

export function RequireAuth({ children }) {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

export function RequireRole({ roles, children }) {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  if (!roles.includes(session.role)) return <Navigate to="/dashboard" replace />;
  return children;
}
