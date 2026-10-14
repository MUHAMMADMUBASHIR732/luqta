import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "motion/react";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ContactGateProvider } from "./components/ContactGate.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Footer from "./components/Footer.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { PageSkeleton } from "./components/states.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const ReportLost = lazy(() => import("./pages/ReportLost.jsx"));
const ReportFound = lazy(() => import("./pages/ReportFound.jsx"));
const Analyzing = lazy(() => import("./pages/Analyzing.jsx"));
const MyReports = lazy(() => import("./pages/MyReports.jsx"));
const FinderMatches = lazy(() => import("./pages/FinderMatches.jsx"));
const OwnerClaim = lazy(() => import("./pages/OwnerClaim.jsx"));
const ClaimReview = lazy(() => import("./pages/ClaimReview.jsx"));
const Handover = lazy(() => import("./pages/Handover.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Forbidden = lazy(() => import("./pages/Forbidden.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const Debug = lazy(() => import("./pages/Debug.jsx"));

const guard = (el) => <ProtectedRoute>{el}</ProtectedRoute>;

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/report/lost" element={guard(<ReportLost />)} />
        <Route path="/report/found" element={guard(<ReportFound />)} />
        <Route path="/analyzing/:id" element={guard(<Analyzing />)} />
        <Route path="/my-reports" element={guard(<MyReports />)} />
        <Route path="/found/:id/matches" element={guard(<FinderMatches />)} />
        <Route path="/claim/:claimId" element={guard(<OwnerClaim />)} />
        <Route path="/claim/:claimId/review" element={guard(<ClaimReview />)} />
        <Route path="/handover/:claimId" element={guard(<Handover />)} />
        <Route path="/profile" element={guard(<Profile />)} />
        <Route path="/forbidden" element={<Forbidden />} />
        {import.meta.env.DEV && <Route path="/_debug" element={<Debug />} />}
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AuthProvider>
          <ContactGateProvider>
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-cream">
              Skip to content
            </a>
            <div className="app-bg flex min-h-dvh flex-col">
              <Navbar />
              <div className="flex-1">
                <ErrorBoundary>
                  <Suspense fallback={<PageSkeleton />}>
                    <AnimatedRoutes />
                  </Suspense>
                </ErrorBoundary>
              </div>
              <Footer />
            </div>
            <Toaster
              position="top-center"
              toastOptions={{ style: { background: "var(--color-ink)", color: "var(--color-cream)", border: "none", fontFamily: "var(--font-sans)" } }}
            />
          </ContactGateProvider>
        </AuthProvider>
      </BrowserRouter>
    </MotionConfig>
  );
}
