import { format } from 'date-fns';

/**
 * Safely formats a date string to a readable format
 * @param {string} dateString - The date string to format
 * @param {string} formatString - The format string (default: 'MMM dd, yyyy')
 * @returns {string} - Formatted date or 'N/A' if invalid
 */
export const safeFormatDate = (dateString, formatString = 'MMM dd, yyyy') => {
  console.log('=== DATE UTILS DEBUG ===');
  console.log('Input dateString:', dateString, 'Type:', typeof dateString);
  
  if (!dateString) {
    console.log('No dateString provided, returning N/A');
    console.log('=== END DATE UTILS DEBUG ===');
    return 'N/A';
  }
  
  try {
    // If it's a simple date string (YYYY-MM-DD), format it directly
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      console.log('Date is in YYYY-MM-DD format, parsing as local date');
      const [year, month, day] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const result = format(date, formatString);
      console.log('Parsed date:', date);
      console.log('Formatted result:', result);
      console.log('=== END DATE UTILS DEBUG ===');
      return result;
    }
    
    // For other date formats, use the original approach
    console.log('Date is not in YYYY-MM-DD format, using Date constructor');
    const date = new Date(dateString);
    console.log('Created Date object:', date);
    if (isNaN(date.getTime())) {
      console.log('Invalid date, returning Invalid Date');
      console.log('=== END DATE UTILS DEBUG ===');
      return 'Invalid Date';
    }
    
    const result = format(date, formatString);
    console.log('Formatted result:', result);
    console.log('=== END DATE UTILS DEBUG ===');
    return result;
  } catch (error) {
    console.error('Error formatting date:', error, 'Date string:', dateString);
    console.log('=== END DATE UTILS DEBUG ===');
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