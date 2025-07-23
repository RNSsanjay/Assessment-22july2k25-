import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminLogin from './pages/admin/login';
import AdminSignup from './pages/admin/signup';
import UserLogin from './pages/user/userlogin';
import UserSignup from './pages/user/usersignup';
import UserDashboard from './pages/user/userdashboard';
import AdminDashboard from './pages/admin/admindashboard';
import Home from './pages/landing';
import Landing from './pages/landing';
import ProtectedRoute from './components/Footer';
import CreateEvent from './pages/admin/createevent';

// Component to handle routing based on auth state
const AppRoutes = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Landing page */}
            <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Landing />} />

            {/* Admin Auth */}
            <Route path="/admin/login" element={isAuthenticated ? <Navigate to="/admin/dashboard" /> : <AdminLogin />} />
            <Route path="/admin/signup" element={isAuthenticated ? <Navigate to="/admin/dashboard" /> : <AdminSignup />} />

            {/* User Auth */}
            <Route path="/user/login" element={isAuthenticated ? <Navigate to="/user/dashboard" /> : <UserLogin />} />
            <Route path="/user/signup" element={isAuthenticated ? <Navigate to="/user/dashboard" /> : <UserSignup />} />

            {/* Admin Dashboard (protected) */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* User Dashboard (protected) */}
            <Route path="/user/dashboard" element={<UserDashboard />} />

            {/* Create Event (protected) */}
            <Route path="/admin/create-event" element={<CreateEvent />} />

            {/* Home (could be landing or dashboard, adjust as needed) */}
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <AppRoutes />
                    <ToastContainer
                        position="top-right"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="dark"
                    />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;