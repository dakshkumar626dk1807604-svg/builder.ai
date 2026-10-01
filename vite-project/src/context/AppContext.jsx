import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Lightweight debounce utility (no external package needed)
function debounce(fn, delay) {
  let timer = null;
  const debounced = (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
  };
  return debounced;
}

const AppContext = createContext(undefined);

export function AppContextProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // states
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeProject, setActiveProject] = useState(null);
  const [loadingActiveProject, setLoadingActiveProject] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [genratingProject, setGenratingProject] = useState(false);
  const [activeFile, setActiveFile] = useState("/App.js");
  const [showCode, setShowCode] = useState(false);

  const checkSession = async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      setUser(data.user);
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      console.log("Login failed:", error);
      const errMsg = error?.response?.data?.error || "Invalid email or password";
      toast.error(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/api/auth/register", { name, email, password });
      setUser(data.user);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      console.log("Register failed:", error);
      const errMsg = error?.response?.data?.error || "Registration failed";
      toast.error(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
      setUser(null);
      setProjects([]);
      setActiveProject(null);
      toast.success("Logged Out Successfully");
      navigate("/login");
    } catch (error) {
      console.log("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  // Projects actions
  const loadProjects = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/api/projects");
      setProjects(data);
    } catch (err) {
      console.log("Failed to list Projects:", err);
      toast.error("Failed to load Projects list");
    } finally {
      setLoadingProjects(false);
    }
  }, [user]);

  const loadProject = useCallback(async (id, silent = false) => {
    console.log("loadProject called with id:", id, "user:", user);
    if (!user) {
      console.log("User not found");
      return;
    }
    if (!silent) setLoadingActiveProject(true);
    try {
      const { data } = await api.get(`/api/projects/${id}`);
      setActiveProject(data);

      const files = Object.keys(data.files || {});
      if (files.length > 0) {
        setActiveFile((prev) => {
          if (files.includes(prev)) return prev;
          if (files.includes("/App.js")) return "/App.js";
          return files[0];
        });
      }
    } catch (error) {
      console.log("Failed to load Project:", error);
      if (!silent) {
        toast.error("Failed to load Project details");
        navigate("/");
      }
    } finally {
      if (!silent) setLoadingActiveProject(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!activeProject?._id || !user) return;
    const isOngoing =
      activeProject.status === "generating" ||
      activeProject.status === "pending" ||
      activeProject.status === "revising";

    if (isOngoing) {
      setChatLoading(true);
      const interval = setInterval(() => {
        loadProject(activeProject._id, true);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setChatLoading(false);
    }
  }, [activeProject?._id, activeProject?.status, user, loadProject]);

  const handleGenerate = useCallback(
    async (prompt) => {
      if (!user) return;
      setGenratingProject(true);
      try {
        const { data } = await api.post("/api/projects", { prompt });
        toast.success("Ai Agent is planning Structure...");
        navigate(`/builder/${data._id}`);
      } catch (err) {
        console.log("failed to generate project:", err);
        toast.error(err?.response?.data?.error || "Failed to generate project");
      } finally {
        setGenratingProject(false);
      }
    },
    [navigate, user]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!user) return;
      try {
        await api.delete(`/api/projects/${id}`);
        setProjects((prev) => prev.filter((p) => p._id !== id));
        toast.success("project deleted Succesfully");
      } catch (err) {
        console.error("Failed to deleted Project:", err);
        toast.error("Failed to delete Project");
      }
    },
    [user]
  );

  const handleChat = useCallback(
    async (prompt) => {
      if (!activeProject?._id || !user) return;
      setChatLoading(true);
      try {
        const { data } = await api.post(`/api/projects/${activeProject._id}/chat`, { prompt });
        setActiveProject(data);
        if (data.errors && data.errors.length > 0) {
          toast.error(`${data.errors.length} revision patch(es) failed`);
        } else {
          toast.success(`Updated to version ${data.version} successfully`);
        }
      } catch (err) {
        console.error("Revision request failed:", err);
        toast.error(err?.response?.data?.error || "Revision request failed");
      } finally {
        setChatLoading(false);
      }
    },
    [activeProject, user]
  );

  const debouncedSave = useMemo(
    () =>
      debounce(async (files, id) => {
        try {
          await api.put(`/api/projects/${id}/files`, { files });
        } catch (err) {
          console.log("Failed to auto-save files:", err);
          toast.error("Failed to save code modification");
        }
      }, 1000),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const updateProjectFiles = useCallback(
    async (files) => {
      if (!activeProject || !user) return;
      debouncedSave(files, activeProject._id);
    },
    [activeProject, user, debouncedSave]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        loadingUser,
        setLoadingUser,
        login,
        register,
        logout,
        projects,
        loadingProjects,
        activeProject,
        loadingActiveProject,
        chatLoading,
        genratingProject,
        activeFile,
        setActiveFile,
        setShowCode,
        showCode,
        loadProjects,
        loadProject,
        handleGenerate,
        handleDelete,
        updateProjectFiles,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}