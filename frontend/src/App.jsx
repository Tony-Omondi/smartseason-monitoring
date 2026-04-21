import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider, { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminFields from './pages/admin/Fields';
import AdminUsers from './pages/admin/Users';
import AgentDashboard from './pages/agent/Dashboard';
import AgentMyFields from './pages/agent/MyFields';
import AgentFieldDetail from './pages/agent/FieldDetail';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/agent'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute role="ADMIN"><Layout /></ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="fields" element={<AdminFields />} />
            <Route path="users"  element={<AdminUsers />} />
          </Route>

          {/* Agent routes */}
          <Route path="/agent" element={
            <ProtectedRoute role="AGENT"><Layout /></ProtectedRoute>
          }>
            <Route index element={<AgentDashboard />} />
            <Route path="fields" element={<AgentMyFields />} />
            <Route path="fields/:id" element={<AgentFieldDetail />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}