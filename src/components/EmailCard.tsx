import React from 'react';

export interface EmailData {
  id: string;
  sender: string;
  subject: string;
  date: string;
  snippet: string;
  parentCategory: string;
  subCategory: string;
  summary: string;
}

interface EmailCardProps {
  email: EmailData;
}

export function EmailCard({ email }: EmailCardProps) {
  // Simple helper to assign colors based on category hash
  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'bg-rose-500/20 text-rose-300 border-rose-500/30',
      'bg-amber-500/20 text-amber-300 border-amber-500/30',
    ];
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const categoryStyle = getCategoryColor(email.parentCategory);

  // Extract clean sender name if formatted like "Name <email@domain.com>"
  const senderName = email.sender.includes('<')
    ? email.sender.split('<')[0].trim().replace(/['"]/g, '')
    : email.sender;

  // Format date if it exists
  const displayDate = email.date
    ? new Date(email.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '';

  return (
    <div className="group backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 ease-out cursor-pointer relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center font-bold text-sm shadow-inner">
            {senderName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-medium text-white/90 leading-tight">{senderName}</h3>
            <p className="text-xs text-gray-400">{displayDate}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${categoryStyle}`}>
          {email.parentCategory} • {email.subCategory}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-lg font-semibold text-white/95 mb-1 line-clamp-1">{email.subject}</h4>
        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
          {email.snippet}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="bg-white/5 rounded-xl p-3 border border-white/5 relative">
           <div className="absolute -top-2 left-4 px-2 bg-slate-900 text-[10px] font-bold tracking-wider text-indigo-400 uppercase rounded">
             AI Summary
           </div>
           <p className="text-sm text-indigo-200/90 italic leading-snug">
             &ldquo;{email.summary}&rdquo;
           </p>
        </div>
      </div>
    </div>
  );
}
