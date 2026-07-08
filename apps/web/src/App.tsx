import { Routes, Route } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { Footer } from './components/Footer';
import { CursorTrail } from './components/CursorTrail';
import { MatrixRain } from './components/MatrixRain';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { ChallengeDetailPage } from './pages/ChallengeDetailPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { LearnPage } from './pages/LearnPage';
import { LessonDetailPage } from './pages/LessonDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UpgradePage } from './pages/UpgradePage';
import { TermsPage } from './pages/TermsPage';

export default function App() {
  return (
    <div className="min-h-screen">
      <MatrixRain className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-25" />
      <span
        className="animate-crt-scanline pointer-events-none fixed inset-x-0 top-0 z-0 h-24 bg-gradient-to-b from-cyan-400/0 via-cyan-400/[0.04] to-cyan-400/0"
        aria-hidden="true"
      />
      <div className="relative z-10">
        <CursorTrail />
        <NavBar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<HomePage />} />
          <Route
            path="/challenges/:slug"
            element={
              <ProtectedRoute>
                <ChallengeDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/learn/:slug" element={<LessonDetailPage />} />
          <Route
            path="/upgrade"
            element={
              <ProtectedRoute>
                <UpgradePage />
              </ProtectedRoute>
            }
          />
          <Route path="/terms" element={<TermsPage />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}
