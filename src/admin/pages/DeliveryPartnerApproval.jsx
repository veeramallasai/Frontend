import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Loader2,
  Search,
  UserPlus,
  Power,
  RefreshCw,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminDeliveryService from '../../services/adminDeliveryService';
import '../../admin/styles/admin.css';

const DeliveryPartnerApproval = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'all' | 'assign'
  const [pendingPartners, setPendingPartners] = useState([]);
  const [allPartners, setAllPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignUserId, setAssignUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendingData, allData] = await Promise.all([
        adminDeliveryService.getPendingDeliveryPartners(),
        adminDeliveryService.getAllDeliveryPartners(),
      ]);

      setPendingPartners(Array.isArray(pendingData) ? pendingData : []);
      setAllPartners(Array.isArray(allData) ? allData : []);
    } catch (err) {
      console.warn('[DeliveryPartnerApproval] Error loading data:', err);
      toast.error('Failed to refresh delivery partner approval data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id, name) => {
    try {
      await adminDeliveryService.approvePartner(id);
      toast.success(`Delivery Partner "${name}" approved successfully.`);
      loadData();
    } catch (err) {
      toast.error('Failed to approve partner.');
    }
  };

  const handleReject = async (id, name) => {
    try {
      await adminDeliveryService.rejectPartner(id);
      toast.error(`Delivery Partner "${name}" application rejected.`);
      loadData();
    } catch (err) {
      toast.error('Failed to reject partner.');
    }
  };

  const handleToggleActivate = async (id, name, currentActive) => {
    try {
      if (currentActive) {
        await adminDeliveryService.deactivatePartner(id);
        toast.error(`Partner "${name}" deactivated.`);
      } else {
        await adminDeliveryService.activatePartner(id);
        toast.success(`Partner "${name}" activated.`);
      }
      loadData();
    } catch (err) {
      toast.error('Failed to update partner activation state.');
    }
  };

  const handleAssignRoleSubmit = async (e) => {
    e.preventDefault();
    if (!assignUserId.trim()) {
      toast.error('Please enter a User ID.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await adminDeliveryService.assignDeliveryRole(assignUserId.trim());
      toast.success(`ROLE_DELIVERY_PARTNER assigned to user ID ${assignUserId}. Partner approved!`);
      setAssignUserId('');
      loadData();
      setActiveTab('all');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to assign role.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAllPartners = allPartners.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.fullName && p.fullName.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.phone && p.phone.includes(q)) ||
      (p.vehicleNumber && p.vehicleNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Delivery Partner Approvals & Roles</h1>
          <p className="admin-page-subtitle">Approve applications, assign ROLE_DELIVERY_PARTNER, and manage status</p>
        </div>
        <button type="button" className="admin-btn-secondary" onClick={loadData} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'admin-spin' : ''} /> Refresh List
        </button>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '2px solid #E2E8F0', paddingBottom: 8 }}>
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          style={{
            border: 'none',
            background: 'transparent',
            fontWeight: 700,
            fontSize: 15,
            padding: '8px 16px',
            cursor: 'pointer',
            color: activeTab === 'pending' ? '#16A34A' : '#64748B',
            borderBottom: activeTab === 'pending' ? '3px solid #16A34A' : 'none',
          }}
        >
          <Clock size={16} style={{ display: 'inline', marginRight: 6 }} />
          Pending Approvals ({pendingPartners.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          style={{
            border: 'none',
            background: 'transparent',
            fontWeight: 700,
            fontSize: 15,
            padding: '8px 16px',
            cursor: 'pointer',
            color: activeTab === 'all' ? '#16A34A' : '#64748B',
            borderBottom: activeTab === 'all' ? '3px solid #16A34A' : 'none',
          }}
        >
          <UserCheck size={16} style={{ display: 'inline', marginRight: 6 }} />
          All Partners ({allPartners.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('assign')}
          style={{
            border: 'none',
            background: 'transparent',
            fontWeight: 700,
            fontSize: 15,
            padding: '8px 16px',
            cursor: 'pointer',
            color: activeTab === 'assign' ? '#16A34A' : '#64748B',
            borderBottom: activeTab === 'assign' ? '3px solid #16A34A' : 'none',
          }}
        >
          <UserPlus size={16} style={{ display: 'inline', marginRight: 6 }} />
          Assign ROLE_DELIVERY_PARTNER
        </button>
      </div>

      {/* TAB 1: Pending Approvals */}
      {activeTab === 'pending' && (
        <div className="admin-card">
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Pending Delivery Partner Applications</h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><Loader2 className="admin-spin" size={32} /></div>
          ) : pendingPartners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>
              <CheckCircle size={48} color="#16A34A" style={{ marginBottom: 12 }} />
              <p style={{ fontWeight: 600, fontSize: 16 }}>All pending applications have been processed!</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Partner Name</th>
                    <th>Email / Phone</th>
                    <th>Vehicle</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPartners.map((partner) => (
                    <tr key={partner.id || partner.userId}>
                      <td>
                        <strong>{partner.fullName || 'Delivery Partner'}</strong>
                        <div style={{ fontSize: 12, color: '#64748B' }}>ID: #{partner.id}</div>
                      </td>
                      <td>
                        <div>{partner.email}</div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>{partner.phone}</div>
                      </td>
                      <td>{partner.vehicleType || 'Motorbike'} ({partner.vehicleNumber || 'N/A'})</td>
                      <td>{[partner.city, partner.state].filter(Boolean).join(', ') || 'N/A'}</td>
                      <td>
                        <span className="admin-badge badge-warning">
                          {partner.verificationStatus || 'PENDING'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            className="admin-btn-success"
                            style={{ padding: '6px 12px', fontSize: 13 }}
                            onClick={() => handleApprove(partner.id || partner.userId, partner.fullName)}
                          >
                            <CheckCircle size={14} /> Approve
                          </button>

                          <button
                            type="button"
                            className="admin-btn-danger"
                            style={{ padding: '6px 12px', fontSize: 13 }}
                            onClick={() => handleReject(partner.id || partner.userId, partner.fullName)}
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: All Partners */}
      {activeTab === 'all' && (
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="admin-search-box" style={{ width: 320 }}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by name, email, vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredAllPartners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>
              <UserCheck size={40} color="#94A3B8" style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px auto' }} />
              <p style={{ fontWeight: 700, fontSize: 16, color: '#1E293B', margin: 0 }}>No data found</p>
              <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>No delivery partner accounts found in PostgreSQL database.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
              <thead>
                <tr>
                  <th>Partner Name</th>
                  <th>Contact</th>
                  <th>Vehicle Info</th>
                  <th>Verification Status</th>
                  <th>Active State</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllPartners.map((partner) => (
                  <tr key={partner.id || partner.userId}>
                    <td>
                      <strong>{partner.fullName}</strong>
                    </td>
                    <td>
                      <div>{partner.email}</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>{partner.phone}</div>
                    </td>
                    <td>{partner.vehicleType} - {partner.vehicleNumber}</td>
                    <td>
                      <span className={`admin-badge ${partner.verificationStatus === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
                        {partner.verificationStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${partner.accountActive ? 'badge-success' : 'badge-danger'}`}>
                        {partner.accountActive ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {partner.verificationStatus !== 'APPROVED' && (
                          <button
                            type="button"
                            className="admin-btn-success"
                            style={{ padding: '4px 10px', fontSize: 12 }}
                            onClick={() => handleApprove(partner.id || partner.userId, partner.fullName)}
                          >
                            Approve
                          </button>
                        )}

                        <button
                          type="button"
                          className={partner.accountActive ? 'admin-btn-warning' : 'admin-btn-success'}
                          style={{ padding: '4px 10px', fontSize: 12 }}
                          onClick={() => handleToggleActivate(partner.id || partner.userId, partner.fullName, partner.accountActive)}
                        >
                          <Power size={12} /> {partner.accountActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}

      {/* TAB 3: Assign Role */}
      {activeTab === 'assign' && (
        <div className="admin-card" style={{ maxWidth: 500 }}>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Assign ROLE_DELIVERY_PARTNER to User</h2>
          <p style={{ color: '#64748B', fontSize: 14, marginBottom: 18 }}>
            Enter the User ID of any existing registered user to assign them the Delivery Partner role and approve their profile immediately.
          </p>

          <form onSubmit={handleAssignRoleSubmit}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>User ID</label>
            <input
              type="text"
              placeholder="e.g. 101"
              value={assignUserId}
              onChange={(e) => setAssignUserId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: 14,
                marginBottom: 16,
              }}
            />

            <button type="submit" className="admin-btn-primary" disabled={isSubmitting} style={{ width: '100%' }}>
              {isSubmitting ? <><Loader2 className="admin-spin" size={16} /> Assigning Role...</> : <><UserPlus size={16} /> Assign ROLE_DELIVERY_PARTNER & Approve</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default DeliveryPartnerApproval;
