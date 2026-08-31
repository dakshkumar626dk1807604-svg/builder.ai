import React from 'react'
import { Outlet, Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

/**
 * Loading component that displays a loading message.
 * @returns {JSX.Element} A simple loading indicator
 */
function Loading() {
  return <div>Loading...</div>;
}

/**
 * AuthLayout component that protects routes requiring authentication.
 * Redirects to login page if user is not authenticated.
 * @returns {JSX.Element} Outlet for authenticated routes or redirect to login
 */
export function AuthLayout() {
  const { user, loadingUser } = useAppContext();
  if (loadingUser) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/**
 * GuestLayout component that wraps routes for non-authenticated users.
 * Redirects to home page if user is already authenticated.
 * @returns {JSX.Element} Outlet for guest routes or redirect to home
 */
export function GuestLayout() {
  const { user, loadingUser } = useAppContext();
  if (loadingUser) return <Loading />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
