import { useState, useEffect } from "react";
import { Plus, Search, HelpCircle, ShieldAlert, RotateCw, FileVideo, Cpu, Users } from "lucide-react";
import { Contact, SystemConfig } from "../types";
import Sidebar from "./Sidebar";
import ContactCard from "./ContactCard";
import ContactModal from "./ContactModal";

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Configuration Status State
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [refreshingConfig, setRefreshingConfig] = useState(false);

  // Modal Control States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all credentials plus config status
  const loadConfig = async (forceRetry = false) => {
    try {
      setRefreshingConfig(true);
      const url = forceRetry ? "/api/config?retry=true" : "/api/config";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSystemConfig(data);
      }
    } catch (err) {
      console.error("Failed to load schema status from server:", err);
    } finally {
      setRefreshingConfig(false);
    }
  };

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/contacts");
      if (!res.ok) {
        let errMsg = "Local vCard server is unresponsive or database offline.";
        try {
          const errData = await res.json();
          if (errData && errData.error) {
            errMsg = `Server error [${res.status}]: ${errData.error}.${errData.details ? ` Details: ${errData.details}` : ''}`;
          } else {
            errMsg = `Server error [${res.status}]: No error details provided.`;
          }
        } catch (jsonErr) {
          const errText = await res.text().catch(() => 'No text body');
          errMsg = `Server error [${res.status} ${res.statusText}]: Response is not JSON. Body snippet: ${errText.slice(0, 150)}`;
        }
        throw new Error(errMsg);
      }
      const data = await res.json();
      setContacts(data);
    } catch (err: any) {
      setError(err.message || "Unable to retrieve contacts registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
    loadContacts();
  }, []);

  const handleRefreshAll = async () => {
    await loadConfig(true);
    await loadContacts();
  };

  const handleCreateNew = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this business card? This operation is persistent.")) return;
    
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Fail operation. Check backend logs.");
      }
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete card.");
    }
  };

  const handleSaveContact = async (id: string | null, data: any) => {
    setIsSaving(true);
    try {
      const url = id ? `/api/contacts/${id}` : "/api/contacts";
      const method = id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to commit changes.");
      }

      const savedDoc = await res.json();
      if (id) {
        setContacts(prev => prev.map(c => c.id === id ? savedDoc : c));
      } else {
        setContacts(prev => [savedDoc, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(`Error committing contact card details: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter contacts locally based on names, titles, organizations
  const filteredContacts = contacts.filter(contact => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      contact.firstName.toLowerCase().includes(q) ||
      contact.lastName.toLowerCase().includes(q) ||
      contact.title.toLowerCase().includes(q) ||
      contact.organization.toLowerCase().includes(q)
    );
  });

  return (
    <div id="dashboard-wrapper" className="min-h-screen bg-transparent flex">
      {/* Fixed Sidebar component on Left */}
      <Sidebar
        config={systemConfig}
        onRefreshConfig={loadConfig}
        isRefreshing={refreshingConfig}
      />

      {/* Main Container Right column */}
      <div id="main-content-layout" className="flex-1 pl-64 min-w-0 pr-6 pb-12">
        {/* Dynamic Navigation Header banner */}
        <header className="h-20 bg-white/85 backdrop-blur-md border-b border-zinc-200/80 flex items-center justify-between px-8 shrink-0 rounded-b-2xl shadow-sm relative z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Contact Directory</h1>
            <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-200/50 text-zinc-500 text-[10px] font-bold rounded uppercase tracking-wider">
              {contacts.length} cards
            </span>
          </div>
          
          <button
            onClick={handleCreateNew}
            id="add-contact-btn"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-indigo-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Card</span>
          </button>
        </header>

        {/* Search and Metadata counter actions */}
        <section className="mt-8 px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Filter by name, agency, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 bg-white/70 backdrop-blur-xs border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all font-sans text-zinc-800"
            />
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
            <span className="bg-white/50 backdrop-blur-xs border border-zinc-200/60 px-2.5 py-1 rounded-md text-zinc-600">
              Filtered: <b>{filteredContacts.length}</b> / {contacts.length} cards
            </span>
            
            {systemConfig && (
              <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wide ${systemConfig.mode === "database" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-yellow-50 text-yellow-700 border border-yellow-105"}`}>
                {systemConfig.mode === "database" ? "Vault Storage" : "Demo Cache Active"}
              </span>
            )}
          </div>
        </section>

        {/* Main interactive grid content body */}
        <section className="mt-6 px-8">
          
          {/* Critical Error Alert with Retry button */}
          {error && (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-4 shadow-xs" id="error-fallback-panel">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-rose-800">Connection Interrupted</h4>
                <p className="text-xs text-rose-600 mt-1 mr-4 leading-relaxed">
                  {error}. The local Node/Express database engine might be booting or MONGODB_URI credentials failed to negotiate handshake.
                </p>
                <button
                  onClick={handleRefreshAll}
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-mono leading-none rounded-lg font-semibold tracking-wide transition-all uppercase"
                >
                  <RotateCw className="w-3 h-3" /> Retry Server Link
                </button>
              </div>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-5 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-zinc-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-zinc-200 rounded-md w-32" />
                      <div className="h-3 bg-zinc-100 rounded-md w-24" />
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-zinc-100 pt-4">
                    <div className="h-3 bg-zinc-100 rounded-md w-full" />
                    <div className="h-3 bg-zinc-100 rounded-md w-2/3" />
                  </div>
                  <div className="h-8 bg-zinc-100 rounded-md w-full mt-4" />
                </div>
              ))}
            </div>
          )}

          {/* Empty Registry State placeholder */}
          {!loading && !error && filteredContacts.length === 0 && (
            <div className="text-center bg-white rounded-2xl border border-zinc-200 py-16 px-4 max-w-lg mx-auto mt-6 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center mx-auto mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">No Enterprise Contacts Found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-2 leading-relaxed">
                {searchQuery ? "Your active search query yielded zero card matches. Try tweaking your query labels." : "There are currently no matching digital cards inside CARDNET. Establish your very first vCard now!"}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleCreateNew}
                  className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Emit First Card
                </button>
              )}
            </div>
          )}

          {/* Active Contacts Grid layout */}
          {!loading && !error && filteredContacts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}

        </section>
      </div>

      {/* Editor & Creator Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contact={editingContact}
        onSave={handleSaveContact}
        isSaving={isSaving}
      />
    </div>
  );
}
