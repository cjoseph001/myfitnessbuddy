import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/authcontext";
import Login from "./pages/auth/login";
import Register from "./pages/auth/Register";
import Home from "./pages/home/home";
import Workouts from "./pages/workouts/workouts";
import Analytics from "./pages/analytics/analytics";
import Layout from "./components/layout";
import ProtectedRoute from "./components/protectedroute";
import Trends from "./pages/trends/trends";

function App() {
  const { user } = useContext(AuthContext);

  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
  };

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/home" /> : <Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workouts"
        element={<Navigate to={`/workouts/${getTodayDate()}`} replace />}
      />
      <Route
        path="/workouts/:date"
        element={
          <ProtectedRoute>
            <Layout>
              <Workouts />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <Analytics />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/trends"
        element={
          <ProtectedRoute>
            <Layout>
              <Trends />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
