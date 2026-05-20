import { Users, Database, ShieldAlert, CheckCircle, HelpCircle, RefreshCw } from "lucide-react";
import { SystemConfig } from "../types";

interface SidebarProps {
  config: SystemConfig | null;
  onRefreshConfig: () => void;
  isRefreshing: boolean;
}

export default function Sidebar({ config, onRefreshConfig, isRefreshing }: SidebarProps) {
  // Compute color state
  let dotColor = "bg-yellow-500 animate-pulse";
  let textColor = "text-yellow-600 dark:text-yellow-400";
  let statusLabel = "Memory (Demo)";
  let statusIcon = <HelpCircle className="w-4 h-4 text-yellow-500" />;

  if (config) {
    if (config.connected && config.mode === "database") {
      dotColor = "bg-emerald-500";
      textColor = "text-emerald-400 font-medium";
      statusLabel = "MongoDB Connected";
      statusIcon = <CheckCircle className="w-4 h-4 text-emerald-500" />;
    } else if (config.error || !config.connected) {
      dotColor = "bg-rose-500";
      textColor = "text-rose-400 font-semibold";
      statusLabel = "Connection Failed";
      statusIcon = <ShieldAlert className="w-4 h-4 text-rose-500" />;
    }
  }

  return (
    <aside id="sidebar-container" className="fixed top-0 left-0 bottom-0 w-64 bg-zinc-900 text-zinc-100 flex flex-col border-r border-zinc-800 shadow-xl z-30">
      {/* Brand & Identity */}
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-lg tracking-wider text-white shrink-0">
            C
          </div>
          <div>
            <h1 className="font-sans science-grade font-bold text-lg tracking-wide text-white">CARDNET</h1>
            <p className="text-[10px] font-mono tracking-widest text-zinc-500">vCARD MANAGER</p>
          </div>
        </div>
      </div>

      {/* Navigation Options */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest px-3 mb-2">
          Management
        </div>

        <button
          id="nav-contacts"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 text-sm font-medium transition-all"
        >
          <Users className="w-4 h-4" />
          <span>Contacts List</span>
        </button>
      </nav>

      {/* Database Connection Monitoring panel */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase flex items-center gap-1">
            <Database className="w-3 h-3" /> System Engine
          </span>
          <button
            onClick={onRefreshConfig}
            disabled={isRefreshing}
            className={`p-1 hover:bg-zinc-800 rounded-md transition-all text-zinc-500 hover:text-white ${isRefreshing ? "animate-spin text-zinc-400" : ""}`}
            title="Refresh database status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-3 bg-zinc-800/50 rounded-xl border border-white/5 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <span className={`w-3 h-3 rounded-full block ${dotColor}`} />
              <span className={`absolute inset-0 w-3 h-3 rounded-full block animate-ping opacity-75 ${dotColor}`} />
            </div>
            <span className={`text-xs ${textColor} font-mono truncate`}>{statusLabel}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono mt-1">
            <span>Store:</span>
            <span className="text-zinc-400 truncate max-w-[115px]" title={config?.dbName || "Unknown"}>
              {config?.dbName || "Connecting..."}
            </span>
          </div>

          {config?.error && (
            <div className="mt-1 text-[10px] text-rose-400 leading-tight bg-rose-500/10 p-1.5 rounded border border-rose-500/10 max-h-16 overflow-y-auto font-mono scrollbar-thin">
              {config.error}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
