/**
 * Enhanced Notification System with Animations
 */
'use client';

import { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Info, 
  X
} from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration (default 5 seconds)
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({ 
  notification, 
  onClose 
}: { 
  notification: Notification; 
  onClose: () => void;
}) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const colors = {
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      icon: 'text-emerald-400',
      title: 'text-emerald-300',
      message: 'text-emerald-200'
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: 'text-red-400',
      title: 'text-red-300',
      message: 'text-red-200'
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      icon: 'text-amber-400',
      title: 'text-amber-300',
      message: 'text-amber-200'
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      icon: 'text-blue-400',
      title: 'text-blue-300',
      message: 'text-blue-200'
    }
  };

  const Icon = icons[notification.type];
  const style = colors[notification.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 300, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
      transition={{ type: "spring", damping: 25, stiffness: 500 }}
      className={`p-4 rounded-lg border backdrop-blur-md shadow-lg ${style.bg} ${style.border}`}
    >
      <div className="flex items-start space-x-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
        >
          <Icon className={`h-5 w-5 mt-0.5 ${style.icon}`} />
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <motion.h4 
            className={`text-sm font-semibold ${style.title}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {notification.title}
          </motion.h4>
          
          {notification.message && (
            <motion.p 
              className={`text-sm mt-1 ${style.message}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {notification.message}
            </motion.p>
          )}
          
          {notification.action && (
            <motion.button
              className={`text-sm font-medium mt-2 hover:underline ${style.title}`}
              onClick={notification.action.onClick}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {notification.action.label}
            </motion.button>
          )}
        </div>
        
        <motion.button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// Quick notification helpers
export function useQuickNotifications() {
  const { addNotification } = useNotifications();

  return {
    success: (title: string, message?: string) => 
      addNotification({ type: 'success', title, message }),
    
    error: (title: string, message?: string) => 
      addNotification({ type: 'error', title, message }),
    
    warning: (title: string, message?: string) => 
      addNotification({ type: 'warning', title, message }),
    
    info: (title: string, message?: string) => 
      addNotification({ type: 'info', title, message }),
    
    saveSuccess: () => 
      addNotification({ 
        type: 'success', 
        title: 'Progress Saved', 
        message: 'Your assessment progress has been saved successfully.',
        duration: 3000
      }),
    
    autoSave: () => 
      addNotification({ 
        type: 'info', 
        title: 'Auto-saved', 
        message: 'Your progress has been automatically saved.',
        duration: 2000
      }),
    
    connectionError: () => 
      addNotification({ 
        type: 'error', 
        title: 'Connection Error', 
        message: 'Unable to save progress. Please check your internet connection.',
        duration: 0 // Don't auto-dismiss
      })
  };
}
