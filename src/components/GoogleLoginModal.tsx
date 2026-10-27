import React, { useState } from 'react';
import { UserProfile } from '../types/trading';
import { 
  X, 
  Check, 
  LogOut, 
  User, 
  ShieldCheck, 
  Sparkles,
  DollarSign,
  Percent,
  Mail,
  Smartphone
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  theme?: 'light' | 'dark';
}

export const GoogleLoginModal: React.FC<GoogleLoginModalProps> = ({
  isOpen,
  onClose,
  user,
  setUser,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [balanceInput, setBalanceInput] = useState(user.accountBalance);
  const [riskInput, setRiskInput] = useState(user.riskPercentage);
  const [phoneInput, setPhoneInput] = useState(user.whatsAppNumber || '+923001234567');
  const [emailInput, setEmailInput] = useState(user.email || 'junaidajaffry@gmail.com');

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    sounds.playSignalAlert();
    setUser((prev) => ({
      ...prev,
      isLoggedIn: true,
      name: 'Junaid Jaffry',
      email: emailInput || 'junaidajaffry@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    }));
  };

  const handleSignOut = () => {
    sounds.playOrderClick();
    setUser((prev) => ({
      ...prev,
      isLoggedIn: false,
    }));
  };

  const handleSaveProfile = () => {
    sounds.playOrderClick();
    setUser((prev) => ({
      ...prev,
      accountBalance: Number(balanceInput) || 10000,
      riskPercentage: Number(riskInput) || 1.5,
      whatsAppNumber: phoneInput,
      email: emailInput,
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className={`rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border transition-all ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#121824] border-[#232f45] text-slate-100'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-gradient-to-r from-blue-950/40 to-[#172033] border-[#232f45]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 border border-blue-200">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Google Trader Profile</h3>
              <p className="text-xs text-blue-700 font-medium">Signals & Risk Account Config</p>
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
          {user.isLoggedIn ? (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className={`flex items-center gap-3.5 p-3.5 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#172030] border-gray-800'
              }`}>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border-2 border-emerald-500 object-cover shadow-xs"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-black text-slate-900">{user.name}</h4>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                </div>

                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Contact Destination */}
              <div className="space-y-2">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">WhatsApp Phone Number:</label>
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border font-mono text-xs ${
                      isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#0e131d] text-white border-gray-700'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Account Email:</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border font-mono text-xs ${
                      isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#0e131d] text-white border-gray-700'
                    }`}
                  />
                </div>
              </div>

              {/* Account Balance and Risk Config */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Account Capital ($):</label>
                  <input
                    type="number"
                    value={balanceInput}
                    onChange={(e) => setBalanceInput(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono text-xs ${
                      isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#0e131d] text-white border-gray-700'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Risk Per Trade (%):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={riskInput}
                    onChange={(e) => setRiskInput(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl border font-mono text-xs ${
                      isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#0e131d] text-white border-gray-700'
                    }`}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-4">
              <p className="text-slate-600 leading-relaxed font-medium">
                Sign in with Google to sync your Gold trading signals, real-time WhatsApp alert phone, customized risk settings, and trade logs.
              </p>

              {/* Official styled Google Sign In button */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl shadow-md border border-slate-300 flex items-center justify-center gap-3 transition-all active:scale-98"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-end gap-2.5 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0e131d] border-[#1e293b]'
        }`}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
          {user.isLoggedIn && (
            <button
              onClick={handleSaveProfile}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
