import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useEffect } from "react";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ReportItem from "./pages/ReportItem";
import ItemsList from "./pages/ItemsList";
import MyAccount from "./pages/MyAccount";
import About from "./pages/About";
import Messages from "./pages/Messages";

import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

function App() {

   useEffect(() => {
  const handleBeforeInstallPrompt = (event) => {
    event.preventDefault();

    console.log("✅ beforeinstallprompt fired");

    window.deferredPwaPrompt = event;

    window.dispatchEvent(new Event("pwa-install-ready"));
  };

  const handleAppInstalled = () => {
    console.log("✅ CampusConnect installed");

    window.deferredPwaPrompt = null;

    window.dispatchEvent(new Event("pwa-installed"));
  };

  window.addEventListener(
    "beforeinstallprompt",
    handleBeforeInstallPrompt
  );

  window.addEventListener("appinstalled", handleAppInstalled);

  return () => {
    window.removeEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.removeEventListener("appinstalled", handleAppInstalled);
  };
}, []);
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report/lost"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReportItem type="lost" />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report/found"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReportItem type="found" />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/items/lost"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ItemsList type="lost" />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/items/found"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ItemsList type="found" />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyAccount />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <Layout>
                    <About />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Messages />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
