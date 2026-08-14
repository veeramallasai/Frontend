import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const AdminStatCard = ({ title, value, icon: Icon, trend, trendValue, iconBg = '#E8F5E9', iconColor = '#2E7D32' }) => {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-header">
        <span className="admin-stat-title">{title}</span>
        <div className="admin-stat-icon" style={{ backgroundColor: iconBg, color: iconColor }}>
          {Icon && <Icon size={20} />}
        </div>
      </div>
      <div>
        <div className="admin-stat-value">{value}</div>
        {trend && (
          <div className="admin-stat-footer">
            {trend === 'up' ? (
              <span className="admin-stat-trend-up" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <ArrowUpRight size={14} /> {trendValue}
              </span>
            ) : (
              <span className="admin-stat-trend-down" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <ArrowDownRight size={14} /> {trendValue}
              </span>
            )}
            <span style={{ color: '#94A3B8', fontSize: '11px' }}>vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStatCard;
