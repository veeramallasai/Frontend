import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

// Track actual user interaction to prevent AudioContext warnings in Firefox/Chrome
let userHasInteracted = false;
const handleInteraction = () => {
  userHasInteracted = true;
  window.removeEventListener('click', handleInteraction);
  window.removeEventListener('keydown', handleInteraction);
};
if (typeof window !== 'undefined') {
  window.addEventListener('click', handleInteraction);
  window.addEventListener('keydown', handleInteraction);
}

// Synthesize a clean, high-quality notification chime using Web Audio API
const playChime = () => {
  try {
    // Prevent warning by checking our custom interaction flag
    if (!userHasInteracted) {
      return;
    }
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Primary Tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    osc1.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12); // Slide to E6
    
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    // Sub-harmony for richness
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440, ctx.currentTime); // A4 note
    osc2.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15);
    
    gain2.gain.setValueAtTime(0.04, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    // Play
    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.6);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (error) {
    console.warn('Audio synthesis failed (browser permissions):', error);
  }
};

const roleSimulations = {
  admin: [
    {
      title: 'New Farmer Request',
      message: 'Farmer Ram Prasad (Krishna Organic Farm) submitted registration.',
      type: 'warning',
      actionUrl: '/admin/pending'
    },
    {
      title: 'Product Review Queue',
      message: 'New product upload: "Organic Fresh Apples" by Farmer Vikram needs verification.',
      type: 'info',
      actionUrl: '/admin/products'
    },
    {
      title: 'Auditing Alert',
      message: 'Security log review: 3 new farmer accounts successfully approved today.',
      type: 'success',
      actionUrl: '/admin/farmers'
    }
  ],
  farmer: [
    {
      title: 'New Order Received! 📦',
      message: 'Order #F2H-8942 placed for 5kg Organic Potatoes. Amount: $22.50.',
      type: 'success',
      actionUrl: '/dashboard'
    },
    {
      title: 'Review Awaiting Action',
      message: 'Customer submitted a question regarding "Fresh Organic Tomatoes" shipping.',
      type: 'info',
      actionUrl: '/dashboard/settings'
    },
    {
      title: 'System Broadcast',
      message: 'Weekly marketplace settlements completed. Funds released to your bank account.',
      type: 'success',
      actionUrl: '/dashboard/bank-details'
    }
  ],
  guest: [
    {
      title: 'Flash Sale Live! 🍎',
      message: 'Organic apples from Krishna Organic Farm are at 20% off for the next 2 hours!',
      type: 'warning',
      actionUrl: '/customer'
    },
    {
      title: 'Fresh Arrivals',
      message: 'Farmer Vikram listed a fresh batch of Leafy Spinach. Grab yours now!',
      type: 'info',
      actionUrl: '/customer'
    },
    {
      title: 'Community Milestone 🎉',
      message: 'Over 500+ local families now trust Farm2Home for their weekly organic groceries.',
      type: 'success',
      actionUrl: '/customer'
    }
  ]
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('f2h_notifications_sound');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      console.warn('Failed to load notification sound preference:', e);
      return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Key storage based on logged-in user email or 'guest'
  const storageKey = isAuthenticated && user?.email 
    ? `f2h_notifications_${user.email}` 
    : 'f2h_notifications_guest';

  // Load notifications from local storage on mount or when user changes
  useEffect(() => {
    const savedNotifications = localStorage.getItem(storageKey);
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
          return;
        }
      } catch (err) {
        console.error('Failed to parse saved notifications from localStorage:', err);
      }
    }
    
    // Seed default notifications
    const defaults = getDefaultNotifications(user?.role);
    setNotifications(defaults);
    try {
      localStorage.setItem(storageKey, JSON.stringify(defaults));
    } catch (e) {
      console.warn('Failed to save default notifications to localStorage:', e);
    }
  }, [storageKey, user?.role]);

  // Persist notifications on update
  const saveNotifications = (newNotifications) => {
    if (typeof newNotifications === 'function') {
      setNotifications(prev => {
        const next = newNotifications(prev);
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch (e) {
          console.warn('Failed to save notifications to localStorage:', e);
        }
        return next;
      });
    } else {
      setNotifications(newNotifications);
      try {
        localStorage.setItem(storageKey, JSON.stringify(newNotifications));
      } catch (e) {
        console.warn('Failed to save notifications to localStorage:', e);
      }
    }
  };

  const getDefaultNotifications = (role) => {
    const timeNow = new Date().toISOString();
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const oneDayAgo = new Date(Date.now() - 86400000).toISOString();

    if (role === 'admin') {
      return [
        {
          id: 'admin-1',
          title: 'Awaiting Verification',
          message: 'Farmer Vikram applied for registration and requires audit review.',
          type: 'warning',
          time: oneHourAgo,
          read: false,
          actionUrl: '/admin/pending'
        },
        {
          id: 'admin-2',
          title: 'System Health Check',
          message: 'Automated database and server backups completed successfully.',
          type: 'success',
          time: oneDayAgo,
          read: true
        }
      ];
    } else if (role === 'farmer') {
      return [
        {
          id: 'farmer-1',
          title: 'Account Registered',
          message: 'Welcome to Farm2Home! Finish setting up your farm details to start selling.',
          type: 'info',
          time: oneDayAgo,
          read: true,
          actionUrl: '/farmer-registration'
        },
        {
          id: 'farmer-2',
          title: 'Awaiting Audit Approval',
          message: 'Your farmer profile is currently pending administrator verification.',
          type: 'warning',
          time: oneHourAgo,
          read: false
        }
      ];
    } else {
      // Customer or Guest
      return [
        {
          id: 'guest-1',
          title: 'Welcome to Farm2Home!',
          message: 'Discover fresh organic vegetables direct from local farmer fields.',
          type: 'info',
          time: oneHourAgo,
          read: false,
          actionUrl: '/customer'
        },
        {
          id: 'guest-2',
          title: 'Grand Launch Offer 🎉',
          message: 'Use discount coupon code FRESH10 on checkout to get 10% off.',
          type: 'success',
          time: oneDayAgo,
          read: true
        }
      ];
    }
  };

  // Add a new notification
  const addNotification = ({ title, message, type = 'info', actionUrl = null }) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      time: new Date().toISOString(),
      read: false,
      actionUrl
    };

    saveNotifications(prev => [newNotif, ...prev]);

    // Toast alert feedback
    toast(
      (t) => (
        <div 
          onClick={() => {
            toast.dismiss(t.id);
            if (actionUrl) window.location.hash = actionUrl; // Simple hash navigation fallback or routing
          }}
          className="flex flex-col cursor-pointer text-left py-0.5 select-none"
        >
          <span className="font-bold text-xs text-slate-800 tracking-tight">{title}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 leading-snug">{message}</span>
        </div>
      ),
      {
        icon: type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : '🔔',
        duration: 5000,
        style: {
          borderLeft: `4px solid ${
            type === 'success' ? '#10B981' : type === 'warning' ? '#F59E0B' : type === 'error' ? '#EF4444' : '#3B82F6'
          }`,
        }
      }
    );

    // Audio cue feedback
    if (soundEnabled) {
      playChime();
    }
  };

  const markAsRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  };

  const clearAll = () => {
    saveNotifications([]);
  };

  // Save sound setting preference
  const toggleSound = () => {
    const val = !soundEnabled;
    setSoundEnabled(val);
    localStorage.setItem('f2h_notifications_sound', JSON.stringify(val));
    if (val) {
      playChime();
    }
  };

  // Background simulations for rich micro-interactions and realistic behaviors
  useEffect(() => {
    // Generate random notification intervals between 45 and 90 seconds
    const triggerSimulation = () => {
      if (roleSimulations[user?.role || 'guest']) {
        const scenarios = roleSimulations[user?.role || 'guest'];
        const chosen = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        // Execute dynamic triggers (e.g. check status, etc. if required)
        addNotification({
          title: chosen.title,
          message: chosen.message,
          type: chosen.type,
          actionUrl: chosen.actionUrl
        });
      }
    };

    const interval = setInterval(triggerSimulation, 60000); // Trigger a simulation every 60 seconds
    return () => clearInterval(interval);
  }, [user?.role, soundEnabled]);



  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      soundEnabled,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      toggleSound
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
