import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Linkedin,
  Twitter,
  Github,
  Globe,
  Share2,
  UserPlus,
  QrCode,
  ArrowLeft,
  X,
  Sparkles,
  ClipboardCheck
} from "lucide-react";
import { Contact } from "../types";

export default function PublicCard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showQr, setShowQr] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchContact = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/contacts/${id}`);
        if (!res.ok) {
          if (res.status === 400) {
            throw new Error("Invalid business card link identifier.");
          }
          if (res.status === 404) {
            throw new Error("This digital business card does not exist or was deleted.");
          }
          throw new Error("Unable to retrieve digital business card details.");
        }
        const data = await res.json();
        setContact(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "An unexpected connection error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  const getInitials = (first: string, last: string) => {
    const f = first ? first[0].toUpperCase() : "";
    const l = last ? last[0].toUpperCase() : "";
    return f + l || "?";
  };

  const cleanUrl = (url: string | undefined) => {
    if (!url) return "";
    const trimmed = url.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    return `https://${trimmed}`;
  };

  const handleSms = () => {
    if (!contact?.phone) return;
    window.location.href = `sms:${contact.phone}`;
  };

  const handleCall = () => {
    if (!contact?.phone) return;
    window.location.href = `tel:${contact.phone}`;
  };

  const handleMail = () => {
    if (!contact?.email) return;
    window.location.href = `mailto:${contact.email}`;
  };

  const handleNavigation = () => {
    if (!contact?.address) return;
    window.location.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`;
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = contact ? `${contact.firstName} ${contact.lastName}'s Digital Card` : "CARDNET vCard";

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Connect with ${contact?.firstName} on CARDNET. Download standard vCard metadata.`,
          url: shareUrl
        });
      } catch (err) {
        // user aborted or sharing failed, fallback
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getRawBase64 = (dataUrl: string) => {
    const match = dataUrl.match(/^data:image\/[a-zA-Z]+;base64,(.+)$/);
    return match ? match[1] : "";
  };

  // Compile on-the-fly downloadable standard .vcf Card File for Contacts Import
  const handleDownloadVcard = () => {
    if (!contact) return;

    let vcfLines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${contact.lastName};${contact.firstName};;;`,
      `FN:${contact.firstName} ${contact.lastName}`,
    ];

    if (contact.organization) vcfLines.push(`ORG:${contact.organization}`);
    if (contact.title) vcfLines.push(`TITLE:${contact.title}`);
    if (contact.phone) vcfLines.push(`TEL;TYPE=cell,voice:${contact.phone}`);
    if (contact.email) vcfLines.push(`EMAIL;TYPE=internet,pref:${contact.email}`);
    if (contact.website) vcfLines.push(`URL:${cleanUrl(contact.website)}`);
    if (contact.address) vcfLines.push(`ADR;TYPE=WORK:;;${contact.address};;;;`);

    // Clean social urls to extract pure screen handle or full links
    if (contact.socials.linkedin) {
      vcfLines.push(`X-SOCIALPROFILE;TYPE=linkedin:${cleanUrl(contact.socials.linkedin)}`);
    }
    if (contact.socials.twitter) {
      vcfLines.push(`X-SOCIALPROFILE;TYPE=twitter:${cleanUrl(contact.socials.twitter)}`);
    }
    if (contact.socials.github) {
      vcfLines.push(`X-SOCIALPROFILE;TYPE=github:${cleanUrl(contact.socials.github)}`);
    }

    if (contact.avatar) {
      const rawBase64 = getRawBase64(contact.avatar);
      if (rawBase64) {
        vcfLines.push(`PHOTO;TYPE=JPEG;ENCODING=b:${rawBase64}`);
      }
    }

    vcfLines.push("END:VCARD");

    const vcfBlob = new Blob([vcfLines.join("\n")], { type: "text/vcard;charset=utf-8" });
    const blobUrl = window.URL.createObjectURL(vcfBlob);
    
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = blobUrl;
    downloadAnchor.setAttribute("download", `${contact.firstName}_${contact.lastName}.vcf`);
    downloadAnchor.click();
    window.URL.revokeObjectURL(blobUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-500 text-sm font-mono tracking-widest uppercase">Syncing Virtual Identity</p>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col items-center justify-center p-6 font-sans text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-5">
          <ArrowLeft className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-zinc-100">Access Restricted</h3>
        <p className="text-sm text-zinc-500 max-w-sm mt-2 leading-relaxed">
          {error || "We could not find the requested digital business card."}
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-mono font-medium tracking-wide text-zinc-300 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to CARDNET Portal</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-between font-sans relative overflow-hidden selection:bg-indigo-600/30">
      
      {/* Decorative ambient visual mesh fields */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[400px] bg-indigo-900/15 rounded-b-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-64 h-64 bg-zinc-900/40 rounded-full blur-3xl pointer-events-none" />

      {/* Admin Quick Back Action */}
      <div className="w-full max-w-md px-6 pt-5 flex items-center justify-between relative z-10">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-850 text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setShowQr(!showQr)}
          className={`p-2 rounded-xl bg-zinc-900/80 border border-zinc-850 text-zinc-400 hover:text-white transition-all`}
          title="Toggle QR Code"
        >
          <QrCode className="w-4 h-4" />
        </button>
      </div>

      {/* Main card focus scroll wrapper */}
      <main className="w-full max-w-md px-6 py-6 flex-1 flex flex-col justify-start relative z-10">
        
        {/* QR Code Expansion Card Option */}
        {showQr && (
          <div className="mb-6 p-6 bg-zinc-900/95 border border-zinc-800 rounded-3xl text-center relative animate-fadeIn">
            <button
              onClick={() => setShowQr(false)}
              className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="text-zinc-200 font-bold text-sm tracking-wide flex items-center justify-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Card Scan Code
            </h4>
            <p className="text-[10px] text-zinc-500 font-mono mb-4 leading-normal">
              Other people can scan this to launch your profile page instantly.
            </p>
            <div className="bg-white p-4 inline-block rounded-2xl shadow-xl">
              <QRCodeSVG
                value={window.location.href}
                size={180}
                bgColor="#FFFFFF"
                fgColor="#09090b"
                level="Q"
                includeMargin={false}
              />
            </div>
            <div className="text-[9px] font-mono text-zinc-400 mt-3 truncate">{window.location.href}</div>
          </div>
        )}

        {/* Profile Details Top Card */}
        <div className="text-center mt-6">
          <div className="inline-block relative">
            {contact.avatar ? (
              <img
                src={contact.avatar}
                alt={`${contact.firstName} ${contact.lastName}`}
                className="w-28 h-28 rounded-full pointer-events-none object-cover mx-auto ring-4 ring-zinc-800 border-2 border-zinc-950 shadow-2xl bg-zinc-900"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center mx-auto ring-4 ring-zinc-800 font-bold text-4xl text-indigo-400 shadow-2xl">
                {getInitials(contact.firstName, contact.lastName)}
              </div>
            )}
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-zinc-950 rounded-full" title="Active NFC Virtual Signal" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white mt-5">
            {contact.firstName} {contact.lastName}
          </h2>
          
          {contact.title && (
            <p className="text-indigo-400 font-medium text-sm mt-1">{contact.title}</p>
          )}
          
          {contact.organization && (
            <p className="text-zinc-500 font-mono text-xs tracking-wider uppercase mt-1">{contact.organization}</p>
          )}

          {contact.address && (
            <p className="text-zinc-400 text-xs mt-3 flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-600" />
              <span>{contact.address}</span>
            </p>
          )}
        </div>

        {/* 4 Quick Action Circular Utilities */}
        <div className="grid grid-cols-4 gap-4 mt-8 px-2">
          {contact.phone ? (
            <>
              <button
                onClick={handleCall}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800/80 hover:border-zinc-700 shadow-xl flex items-center justify-center transition-all">
                  <Phone className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300">Call</span>
              </button>

              <button
                onClick={handleSms}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800/80 hover:border-zinc-700 shadow-xl flex items-center justify-center transition-all">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300">SMS</span>
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-2 opacity-30">
                <div className="w-12 h-12 rounded-full bg-zinc-950 text-zinc-600 border border-zinc-900 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-zinc-600">Call</span>
              </div>
              <div className="flex flex-col items-center gap-2 opacity-30">
                <div className="w-12 h-12 rounded-full bg-zinc-950 text-zinc-600 border border-zinc-900 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-zinc-600">SMS</span>
              </div>
            </>
          )}

          {contact.email ? (
            <button
              onClick={handleMail}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800/80 hover:border-zinc-700 shadow-xl flex items-center justify-center transition-all">
                <Mail className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300">Email</span>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-30">
              <div className="w-12 h-12 rounded-full bg-zinc-950 text-zinc-600 border border-zinc-900 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-zinc-600">Email</span>
            </div>
          )}

          {contact.address ? (
            <button
              onClick={handleNavigation}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800/80 hover:border-zinc-700 shadow-xl flex items-center justify-center transition-all">
                <MapPin className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300">Route</span>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-30">
              <div className="w-12 h-12 rounded-full bg-zinc-950 text-zinc-600 border border-zinc-900 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-zinc-600">Route</span>
            </div>
          )}
        </div>

        {/* Frosted glass social tiles links */}
        <div className="mt-8 space-y-3.5">
          <span className="block text-zinc-500 text-[10px] tracking-widest font-mono uppercase text-center">Connected Web Handles</span>

          {contact.website && (
            <a
              href={cleanUrl(contact.website)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-md group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-semibold text-zinc-300">Official Website</div>
                  <div className="text-[11px] text-zinc-500 truncate max-w-[220px]">{contact.website}</div>
                </div>
              </div>
              <span className="text-xs font-mono text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all">Open</span>
            </a>
          )}

          {contact.socials.linkedin && (
            <a
              href={cleanUrl(contact.socials.linkedin)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-md group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/10 flex items-center justify-center text-blue-400">
                  <Linkedin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-semibold text-zinc-300">LinkedIn Profile</div>
                  <div className="text-[11px] text-zinc-500 truncate max-w-[220px]">{contact.socials.linkedin}</div>
                </div>
              </div>
              <span className="text-xs font-mono text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all">Connect</span>
            </a>
          )}

          {contact.socials.twitter && (
            <a
              href={cleanUrl(contact.socials.twitter)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-md group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-100">
                  <Twitter className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-semibold text-zinc-300">Twitter Feed</div>
                  <div className="text-[11px] text-zinc-500 truncate max-w-[220px]">{contact.socials.twitter}</div>
                </div>
              </div>
              <span className="text-xs font-mono text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all">Follow</span>
            </a>
          )}

          {contact.socials.github && (
            <a
              href={cleanUrl(contact.socials.github)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-md group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-zinc-100">
                  <Github className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-semibold text-zinc-300">GitHub Commits</div>
                  <div className="text-[11px] text-zinc-500 truncate max-w-[220px]">{contact.socials.github}</div>
                </div>
              </div>
              <span className="text-xs font-mono text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all">View</span>
            </a>
          )}
        </div>

      </main>

      {/* Two Primary Action Buttons at bottom */}
      <footer className="w-full max-w-md px-6 pb-8 pt-4 bg-zinc-950 border-t border-zinc-900/40 relative z-10 sticky bottom-0">
        <div className="grid grid-cols-2 gap-3.5">
          <button
            onClick={handleDownloadVcard}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono font-semibold tracking-wide rounded-xl transition-all shadow-xl active:scale-98 select-none"
          >
            <UserPlus className="w-4 h-4 text-zinc-950 flex-shrink-0" />
            <span>Add to Contact</span>
          </button>

          <button
            onClick={handleShare}
            className={`flex items-center justify-center gap-2 py-3 px-4 text-xs font-mono font-semibold tracking-wide rounded-xl transition-all select-none border shadow-xl active:scale-98 ${copiedLink ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-zinc-900 hover:bg-zinc-850 border-zinc-800 hover:border-zinc-700 text-zinc-100"}`}
          >
            {copiedLink ? (
              <>
                <ClipboardCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Copied Link</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>Share Profile</span>
              </>
            )}
          </button>
        </div>
        <p className="text-[9px] text-zinc-600 text-center font-mono mt-4">POWERED BY CARDNET • SECURE DIGITAL CARDS</p>
      </footer>

    </div>
  );
}
