"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  Package,
  Clock,
  DollarSign,
  Calendar,
  AlertTriangle,
  FileText,
  Bot,
  CheckCircle2,
  Circle,
  Activity,
  LogOut,
  RefreshCw,
  Search,
  LogIn,
  ShieldAlert,
  ChevronRight,
  Menu
} from 'lucide-react';

// --- Type Definitions ---
export interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  priority?: "low" | "medium" | "high" | "critical";
  category: "logistics" | "invoices" | "trading" | "newsletter" | "other";
  receivedAt: string;
  processed: boolean;
  summary?: string;
  extractedData?: { label: string; value: string; icon: string }[];
  actionItems?: { id: string; text: string; completed: boolean }[];
  bodyText?: string;
  snippet?: string;
}

// --- Icons Helper ---
const renderIcon = (iconName: string, className?: string) => {
  switch (iconName) {
    case 'package': return <Package className={className} />;
    case 'clock': return <Clock className={className} />;
    case 'dollar': return <DollarSign className={className} />;
    case 'calendar': return <Calendar className={className} />;
    default: return <FileText className={className} />;
  }
};

// --- Sub-Components ---

function CommandHeader({
  emailCount,
  onEmailCountChange,
  onRefresh,
  isLoading,
  session
}: {
  emailCount: number,
  onEmailCountChange: (val: number) => void,
  onRefresh: () => void,
  isLoading: boolean,
  session: any
}) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-6 gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Activity className="h-4 w-4 text-indigo-400" />
          </div>
          <span className="font-semibold text-lg text-slate-200 tracking-tight hidden sm:block">Command Center</span>
        </div>

        <div className="flex-1 flex items-center justify-center max-w-xl mx-auto">
          <div className="flex items-center gap-4 w-full px-4 py-2 bg-slate-800/50 rounded-full border border-white/5">
            <span className="text-sm font-medium text-slate-400 whitespace-nowrap">Fetch Limit</span>
            <input
              type="range"
              min="0"
              max="50"
              value={emailCount}
              onChange={(e) => onEmailCountChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-sm font-bold text-indigo-400 w-8 text-right">{emailCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <div className="h-6 w-px bg-white/10 mx-1"></div>
          {session?.user?.image ? (
            <img src={session.user.image} alt="Profile" className="h-8 w-8 rounded-full border border-white/10" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 border border-white/20" />
          )}
          <button
            onClick={() => signOut()}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-full transition-colors hidden sm:block"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

function MorningBriefing({ urgentLogistics, pendingInvoices, tradingAlerts }: any) {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-800/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
      <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-indigo-400" />
        Morning Briefing
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-white/5">
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
            <Package size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">{urgentLogistics}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Urgent Logistics</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-white/5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">{pendingInvoices}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Pending Invoices</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-white/5">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">{tradingAlerts}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Trading Alerts</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsPanel({ categories, processedCount, totalCount }: any) {
  const percent = totalCount === 0 ? 0 : Math.round((processedCount / totalCount) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1 rounded-2xl border border-white/5 bg-slate-800/40 p-5 flex flex-col justify-center items-center">
         <div className="text-3xl font-light text-slate-100 mb-1">{percent}%</div>
         <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Processed</div>
         <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
         </div>
      </div>
      <div className="md:col-span-3 rounded-2xl border border-white/5 bg-slate-800/40 p-5 flex items-center justify-around">
        {Object.entries(categories).map(([cat, count]: [string, any]) => (
          <div key={cat} className="text-center">
            <div className="text-2xl font-semibold text-slate-200">{count}</div>
            <div className="text-xs text-slate-500 capitalize">{cat}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmailSlab({
  email,
  onProcess,
  onToggleAction,
  isProcessing
}: {
  email: Email,
  onProcess: (id: string, bodyText: string) => void,
  onToggleAction: (emailId: string, actionId: string) => void,
  isProcessing: boolean
}) {
  const categoryColors = {
    logistics: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    invoices: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    trading: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    newsletter: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    other: "bg-slate-500/10 text-slate-400 border-slate-500/20"
  };

  const priorityColors = {
    critical: "text-rose-400 bg-rose-400/10",
    high: "text-orange-400 bg-orange-400/10",
    medium: "text-yellow-400 bg-yellow-400/10",
    low: "text-slate-400 bg-slate-400/10"
  };

  return (
    <div className={`rounded-2xl border transition-all duration-300 ${
      email.processed
        ? "border-white/5 bg-slate-800/20"
        : "border-indigo-500/30 bg-slate-800/60 shadow-lg shadow-indigo-500/5 hover:border-indigo-500/50 hover:-translate-y-1"
    }`}>
      <div className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-3 gap-2">
          <div className="flex gap-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-md font-medium border capitalize ${categoryColors[email.category] || categoryColors.other}`}>
              {email.category}
            </span>
            {email.priority && (
              <span className={`text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wider flex items-center gap-1 ${priorityColors[email.priority]}`}>
                 {email.priority === 'critical' && <AlertTriangle size={12} />}
                 {email.priority}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500 whitespace-nowrap">{email.receivedAt}</span>
        </div>

        <h3 className="font-semibold text-slate-200 leading-snug mb-1 line-clamp-2" title={email.subject}>
          {email.subject}
        </h3>
        <p className="text-sm text-slate-400 mb-4 truncate">{email.sender}</p>

        {email.processed ? (
          <div className="mt-auto space-y-4 animate-in fade-in duration-500">
            <div className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-white/5">
              {email.summary}
            </div>

            {email.extractedData && email.extractedData.length > 0 && (
              <div className="flex gap-2">
                {email.extractedData.map((data, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1.5 rounded-lg border border-white/5 flex-1 justify-center">
                    {renderIcon(data.icon, "h-3.5 w-3.5 text-indigo-400")}
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">{data.label}</span>
                      <span className="text-xs font-semibold text-slate-200">{data.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {email.actionItems && email.actionItems.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Action Items</div>
                {email.actionItems.map(action => (
                  <button
                    key={action.id}
                    onClick={() => onToggleAction(email.id, action.id)}
                    className="flex items-start gap-2 text-left w-full group"
                  >
                    {action.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 mt-0.5 shrink-0 transition-colors" />
                    )}
                    <span className={`text-sm ${action.completed ? "text-slate-500 line-through" : "text-slate-300 group-hover:text-slate-200"}`}>
                      {action.text}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-auto pt-4">
            <p className="text-sm text-slate-500 mb-4 line-clamp-3 italic">
               "{email.snippet}"
            </p>
            <button
              onClick={() => onProcess(email.id, email.bodyText || email.snippet || email.subject)}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl transition-all disabled:opacity-50 text-sm font-medium"
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Bot size={18} />
                  <span>Process with Vertex Agent</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Page Component ---
export default function InboxDashboard() {
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState<Email[]>([]);
  const [emailCount, setEmailCount] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const fetchEmails = useCallback(async () => {
    if (status !== 'authenticated' || emailCount === 0) {
      if (emailCount === 0) setEmails([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/emails?limit=${emailCount}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();

      const formattedEmails: Email[] = data.emails.map((e: any) => ({
        id: e.id,
        sender: e.sender.split('<')[0].trim(),
        senderEmail: e.sender.includes('<') ? e.sender.match(/<([^>]+)>/)[1] : e.sender,
        subject: e.subject,
        priority: undefined,
        category: "other", // Default before processing
        receivedAt: e.date ? new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Unknown",
        processed: false,
        bodyText: e.bodyText,
        snippet: e.snippet
      }));

      setEmails(formattedEmails);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [status, emailCount]);

  useEffect(() => {
    // Only auto-fetch when session is ready.
    // We also debounce fetch based on slider.
    const timer = setTimeout(() => {
       fetchEmails();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchEmails]);

  // Handle unauthenticated state
  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-slate-950 text-slate-200">
        <div className="max-w-md w-full p-8 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <div className="mx-auto w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/30 rotate-3">
             <Bot className="w-8 h-8 text-indigo-400 -rotate-3" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Smart Inbox</h1>
          <p className="text-slate-400 pb-4 text-sm leading-relaxed">
             Sign in with your Google account to let Vertex AI categorize and summarize your emails.
          </p>
          <button
            onClick={() => signIn('google')}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] active:scale-[0.98]"
          >
             <LogIn size={20} />
             <span>Sign In with Google</span>
          </button>
        </div>
      </div>
    );
  }

  // Derived state for Analytics
  const processedCount = emails.filter((e) => e.processed).length;
  const categories = { logistics: 0, invoices: 0, trading: 0, newsletter: 0, other: 0 };
  emails.forEach((email) => {
    if (categories.hasOwnProperty(email.category)) {
       (categories as any)[email.category]++;
    } else {
       categories.other++;
    }
  });

  let urgentLogistics = 0;
  let pendingInvoices = 0;
  let tradingAlerts = 0;
  emails.forEach((email) => {
    if (!email.processed) {
      if (email.category === "logistics" && (email.priority === "critical" || email.priority === "high")) urgentLogistics++;
      if (email.category === "invoices") pendingInvoices++;
      if (email.category === "trading") tradingAlerts++;
    }
  });

  const handleProcess = async (id: string, bodyText: string) => {
    setProcessingIds(prev => new Set(prev).add(id));

    try {
      const response = await fetch('/api/process-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailBody: bodyText })
      });

      if (!response.ok) throw new Error('Failed to process email');

      const aiData = await response.json();

      setEmails((prev) =>
        prev.map((email) => {
          if (email.id === id) {
            return {
              ...email,
              processed: true,
              summary: aiData.summary,
              category: aiData.category || "other",
              priority: aiData.priority || "medium",
              actionItems: aiData.suggestedAction && aiData.suggestedAction !== "No action needed"
                ? [{ id: `${id}-a1`, text: aiData.suggestedAction, completed: false }]
                : []
            };
          }
          return email;
        })
      );
    } catch (error) {
      console.error("Processing failed", error);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleToggleAction = (emailId: string, actionId: string) => {
    setEmails((prev) =>
      prev.map((email) => {
        if (email.id === emailId && email.actionItems) {
          return {
            ...email,
            actionItems: email.actionItems.map((action) =>
              action.id === actionId
                ? { ...action, completed: !action.completed }
                : action
            ),
          };
        }
        return email;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <CommandHeader
        emailCount={emailCount}
        onEmailCountChange={setEmailCount}
        onRefresh={fetchEmails}
        isLoading={isLoading}
        session={session}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="space-y-8">
          {/* Dashboard Header Blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-1">
                <MorningBriefing
                  urgentLogistics={urgentLogistics}
                  pendingInvoices={pendingInvoices}
                  tradingAlerts={tradingAlerts}
                />
             </div>
             <div className="lg:col-span-2">
                <AnalyticsPanel
                  categories={categories}
                  processedCount={processedCount}
                  totalCount={emails.length}
                />
             </div>
          </div>

          {/* Email Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                 <Package className="h-5 w-5 text-slate-400" />
                 Inbox Queue
               </h2>
               <span className="text-sm text-slate-500">{emails.length} items fetched</span>
            </div>

            {emailCount === 0 || emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-24 text-center bg-slate-900/20">
                {isLoading ? (
                  <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mb-4" />
                ) : (
                  <>
                    <div className="mb-4 text-6xl font-light text-slate-700">0</div>
                    <p className="text-sm text-slate-500 max-w-xs">
                      {emailCount === 0 ? "Drag the fetch limit slider to load emails from your inbox." : "No unread emails found."}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {emails.map((email) => (
                  <EmailSlab
                    key={email.id}
                    email={email}
                    onProcess={handleProcess}
                    onToggleAction={handleToggleAction}
                    isProcessing={processingIds.has(email.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
