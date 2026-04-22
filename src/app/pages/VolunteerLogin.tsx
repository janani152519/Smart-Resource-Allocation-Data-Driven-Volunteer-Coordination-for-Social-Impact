import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Shield, User, Mail, Phone, Wrench, ArrowRight, ChevronLeft, Activity, Target, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function VolunteerLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', skills: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) { toast.error('Required parameters missing.'); return; }
    setIsLoading(true);
    localStorage.setItem('svas_volunteer', JSON.stringify({ ...formData, loginTime: Date.now() }));
    setTimeout(() => { toast.success('Mission authorization granted.'); navigate('/volunteer'); }, 1000);
  };

  return (
    <div className="min-h-screen bg-background data-grid flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 bg-card/40 rounded-[40px] border border-white/5 overflow-hidden backdrop-blur-2xl shadow-2xl">
        {/* Left: Decorative */}
        <div className="hidden lg:flex bg-primary/10 p-12 flex-col justify-between border-r border-white/5 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary rounded-full blur-[80px]"></div>
           </div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-12">
                 <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                    <Shield className="w-5 h-5 text-primary" />
                 </div>
                 <span className="text-xl font-black text-foreground tracking-tighter">SVAS 2.0</span>
              </div>
              <h2 className="text-5xl font-black text-foreground mb-6 leading-tight">HERO <br/><span className="text-primary uppercase">Authorization.</span></h2>
              <p className="text-muted-foreground leading-relaxed max-w-xs">Authorized personnel only. Secure terminal for disaster response coordination and live GPS navigation.</p>
           </div>

           <div className="relative z-10 p-6 rounded-3xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Missions: 1,420</span>
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-normal">Success: 99%</span>
              </div>
              <div className="flex items-end gap-1 h-12">
                 {[40,70,50,90,30,80,60,40,90,50].map((h, i) => (
                    <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} className="flex-1 bg-primary/20 rounded-t-sm" />
                 ))}
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

          <h1 className="text-3xl font-black text-foreground mb-2 tracking-tighter">VOLUNTEER SIGN-IN</h1>
          <p className="text-muted-foreground mb-10 text-sm">Verify your credentials to access the command center.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField icon={<User className="text-primary" />} label="Operator Name" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
            <InputField icon={<Mail className="text-primary" />} label="Signal (Email)" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="operator@svas.network" />
            <InputField icon={<Phone className="text-primary" />} label="Secure Line (Phone)" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 XXXX XXXX" required />
            
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Expertise / Skillset</label>
               <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary group-focus-within:text-primary transition-colors"><Wrench className="w-5 h-5" /></div>
                  <select name="skills" value={formData.skills} onChange={handleChange}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white/10 transition-all appearance-none">
                    <option value="" className="bg-[#0A192F]">Select Skillset</option>
                    <option value="medical" className="bg-[#0A192F]">Medical / First Aid</option>
                    <option value="rescue" className="bg-[#0A192F]">Search & Rescue</option>
                    <option value="logistics" className="bg-[#0A192F]">Logistics & Transport</option>
                    <option value="general" className="bg-[#0A192F]">General Support</option>
                  </select>
               </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group">
              {isLoading ? <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div> : <>Initialize Session <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" /></>}
            </button>
          </form>

          <p className="text-center text-muted-foreground mt-8 text-xs font-bold uppercase tracking-tight">
            Need assistance instead? <Link to="/help-login" className="text-blue-400 hover:underline">Requester Login →</Link>
          </p>
        </div>
      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-card max-w-md w-full p-8 rounded-3xl border border-white/10 relative">
               <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-6 h-6" /></button>
               <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Info className="text-primary" /> Operator Assistance</h3>
               <div className="space-y-4 text-sm text-muted-foreground">
                  <p>The SVAS 2.0 Command Center is currently in <span className="text-primary font-bold">Simulation Mode</span>.</p>
                  <p>To access the volunteer terminal, you simply need to provide an <span className="text-white">Operator Name</span> and <span className="text-white">Phone Number</span>. Credentials are validated locally for this demonstration.</p>
                  <p>If the session fails to initialize, please verify that your browser supports LocalStorage and is not in Private/Incognito mode.</p>
               </div>
               <button onClick={() => setShowHelp(false)} className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold uppercase tracking-widest hover:bg-white/10">Proceed to Terminal</button>
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
        <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 group-focus-within:text-primary transition-colors">{icon}</div>
        <input type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
          className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white/10 transition-all" />
      </div>
    </div>
  );
}
