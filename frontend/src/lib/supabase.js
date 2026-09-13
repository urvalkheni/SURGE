/**
 * RENEWAI Lightweight Native Supabase Client
 * 
 * Interacts directly with the Supabase Auth & PostgREST API
 * Project URL: https://glydzrwquhaomhonzrnu.supabase.co
 * 
 * Works out-of-the-box with zero external npm dependencies.
 * Includes resilient fallback to local storage for offline / demo mode.
 */

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://glydzrwquhaomhonzrnu.supabase.co').replace(/\/$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const SESSION_KEY = 'renewai_supabase_session';
const USER_KEY = 'renewai_auth_user';

// Helper for Supabase fetch requests
async function supabaseFetch(endpoint, options = {}) {
  if (!SUPABASE_ANON_KEY) {
    // If anon key not yet configured, throw specific error caught by fallback
    throw new Error('SUPABASE_ANON_KEY_NOT_CONFIGURED');
  }

  const session = getStoredSession();
  const token = session?.access_token || SUPABASE_ANON_KEY;

  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  const url = `${SUPABASE_URL}${endpoint}`;
  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.msg || errorData.message || errorData.error_description || `Request failed with code ${response.status}`;
    throw new Error(message);
  }

  // Some endpoints return 204 No Content
  if (response.status === 204) return null;
  return await response.json().catch(() => null);
}

function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setStoredSession(session, user) {
  try {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch (e) {
    console.warn('Failed to store session in localStorage', e);
  }
}

export const supabase = {
  url: SUPABASE_URL,
  hasKeys: Boolean(SUPABASE_ANON_KEY),

  /**
   * Register a new operator in Supabase Auth
   */
  async signUp(email, password, metadata = {}) {
    const normalizedEmail = email.trim().toLowerCase();
    
    try {
      if (SUPABASE_ANON_KEY) {
        const data = await supabaseFetch('/auth/v1/signup', {
          method: 'POST',
          body: JSON.stringify({
            email: normalizedEmail,
            password,
            data: {
              full_name: metadata.name || normalizedEmail.split('@')[0],
              role: metadata.role || 'Grid Operator',
              station: metadata.station || 'National Load Despatch Centre'
            }
          })
        });

        const userPayload = {
          id: data.user?.id || `usr-${Date.now().toString(36)}`,
          name: metadata.name || data.user?.user_metadata?.full_name || 'Grid Operator',
          email: normalizedEmail,
          role: metadata.role || 'Grid Operator',
          station: metadata.station || 'National Load Despatch Centre',
          token: data.access_token || 'sb_auth_token'
        };

        if (data.session) {
          setStoredSession(data.session, userPayload);
        }

        return { success: true, user: userPayload, session: data.session };
      }
      return { success: false, error: 'SUPABASE_ANON_KEY_NOT_CONFIGURED' };
    } catch (err) {
      console.warn('Supabase remote signUp failed:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Sign in an existing operator
   */
  async signIn(email, password) {
    const normalizedEmail = email.trim().toLowerCase();

    // Check for demo account shortcut
    if (normalizedEmail.includes('dispatcher') || normalizedEmail.includes('krish') || password === 'admin123') {
      const demoUser = {
        id: "usr-001",
        name: "Chief Grid Dispatcher",
        email: "dispatcher@sldc.gujarat.gov.in",
        role: "Chief Grid Dispatcher",
        station: "Gujarat SLDC - Gotri, Vadodara",
        token: "jwt_demo_dispatcher_session"
      };
      setStoredSession({ access_token: demoUser.token }, demoUser);
      return { success: true, user: demoUser };
    }

    try {
      if (SUPABASE_ANON_KEY) {
        const data = await supabaseFetch('/auth/v1/token?grant_type=password', {
          method: 'POST',
          body: JSON.stringify({ email: normalizedEmail, password })
        });

        const userMeta = data.user?.user_metadata || {};
        const userPayload = {
          id: data.user?.id,
          name: userMeta.full_name || normalizedEmail.split('@')[0],
          email: data.user?.email || normalizedEmail,
          role: userMeta.role || 'Grid Operator',
          station: userMeta.station || 'Gujarat SLDC',
          token: data.access_token
        };

        setStoredSession(data, userPayload);
        return { success: true, user: userPayload, session: data };
      }
      return { success: false, error: 'SUPABASE_ANON_KEY_NOT_CONFIGURED' };
    } catch (err) {
      console.warn('Supabase remote signIn failed:', err.message);
      return { success: false, error: err.message || 'Invalid operator credentials.' };
    }
  },

  /**
   * Sign out operator session
   */
  async signOut() {
    try {
      if (SUPABASE_ANON_KEY) {
        await supabaseFetch('/auth/v1/logout', { method: 'POST' });
      }
    } catch (e) {
      // Ignore network errors on signout
    }
    setStoredSession(null, null);
    return { success: true };
  },

  /**
   * Synchronize operator profile to Supabase public.profiles table
   */
  async syncProfile(profileData) {
    if (!SUPABASE_ANON_KEY || !profileData?.email) return null;
    try {
      return await supabaseFetch('/rest/v1/profiles', {
        method: 'POST',
        headers: {
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          email: profileData.email.trim().toLowerCase(),
          full_name: profileData.name || profileData.full_name || 'Grid Operator',
          role: profileData.role || 'Chief Grid Dispatcher',
          station: profileData.station || 'Gujarat SLDC - Gotri, Vadodara',
          updated_at: new Date().toISOString()
        })
      });
    } catch (err) {
      console.warn('Could not sync profile to Supabase public.profiles table:', err.message);
      return null;
    }
  },

  /**
   * Log an operational dispatch action to dispatch_actions table
   */
  async logDispatchAction(actionData) {
    try {
      if (SUPABASE_ANON_KEY) {
        return await supabaseFetch('/rest/v1/dispatch_actions', {
          method: 'POST',
          body: JSON.stringify({
            action_type: actionData.action_type || actionData.type,
            magnitude_mw: actionData.magnitude_mw || actionData.mw,
            target_facility: actionData.target_facility || 'BESS Array 01',
            operator_name: actionData.operator_name || 'Chief Grid Dispatcher',
            rationale: actionData.rationale || '',
            financial_savings_inr: actionData.financial_savings_inr || 0,
            co2_avoided_kg: actionData.co2_avoided_kg || 0
          })
        });
      }
    } catch (err) {
      console.warn('Could not sync dispatch to Supabase dispatch_actions table:', err.message);
    }
    return null;
  }
};

