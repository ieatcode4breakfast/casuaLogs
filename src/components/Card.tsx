import React from 'react';

export interface CardProps {
  title: string;
  onClick: () => void;
  color?: 'blue' | 'green';
  createdAt?: string;
  updatedAt?: string;
  leftFooterNode?: React.ReactNode;
}

export function Card({ title, onClick, color = 'blue', createdAt, updatedAt, leftFooterNode }: CardProps) {
  const hoverColorClass = color === 'green' 
    ? 'group-hover:text-green-600 dark:group-hover:text-green-400' 
    : 'group-hover:text-blue-600 dark:group-hover:text-blue-400';

  return (
    <div 
      onClick={onClick}
      className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer group h-full"
    >
      <h3 className={`text-lg font-bold text-slate-900 dark:text-white transition-colors line-clamp-2 break-words ${hoverColorClass} ${(createdAt || updatedAt || leftFooterNode) ? 'mb-2' : ''}`}>
        {title}
      </h3>
      {(createdAt || updatedAt || leftFooterNode) && (
        <div className={`mt-auto flex items-end ${leftFooterNode ? 'justify-between' : 'justify-end'}`}>
          {leftFooterNode && <span className="text-sm text-slate-500 dark:text-slate-400">{leftFooterNode}</span>}
          <div className="flex flex-col items-end gap-0.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
            {createdAt && <span>Created: {new Date(createdAt).toLocaleDateString()}</span>}
            {updatedAt && <span>Last Modified: {new Date(updatedAt).toLocaleDateString()}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
