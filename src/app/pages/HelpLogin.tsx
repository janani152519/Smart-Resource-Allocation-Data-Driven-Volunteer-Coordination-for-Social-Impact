import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Heart, Shield, User, Phone, MapPin, ArrowRight, ChevronLeft, Activity, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function HelpLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', phone: '', location: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) { toast.error('Incomplete data signature.'); return; }
    setIsLoading(true);
    localStorage.setItem('svas_helpuser', JSON.stringify({ ...formData, loginTime: Date.now() }));
    setTimeout(() => { toast.success('Authentication successful.'); navigate('/help-dashboard'); }, 1000);
  };

  return (
    <div className="min-h-screen bg-background data-grid flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 bg-card/40 rounded-[40px] border border-white/5 overflow-hidden backdrop-blur-2xl shadow-2xl">
        {/* Left: Decorative */}
        <div className="hidden lg:flex bg-blue-600/10 p-12 flex-col justify-between border-r border-white/5 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
              <div className="absolute top-10 left-10 w-40 h-40 bg-blue-500 rounded-full blur-[80px]"></div>
           </div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-12">
                 <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <Heart className="w-5 h-5 text-blue-400" />
                 </div>
                 <span className="text-xl font-black text-foreground tracking-tighter">SVAS 2.0</span>
              </div>
              <h2 className="text-5xl font-black text-foreground mb-6 leading-tight">NEED <br/><span className="text-blue-400">ASSISTANCE?</span></h2>
              <p className="text-muted-foreground leading-relaxed max-w-xs">Securely sign in to the global predictive help network. Real-time GPS coordinate broadcasting active.</p>
           </div>

           <div className="relative z-10 p-6 rounded-3xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-4 mb-4">
                 <Activity className="w-5 h-5 text-blue-400" />
                 <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Live Network Load: Optimal</span>
              </div>
              <div className="flex gap-2">
                 {[40, 70, 30, 90, 50, 60].map((h, i) => <div key={i} className="flex-1 bg-blue-500/20 rounded-sm" style={{ height: `${h}%` }}></div>)}
              </div>
           </div>
        </div>

        {/* Right: Form */}
        <div className="p-12">
          <div className="flex justify-between items-center mb-12">
            <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={() => setShowHelp(true)} className="p-2 rounded-full hover:bg-white/5 text-muted-foreground transition-colors"><Info className="w-5 h-5" /></button>
          </div>

          <h1 className="text-3xl font-black text-foreground mb-2 tracking-tighter">REQUESTER SIGN-IN</h1>
          <p className="text-muted-foreground mb-10 text-sm">Enter identity parameters to access the portal.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField icon={<User className="text-blue-400" />} label="Identity Name" name="name" value={formData.name} onChange={handleChange} placeholder="Full Legal Name" required />
            <InputField icon={<Phone className="text-blue-400" />} label="Comm-Link (Phone)" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 XXXX XXXX" required />
            <InputField icon={<MapPin className="text-blue-400" />} label="Base Location" name="location" value={formData.location} onChange={handleChange} placeholder="Current Sector / City" />

            <button type="submit" disabled={isLoading} className="w-full py-5 bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group">
              {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Access Portal <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" /></>}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
             <p className="text-sm text-muted-foreground">Emergency? <Link to="/quick-help" className="text-emergency font-bold hover:underline">Bypass Auth Mode →</Link></p>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-card max-w-md w-full p-8 rounded-3xl border border-white/10 relative">
               <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-6 h-6" /></button>
               <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Info className="text-blue-400" /> Can't Login?</h3>
               <div className="space-y-4 text-sm text-muted-foreground">
                  <p>The SVAS 2.0 system is currently in <span className="text-primary font-bold">Simulation Mode</span>.</p>
                  <p>To access the portal, you simply need to provide a <span className="text-white">Name</span> and <span className="text-white">Phone Number</span>. No password is required in this phase.</p>
                  <p>If you are still unable to login, clear your browser's local storage and try again.</p>
               </div>
               <button onClick={() => setShowHelp(false)} className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold uppercase tracking-widest hover:bg-white/10">Understood</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputField({ icon, label, name, value, onChange, placeholder, type = 'text', required = false }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 group-focus-within:text-blue-400 transition-colors">{icon}</div>
        <input type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
          className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white/10 transition-all" />
      </div>
    </div>
  );
}

function X(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}
