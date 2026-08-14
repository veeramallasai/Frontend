import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarClock,
  Clock,
  DollarSign,
  Power,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../../components/deliveryPartner/StatCard';
import SectionCard from '../../components/deliveryPartner/SectionCard';
import CurrentDeliveryPanel from '../../components/deliveryPartner/CurrentDeliveryPanel';
import DeliveriesTable from '../../components/deliveryPartner/DeliveriesTable';
import {
  getCurrentDelivery,
  getDashboardSummary,
  getEarningsSummary,
  getRatings,
  getRecentDeliveries,
  getUpcomingDeliveries,
  updateDeliveryStatus,
  updateOnlineStatus,
} from '../../services/deliveryPartnerService';
import '../../styles/deliveryPartner.css';

const DeliveryPartnerDashboard = () => {
  const navigate = useNavigate();
  const [partnerUser, setPartnerUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [recent, setRecent] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [ratings, setRatings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);

  const formatCurrency = (value) => {
    const amount = Number(value || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setLoadingError('');

    try {
      const [summaryData, currentData, upcomingData, recentData, earningsData, ratingsData] =
        await Promise.all([
          getDashboardSummary(),
          getCurrentDelivery(),
          getUpcomingDeliveries(5),
          getRecentDeliveries(6),
          getEarningsSummary(),
          getRatings(),
        ]);

      setSummary(summaryData || null);
      setCurrentDelivery(currentData || null);
      setUpcoming(Array.isArray(upcomingData) ? upcomingData : []);
      setRecent(Array.isArray(recentData) ? recentData : []);
      setEarnings(Array.isArray(earningsData) ? earningsData : []);
      setRatings(ratingsData || null);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.customFormattedMessage ||
        'Failed to load dashboard.';
      setLoadingError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const rawUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (rawUser) {
      try {
        setPartnerUser(JSON.parse(rawUser));
      } catch (error) {
        setPartnerUser({ name: 'Delivery Partner' });
      }
    }
    loadDashboard();
  }, [loadDashboard]);

  const isOnline = useMemo(
    () => String(summary?.availabilityStatus || 'OFFLINE').toUpperCase() === 'ONLINE',
    [summary]
  );

  const maxEarning = useMemo(() => {
    const max = Math.max(...earnings.map((point) => Number(point.amount || 0)), 1);
    return max;
  }, [earnings]);

  const handleToggleStatus = async () => {
    if (isTogglingStatus || !summary) {
      return;
    }

    const nextStatus = isOnline ? 'OFFLINE' : 'ONLINE';
    const faceVerified =
      sessionStorage.getItem('deliveryPartnerFaceVerified') === 'true' ||
      localStorage.getItem('deliveryPartnerFaceVerified') === 'true';

    if (nextStatus === 'ONLINE' && !faceVerified) {
      toast.error('Face verification is required before going online.');
      navigate('/delivery-partner/face-verification/instructions');
      return;
    }

    try {
      setIsTogglingStatus(true);
      const updated = await updateOnlineStatus(nextStatus);
      setSummary((prev) => ({
        ...(prev || {}),
        availabilityStatus: updated?.status || nextStatus,
      }));
      toast.success(`You are now ${String(updated?.status || nextStatus).toUpperCase()}.`);
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Failed to update availability status.';
      toast.error(message);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDeliveryStatusUpdate = async (orderId, status) => {
    try {
      setIsUpdatingTask(true);
      const updatedTask = await updateDeliveryStatus(orderId, status);
      setCurrentDelivery(
        updatedTask?.status === 'DELIVERED' || updatedTask?.status === 'CANCELLED'
          ? null
          : updatedTask
      );
      toast.success('Delivery status updated successfully.');
      await loadDashboard();
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Failed to update delivery status.';
      toast.error(message);
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('deliveryPartnerFaceVerified');
    localStorage.removeItem('deliveryPartnerFaceVerified');
    toast.success('Logged out successfully.');
    navigate('/delivery-partner/login');
  };

  return (
    <div className="dp-dashboard-wrapper">
      <nav className="dp-dashboard-nav">
        <div className="dp-dashboard-brand">
          <div className="dp-logo-dot" />
          <div>
            <div style={{ lineHeight: '1.2' }}>Farm to Home</div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#A7F3D0' }}>
              Delivery Partner Portal
            </div>
          </div>
        </div>

        <div className="dp-dashboard-nav-actions">
          <button
            type="button"
            onClick={handleToggleStatus}
            className={`dp-status-badge ${isOnline ? 'dp-status-online' : 'dp-status-offline'}`}
            style={{ cursor: isTogglingStatus ? 'not-allowed' : 'pointer', border: 'none' }}
            disabled={isTogglingStatus || isLoading}
          >
            <span className="dp-status-dot" />
            {isTogglingStatus ? 'UPDATING...' : isOnline ? 'ONLINE' : 'OFFLINE'}
          </button>

          <div className="dp-partner-pill">
            <ShieldCheck size={16} color="#4ADE80" />
            <span>{partnerUser?.name || partnerUser?.fullName || 'Delivery Partner'}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="dp-logout-btn"
          >
            <Power size={18} />
          </button>
        </div>
      </nav>

      <div className="dp-dashboard-container">
        <div className="dp-banner-card">
          <div>
            <h1>
              Welcome, {partnerUser?.name || partnerUser?.fullName || 'Delivery Partner'}
            </h1>
            <p>Manage your deliveries, earnings, and ratings in real time.</p>
          </div>
          <div className="dp-verified-pill">
            <ShieldCheck size={18} color="#16A34A" />
            Face Verification: VERIFIED
          </div>
        </div>

        {loadingError ? (
          <div className="dp-error-box" style={{ marginBottom: '18px' }}>
            <span>{loadingError}</span>
            <button
              type="button"
              className="dp-link-button dp-link"
              onClick={loadDashboard}
            >
              Retry
            </button>
          </div>
        ) : null}

        <div className="dp-stats-grid">
          <StatCard
            icon={<Truck size={24} />}
            value={isLoading ? '...' : summary?.completedToday ?? 0}
            label="Deliveries Completed Today"
          />
          <StatCard
            icon={<Clock size={24} />}
            value={isLoading ? '...' : summary?.activeDeliveries ?? 0}
            label="Active Orders"
            tint="#D97706"
            bg="#FEF3C7"
          />
          <StatCard
            icon={<DollarSign size={24} />}
            value={isLoading ? '...' : formatCurrency(summary?.todaysEarnings)}
            label="Earnings Today"
            tint="#059669"
            bg="#ECFDF5"
          />
          <StatCard
            icon={<Sparkles size={24} />}
            value={isLoading ? '...' : `${ratings?.overallRating || 0} / 5`}
            label="Customer Rating"
            tint="#2563EB"
            bg="#EFF6FF"
          />
        </div>

        <div className="dp-grid-2">
          <SectionCard title="Current Delivery Task">
            {isLoading ? (
              <p className="dp-muted">Loading current task...</p>
            ) : (
              <CurrentDeliveryPanel
                delivery={currentDelivery}
                onUpdateStatus={handleDeliveryStatusUpdate}
                isUpdating={isUpdatingTask}
              />
            )}
          </SectionCard>

          <SectionCard
            title="Upcoming Deliveries"
            action={
              <button
                type="button"
                className="dp-link-button dp-link"
                onClick={() => navigate('/delivery-partner/scheduled-deliveries')}
              >
                View all
              </button>
            }
          >
            {isLoading ? (
              <p className="dp-muted">Loading scheduled deliveries...</p>
            ) : (
              <DeliveriesTable items={upcoming} emptyText="No upcoming deliveries." />
            )}
          </SectionCard>
        </div>

        <div className="dp-grid-2" style={{ marginTop: '18px' }}>
          <SectionCard
            title="Weekly Earnings"
            action={
              <button
                type="button"
                className="dp-link-button dp-link"
                onClick={() => navigate('/delivery-partner/earnings')}
              >
                Details
              </button>
            }
          >
            {isLoading ? (
              <p className="dp-muted">Loading earnings...</p>
            ) : earnings.length ? (
              <div className="dp-earnings-bars">
                {earnings.map((point) => {
                  const amount = Number(point.amount || 0);
                  const height = Math.max((amount / maxEarning) * 100, 12);
                  return (
                    <div className="dp-earnings-bar-item" key={point.day}>
                      <div className="dp-earnings-bar" style={{ height: `${height}%` }} />
                      <span className="dp-earnings-day">
                        {String(point.day || '').toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="dp-empty-state">
                <p>No earnings data available.</p>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Ratings Overview"
            action={
              <span className="dp-muted" style={{ fontWeight: 700 }}>
                {ratings?.totalRatings || 0} ratings
              </span>
            }
          >
            {isLoading ? (
              <p className="dp-muted">Loading ratings...</p>
            ) : (
              <div>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = Number(ratings?.distribution?.[star] || 0);
                  const total = Number(ratings?.totalRatings || 0);
                  const width = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div className="dp-rating-row" key={star}>
                      <span>
                        <Star size={13} /> {star}
                      </span>
                      <div className="dp-rating-track">
                        <div className="dp-rating-fill" style={{ width: `${width}%` }} />
                      </div>
                      <span>{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        <div style={{ marginTop: '18px' }}>
          <SectionCard
            title="Recent Completed Deliveries"
            action={
              <button
                type="button"
                className="dp-link-button dp-link"
                onClick={() => navigate('/delivery-partner/delivery-history')}
              >
                Full history
              </button>
            }
          >
            {isLoading ? (
              <p className="dp-muted">Loading delivery history...</p>
            ) : (
              <div className="dp-table-wrap">
                <table className="dp-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.length ? (
                      recent.map((item) => (
                        <tr key={item.orderId}>
                          <td>{item.orderId}</td>
                          <td>{item.customerName}</td>
                          <td>{formatCurrency(item.amount)}</td>
                          <td>{String(item.status || '').replaceAll('_', ' ')}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="dp-muted">
                          No completed deliveries found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="dp-quick-links">
          <button
            type="button"
            className="dp-quick-link"
            onClick={() => navigate('/delivery-partner/scheduled-deliveries')}
          >
            <CalendarClock size={16} /> Scheduled Deliveries
          </button>
          <button
            type="button"
            className="dp-quick-link"
            onClick={() => navigate('/delivery-partner/earnings')}
          >
            <DollarSign size={16} /> Earnings
          </button>
          <button
            type="button"
            className="dp-quick-link"
            onClick={() => navigate('/delivery-partner/delivery-history')}
          >
            <ReceiptText size={16} /> Delivery History
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPartnerDashboard;
