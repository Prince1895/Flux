import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CloudAccounts from './pages/CloudAccounts';
import Automation from './pages/Automation';
import Connect from './pages/Connect';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pricing from './pages/Pricing';
import Docs from './pages/Docs';
import './styles/globals.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/docs" element={<Docs />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/accounts"
        element={
          <ProtectedRoute>
            <CloudAccounts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/automation"
        element={
          <ProtectedRoute>
            <Automation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/pricing"
        element={
          <ProtectedRoute>
            <Pricing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/connect"
        element={
          <ProtectedRoute>
            <Connect />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
