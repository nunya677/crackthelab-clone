import { useAuth } from '../context/AuthContext';
import { ChallengesPage } from './ChallengesPage';
import { LandingPage } from './LandingPage';

export function HomePage() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <ChallengesPage /> : <LandingPage />;
}
