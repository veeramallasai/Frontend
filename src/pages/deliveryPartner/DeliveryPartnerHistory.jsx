import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ReceiptText } from 'lucide-react';
import toast from 'react-hot-toast';
import SectionCard from '../../components/deliveryPartner/SectionCard';
import { getRecentDeliveries } from '../../services/deliveryPartnerService';
import '../../styles/deliveryPartner.css';

const DeliveryPartnerHistory = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getRecentDeliveries(50);
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load delivery history.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="dp-dashboard-wrapper">
      <div className="dp-dashboard-container">
        <div className="dp-page-head">
          <button type="button" className="dp-link-button dp-link" onClick={() => navigate('/delivery-partner/dashboard')}>
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h1><ReceiptText size={20} /> Delivery History</h1>
        </div>

        <SectionCard title="Recent Completed Deliveries">
          {isLoading ? (
            <p className="dp-muted">Loading history...</p>
          ) : items.length ? (
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
                  {items.map((item) => (
                    <tr key={item.orderId}>
                      <td>{item.orderId}</td>
                      <td>{item.customerName}</td>
                      <td>{formatCurrency(item.amount)}</td>
                      <td>{String(item.status || '').replaceAll('_', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="dp-empty-state"><p>No completed deliveries found.</p></div>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default DeliveryPartnerHistory;
