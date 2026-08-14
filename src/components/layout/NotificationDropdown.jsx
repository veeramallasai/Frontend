import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  Trash2, 
  Check, 
  CheckCheck, 
  AlertCircle, 
  Info, 
  ExternalLink,
  Inbox,
  Bell
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const formatTime = (isoString) => {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    
    if (diffMs < 0) return 'Just now';
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch (e) {
    return 'Recently';
  }
};

const NotificationDropdown = ({ onClose }) => {
  const navigate = useNavigate();
  const { 
    notifications, 
    soundEnabled, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll, 
    toggleSound 
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'unread') return !notif.read;
    return true;
  });

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
      onClose();
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-emerald-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-skyBlue-dark" />;
    }
  };

  const getColorClass = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-emerald-500 bg-emerald-50/30';
      case 'warning':
        return 'border-l-amber-500 bg-amber-50/30';
      case 'error':
        return 'border-l-red-500 bg-red-50/30';
      default:
        return 'border-l-primary bg-primary-50/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200/80 rounded-2xl shadow-glass backdrop-blur-md z-50 overflow-hidden text-left"
    >
      {/* Dropdown Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center space-x-2">
          <Bell className="w-4.5 h-4.5 text-slate-700" />
          <span className="font-bold text-slate-800 text-sm tracking-tight">Notifications</span>
        </div>
        
        {/* Toggle Controls */}
        <div className="flex items-center space-x-2">
          {/* Audio toggle button with sound ripple simulation on hover */}
          <button 
            onClick={toggleSound}
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              soundEnabled 
                ? 'bg-primary-50 text-primary hover:bg-primary-100' 
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Mark all as read */}
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllAsRead}
              title="Mark all as read"
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}

          {/* Clear all */}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              title="Clear all notifications"
              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 pt-2 border-b border-slate-100 text-xs font-semibold text-slate-500 bg-white">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2 pr-4 border-b-2 transition-all relative ${
            activeTab === 'all' 
              ? 'text-primary border-primary font-bold' 
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          All
          {notifications.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold text-[10px]">
              {notifications.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`pb-2 px-4 border-b-2 transition-all relative ${
            activeTab === 'unread' 
              ? 'text-primary border-primary font-bold' 
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          Unread
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-primary-100 text-primary rounded-full font-bold text-[10px]">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </button>
      </div>

      {/* List Container */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100/60 bg-white select-none">
        <AnimatePresence initial={false}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={`relative border-l-4 p-4 flex items-start space-x-3 transition-colors duration-150 group ${getColorClass(notif.type)} ${
                  !notif.read ? 'hover:bg-slate-50/50' : 'opacity-70 hover:opacity-100'
                }`}
              >
                {/* Visual Type Indicator Icon */}
                <div className="mt-0.5 p-1 bg-white rounded-lg border border-slate-100 shadow-sm flex-shrink-0">
                  {getIcon(notif.type)}
                </div>

                {/* Content */}
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="flex items-center space-x-1">
                    <h4 className={`text-xs truncate ${!notif.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                      {notif.title}
                    </h4>
                    {notif.actionUrl && (
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-primary transition-colors flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed break-words">
                    {notif.message}
                  </p>
                  <span className="text-[9px] text-slate-400 font-semibold tracking-wide block mt-1.5">
                    {formatTime(notif.time)}
                  </span>
                </div>

                {/* Actions Panel (Mark read / Delete) */}
                <div className="flex flex-col space-y-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pl-2">
                  {!notif.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif.id);
                      }}
                      title="Mark as read"
                      className="p-1 text-slate-400 hover:text-primary hover:bg-white rounded-md border border-slate-100 shadow-sm transition-all"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    title="Delete notification"
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-white rounded-md border border-slate-100 shadow-sm transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-3"
            >
              <div className="p-3 bg-slate-50 rounded-full border border-slate-100">
                <Inbox className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-700">All caught up!</h5>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-normal">
                  {activeTab === 'unread' 
                    ? "You don't have any unread notifications at the moment."
                    : "No notifications available. We'll alert you when something happens!"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-2.5 bg-slate-50/50 border-t border-slate-100 text-center">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Connected to Live Alert Channel
          </span>
        </div>
      )}
    </motion.div>
  );
};

// Help Helper Component
const CheckCircleIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

export default NotificationDropdown;
