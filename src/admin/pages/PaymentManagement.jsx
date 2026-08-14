import React, { useState, useEffect } from 'react';
import { adminApiService } from '../services/adminApiService';
import { CreditCard, DollarSign, CheckCircle2, Clock, Search, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const data = await adminApiService.getPayments();
        setPayments(data);
      } catch (err) {
        toast.error('Failed to load payment transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const handleApprovePayout = (id, amount) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'Payout Processed' } : p))
    );
    toast.success(`Payout of ₹${amount} approved & remitted.`);
  };

  const filteredPayments = payments.filter((p) =>
    p.txnId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-filter-group">
          <div style={{ position: 'relative', width: '320px' }}>
            <Search className="admin-search-icon" size={16} />
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search Transaction ID, Order ID, Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Payment Gateway Transactions & Payouts</h3>
          <span style={{ fontSize: '12px', color: '#64748B' }}>Total Logs: {filteredPayments.length}</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#2E7D32' }}>
            <Loader2 className="animate-spin" size={28} style={{ margin: '0 auto 8px auto' }} />
            Loading transaction history...
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Gateway Txn Ref</th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((pay) => (
                  <tr key={pay.id}>
                    <td style={{ fontWeight: 600, color: '#2E7D32' }}>{pay.id}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '12px' }}>
                        {pay.txnId}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#0284C7' }}>{pay.orderId}</td>
                    <td>{pay.customer}</td>
                    <td style={{ fontWeight: 700, color: '#16A34A' }}>₹{pay.amount}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}>
                        <CreditCard size={14} style={{ color: '#9333EA' }} /> {pay.method}
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748B' }}>{pay.date}</td>
                    <td>
                      <span
                        className={`admin-pill ${
                          pay.status === 'Success' || pay.status === 'Payout Processed'
                            ? 'admin-pill-success'
                            : 'admin-pill-warning'
                        }`}
                      >
                        {pay.status}
                      </span>
                    </td>
                    <td>
                      {pay.status === 'Pending Payout' ? (
                        <button
                          className="admin-action-btn"
                          style={{ backgroundColor: '#2E7D32', color: '#FFFFFF', borderColor: '#2E7D32' }}
                          onClick={() => handleApprovePayout(pay.id, pay.amount)}
                        >
                          Approve Payout
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#16A34A', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          <ShieldCheck size={14} /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManagement;
