import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarClock } from 'lucide-react';
import toast from 'react-hot-toast';
import SectionCard from '../../components/deliveryPartner/SectionCard';
import DeliveriesTable from '../../components/deliveryPartner/DeliveriesTable';
import { getUpcomingDeliveries } from '../../services/deliveryPartnerService';
import '../../styles/deliveryPartner.css';

const DeliveryPartnerScheduledDeliveries = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getUpcomingDeliveries(20);
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load scheduled deliveries.');
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
          <h1><CalendarClock size={20} /> Scheduled Deliveries</h1>
        </div>

        <SectionCard title="All Upcoming Deliveries">
          {isLoading ? <p className="dp-muted">Loading scheduled deliveries...</p> : <DeliveriesTable items={items} emptyText="No scheduled deliveries." />}
        </SectionCard>
      </div>
    </div>
  );
};

export default DeliveryPartnerScheduledDeliveries;
