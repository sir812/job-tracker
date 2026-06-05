import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BriefcaseBusiness, ArrowRight, Bot, BarChart3, Globe } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, type: "spring" }}
    className="relative group p-1 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 dark:from-neutral-800 dark:to-neutral-900"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
    <div className="relative h-full bg-white dark:bg-black rounded-xl p-6 sm:p-8 flex flex-col gap-4 border border-slate-100 dark:border-neutral-800 transition-all duration-300">
      <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-black dark:text-white mb-2">{title}</h3>
        <p className="text-black dark:text-white leading-relaxed text-sm">
          {description}
        </p>
      </div>
    </div>
  </motion.div>
);

export const Landing: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  if (token) return null; // Prevent flicker while redirecting

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      {/* Navigation */}
      <nav className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BriefcaseBusiness className="w-8 h-8 text-cyan-500" />
          <span className="text-2xl font-black tracking-tight text-black dark:text-white">
            Job<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Tracker</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/auth/login" className="text-sm font-semibold text-black hover:text-black dark:text-white dark:hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/auth/register">
            <Button variant="primary" size="sm" className="px-5 shadow-lg shadow-cyan-500/25">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-sm font-medium text-black dark:text-white mb-8 select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            The Ultimate Career Hub
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-black dark:text-white mb-6 leading-tight">
            Manage your tech job hunt with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              AI-Powered Precision.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-black dark:text-white mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop losing track of your applications. Discover real remote opportunities, prepare with our AI coach, and land your dream job faster than ever.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth/register" className="w-full sm:w-auto">
              <Button size="lg" icon={<ArrowRight className="w-5 h-5" />} className="w-full text-base px-8 shadow-xl shadow-cyan-500/20 group">
                Start Tracking Free
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Floating Mockup/Visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="w-full max-w-5xl mt-24 relative rounded-2xl p-2 bg-gradient-to-b from-slate-200 to-transparent dark:from-neutral-800 dark:to-transparent"
        >
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
          <div className="w-full h-48 md:h-[400px] bg-slate-100 dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-neutral-900 overflow-hidden relative flex items-center justify-center shadow-2xl">
            {/* Abstract visual inside the mockup */}
            <div className="absolute w-full h-full opacity-30 dark:opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            <div className="flex flex-col items-center gap-4 select-none z-10">
               <BriefcaseBusiness className="w-16 h-16 text-black dark:text-white" />
               <p className="text-black dark:text-black font-bold tracking-widest uppercase">JobTracker Dashboard View</p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 bg-slate-50 dark:bg-black py-32 border-t border-slate-100 dark:border-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-black dark:text-white tracking-tight mb-4">
              Everything you need to <span className="text-cyan-500">get hired</span>.
            </h2>
            <p className="text-black dark:text-white text-lg max-w-2xl mx-auto">
              Our tools are designed specifically for software engineers and tech professionals navigating modern hiring pipelines.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Globe}
              title="Real Remote Jobs"
              description="Browse and save actual job listings aggregated from major sites directly into your Kanban board."
              delay={0.1}
            />
            <FeatureCard
              icon={BarChart3}
              title="Visual Kanban Pipeline"
              description="Drag and drop your applications through different stages. Never miss an interview followup again."
              delay={0.2}
            />
            <FeatureCard
              icon={Bot}
              title="AI Interview Coach"
              description="Practice behavioral and technical questions with our specialized AI tailored to your target roles."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-neutral-900 py-12 relative z-10 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
             <BriefcaseBusiness className="w-5 h-5 text-cyan-500" />
             <span className="font-bold text-black dark:text-white">JobTracker</span>
          </div>
          <p className="text-sm text-black dark:text-white">
            © {new Date().getFullYear()} JobTracker. Built for professionals.
          </p>
        </div>
      </footer>
    </div>
  );
};
export default Landing;
