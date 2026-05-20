import { useState } from "react";
import { Linkedin, Twitter, Github, Mail, Phone, ExternalLink, Edit3, Trash2, Copy, Check, Globe } from "lucide-react";
import { Contact } from "../types";

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

export default function ContactCard({ contact, onEdit, onDelete }: ContactCardProps) {
  const [copied, setCopied] = useState(false);

  const getInitials = (first: string, last: string) => {
    const f = first ? first[0].toUpperCase() : "";
    const l = last ? last[0].toUpperCase() : "";
    return f + l || "?";
  };

  const getPublicLink = () => {
    return `${window.location.origin}/card/${contact.id}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getPublicLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatUrl = (url: string | undefined) => {
    if (!url) return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    // Handle social handles that are just usernames
    return `https://${trimmed}`;
  };

  const handleOpenCard = () => {
    window.open(getPublicLink(), "_blank");
  };

  return (
    <div
      id={`contact-card-${contact.id}`}
      className="bg-white/65 backdrop-blur-md rounded-[1.5rem] border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(99,102,241,0.08)] transition-all duration-300 p-6 flex flex-col justify-between group hover:-translate-y-1 hover:border-indigo-100"
    >
      {/* Top Banner Card Header */}
      <div>
        <div className="flex items-start gap-4">
          {/* Avatar Profile Display */}
          {contact.avatar ? (
            <img
              src={contact.avatar}
              alt={`${contact.firstName} ${contact.lastName}`}
              className="w-14 h-14 rounded-full object-cover border border-zinc-100 bg-zinc-50 flex-shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-sans font-bold text-lg text-indigo-600 flex-shrink-0">
              {getInitials(contact.firstName, contact.lastName)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-sans font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors truncate text-base leading-tight">
              {contact.firstName} {contact.lastName}
            </h3>
            {contact.title && (
              <p className="text-sm text-zinc-600 truncate mt-0.5">{contact.title}</p>
            )}
            {contact.organization && (
              <p className="text-xs text-zinc-400 font-medium truncate mt-0.5">{contact.organization}</p>
            )}
          </div>
        </div>

        {/* Contact Info Items Section */}
        <div className="mt-5 space-y-2 border-t border-zinc-100 pt-4 text-xs font-mono text-zinc-500">
          {contact.email && (
            <div className="flex items-center gap-2.5 truncate" title={contact.email}>
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2.5 truncate" title={contact.phone}>
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              <span className="truncate">{contact.phone}</span>
            </div>
          )}
          {contact.website && (
            <div className="flex items-center gap-2.5 truncate" title={contact.website}>
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <a
                href={formatUrl(contact.website) || "#"}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline truncate"
              >
                {contact.website}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Footer Socials & System Operations */}
      <div className="mt-6 border-t border-zinc-100 pt-4 flex items-center justify-between">
        {/* Social Badges Grid */}
        <div className="flex items-center gap-2">
          {contact.socials.linkedin && (
            <a
              href={formatUrl(contact.socials.linkedin) || "#"}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg border border-zinc-100 text-zinc-500 hover:bg-zinc-50 hover:text-indigo-600 transition-all"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
          )}
          {contact.socials.twitter && (
            <a
              href={formatUrl(contact.socials.twitter) || "#"}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg border border-zinc-100 text-zinc-500 hover:bg-zinc-50 hover:text-indigo-400 transition-all"
              title="Twitter Handle"
            >
              <Twitter className="w-3.5 h-3.5" />
            </a>
          )}
          {contact.socials.github && (
            <a
              href={formatUrl(contact.socials.github) || "#"}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg border border-zinc-100 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all"
              title="Github Commits"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Actions Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyLink}
            className={`p-1.5 rounded-lg border border-zinc-100 text-zinc-500 hover:bg-zinc-50 transition-all ${copied ? "text-emerald-600 border-emerald-100 bg-emerald-50" : "hover:text-indigo-600"}`}
            title="Copy Public Card Link"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          
          <button
            onClick={handleOpenCard}
            className="p-1.5 rounded-lg border border-zinc-100 text-zinc-500 hover:bg-zinc-50 hover:text-indigo-600 transition-all"
            title="Open Public Shared Card"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onEdit(contact)}
            className="p-1.5 rounded-lg border border-zinc-100 text-zinc-500 hover:bg-zinc-50 hover:text-indigo-600 transition-all"
            title="Edit Contact"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(contact.id)}
            className="p-1.5 rounded-lg border border-zinc-100 text-zinc-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
            title="Delete Contact"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
