import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import SectionCard from '../../components/deliveryPartner/SectionCard';
import { getEarningsSummary } from '../../services/deliveryPartnerService';
import '../../styles/deliveryPartner.css';

const DeliveryPartnerEarnings = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getEarningsSummary();
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load earnings summary.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const total = useMemo(() => {
    return items.reduce((sum, point) => sum + Number(point.amount || 0), 0);
  }, [items]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  return (
    <div className="dp-dashboard-wrapper">
      <div className="dp-dashboard-container">
        <div className="dp-page-head">
          <button type="button" className="dp-link-button dp-link" onClick={() => navigate('/delivery-partner/dashboard')}>
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h1><DollarSign size={20} /> Earnings</h1>
        </div>

        <SectionCard title="Weekly Earnings Overview" action={<span className="dp-muted" style={{ fontWeight: 700 }}>Total: {formatCurrency(total)}</span>}>
          {isLoading ? (
            <p className="dp-muted">Loading earnings...</p>
          ) : items.length ? (
            <div className="dp-table-wrap">
              <table className="dp-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.day}>
                      <td>{String(item.day || '').toUpperCase()}</td>
                      <td>{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="dp-empty-state"><p>No earnings data found.</p></div>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default DeliveryPartnerEarnings;
