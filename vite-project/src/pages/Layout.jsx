import React from 'react'
import { Outlet, Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function Loading() {
  return <div>Loading...</div>;
}

export function AuthLayout() {
  const { user, loadingUser } = useAppContext();
  if (loadingUser) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function GuestLayout() {
  const { user, loadingUser } = useAppContext();
  if (loadingUser) return <Loading />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
