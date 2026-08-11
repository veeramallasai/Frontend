import React from 'react';

const formatStatus = (status = '') => status.replaceAll('_', ' ');

const DeliveriesTable = ({ items, emptyText = 'No records found' }) => {
  if (!items?.length) {
    return <div className="dp-empty-state"><p>{emptyText}</p></div>;
  }

  return (
    <div className="dp-table-wrap">
      <table className="dp-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.orderId}>
              <td>{item.orderId}</td>
              <td>{item.customerName}</td>
              <td>{item.location || '-'}</td>
              <td>{formatStatus(item.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeliveriesTable;
