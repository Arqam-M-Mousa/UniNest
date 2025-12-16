import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/general/Home";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Marketplace from "./pages/properties/Marketplace";
import PropertyDetails from "./pages/properties/PropertyDetails";
import About from "./pages/general/About";
import Contact from "./pages/general/Contact";
import Apartments from "./pages/properties/Apartments";
import MyListings from "./pages/properties/MyListings";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Profile from "./pages/profile/Profile";
import Messages from "./pages/general/Messages";
import Admin from "./pages/admin/Admin";
import AdminManagement from "./pages/admin/AdminManagement";

// Scroll to top on route change to avoid preserving scroll between pages
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const id = window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);

    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}

// Separate inner app so we can access theme after providers
function ThemedLayout() {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col min-h-screen transition-colors bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<PropertyDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/apartments" element={<Apartments />} />
          <Route path="/apartments/:id" element={<PropertyDetails />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:id" element={<Messages />} />
          <Route path="/admin/universities" element={<Admin />} />
          <Route path="/admin/manage-admins" element={<AdminManagement />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SocketProvider>
            <Router>
              <ScrollToTop />
              <ThemedLayout />
            </Router>
          </SocketProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
