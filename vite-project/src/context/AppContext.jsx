import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

const AppContext = createContext(undefined);

/**
 * AppContextProvider component that provides global application state.
 * Manages user authentication state and session checking.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap with context
 * @returns {JSX.Element} Context provider wrapping children
 */
export function AppContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

/**
 * Checks the current user session by calling the API.
 * Sets user state if authenticated, otherwise sets to null.
 */
const checkSession = async () =>{
  try {
    const {data} = await api.get("/api/auth/me");
    // setUser(data.user);
  } catch (error){
    setUser(null)
  } finally{
    setLoadingUser(false)
  }

  }
  useEffect(()=>{
    checkSession()
  },[checkSession])


  return (
    <AppContext.Provider value={{ user, setUser, loadingUser, setLoadingUser }}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Custom hook to access the application context.
 * Must be used within an AppContextProvider.
 * @returns {Object} The application context containing user and loading state
 * @throws {Error} If used outside of AppContextProvider
 */
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}