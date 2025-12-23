import { useState } from 'react';
import { Sparkles, Mail, Lock, User, Phone, CheckCircle } from 'lucide-react';

interface AuthViewProps {
  onAuthSuccess: (accessToken: string, userName: string, role?: string) => void;
}

export function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Sign up
        const response = await fetch(
          `https://${(window as any).SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-f79deb15/signup`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(window as any).SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ name, email, phone, password })
          }
        );

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Sign up failed');
        }

        // Automatically sign in after successful signup
        const signInResponse = await fetch(
          `https://${(window as any).SUPABASE_PROJECT_ID}.supabase.co/auth/v1/token?grant_type=password`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': (window as any).SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ email, password })
          }
        );

        const signInData = await signInResponse.json();
        
        if (!signInResponse.ok) {
          throw new Error(signInData.error_description || 'Auto sign-in failed. Please sign in manually.');
        }

        // Get user data to retrieve role
        const userResponse = await fetch(
          `https://${(window as any).SUPABASE_PROJECT_ID}.supabase.co/auth/v1/user`,
          {
            headers: {
              'Authorization': `Bearer ${signInData.access_token}`,
              'apikey': (window as any).SUPABASE_ANON_KEY
            }
          }
        );

        const userData = await userResponse.json();
        const role = userData.user_metadata?.role || 'customer';

        onAuthSuccess(signInData.access_token, name, role);
      } else {
        // Sign in
        const response = await fetch(
          `https://${(window as any).SUPABASE_PROJECT_ID}.supabase.co/auth/v1/token?grant_type=password`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': (window as any).SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ email, password })
          }
        );

        const data = await response.json();
        
        if (!response.ok) {
          // Check if error is due to unverified email
          if (data.error_description?.includes('Email not confirmed')) {
            throw new Error('Please verify your email before signing in. Check your inbox for the verification link.');
          }
          throw new Error(data.error_description || 'Sign in failed');
        }

        // Get user data to retrieve name and role
        const userResponse = await fetch(
          `https://${(window as any).SUPABASE_PROJECT_ID}.supabase.co/auth/v1/user`,
          {
            headers: {
              'Authorization': `Bearer ${data.access_token}`,
              'apikey': (window as any).SUPABASE_ANON_KEY
            }
          }
        );

        const userData = await userResponse.json();
        const userName = userData.user_metadata?.name || 'User';
        const role = userData.user_metadata?.role || 'customer';

        onAuthSuccess(data.access_token, userName, role);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="w-8 h-8 text-amber-500" />
        <h1 className="text-black tracking-tight">Dardan's Barbershop</h1>
      </div>

      <p className="text-zinc-600 text-sm mb-8 text-center">
        Premium Grooming Experience
      </p>

      {/* Auth Form */}
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-lg">
          <h2 className="text-black text-xl mb-6 text-center">
            {isSignUp ? 'Create Account' : 'Welcome back'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="text-zinc-600 text-xs block mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-white text-black rounded-xl pl-11 pr-4 py-3 border border-zinc-200 focus:border-amber-500 focus:outline-none transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-600 text-xs block mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full bg-white text-black rounded-xl pl-11 pr-4 py-3 border border-zinc-200 focus:border-amber-500 focus:outline-none transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-zinc-600 text-xs block mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white text-black rounded-xl pl-11 pr-4 py-3 border border-zinc-200 focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-600 text-xs block mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-white text-black rounded-xl pl-11 pr-4 py-3 border border-zinc-200 focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-full py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-zinc-600 text-sm hover:text-amber-500 transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}