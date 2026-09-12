import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsDemo, loading, error: authError } = useAuth();

  const [email, setEmail] = useState('krish.patel@sldc.gujarat.gov.in');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const redirectPath = location.state?.from?.pathname && location.state.from.pathname !== '/' 
    ? location.state.from.pathname 
    : '/dashboard';

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
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                Supabase Auth
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

            {/* 1-Click Demo Operator Button */}
            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Continue as Demo Operator (Krish Patel)</span>
            </button>

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
    </div>
  );
}
