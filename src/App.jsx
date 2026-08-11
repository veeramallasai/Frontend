import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CustomerProvider } from './context/CustomerContext';
import { NotificationProvider } from './context/NotificationContext';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import AppErrorBoundary from './components/common/AppErrorBoundary';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AppErrorBoundary>
        <AuthProvider>
          <AdminAuthProvider>
            <NotificationProvider>
              <CustomerProvider>
            {/* Toast Notifications Provider */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#FFFFFF',
                  color: '#1E293B',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
                  borderRadius: '12px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                },
                success: {
                  iconTheme: {
                    primary: '#2E7D32',
                    secondary: '#FFFFFF',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#FFFFFF',
                  },
                },
              }}
            />


            {/* Route Trees */}
            <AppRoutes />
          </CustomerProvider>
        </NotificationProvider>
      </AdminAuthProvider>
      </AuthProvider>
      </AppErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
