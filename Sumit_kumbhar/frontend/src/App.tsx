import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Home, Calendar, PlusSquare, LayoutGrid, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import NewBooking from './pages/NewBooking';
import BookingDetails from './pages/BookingDetails';
import EditBooking from './pages/EditBooking';
import BookingsList from './pages/BookingsList';
import IdolInventory from './pages/IdolInventory';
import Login from './pages/Login';
import Register from './pages/Register';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Bookings', path: '/bookings', icon: Calendar },
    { label: 'New Booking', path: '/bookings/new', icon: PlusSquare },
    { label: 'Inventory', path: '/inventory', icon: LayoutGrid },
  ];

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden w-64 bg-white border-r border-slate-200 md:flex md:flex-col justify-between p-5 sticky top-0 h-screen no-print">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2">
            <span className="text-2xl">🕉️</span>
            <div>
              <h1 className="text-sm font-black text-slate-900 leading-tight truncate w-40">
                {user?.businessName || 'Ganpati Notebook'}
              </h1>
              <p className="text-[10px] text-festive-saffron font-bold uppercase tracking-wider">Notebook</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                               (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange-50 text-festive-saffron font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-festive-saffron' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile Footer & Logout */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="px-2">
            <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider leading-none">Logged In Owner</p>
            <p className="text-xs font-black text-slate-700 truncate mt-1">@{user?.username}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-650 hover:bg-red-100 font-extrabold rounded-xl text-xs transition-all btn-tap"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 min-h-screen">
        {/* Mobile Top Header */}
        <header className="md:hidden flex items-center justify-between bg-white border-b border-slate-100 px-5 py-3 sticky top-0 z-40 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xl">🕉️</span>
            <div>
              <span className="font-extrabold text-slate-900 text-xs truncate block max-w-[120px] leading-tight">
                {user?.businessName || 'Notebook'}
              </span>
              <span className="text-[9px] text-festive-saffron block font-bold leading-none mt-0.5">Notebook</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-red-650 hover:bg-red-50 rounded-xl transition-all btn-tap"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 max-w-lg mx-auto pb-24 md:pb-8">
          <Routes>
            {/* Guarded Application Views */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><BookingsList /></ProtectedRoute>} />
            <Route path="/bookings/new" element={<ProtectedRoute><NewBooking /></ProtectedRoute>} />
            <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetails /></ProtectedRoute>} />
            <Route path="/bookings/:id/edit" element={<ProtectedRoute><EditBooking /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><IdolInventory /></ProtectedRoute>} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 flex justify-around py-2 z-40 no-print">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 py-1 gap-0.5 select-none btn-tap"
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-festive-saffron' : 'text-slate-400'}`} />
                <span className={`text-[10px] transition-colors ${isActive ? 'text-festive-saffron font-bold' : 'text-slate-500'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Views */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Guarded Main Area Layout */}
          <Route path="*" element={<AppLayout />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
export { App };
