import React from 'react';
import { EmailCard, EmailData } from './EmailCard';
import { Loader2 } from 'lucide-react';

interface EmailFeedProps {
  emails: EmailData[];
  isLoading: boolean;
  selectedCategory: string | null;
}

export function EmailFeed({ emails, isLoading, selectedCategory }: EmailFeedProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
        <p className="text-gray-400 font-medium tracking-wide">Fetching & Analyzing Inbox...</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
          <span className="text-4xl">📭</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Inbox Zero</h2>
        <p className="text-gray-400 max-w-sm text-center">
          You have no unread emails. Great job keeping up!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 hide-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            {selectedCategory ? `${selectedCategory} Messages` : 'Recent Unread'}
          </h1>
          <p className="text-gray-400 font-medium">
            Displaying {emails.length} smartly categorized email{emails.length !== 1 ? 's' : ''}.
          </p>
        </div>

        <div className="grid gap-6">
          {emails.map((email) => (
            <EmailCard key={email.id} email={email} />
          ))}
        </div>
      </div>
    </div>
  );
}
