import { format } from 'date-fns';

/**
 * Safely formats a date string to a readable format
 * @param {string} dateString - The date string to format
 * @param {string} formatString - The format string (default: 'MMM dd, yyyy')
 * @returns {string} - Formatted date or 'N/A' if invalid
 */
export const safeFormatDate = (dateString, formatString = 'MMM dd, yyyy') => {
  if (!dateString) return 'N/A';
  
  try {
    // Handle different date formats
    let date;
    if (typeof dateString === 'string') {
      // If it's just a date (YYYY-MM-DD), add time component
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        date = new Date(dateString + 'T00:00:00');
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error, 'Date string:', dateString);
    return 'Invalid Date';
  }
};

/**
 * Safely formats a date string to include time
 * @param {string} dateString - The date string to format
 * @param {string} formatString - The format string (default: 'MMM dd, yyyy HH:mm')
 * @returns {string} - Formatted date with time or 'N/A' if invalid
 */
export const safeFormatDateTime = (dateString, formatString = 'MMM dd, yyyy HH:mm') => {
  return safeFormatDate(dateString, formatString);
};

/**
 * Safely converts a date string to ISO date format (YYYY-MM-DD)
 * @param {string} dateString - The date string to convert
 * @returns {string} - ISO date string or empty string if invalid
 */
export const safeToISODate = (dateString) => {
  if (!dateString) return '';
  
  try {
    let date;
    if (typeof dateString === 'string') {
      // If it's just a date (YYYY-MM-DD), return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      date = new Date(dateString);
    } else {
      date = new Date(dateString);
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error converting date to ISO:', error, 'Date string:', dateString);
    return '';
  }
}; 