import React from 'react';
import { CheckCircle2, Clock, Navigation, Phone, Truck } from 'lucide-react';

const nextActionByStatus = {
  ACCEPTED: { label: 'Start Pickup', status: 'PICKUP_STARTED' },
  PICKUP_STARTED: { label: 'Mark Picked Up', status: 'PICKED_UP' },
  PICKED_UP: { label: 'Start Delivery', status: 'OUT_FOR_DELIVERY' },
  OUT_FOR_DELIVERY: { label: 'Complete Delivery', status: 'DELIVERED' },
};

const formatStatus = (status = '') => status.replaceAll('_', ' ');

const CurrentDeliveryPanel = ({ delivery, onUpdateStatus, isUpdating }) => {
  if (!delivery) {
    return (
      <div className="dp-empty-state">
        <Truck size={22} />
        <p>No active delivery right now.</p>
      </div>
    );
  }

  const action = nextActionByStatus[delivery.status];

  return (
    <div className="dp-task-card">
      <div className="dp-task-top">
        <div>
          <h4>{delivery.orderId}</h4>
          <p>{delivery.customerName}</p>
        </div>
        <span className="dp-chip">{formatStatus(delivery.status)}</span>
      </div>

      <div className="dp-task-meta">
        <div><Navigation size={14} /> Pickup: {delivery.pickupLocation}</div>
        <div><Navigation size={14} /> Drop: {delivery.deliveryLocation}</div>
        <div><Phone size={14} /> {delivery.customerPhone || 'Phone unavailable'}</div>
        <div><Clock size={14} /> ETA: {delivery.estimatedMinutes || 0} mins</div>
      </div>

      {action ? (
        <button
          type="button"
          className="dp-btn-primary"
          style={{ maxWidth: '260px', marginTop: '14px' }}
          disabled={isUpdating}
          onClick={() => onUpdateStatus(delivery.orderId, action.status)}
        >
          <CheckCircle2 size={16} /> {isUpdating ? 'Updating...' : action.label}
        </button>
      ) : null}
    </div>
  );
};

export default CurrentDeliveryPanel;
