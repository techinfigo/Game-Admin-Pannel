/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Save, Globe, MessageCircle, Mail, Link as LinkIcon, Instagram, Youtube, Send, Facebook, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { SiteSettings } from '../types';

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    phone: '+91 98765 43210',
    whatsappNumber: '+91 98765 43210',
    email: 'contact@gameacademy.in',
    classplusPortalLink: 'https://web.classplusapp.com/login',
    instagram: 'https://instagram.com/game_academy',
    youtube: 'https://youtube.com/@game_academy',
    telegram: 'https://t.me/game_academy',
    facebook: 'https://facebook.com/gameacademy',
    address: '123, Tech Park, Hyderabad, India'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      // TODO: connect to Firestore
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Site Settings</h1>
        <p className="text-slate-500 mt-1">Manage global contact information and social links for GAME Academy.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contact Info Section */}
        <section className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-game-teal/10 rounded-xl flex items-center justify-center text-game-teal">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Contact Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-text">Phone Number</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="phone"
                  value={settings.phone}
                  onChange={handleInputChange}
                  className="input-field pl-10" 
                  required
                />
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="label-text">WhatsApp Number</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="whatsappNumber"
                  value={settings.whatsappNumber}
                  onChange={handleInputChange}
                  className="input-field pl-10" 
                  required
                />
                <MessageCircle className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="label-text">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  name="email"
                  value={settings.email}
                  onChange={handleInputChange}
                  className="input-field pl-10" 
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="label-text">Classplus Portal Link</label>
              <div className="relative">
                <input 
                  type="url" 
                  name="classplusPortalLink"
                  value={settings.classplusPortalLink}
                  onChange={handleInputChange}
                  className="input-field pl-10" 
                  required
                />
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="label-text">Physical Address</label>
              <div className="relative">
                <textarea 
                  name="address"
                  value={settings.address}
                  onChange={handleInputChange}
                  className="input-field pl-10 min-h-[100px] py-3" 
                  required
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>
        </section>

        {/* Social Links Section */}
        <section className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-game-gold/10 rounded-xl flex items-center justify-center text-game-gold">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Social Presence</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-text">Instagram URL</label>
              <div className="relative">
                <input 
                  type="url" 
                  name="instagram"
                  value={settings.instagram}
                  onChange={handleInputChange}
                  className="input-field pl-10" 
                />
                <Instagram className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="label-text">YouTube URL</label>
              <div className="relative">
                <input 
                  type="url" 
                  name="youtube"
                  value={settings.youtube}
                  onChange={handleInputChange}
                  className="input-field pl-10" 
                />
                <Youtube className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="label-text">Telegram URL</label>
              <div className="relative">
                <input 
                  type="url" 
                  name="telegram"
                  value={settings.telegram}
                  onChange={handleInputChange}
                  className="input-field pl-10" 
                />
                <Send className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="label-text">Facebook URL</label>
              <div className="relative">
                <input 
                  type="url" 
                  name="facebook"
                  value={settings.facebook}
                  onChange={handleInputChange}
                  className="input-field pl-10" 
                />
                <Facebook className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </section>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-200">
          {showSuccess && (
            <motion.p 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-game-teal font-bold text-sm flex items-center gap-2"
            >
              ✓ Settings saved successfully
            </motion.p>
          )}
          <button 
            type="submit" 
            disabled={isSaving}
            className="btn-primary min-w-[140px] justify-center"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
