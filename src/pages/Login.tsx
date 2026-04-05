import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function Login() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-blob" />
        <div className="absolute top-2/3 right-1/4 w-80 h-80 rounded-full bg-primary/3 blur-3xl animate-blob-delay" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl mb-4">
            ASC
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">ASC Outreach</h1>
          <p className="text-muted-foreground mt-2 text-center">AI-powered cold email outreach for American Screening Corporation</p>
        </div>

        {/* Login card */}
        <div className="glass-card p-8">
          <h2 className="text-lg font-semibold text-foreground text-center mb-6">Sign in to continue</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex justify-center">
            {GOOGLE_CLIENT_ID ? (
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    if (!credentialResponse.credential) {
                      setError('No credential received from Google');
                      return;
                    }
                    setLoading(true);
                    setError('');
                    try {
                      await login(credentialResponse.credential);
                    } catch (err: any) {
                      setError(err.message || 'Login failed');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  onError={() => setError('Google sign-in failed')}
                  theme="filled_black"
                  size="large"
                  width={320}
                  text="signin_with"
                />
              </GoogleOAuthProvider>
            ) : (
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await login('dev-token');
                  } catch (err: any) {
                    setError(err.message || 'Login failed');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in (Dev Mode)'}
              </button>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Sign in with your company Google account
          </p>
        </div>
      </div>
    </div>
  );
}
