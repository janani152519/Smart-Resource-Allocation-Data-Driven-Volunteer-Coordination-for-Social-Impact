import { Link } from 'react-router';
import { Shield, Zap, Activity, Globe, MapPin, TrendingUp, ChevronRight, HandHelping, Heart } from 'lucide-react';
import { motion } from 'motion/react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background data-grid overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <nav className="px-6 py-6 glass-effect sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <div>
              <span className="text-2xl font-black text-foreground tracking-tighter block leading-none">SVAS 2.0</span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-[0.3em]">Next-Gen Help Network</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/quick-help" className="px-6 py-2.5 bg-emergency text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emergency/20 flex items-center gap-2">
              <Zap className="w-4 h-4 fill-white" /> Emergency SOS
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left: Content */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Activity className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Self-Optimizing Intelligence Active</span>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-black text-foreground mb-8 leading-[0.9] tracking-tighter">
              DISPATCH <br />
              <span className="text-primary italic">RESILIENCE.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-lg leading-relaxed">
              SVAS 2.0 isn't just a platform; it's a predictive response engine. We bridge the gap between crisis and coordination using real-time GPS intelligence.
            </p>

            <div className="flex flex-wrap gap-6">
              <Link to="/quick-help" className="px-10 py-5 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest hover:bg-primary transition-all shadow-2xl shadow-primary/20">
                Get Help Now
              </Link>
              <div className="flex items-center gap-4 px-6 border-l-2 border-white/5">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                   <Globe className="w-6 h-6 text-primary" />
                </div>
                <div className="text-sm">
                   <span className="block font-bold">5,240+</span>
                   <span className="text-muted-foreground text-xs uppercase font-bold tracking-tighter">Active Nodes</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Dual Action Cards */}
          <div className="grid gap-8">
            <Link to="/volunteer-login" className="group">
              <div className="p-10 rounded-[32px] glass-effect border border-white/5 hover:border-primary/40 transition-all duration-500 relative overflow-hidden card-hover">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><HandHelping className="w-40 h-40" /></div>
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-8 group-hover:bg-primary transition-colors">
                  <HandHelping className="w-8 h-8 text-primary group-hover:text-background transition-colors" />
                </div>
                <h3 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tighter">Volunteer Portal</h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">Accept missions, track live routes, and coordinate in real-time. Join the elite response force.</p>
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                  Access Dashboard <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>

            <Link to="/help-login" className="group">
              <div className="p-10 rounded-[32px] glass-effect border border-white/5 hover:border-blue-500/40 transition-all duration-500 relative overflow-hidden card-hover">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Heart className="w-40 h-40" /></div>
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-8 group-hover:bg-blue-500 transition-colors">
                  <Heart className="w-8 h-8 text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tighter">Requester Portal</h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">Request emergency, moderate, or planned assistance. Track your helper's live location in real-time.</p>
                <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-xs">
                  Request Help <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Analytic Stats Bar */}
        <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8">
           <AnalyticStat icon={<TrendingUp />} label="Success Rate" value="99.2%" />
           <AnalyticStat icon={<Activity />} label="Network Load" value="Optimal" />
           <AnalyticStat icon={<MapPin />} label="Response Time" value="8.4m" />
           <AnalyticStat icon={<Globe />} label="Lives Saved" value="12k+" />
        </div>
      </main>

      {/* Futuristic Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="w-full h-1 bg-primary absolute top-0 left-0" style={{ animation: 'scanline 10s linear infinite' }}></div>
      </div>
    </div>
  );
}

function AnalyticStat({ icon, label, value }: any) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center text-center">
       <div className="text-primary mb-3">{icon}</div>
       <div className="text-2xl font-black text-foreground leading-none mb-1">{value}</div>
       <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{label}</div>
    </div>
  );
}
