import React, { useState } from 'react';
import { 
  X, 
  MessageCircle, 
  Check, 
  Send, 
  ShieldCheck, 
  Smartphone,
  ExternalLink,
  Zap,
  Mail
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsAppNumber: string;
  userEmail?: string;
  onSaveWhatsAppNumber: (phone: string, autoSend: boolean, email?: string) => void;
  autoSendAlerts: boolean;
  theme?: 'light' | 'dark';
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  whatsAppNumber,
  userEmail = 'junaidajaffry@gmail.com',
  onSaveWhatsAppNumber,
  autoSendAlerts,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [phone, setPhone] = useState(whatsAppNumber || '+923001234567');
  const [email, setEmail] = useState(userEmail || 'junaidajaffry@gmail.com');
  const [autoSend, setAutoSend] = useState(autoSendAlerts);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    sounds.playOrderClick();
    onSaveWhatsAppNumber(phone, autoSend, email);
    onClose();
  };

  const handleTestWhatsApp = async () => {
    sounds.playSignalAlert();
    setIsSendingTest(true);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const sampleMessage = encodeURIComponent(`
🎯 *GOLDSNIPER PRO - REAL-TIME VERIFIED SIGNAL* 🎯
━━━━━━━━━━━━━━━━━━━━
🪙 *Asset:* GOLD (XAU/USD)
⚡ *Direction:* STRONG BUY
💵 *Entry Price:* 4,058.39
🛑 *Stop Loss:* 4,048.00 (-104 pips)
🎯 *Target 1 (TP1):* 4,068.00 (+96 pips)
🎯 *Target 2 (TP2):* 4,078.00 (+196 pips)
🎯 *Target 3 (TP3):* 4,095.00 (+366 pips)
━━━━━━━━━━━━━━━━━━━━
💎 *Confidence:* 94% (Zero-Mistake Confluence)
📊 *Indicators:* MA50 Support ($4,049.96) + RSI Momentum
🛡️ *ForexFactory News:* Clear of High-Impact Embargo
🇵🇰 *Roman Urdu:* Gold MA 50 support per mazboot hai, fake reports filter ho chuki hain. Safe entry zone 4058 hai.
━━━━━━━━━━━━━━━━━━━━
⚠️ *Risk:* Max 1-2% account balance exposure
✉️ *Subscriber:* ${email}
📱 GoldSniper Pro AI Trading Terminal
    `.trim());

    // Also notify server backend
    try {
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone,
          message: decodeURIComponent(sampleMessage),
          signalId: `TEST-${Date.now()}`
        })
      });
    } catch (e) {
      console.warn('Backend WhatsApp test log:', e);
    }

    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${sampleMessage}`
      : `https://api.whatsapp.com/send?text=${sampleMessage}`;

    window.open(url, '_blank');
    setIsSendingTest(false);
    setTestSent(true);
    setTimeout(() => setTestSent(false), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className={`rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border transition-all ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#121824] border-[#232f45] text-slate-100'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-gradient-to-r from-emerald-950/60 to-[#172033] border-[#232f45]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-300">
              <MessageCircle className="w-5 h-5 fill-emerald-600 text-transparent" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Real-Time Signal Dispatch</h3>
              <p className="text-xs text-emerald-700 font-medium">WhatsApp & Email Instant Delivery</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* WhatsApp Phone Number */}
          <div>
            <label className="text-slate-700 font-bold block mb-1.5 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              WhatsApp Phone Number (with Country Code):
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +923001234567 or +14155552671"
              className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm focus:outline-none transition-all ${
                isLight 
                  ? 'bg-slate-50 text-slate-900 border-slate-300 focus:border-emerald-600 focus:bg-white' 
                  : 'bg-[#0e131d] text-white border-gray-700 focus:border-emerald-400'
              }`}
            />
            <p className="text-xs text-slate-500 mt-1">
              Include country code (e.g. +92 for Pakistan, +1 USA, +44 UK, +971 UAE)
            </p>
          </div>

          {/* Email Address */}
          <div>
            <label className="text-slate-700 font-bold block mb-1.5 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-600" />
              Email Address for Signal Logs:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. junaidajaffry@gmail.com"
              className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm focus:outline-none transition-all ${
                isLight 
                  ? 'bg-slate-50 text-slate-900 border-slate-300 focus:border-blue-600 focus:bg-white' 
                  : 'bg-[#0e131d] text-white border-gray-700 focus:border-blue-400'
              }`}
            />
          </div>

          {/* Auto Send Toggle */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#172030] border-gray-800'
          }`}>
            <div className="pr-3">
              <span className="font-bold text-slate-900 block text-xs">Auto-Send Signal to WhatsApp</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Automatically opens & sends signal to your WhatsApp as soon as signal triggers
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={autoSend}
                onChange={(e) => setAutoSend(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Test Signal Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleTestWhatsApp}
              disabled={isSendingTest}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>{isSendingTest ? 'Sending Signal...' : '⚡ Test Real-Time WhatsApp Signal Dispatch'}</span>
            </button>

            {testSent && (
              <p className="text-center text-xs text-emerald-700 font-bold mt-2 flex items-center justify-center gap-1.5 animate-fade-in bg-emerald-50 py-1.5 rounded-lg border border-emerald-200">
                <Check className="w-4 h-4 text-emerald-600" />
                WhatsApp opened with Gold Signal for {phone}!
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-end gap-2.5 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0e131d] border-[#1e293b]'
        }`}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Save Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
