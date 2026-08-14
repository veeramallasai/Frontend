import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isTokenExpired } from '../services/api';
import { normalizeRole, ROLES } from '../utils/roleUtils';
import faceVerificationService from '../services/faceVerificationService';

const DeliveryPartnerProtectedRoute = ({ children }) => {
  const [state, setState] = useState({ loading: true, allowed: false, redirect: '/delivery-partner/login' });

  useEffect(() => {
    let active = true;

    const validate = async () => {
      const token =
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token') ||
        sessionStorage.getItem('accessToken') ||
        sessionStorage.getItem('token');

      const rawUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      let user = null;
      try {
        user = rawUser ? JSON.parse(rawUser) : null;
      } catch (error) {
        user = null;
      }

      const role = normalizeRole(user?.role || user?.userRole || '');

      if (!token || isTokenExpired(token) || role !== ROLES.DELIVERY_PARTNER) {
        if (active) {
          setState({ loading: false, allowed: false, redirect: '/delivery-partner/login' });
        }
        return;
      }

      const localVerified =
        sessionStorage.getItem('deliveryPartnerFaceVerified') === 'true' ||
        localStorage.getItem('deliveryPartnerFaceVerified') === 'true';

      if (localVerified) {
        if (active) {
          setState({ loading: false, allowed: true, redirect: '' });
        }
        return;
      }

      try {
        const status = await faceVerificationService.getStatus();
        const faceRegistered = Boolean(status?.faceRegistered || status?.enrolled);
        const verified = Boolean(status?.verified);

        if (verified) {
          sessionStorage.setItem('deliveryPartnerFaceVerified', 'true');
          localStorage.setItem('deliveryPartnerFaceVerified', 'true');
          if (active) {
            setState({ loading: false, allowed: true, redirect: '' });
          }
          return;
        }

        sessionStorage.removeItem('deliveryPartnerFaceVerified');
        localStorage.removeItem('deliveryPartnerFaceVerified');

        if (active) {
          setState({
            loading: false,
            allowed: false,
            redirect: faceRegistered
              ? '/delivery-partner/face-verification'
              : '/delivery-partner/face-registration',
          });
        }
      } catch (error) {
        if (active) {
          setState({ loading: false, allowed: false, redirect: '/delivery-partner/login' });
        }
      }
    };

    validate();
    return () => {
      active = false;
    };
  }, []);

  if (state.loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', backgroundColor: '#F8FAFC', color: '#16A34A', fontWeight: 600 }}>
        Verifying Delivery Partner Security Credentials...
      </div>
    );
  }

  if (!state.allowed) {
    return <Navigate to={state.redirect} replace />;
  }

  return children;
};

export default DeliveryPartnerProtectedRoute;
