import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>; // Show a loading state
  return user ? <Outlet /> : <Navigate to="/auth/sign-in" />;
};

export default ProtectedRoute;
