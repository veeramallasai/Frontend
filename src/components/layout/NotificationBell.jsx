import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [animateBell, setAnimateBell] = useState(false);
  const containerRef = useRef(null);
  const prevCountRef = useRef(unreadCount);

  // Trigger wiggle micro-interaction whenever unread count increases
  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      setAnimateBell(true);
      const timer = setTimeout(() => setAnimateBell(false), 6000); // wiggle effect duration
      return () => clearTimeout(timer);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  // Click outside to close the dropdown panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const bellVariants = {
    idle: { 
      rotate: 0, 
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 15 } 
    },
    hover: { 
      scale: 1.1,
      transition: { type: 'spring', stiffness: 400, damping: 10 } 
    },
    tap: { 
      scale: 0.95 
    },
    wiggle: {
      rotate: [0, -18, 15, -15, 12, -8, 6, -3, 0],
      scale: [1, 1.15, 1.15, 1.1, 1.1, 1.05, 1.05, 1, 1],
      transition: { 
        duration: 0.8, 
        ease: 'easeInOut',
        times: [0, 0.15, 0.3, 0.45, 0.6, 0.7, 0.8, 0.9, 1] 
      }
    }
  };

  const badgeVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1, 
      transition: { type: 'spring', stiffness: 500, damping: 15 } 
    },
    exit: { scale: 0, opacity: 0 }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Dynamic Trigger Bell Icon */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        variants={bellVariants}
        animate={animateBell ? "wiggle" : "idle"}
        whileHover="hover"
        whileTap="tap"
        className={`p-2 rounded-xl transition-colors select-none focus:outline-none ${
          isOpen 
            ? 'bg-primary-50 text-primary border border-primary/20 shadow-sm' 
            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-transparent'
        }`}
      >
        <Bell className="w-5 h-5" />

        {/* Unread Alert Indicator Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              variants={badgeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1.5 bg-red-500 text-white font-extrabold text-[10px] flex items-center justify-center rounded-full border-2 border-white shadow-sm pointer-events-none"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Floating Notification Panel Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <NotificationDropdown onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
