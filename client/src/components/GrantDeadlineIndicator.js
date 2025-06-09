import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const GrantDeadlineIndicator = ({ deadline, className = '' }) => {
  const { darkMode } = useContext(ThemeContext);

  const calculateDaysRemaining = (deadlineString) => {
    if (!deadlineString) return null;
    const today = new Date();
    const deadlineDate = new Date(deadlineString);
    if (isNaN(deadlineDate.getTime())) return null;
    return Math.round((deadlineDate - today) / (1000 * 60 * 60 * 24));
  };

  const getUrgencyLevel = (days) => {
    if (days === null) return 'unknown';
    if (days < 0) return 'expired';
    if (days <= 7) return 'urgent';
    if (days <= 30) return 'soon';
    return 'normal';
  };

  const getIndicatorStyles = (urgencyLevel) => {
    switch (urgencyLevel) {
      case 'expired':
        return {
          bg: darkMode ? 'bg-red-900/20' : 'bg-red-100',
          border: darkMode ? 'border-red-700' : 'border-red-300',
          text: darkMode ? 'text-red-400' : 'text-red-700',
          icon: '⚠️',
          pulse: false,
        };
      case 'urgent':
        return {
          bg: darkMode ? 'bg-orange-900/20' : 'bg-orange-100',
          border: darkMode ? 'border-orange-700' : 'border-orange-300',
          text: darkMode ? 'text-orange-400' : 'text-orange-700',
          icon: '🔥',
          pulse: true,
        };
      case 'soon':
        return {
          bg: darkMode ? 'bg-yellow-900/20' : 'bg-yellow-100',
          border: darkMode ? 'border-yellow-700' : 'border-yellow-300',
          text: darkMode ? 'text-yellow-400' : 'text-yellow-700',
          icon: '⏰',
          pulse: false,
        };
      case 'normal':
        return {
          bg: darkMode ? 'bg-green-900/20' : 'bg-green-100',
          border: darkMode ? 'border-green-700' : 'border-green-300',
          text: darkMode ? 'text-green-400' : 'text-green-700',
          icon: '✅',
          pulse: false,
        };
      default:
        return {
          bg: darkMode ? 'bg-gray-700/50' : 'bg-gray-100',
          border: darkMode ? 'border-gray-600' : 'border-gray-300',
          text: darkMode ? 'text-gray-400' : 'text-gray-600',
          icon: '📅',
          pulse: false,
        };
    }
  };

  const formatDeadlineText = (days, urgencyLevel) => {
    if (urgencyLevel === 'unknown' || deadline === 'Rolling') {
      return deadline || 'No deadline';
    }
    if (urgencyLevel === 'expired') {
      return `Expired ${Math.abs(days)} days ago`;
    }
    if (days === 0) {
      return 'Deadline today!';
    }
    if (days === 1) {
      return 'Tomorrow';
    }
    return `${days} days left`;
  };

  const days = calculateDaysRemaining(deadline);
  const urgencyLevel = getUrgencyLevel(days);
  const styles = getIndicatorStyles(urgencyLevel);
  const text = formatDeadlineText(days, urgencyLevel);

  // Progress bar width calculation
  const getProgressWidth = () => {
    if (urgencyLevel === 'expired' || urgencyLevel === 'unknown') return 0;
    if (days > 90) return 100;
    return Math.max(0, Math.min(100, (days / 90) * 100));
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      {/* Main indicator */}
      <div
        className={`
          inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold
          border ${styles.bg} ${styles.border} ${styles.text}
          ${styles.pulse ? 'animate-pulse' : ''}
          transition-all duration-300
        `}
      >
        <span className="mr-1.5 text-sm">{styles.icon}</span>
        <span>{text}</span>
      </div>

      {/* Progress bar for non-expired grants */}
      {urgencyLevel !== 'expired' && urgencyLevel !== 'unknown' && days !== null && (
        <div className="mt-1 w-full">
          <div className={`h-1 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                urgencyLevel === 'urgent'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500'
                  : urgencyLevel === 'soon'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500'
              }`}
              style={{ width: `${getProgressWidth()}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Compact version for use in cards
export const CompactDeadlineIndicator = ({ deadline }) => {
  const { darkMode } = useContext(ThemeContext);

  const calculateDaysRemaining = (deadlineString) => {
    if (!deadlineString) return null;
    const today = new Date();
    const deadlineDate = new Date(deadlineString);
    if (isNaN(deadlineDate.getTime())) return null;
    return Math.round((deadlineDate - today) / (1000 * 60 * 60 * 24));
  };

  const days = calculateDaysRemaining(deadline);
  
  if (deadline === 'Rolling' || days === null) {
    return (
      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Rolling deadline
      </span>
    );
  }

  const isExpired = days < 0;
  const isUrgent = days >= 0 && days <= 7;
  const isSoon = days > 7 && days <= 30;

  return (
    <div className="flex items-center gap-1">
      {isExpired && (
        <>
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-xs text-red-500 font-medium">Expired</span>
        </>
      )}
      {isUrgent && (
        <>
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-xs text-orange-500 font-medium">{days}d left</span>
        </>
      )}
      {isSoon && (
        <>
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-xs text-yellow-500 font-medium">{days}d left</span>
        </>
      )}
      {!isExpired && !isUrgent && !isSoon && (
        <>
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-green-500 font-medium">{days}d left</span>
        </>
      )}
    </div>
  );
};

export default GrantDeadlineIndicator;