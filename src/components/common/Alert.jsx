import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Alert = ({
  type = 'info', // info | success | warning | error
  message,
  description,
  onClose,
  className = '',
}) => {
  const styles = {
    info: {
      container: 'bg-blue-50 border-blue-100 text-blue-800',
      icon: Info,
    },
    success: {
      container: 'bg-emerald-50 border-emerald-100 text-emerald-800',
      icon: CheckCircle,
    },
    warning: {
      container: 'bg-amber-50 border-amber-100 text-amber-800',
      icon: AlertCircle,
    },
    error: {
      container: 'bg-red-50 border-red-100 text-red-800',
      icon: XCircle,
    },
  };

  const currentStyle = styles[type] || styles.info;
  const Icon = currentStyle.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-start p-4 rounded-xl border text-left gap-3.5 shadow-premium ${currentStyle.container} ${className}`}
      >
        <div className="flex-shrink-0 mt-0.5">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h5 className="font-semibold text-sm leading-tight">{message}</h5>
          {description && (
            <p className="mt-1 text-xs opacity-90 leading-relaxed font-medium">
              {description}
            </p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 ml-auto -mr-1.5 -mt-1.5 p-1 rounded-lg hover:bg-black/5 transition-colors focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Alert;
