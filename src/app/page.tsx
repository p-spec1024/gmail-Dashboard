'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Sidebar } from '@/components/Sidebar';
import { EmailFeed } from '@/components/EmailFeed';
import { EmailData } from '@/components/EmailCard';
import { RefreshCw, Search, ShieldAlert, LogIn, LogOut } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmails = useCallback(async () => {
    if (status !== 'authenticated') return;

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
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchEmails();
    }
  }, [status, fetchEmails]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-slate-900 text-slate-200">
        <div className="max-w-md w-full p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-center space-y-6 shadow-2xl">
          <div className="mx-auto w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
             <ShieldAlert className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Smart Inbox</h1>
          <p className="text-gray-400 pb-4">
             Sign in with your Google account to let AI categorize and summarize your unread emails securely.
          </p>
          <button
            onClick={() => signIn('google')}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/30"
          >
             <LogIn size={20} />
             <span>Sign In with Google</span>
          </button>
        </div>
      </div>
    );
  }

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

             <div className="flex items-center gap-3 border-l border-white/10 pl-4 ml-2">
               {session?.user?.image ? (
                 <img src={session.user.image} alt="Profile" className="h-8 w-8 rounded-full border border-white/20" />
               ) : (
                 <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 border border-white/20 shadow-lg" />
               )}
               <button
                 onClick={() => signOut()}
                 className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                 title="Sign Out"
               >
                 <LogOut size={18} />
               </button>
             </div>
           </div>
        </header>

        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
            <ShieldAlert size={48} className="text-rose-400 mb-4" />
            <h2 className="text-2xl font-semibold text-rose-300 mb-2">Error Fetching Inbox</h2>
            <p className="text-gray-400 max-w-md mb-6">
               {error}
            </p>
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
