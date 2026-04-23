import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
// Dev login is kept available until real auth is configured.
// Set VITE_DISABLE_DEV_LOGIN=true on a deploy to hide the button.
const DEV_LOGIN_ENABLED = import.meta.env.VITE_DISABLE_DEV_LOGIN !== 'true';

export default function Login() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const devLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await login('dev-token');
    } catch (err: any) {
      setError(err.message || 'Dev login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm mx-auto px-6">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg mb-4">
            OP
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Outpilot</h1>
          <p className="text-muted-foreground text-sm mt-1.5 text-center">
            AI-powered B2B outreach automation
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-7">
          <h2 className="text-[15px] font-semibold text-foreground mb-5">Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Dev Mode Login — always visible in development */}
            {DEV_LOGIN_ENABLED && (
              <div className="space-y-2">
                <button
                  onClick={devLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <span className="text-base">⚡</span>
                  )}
                  {loading ? 'Signing in...' : 'Continue as Dev User'}
                </button>
                <p className="text-[11px] text-muted-foreground text-center">
                  Development mode — bypasses authentication
                </p>
              </div>
            )}

            {/* Divider — shown when both options are available */}
            {DEV_LOGIN_ENABLED && GOOGLE_CLIENT_ID && (
              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-3 text-xs text-muted-foreground">or</span>
                </div>
              </div>
            )}

            {/* Google Login */}
            {GOOGLE_CLIENT_ID && (
              <div className="flex justify-center">
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
                    theme="outline"
                    size="large"
                    width={288}
                    text="signin_with"
                  />
                </GoogleOAuthProvider>
              </div>
            )}

            {/* No auth configured at all */}
            {!DEV_LOGIN_ENABLED && !GOOGLE_CLIENT_ID && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Authentication is not configured.
              </p>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground/70 text-center mt-6 pt-5 border-t border-border">
            Production authentication is being configured.<br />
            Use dev access for early preview.
          </p>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-5">
          © {new Date().getFullYear()} Outpilot. All rights reserved.
        </p>
      </div>
    </div>
  );
}
