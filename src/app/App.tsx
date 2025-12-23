import { useState, useEffect } from 'react';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { ServicesView } from './components/ServicesView';
import { BookingView } from './components/BookingView';
import { ProfileView } from './components/ProfileView';
import { EmployeeView } from './components/EmployeeView';
import { AuthView } from './components/AuthView';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// Make credentials available globally for AuthView
(window as any).SUPABASE_PROJECT_ID = projectId;
(window as any).SUPABASE_ANON_KEY = publicAnonKey;

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('customer');
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/auth/v1/user`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'apikey': publicAnonKey
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAccessToken(localStorage.getItem('access_token'));
          setUserName(data.user_metadata?.name || 'User');
          setUserRole(data.user_metadata?.role || 'customer');
        }
      } catch (error) {
        console.log('No active session');
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const handleAuthSuccess = (token: string, name: string, role: string = 'customer') => {
    setAccessToken(token);
    setUserName(name);
    setUserRole(role);
    localStorage.setItem('access_token', token);
  };

  const handleSignOut = () => {
    setAccessToken(null);
    setUserName('');
    setUserRole('customer');
    localStorage.removeItem('access_token');
    setActiveTab('home');
  };

  // Show loading state while checking session
  if (isCheckingSession) {
    return (
      <div className="size-full bg-black flex items-center justify-center">
        <div className="text-amber-500">Loading...</div>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!accessToken) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  // Show employee dashboard for employees
  if (userRole === 'employee') {
    return (
      <div className="size-full bg-white text-black overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-hide" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <EmployeeView accessToken={accessToken} />
        </div>
        
        {/* Sign out button for employees */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleSignOut}
            className="px-6 py-3 bg-black text-white rounded-full shadow-lg hover:bg-zinc-800 transition-all active:scale-95"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full bg-white text-black overflow-hidden">
      {/* PWA-friendly layout */}
      <div className="h-full overflow-y-auto pb-20 scrollbar-hide" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        {activeTab === 'home' && <HomeView onNavigateToBooking={() => setActiveTab('booking')} />}
        {activeTab === 'services' && <ServicesView onNavigateToBooking={() => setActiveTab('booking')} />}
        {activeTab === 'booking' && <BookingView accessToken={accessToken} />}
        {activeTab === 'profile' && <ProfileView userName={userName} accessToken={accessToken} onSignOut={handleSignOut} />}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}