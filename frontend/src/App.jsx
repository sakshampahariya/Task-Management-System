import { useEffect, useState, lazy, Suspense } from "react";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";
import api from "./api";
import Layout from "./components/Layout";
import GlassLoader from "./components/GlassLoader";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const MemberDashboardPage = lazy(() => import("./pages/MemberDashboardPage"));
const RegistrationPage = lazy(() => import("./pages/RegistrationPage"));

// Private Route Wrapper
const PrivateWrapper = ({ user, role, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === "Admin" ? "/admin" : "/member"} replace />;
  }
  return children;
};

// Public Route Wrapper
const PublicWrapper = ({ user, children }) => {
  if (user) {
    return <Navigate to={user.role === "Admin" ? "/admin" : "/member"} replace />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 font-sans text-slate-100">
      {children}
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  if (loading) {
    return <GlassLoader />;
  }

  return (
    <Suspense fallback={<GlassLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route
          element={
            <PublicWrapper user={user}>
              <Outlet />
            </PublicWrapper>
          }
        >
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/register" element={<RegistrationPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<Layout user={user} setUser={setUser} />}>
          <Route
            path="/admin/*"
            element={
              <PrivateWrapper user={user} role="Admin">
                <AdminDashboardPage user={user} />
              </PrivateWrapper>
            }
          />
          <Route
            path="/member/*"
            element={
              <PrivateWrapper user={user} role="Member">
                <MemberDashboardPage user={user} />
              </PrivateWrapper>
            }
          />
        </Route>

        {/* Fallback Redirect */}
        <Route
          path="*"
          element={
            user ? (
              <Navigate to={user.role === "Admin" ? "/admin" : "/member"} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Suspense>
  );
}

export default App;
