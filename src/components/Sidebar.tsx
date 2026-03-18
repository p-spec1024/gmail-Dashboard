import React, { useState } from 'react';
import { Folder, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

interface SidebarProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function Sidebar({ categories, selectedCategory, onSelectCategory }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`h-screen border-r border-white/10 bg-white/5 backdrop-blur-lg flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        {!isCollapsed && <span className="font-semibold text-lg tracking-tight">Smart Inbox</span>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-2">
          <button
            onClick={() => onSelectCategory(null)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              selectedCategory === null ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
            title="All Emails"
          >
            <Inbox size={20} className={selectedCategory === null ? 'text-blue-400' : 'text-gray-400'} />
            {!isCollapsed && <span>All Emails</span>}
          </button>
        </div>

        {!isCollapsed && (
           <div className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
             Categories
           </div>
        )}

        <div className="px-3 space-y-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === category ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-gray-300'
              }`}
              title={category}
            >
              <Folder size={20} className={selectedCategory === category ? 'text-blue-400' : 'text-gray-500'} />
              {!isCollapsed && <span className="truncate text-left">{category}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
