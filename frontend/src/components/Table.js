import React from 'react';
import { clsx } from 'clsx';

export const Table = ({ children, className = '' }) => (
  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
    <table className={clsx('min-w-full divide-y divide-gray-300', className)}>
      {children}
    </table>
  </div>
);

export const TableHead = ({ children, className = '' }) => (
  <thead className={clsx('bg-gray-50', className)}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '' }) => (
  <tbody className={clsx('divide-y divide-gray-200 bg-white', className)}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '', hover = true }) => (
  <tr className={clsx(hover && 'hover:bg-gray-50', className)}>
    {children}
  </tr>
);

export const TableCell = ({ 
  children, 
  className = '', 
  isHeader = false,
  align = 'left' 
}) => {
  const Tag = isHeader ? 'th' : 'td';
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  
  const baseClasses = isHeader 
    ? 'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider'
    : 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
    
  return (
    <Tag className={clsx(baseClasses, alignClasses[align], className)}>
      {children}
    </Tag>
  );
};

export const TableContainer = ({ children, className = '' }) => (
  <div className={clsx('flex flex-col', className)}>
    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  </div>
); 