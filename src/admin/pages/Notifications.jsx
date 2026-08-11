import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, AlertTriangle, Info, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Farmer Registration', message: 'Ramesh Patil applied for verification.', time: '10 mins ago', type: 'info', read: false },
    { id: 2, title: 'Low Stock Alert', message: 'Fresh Mint Leaves stock is below 5 units.', time: '1 hour ago', type: 'warning', read: false },
    { id: 3, title: 'System Backup Completed', message: 'Database backup succeeded automatically.', time: '5 hours ago', type: 'success', read: true },
    { id: 4, title: 'Payment Payout Pending', message: '3 farmer payout requests require admin signoff.', time: '1 day ago', type: 'warning', read: true }
  ]);

  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcast, setBroadcast] = useState({ title: '', message: '', target: 'All' });

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read.');
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcast.title || !broadcast.message) {
      toast.error('Please fill in broadcast title and message.');
      return;
    }
    const newNotif = {
      id: Date.now(),
      title: broadcast.title,
      message: broadcast.message,
      time: 'Just now',
      type: 'info',
      read: false
    };
    setNotifications([newNotif, ...notifications]);
    setShowBroadcastModal(false);
    setBroadcast({ title: '', message: '', target: 'All' });
    toast.success('Broadcast notification dispatched successfully!');
  };

  return (
    <div>
      <div className="admin-toolbar">
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#0F172A' }}>Notifications & System Alerts</h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#64748B' }}>
            Administrative notifications, inventory alerts, and push broadcast engine
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="admin-btn-secondary" onClick={handleMarkAllRead}>
            Mark All Read
          </button>
          <button
            className="admin-btn-primary"
            style={{ width: 'auto', padding: '8px 16px' }}
            onClick={() => setShowBroadcastModal(true)}
          >
            <Send size={16} /> Broadcast Alert
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Alert Center Logs</h3>
          <span style={{ fontSize: '12px', color: '#64748B' }}>Count: {notifications.length}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: notif.read ? '#FFFFFF' : '#F0FDF4',
                border: '1px solid #E2E8F0'
              }}
            >
              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ marginTop: '2px' }}>
                  {notif.type === 'warning' ? (
                    <AlertTriangle size={20} style={{ color: '#EA580C' }} />
                  ) : notif.type === 'success' ? (
                    <CheckCircle2 size={20} style={{ color: '#16A34A' }} />
                  ) : (
                    <Info size={20} style={{ color: '#0284C7' }} />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>{notif.title}</div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569' }}>{notif.message}</p>
                  <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px', display: 'inline-block' }}>
                    {notif.time}
                  </span>
                </div>
              </div>

              {!notif.read && (
                <button
                  className="admin-action-btn"
                  onClick={() =>
                    setNotifications((prev) =>
                      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                    )
                  }
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {showBroadcastModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '20px',
          }}
          onClick={() => setShowBroadcastModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#0F172A' }}>Send System Broadcast</h3>
            <form onSubmit={handleSendBroadcast}>
              <div className="admin-form-group">
                <label className="admin-form-label">Alert Title</label>
                <input
                  type="text"
                  className="admin-input"
                  style={{ paddingLeft: '14px' }}
                  placeholder="e.g. Scheduled Platform Maintenance"
                  value={broadcast.title}
                  onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Target Audience</label>
                <select
                  className="admin-select"
                  style={{ width: '100%' }}
                  value={broadcast.target}
                  onChange={(e) => setBroadcast({ ...broadcast, target: e.target.value })}
                >
                  <option value="All">All Platform Users</option>
                  <option value="Farmers">Farmers Only</option>
                  <option value="Customers">Customers Only</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Message Body</label>
                <textarea
                  className="admin-input"
                  style={{ paddingLeft: '14px', minHeight: '80px' }}
                  placeholder="Write your broadcast message here..."
                  value={broadcast.message}
                  onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setShowBroadcastModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary">
                  <Send size={16} /> Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
