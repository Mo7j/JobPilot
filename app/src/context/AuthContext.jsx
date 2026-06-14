import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithEmail, signOutUser } from '../firebase';
import { isDemoMode, allowedEmail } from '../config';
import { DEMO_USER } from '../data/demo';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(isDemoMode ? { ...DEMO_USER, isDemo: true } : null);
  const [loading, setLoading] = useState(!isDemoMode);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isDemoMode || !auth) return;
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      // Convenience check only, the real boundary is firestore.rules.
      if (allowedEmail && firebaseUser.email?.toLowerCase() !== allowedEmail) {
        setError('This account is not authorized for this deployment.');
        await signOutUser();
        setUser(null);
        setLoading(false);
        return;
      }
      setUser({ email: firebaseUser.email, name: firebaseUser.displayName || firebaseUser.email });
      setLoading(false);
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      isDemo: isDemoMode,
      async signIn(email, password) {
        setError('');
        try {
          await signInWithEmail(email, password);
        } catch (e) {
          const message =
            {
              'auth/invalid-credential': 'Wrong email or password.',
              'auth/too-many-requests': 'Too many attempts, try again in a few minutes.',
            }[e?.code] ?? 'Sign-in failed. Check your Firebase setup (docs/SETUP.md).';
          setError(message);
          throw e;
        }
      },
      async signOut() {
        if (!isDemoMode) await signOutUser();
      },
    }),
    [user, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
