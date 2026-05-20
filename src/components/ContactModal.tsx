import React, { useState, useEffect } from "react";
import { X, Upload, Mail, Phone, Globe, MapPin, Building, Briefcase, Linkedin, Twitter, Github, Eye, Sparkles } from "lucide-react";
import { Contact } from "../types";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onSave: (id: string | null, data: any) => Promise<void>;
  isSaving: boolean;
}

export default function ContactModal({ isOpen, onClose, contact, onSave, isSaving }: ContactModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    title: "",
    organization: "",
    website: "",
    address: "",
    socials: {
      linkedin: "",
      twitter: "",
      github: ""
    },
    avatar: ""
  });
  
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (contact) {
      setFormData({
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        email: contact.email || "",
        phone: contact.phone || "",
        title: contact.title || "",
        organization: contact.organization || "",
        website: contact.website || "",
        address: contact.address || "",
        socials: {
          linkedin: contact.socials?.linkedin || "",
          twitter: contact.socials?.twitter || "",
          github: contact.socials?.github || ""
        },
        avatar: contact.avatar || ""
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        title: "",
        organization: "",
        website: "",
        address: "",
        socials: {
          linkedin: "",
          twitter: "",
          github: ""
        },
        avatar: ""
      });
    }
    setFileError(null);
  }, [contact, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("socials.")) {
      const socialKey = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        socials: {
          ...prev.socials,
          [socialKey]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      setFileError("Avatar image file exceeds 1.5MB benchmark. Please upload a smaller file.");
      return;
    }
    setFileError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, avatar: reader.result as string }));
    };
    reader.onerror = () => {
      setFileError("Failed to convert image to DataURL format.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setFormData(prev => ({ ...prev, avatar: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      return;
    }
    onSave(contact ? contact.id : null, formData);
  };

  const getInitials = () => {
    const f = formData.firstName ? formData.firstName[0].toUpperCase() : "";
    const l = formData.lastName ? formData.lastName[0].toUpperCase() : "";
    return f + l || "?";
  };

  return (
    <div id="contact-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white/90 backdrop-blur-lg rounded-[2rem] w-full max-w-5xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] flex flex-col max-h-[85vh] overflow-hidden border border-white/50">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-white/50">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
              {contact ? "Modify Business Card" : "New Digital Business Card"}
            </h2>
            <p className="text-xs text-zinc-500">
              {contact ? "Update credential fields and preview instantly" : "Deploy a new NFC compatible virtual identity card"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-805 transition-all"
            id="close-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Layout: Two Columns on Desktop */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-100">
          
          {/* Left Form: Field Entry */}
          <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 max-h-full overflow-y-auto scrollbar-thin">
            
            {/* Avatar upload banner */}
            <div className="p-4 bg-white rounded-2xl border border-zinc-200/80 shadow-xs">
              <span className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Card Avatar Profile Photo
              </span>
              <div className="flex items-center gap-4">
                {formData.avatar ? (
                  <div className="relative group">
                    <img
                      src={formData.avatar}
                      alt="Avatar preview"
                      className="w-16 h-16 rounded-full object-cover border border-zinc-200 bg-zinc-50"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-1 -right-1 bg-rose-500 text-white p-0.5 rounded-full hover:bg-rose-600 transition-colors shadow-xs"
                      title="Clear photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-lg">
                    {getInitials()}
                  </div>
                )}
                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-xs font-medium text-zinc-700 cursor-pointer transition-all shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-zinc-500 mt-1">PNG, JPG or WEBP. Limit size to 1.5MB.</p>
                  {fileError && <p className="text-[10px] font-mono font-medium text-rose-500 leading-tight mt-1">{fileError}</p>}
                </div>
              </div>
            </div>

            {/* Basic credentials grid */}
            <div>
              <span className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Identity Profile Credentials
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Jane"
                    className="w-full text-sm px-3 py-2 border border-zinc-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    className="w-full text-sm px-3 py-2 border border-zinc-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Job structure */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-zinc-400" /> Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Senior Sales Advisor"
                  className="w-full text-sm px-3 py-2 border border-zinc-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1 flex items-center gap-1">
                  <Building className="w-3 h-3 text-zinc-400" /> Organization
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  placeholder="Google LLC"
                  className="w-full text-sm px-3 py-2 border border-zinc-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Direct communication tools */}
            <div className="space-y-3">
              <span className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-0.5">
                Contact details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-zinc-400" /> Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className="w-full text-sm px-3 py-2 border border-zinc-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-zinc-400" /> Telephone Route
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full text-sm px-3 py-2 border border-zinc-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-zinc-400" /> Personal Website
                  </label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://google.com"
                    className="w-full text-sm px-3 py-2 border border-zinc-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-zinc-400" /> Physical Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="1600 Amphitheatre Pkwy, Mountain View"
                    className="w-full text-sm px-3 py-2 border border-zinc-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Social connections handles */}
            <div className="space-y-3">
              <span className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-0.5">
                Social Accounts Links
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1 flex items-center gap-1">
                    <Linkedin className="w-3 h-3 text-blue-600" /> LinkedIn URL
                  </label>
                  <input
                    type="text"
                    name="socials.linkedin"
                    value={formData.socials.linkedin}
                    onChange={handleInputChange}
                    placeholder="linkedin.com/in/user"
                    className="w-full text-sm px-3 py-2 border border-zinc-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1 flex items-center gap-1">
                    <Twitter className="w-3 h-3 text-zinc-800" /> Twitter Handle
                  </label>
                  <input
                    type="text"
                    name="socials.twitter"
                    value={formData.socials.twitter}
                    onChange={handleInputChange}
                    placeholder="twitter.com/user"
                    className="w-full text-sm px-3 py-2 border border-zinc-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1 flex items-center gap-1">
                    <Github className="w-3 h-3 text-zinc-900" /> GitHub URL
                  </label>
                  <input
                    type="text"
                    name="socials.github"
                    value={formData.socials.github}
                    onChange={handleInputChange}
                    placeholder="github.com/user"
                    className="w-full text-sm px-3 py-2 border border-zinc-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Actions in Modal Form bottom */}
            <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-3 bg-zinc-50 -mx-6 -mb-6 p-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-sm font-medium rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-all shadow-xs flex items-center gap-2"
              >
                {isSaving ? "Saving..." : contact ? "Overwrite Card" : "Publish vCard"}
              </button>
            </div>
          </form>

          {/* Right Section: Real-Time Live Preview */}
          <div className="hidden md:flex w-96 bg-zinc-900/95 backdrop-blur-md p-6 flex-col justify-between overflow-y-auto max-h-full border-l border-zinc-100">
            <div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px] tracking-widest uppercase mb-4">
                <Eye className="w-3.5 h-3.5 text-indigo-400" /> 
                <span>Card Live Preview</span>
              </div>

              {/* simulated physical card */}
              <div className="bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl p-6 relative overflow-hidden transition-all select-none">
                {/* Visual mesh glow bubble backgrounds */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-zinc-800/20 rounded-full blur-2xl pointer-events-none" />

                {/* Card header layout */}
                <div className="flex items-center gap-4 relative z-10">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Avatar preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-zinc-805 bg-zinc-800"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-900/40 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-base">
                      {getInitials()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h4 className="text-zinc-100 font-bold text-base tracking-tight truncate leading-snug">
                      {formData.firstName || formData.lastName ? `${formData.firstName} ${formData.lastName}` : "Your Identity"}
                    </h4>
                    <p className="text-zinc-400 text-xs truncate font-medium">
                      {formData.title || "Enterprise Executive"}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-medium truncate font-mono mt-0.5">
                      {formData.organization || "CARDNET Inc."}
                    </p>
                  </div>
                </div>

                {/* Card content details */}
                <div className="mt-6 pt-4 border-t border-zinc-805/85 space-y-2.5 text-[11px] font-mono text-zinc-400 relative z-10">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                    <span className="truncate">{formData.email || "partner@cardnet.io"}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Phone className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                    <span className="truncate">{formData.phone || "+1 (555) 000-0000"}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Globe className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                    <span className="truncate text-indigo-400">{formData.website || "www.cardnet.io"}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                    <span className="truncate">{formData.address || "HQ California, USA"}</span>
                  </div>
                </div>

                {/* Social media tray icon bar */}
                <div className="mt-6 flex items-center gap-2.5 pt-4 border-t border-zinc-850 relative z-10 text-zinc-500">
                  <Linkedin className={`w-3.5 h-3.5 ${formData.socials.linkedin ? "text-indigo-400" : ""}`} />
                  <Twitter className={`w-3.5 h-3.5 ${formData.socials.twitter ? "text-zinc-400" : ""}`} />
                  <Github className={`w-3.5 h-3.5 ${formData.socials.github ? "text-zinc-100" : ""}`} />
                </div>
              </div>
            </div>

            {/* Preview Hint details */}
            <div className="text-[10px] text-zinc-500 font-mono leading-relaxed mt-4">
              Changes committed here are published instantly to the database. Accessing the generated share link allows visitors to download standard .vcf cards to their mobile contact address books.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
