// timeLabels.js - Updated with month-year format for MONTH timeframe
import { format, subDays, subMonths, subWeeks } from 'date-fns';

// Timeframe constants
export const TIMEFRAMES = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year'
};

/**
 * Get appropriate labels for a given timeframe
 * @param {string} timeframe - One of the TIMEFRAMES values
 * @returns {Array} - Array of labels for the selected timeframe
 */
export const getLabels = (timeframe) => {
  const today = new Date();
  
  switch(timeframe) {
    case TIMEFRAMES.TODAY:
      // For today we'll use hourly labels
      return ['6am', '9am', '12pm', '3pm', '6pm', '9pm'];
      
    case TIMEFRAMES.WEEK:
      // Last 7 days with short day names
      return Array.from({ length: 7 }, (_, i) => {
        const date = subDays(today, 6 - i);
        return format(date, 'EEE'); // Mon, Tue, Wed, etc.
      });
      
    case TIMEFRAMES.MONTH:
      // Weekly intervals with dates (e.g., "Feb 23")
      return Array.from({ length: 5 }, (_, i) => {
        const date = subWeeks(today, 4 - i);
        return format(date, 'MMM dd'); // Feb 23, Mar 01, etc.
      });
      
    case TIMEFRAMES.YEAR:
      // Month abbreviations with year in format 'Jan 25', 'Apr 25', etc.
      // Keep only Jan, Apr, Jul, Oct with year, replace others with empty string
      return ['Jan', '', '', 'Apr', '', '', 'Jul', '', '', 'Oct', '', ''];
              
    default:
      return [];
  }
};

/**
 * Get number of data points needed for a given timeframe
 * @param {string} timeframe - One of the TIMEFRAMES values
 * @returns {number} - Number of data points for the timeframe
 */
export const getDataPointCount = (timeframe) => {
  switch(timeframe) {
    case TIMEFRAMES.TODAY:
      return 6; // Hourly readings
    case TIMEFRAMES.WEEK:
      return 7; // Daily readings
    case TIMEFRAMES.MONTH:
      return 5; // Weekly readings
    case TIMEFRAMES.YEAR:
      return 12; // Monthly readings
    default:
      return 7;
  }
};

/**
 * Determines if a graph should be shown for the selected timeframe
 * @param {string} timeframe - One of the TIMEFRAMES values
 * @returns {boolean} - Whether to show graphs
 */
export const shouldShowGraph = (timeframe) => {
  // All timeframes can show graphs in this simplified version
  return true;
};

export default {
  TIMEFRAMES,
  getLabels,
  getDataPointCount,
  shouldShowGraph
};