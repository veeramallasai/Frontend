import React, { useState, useEffect } from 'react';
import { adminApiService } from '../services/adminApiService';
import {
  ShieldAlert,
  Lock,
  ShieldCheck,
  Search,
  RefreshCw,
  AlertTriangle,
  Clock,
  Globe,
  Monitor,
  UserX,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import toast from 'react-hot-toast';

const SecurityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSecurityLogs = async () => {
    setLoading(true);
    try {
      const data = await adminApiService.getUnauthorizedAttempts();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[SecurityLogs] Error fetching security logs:', err);
      toast.error('Failed to load security audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const email = (log.attemptedEmail || '').toLowerCase();
    const ip = (log.ipAddress || '').toLowerCase();
    const reason = (log.reason || '').toLowerCase();
    return email.includes(q) || ip.includes(q) || reason.includes(q);
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (e) {
      return String(dateString);
    }
  };

  return (
    <div className="admin-page-container">
      {/* Header Banner */}
      <div className="admin-page-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 8px 20px rgba(220, 38, 38, 0.25)'
          }}>
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="admin-page-title" style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Super Admin Security Section
            </h1>
            <p className="admin-page-desc" style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0 0' }}>
              Real-time audit log of blocked unauthorized admin login attempts and access violations
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchSecurityLogs}
          className="admin-btn-primary"
          style={{ width: 'auto', backgroundColor: '#16A34A', gap: '8px', padding: '10px 18px' }}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Security Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserX size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.5px' }}>
              Blocked Access Attempts
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
              {logs.length}
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.5px' }}>
              Authorized Admin Email
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#15803D', marginTop: '4px', wordBreak: 'break-all' }}>
              veeramallasaipichaiah456@gmail.com
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.5px' }}>
              Security Policy
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E40AF', marginTop: '4px' }}>
              Password + 6-Digit Email OTP
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search audit logs by attempted email address, IP, or security reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '42px',
                paddingRight: '16px',
                paddingTop: '10px',
                paddingBottom: '10px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Audit Logs Table */}
        <div style={{ marginTop: '20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Timestamp</th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Attempted Email</th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>IP Address</th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Device / User Agent</th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Reason & Status</th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 10px auto', display: 'block' }} />
                    Loading security audit logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <CheckCircle size={32} style={{ margin: '0 auto 10px auto', display: 'block', color: '#16A34A' }} />
                    No unauthorized login attempts found matching filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr key={log.id || index} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} style={{ color: '#94A3B8' }} />
                        {formatDate(log.attemptTime || log.createdAt)}
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                      <span style={{
                        padding: '4px 10px',
                        backgroundColor: '#FEF2F2',
                        color: '#991B1B',
                        borderRadius: '6px',
                        border: '1px solid #FCA5A5',
                        fontFamily: 'monospace'
                      }}>
                        {log.attemptedEmail}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#475569', fontFamily: 'monospace' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Globe size={14} style={{ color: '#64748B' }} />
                        {log.ipAddress || '127.0.0.1'}
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '12px', color: '#64748B', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title={log.userAgent}>
                        <Monitor size={14} style={{ color: '#94A3B8', flexShrink: 0 }} />
                        <span>{log.userAgent || 'Unknown Device'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: 700 }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        backgroundColor: '#FEE2E2',
                        color: '#B91C1C',
                        fontSize: '12px'
                      }}>
                        <AlertTriangle size={12} />
                        {log.reason || 'Access Denied'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        backgroundColor: '#DC2626',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase'
                      }}>
                        Blocked & Logged
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecurityLogs;
