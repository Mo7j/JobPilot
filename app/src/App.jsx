import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import SignInScreen from './components/SignInScreen';
import LoadingScreen from './components/LoadingScreen';

const Overview = lazy(() => import('./pages/Overview'));
const Approvals = lazy(() => import('./pages/Approvals'));
const Applications = lazy(() => import('./pages/Applications'));
const Agents = lazy(() => import('./pages/Agents'));
const Insights = lazy(() => import('./pages/Insights'));
const Tracker = lazy(() => import('./pages/Tracker'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

// On every fresh launch (cold open of the installed app or a full reload), land
// on the overview instead of wherever the last session left off. sessionStorage
// survives in-app navigation but is cleared when the app is fully closed.
function useLandOnOverview() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!sessionStorage.getItem('jp-launched')) {
      sessionStorage.setItem('jp-launched', '1');
      navigate('/', { replace: true });
    }
  }, [navigate]);
}

// The authenticated app: requires a signed-in user and wraps pages in the app
// shell (sidebar / top bar / mobile nav).
function ProtectedLayout() {
  const { user } = useAuth();
  if (!user) return <SignInScreen />;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function Shell() {
  const { loading } = useAuth();
  useLandOnOverview();

  if (loading) return <LoadingScreen />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* In-app pages, behind login, inside the app shell */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Public, site-wide 404, no app shell, works logged out */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
