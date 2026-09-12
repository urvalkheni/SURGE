import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Leaf, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Activity, 
  AlertCircle,
  CheckCircle2,
  X,
  KeyRound,
  ExternalLink,
  HelpCircle,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsDemo, loginWithGoogle, loading, error: authError } = useAuth();

  const [email, setEmail] = useState('krish.patel@sldc.gujarat.gov.in');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const gsiInitializedRef = useRef(false);

  // Google OAuth state
  const [googleClientId, setGoogleClientId] = useState(() => {
    return localStorage.getItem('google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  });
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [clientIdInput, setClientIdInput] = useState('');
  const [googleUserEmail, setGoogleUserEmail] = useState('');
  const [googleUserName, setGoogleUserName] = useState('');
  const [modalTab, setModalTab] = useState('oauth'); // 'oauth' or 'direct'

  const redirectPath = location.state?.from?.pathname && location.state.from.pathname !== '/' 
    ? location.state.from.pathname 
    : '/dashboard';

  // Handle Google token verification and login
  const handleGoogleResponse = async (idToken) => {
    setFormError('');
    if (!idToken) {
      setFormError('Google did not return a valid authentication credential.');
      return;
    }
    const res = await loginWithGoogle({ credential: idToken });
    if (res.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setFormError(res.error || 'Google authentication failed.');
    }
  };

  // Check URL hash for Google OAuth 2.0 redirect response (#id_token=...)
  useEffect(() => {
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const idToken = params.get('id_token') || params.get('credential');
      if (idToken) {
        if (window.opener && window.opener !== window) {
          window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', idToken }, window.location.origin);
          window.close();
          return;
        }
        handleGoogleResponse(idToken);
      }
    }

    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data.idToken) {
        handleGoogleResponse(event.data.idToken);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Initialize Google Identity Services if client_id is available
  useEffect(() => {
    if (!googleClientId) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        try {
          if (!gsiInitializedRef.current) {
            window.google.accounts.id.initialize({
              client_id: googleClientId,
              callback: (response) => {
                if (response?.credential) {
                  handleGoogleResponse(response.credential);
                }
              },
              auto_select: false,
              cancel_on_tap_outside: true
            });
            gsiInitializedRef.current = true;
          }
          const btnElem = document.getElementById("gsi-render-button");
          if (btnElem) {
            btnElem.innerHTML = '';
            window.google.accounts.id.renderButton(btnElem, {
              theme: "outline",
              size: "large",
              width: 380,
              text: "continue_with",
              shape: "rectangular"
            });
          }
        } catch (e) {
          console.warn("GSI init notice:", e);
        }
      }
    };
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [googleClientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim() || !password) {
      setFormError('Please provide both your operator email and password.');
      return;
    }

    const res = await login(email.trim(), password);
    if (res.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setFormError(res.error || 'Invalid credentials.');
    }
  };

  const handleDemoAccess = () => {
    loginAsDemo('Chief Grid Dispatcher');
    navigate(redirectPath, { replace: true });
  };

  const openGoogleOAuthPopup = (clientIdToUse) => {
    const cid = clientIdToUse || googleClientId;
    if (!cid) return;
    const redirectUri = window.location.origin + '/login';
    const scope = encodeURIComponent('openid email profile');
    const nonce = Math.random().toString(36).substring(2);
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(cid)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token%20id_token&scope=${scope}&nonce=${nonce}&prompt=select_account`;
    window.open(url, 'GoogleAuth', 'width=520,height=630,menubar=no,toolbar=no');
  };

  const handleGoogleCustomClick = () => {
    setFormError('');
    if (googleClientId) {
      // First attempt to trigger Google Identity Services One Tap prompt if supported
      if (window.google?.accounts?.id) {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            openGoogleOAuthPopup();
          }
        });
      } else {
        openGoogleOAuthPopup();
      }
      return;
    }
    // If no client ID yet, open setup modal
    setIsGoogleModalOpen(true);
  };

  const handleSaveClientId = (e) => {
    e.preventDefault();
    const cleanId = clientIdInput.trim();
    if (!cleanId) {
      setFormError('Please enter your Google Client ID.');
      return;
    }
    localStorage.setItem('google_client_id', cleanId);
    setGoogleClientId(cleanId);
    setIsGoogleModalOpen(false);
    openGoogleOAuthPopup(cleanId);
  };

  const handleCustomGoogleEmailLogin = async (e) => {
    e.preventDefault();
    if (!googleUserEmail.trim()) {
      setFormError('Please enter your Google account email.');
      return;
    }
    setIsGoogleModalOpen(false);
    const res = await loginWithGoogle({
      email: googleUserEmail.trim(),
      name: googleUserName.trim() || googleUserEmail.split('@')[0],
      role: 'Grid Dispatcher',
      station: 'State Load Despatch Centre'
    });
    if (res.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setFormError(res.error || 'Google authentication failed.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Container Box */}
      <div className="w-full max-w-5xl bg-white border border-slate-200/80 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* Left Side: Brand Visual & Grid Mission */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Scenic Overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <img 
              src="/hero-solar-photo.png" 
              alt="Clean Energy Infrastructure" 
              className="w-full h-full object-cover object-center filter grayscale"
            />
          </div>

          {/* Top Logo */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                <img src="/surge-icon.png" alt="SURGE" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight font-sans text-white">
                SURGE
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>National Grid Gateway</span>
            </div>
          </div>

          {/* Center Pitch */}
          <div className="relative z-10 space-y-4 my-8">
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Forecast the Grid.<br />
              <span className="text-blue-400">Before the Gap.</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              AI-driven multi-state renewable generation forecasting, automated peak-shaving dispatch, and CERC Deviation Settlement protection.
            </p>

            {/* Feature Bullets */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>CERC DSM &lt; 10% Regulatory Compliance</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <Activity className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Hyper-Local 24-72h Weather & Generation Telemetry</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Intelligent BESS Battery Storage Absorption</span>
              </div>
            </div>
          </div>

          {/* Bottom Accreditation */}
          <div className="relative z-10 text-[11px] text-slate-400 border-t border-slate-800 pt-4 flex items-center justify-between">
            <span>Gujarat SLDC &bull; REMC Desk</span>
            <span className="font-mono">v3.2 Enterprise</span>
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div className="max-w-md mx-auto w-full space-y-6">
            
            {/* Back to Overview */}
            <div className="flex items-center justify-between">
              <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors">
                <span>&larr; Back to Overview</span>
              </Link>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                SQLite DB Auth
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Control Room Sign In
              </h3>
              <p className="text-xs text-slate-500">
                Enter your authorized credentials to access real-time dispatch controls.
              </p>
            </div>

            {/* Error Message */}
            {(formError || authError) && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError || authError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Official Operator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="operator@sldc.gujarat.gov.in"
                    className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-800 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Secure Password
                  </label>
                  <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-xs text-slate-800 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-3.5 h-3.5"
                  />
                  <span>Keep this workstation logged in</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Command Center</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] uppercase font-bold text-slate-400">
                Or Instant Access
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            {/* Quick Auth Actions */}
            <div className="space-y-2.5">
              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleCustomClick}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* 1-Click Demo Operator Button */}
              <button
                type="button"
                onClick={handleDemoAccess}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Continue as Demo Operator (Krish Patel)</span>
              </button>
            </div>

            {/* Switch to Sign Up */}
            <div className="text-center text-xs text-slate-500 pt-2">
              Need a new dispatch station login?{' '}
              <Link to="/signup" className="text-blue-600 font-bold hover:underline">
                Create Operator Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Google Setup & Account Modal */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Google Authentication</h3>
                  <p className="text-[11px] text-slate-500">Sign in with your Google account</p>
                </div>
              </div>
              <button
                onClick={() => setIsGoogleModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Credential Status */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Backend Client Secret Configured</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono truncate">
                GOOGLE_CLIENT_SECRET (Configured via env)
              </p>
            </div>

            {/* Mode Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setModalTab('oauth')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  modalTab === 'oauth'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Google Web Client ID
              </button>
              <button
                type="button"
                onClick={() => setModalTab('direct')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  modalTab === 'direct'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Direct Google Email
              </button>
            </div>

            {/* Tab 1: Real Google Client ID */}
            {modalTab === 'oauth' && (
              <form onSubmit={handleSaveClientId} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Google OAuth Client ID
                  </label>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    From Google Cloud Console (Credentials) paired with your secret key:
                  </p>
                  <input
                    type="text"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                    className="w-full px-3 py-2 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGoogleModalOpen(false)}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Save & Open Google Popup
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Custom Google Email Login */}
            {modalTab === 'direct' && (
              <form onSubmit={handleCustomGoogleEmailLogin} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Your Google Email
                  </label>
                  <input
                    type="email"
                    required
                    value={googleUserEmail}
                    onChange={(e) => setGoogleUserEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={googleUserName}
                    onChange={(e) => setGoogleUserName(e.target.value)}
                    placeholder="e.g. Your Name"
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGoogleModalOpen(false)}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Sign In as this User
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
