import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/Homepage";
import BuilderPage from "./pages/BuilderPage";
import PreviewPage from "./pages/PreviewPage";
import { AuthLayout, GuestLayout } from "./pages/Layout";

/**
 * App component that defines the application routing structure.
 * Includes guest routes (login, register) and protected routes (home, builder, preview).
 * @returns {JSX.Element} The main application router configuration
 */
const App = () => {
  return (
    <Routes>
      <Route element={<GuestLayout />}>
        <Route path='/login' element={<AuthPage mode="login" />} />
        <Route path='/register' element={<AuthPage mode="register" />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path='/' element={<HomePage />} />
        <Route path='/builder/:id' element={<BuilderPage />} />
        <Route path='/preview/:id' element={<PreviewPage />} />
      </Route>
    </Routes>
  );
};

export default App;