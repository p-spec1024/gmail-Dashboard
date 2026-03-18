'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { EmailFeed } from '@/components/EmailFeed';
import { EmailData } from '@/components/EmailCard';
import { RefreshCw, Search, ShieldAlert } from 'lucide-react';

export default function Home() {
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/emails');
      if (!response.ok) {
        throw new Error(`Failed to fetch emails: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
         throw new Error(data.error);
      }

      const fetchedEmails: EmailData[] = data.emails || [];
      setEmails(fetchedEmails);

      // Extract unique parent categories
      const uniqueCategories = Array.from(
        new Set(fetchedEmails.map((email) => email.parentCategory))
      ).filter(Boolean).sort();

      setCategories(uniqueCategories);

    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const filteredEmails = selectedCategory
    ? emails.filter((email) => email.parentCategory === selectedCategory)
    : emails;

  return (
    <div className="flex h-screen w-full overflow-hidden text-slate-200">
      <Sidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-white/10 bg-white/5 backdrop-blur-md px-6 flex items-center justify-between z-10 shrink-0">
           <div className="relative w-96 hidden md:block">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-500" />
             </div>
             <input
               type="text"
               placeholder="Search smart inbox..."
               className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-white/5 text-slate-300 placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-indigo-500 transition-all sm:text-sm"
             />
           </div>

           <div className="flex items-center gap-4">
             <button
               onClick={fetchEmails}
               disabled={isLoading}
               className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
             >
               <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
               <span>Sync</span>
             </button>

             <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 border-2 border-slate-800 shadow-lg cursor-pointer" title="Profile" />
           </div>
        </header>

        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
            <ShieldAlert size={48} className="text-rose-400 mb-4" />
            <h2 className="text-2xl font-semibold text-rose-300 mb-2">Authentication Needed</h2>
            <p className="text-gray-400 max-w-md mb-6">
               {error}
            </p>
            <div className="bg-slate-900/50 border border-white/10 p-6 rounded-xl text-left font-mono text-sm text-gray-300 space-y-2">
               <p>1. Ensure <span className="text-yellow-400">credentials.json</span> is in the project root.</p>
               <p>2. Ensure <span className="text-yellow-400">token.json</span> is generated/present.</p>
               <p>3. Ensure <span className="text-yellow-400">GEMINI_API_KEY</span> is in <span className="text-yellow-400">.env.local</span>.</p>
            </div>
          </div>
        ) : (
          <EmailFeed
            emails={filteredEmails}
            isLoading={isLoading}
            selectedCategory={selectedCategory}
          />
        )}
      </main>
    </div>
  );
}
