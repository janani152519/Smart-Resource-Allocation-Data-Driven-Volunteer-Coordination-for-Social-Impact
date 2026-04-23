import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Shield, Zap, AlertTriangle, Leaf, Navigation, Send, X, MapPin, CheckCircle, ChevronLeft, UserPlus, LogIn, Activity, Globe, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

type ModalType = null | 'emergency' | 'moderate' | 'normal' | 'signup';

export default function QuickHelp() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [sosSent, setSosSent] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Forms
  const [emergForm, setEmergForm] = useState({ name: '', phone: '', note: '' });
  const [modForm, setModForm] = useState({ name: '', phone: '', issue: '', description: '' });
  const [normForm, setNormForm] = useState({ name: '', phone: '', plan: '', details: '', date: '' });
  const [signupForm, setSignupForm] = useState({ name: '', phone: '', email: '' });

  const getGPS = (silent = false) => {
    if (!navigator.geolocation) { toast.error('GPS not supported'); return; }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
        if (!silent) toast.success('Location Vector Locked');
      },
      () => {
        setIsLocating(false);
        if (!silent) toast.error('GPS Signal Weak');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSOS = async () => {
    if (!emergForm.name || !emergForm.phone) { toast.error('Identity Signature Required'); return; }
    if (!gpsLocation) { getGPS(); toast.info('Establishing GPS Link...'); return; }

    try {
      await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'EMERGENCY SOS',
          description: emergForm.note || 'Immediate assistance required.',
          urgency: 'critical',
          lat: gpsLocation.lat,
          lng: gpsLocation.lng,
          contact: `${emergForm.name} (${emergForm.phone})`
        })
      });
      setSosSent(true);
      toast.success('🚨 EMERGENCY DISPATCH ACTIVE!');
      setTimeout(() => { setSosSent(false); setActiveModal(null); }, 4000);
    } catch (e) {
      toast.error('Network failure. SOS signal not sent.');
    }
  };

  const handleSubmit = async (type: string) => {
    const form: any = type === 'moderate' ? modForm : normForm;
    if (!form.name || !form.phone) { toast.error('Missing Required Fields'); return; }
    if (!gpsLocation) { getGPS(); toast.info('Awaiting GPS Lock...'); return; }

    try {
      await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: type === 'moderate' ? modForm.issue : normForm.plan,
          description: type === 'moderate' ? modForm.description : normForm.details,
          urgency: type === 'moderate' ? 'high' : 'medium',
          lat: gpsLocation.lat,
          lng: gpsLocation.lng,
          contact: `${form.name} (${form.phone})`
        })
      });
      toast.success(`${type.toUpperCase()} Request Dispatched to Network`);
      setActiveModal(null);
    } catch (e) {
      toast.error('Dispatch failed. Retrying sync...');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.name || !signupForm.phone) { toast.error('Missing Required Fields'); return; }
    localStorage.setItem('svas_helpuser', JSON.stringify({ ...signupForm, loginTime: Date.now() }));
    toast.success('Identity Registered');
    setActiveModal(null);
    navigate('/help-dashboard');
  };

  return (
    <div className="min-h-screen bg-background data-grid">
      {/* Premium Navbar */}
      <nav className="px-6 py-4 glass-effect sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emergency/20 border border-emergency/30 flex items-center justify-center shadow-lg shadow-emergency/20">
              <Zap className="w-5 h-5 text-emergency" />
            </div>
            <div>
              <span className="text-xl font-black text-foreground block leading-none tracking-tighter">SVAS BYPASS</span>
              <span className="text-[10px] text-emergency font-black uppercase tracking-widest">Urgency Channel Active</span>
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/help-login" className="text-[10px] font-black uppercase tracking-widest text-foreground/60 hover:text-primary transition-colors flex items-center gap-2">
              <LogIn className="w-4 h-4" /> Secure Login
            </Link>
            <button onClick={() => window.history.back()} className="text-[10px] font-black uppercase tracking-widest text-foreground/60 hover:text-foreground flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emergency/10 border border-emergency/20 mb-8 shadow-inner">
            <Activity className="w-4 h-4 text-emergency animate-pulse" />
            <span className="text-[10px] font-black text-emergency uppercase tracking-[0.2em]">Zero-Latency Dispatch</span>
          </div>
          <h1 className="text-7xl font-black text-foreground mb-6 tracking-tighter uppercase leading-[0.9]">Request <span className="text-emergency italic">Signal.</span></h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium">Bypass authentication for immediate network response. Choose your tactical urgency.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10 mb-20">
          <UrgencyCard
            urgency="emergency"
            icon={<Zap />}
            title="Red"
            desc="Emergency SOS: Instant GPS Lock & Dispatch"
            onClick={() => { setActiveModal('emergency'); getGPS(true); }}
          />
          <UrgencyCard
            urgency="moderate"
            icon={<AlertTriangle />}
            title="Yellow"
            desc="Moderate Help: Custom Issue & Location Select"
            onClick={() => { setActiveModal('moderate'); }}
          />
          <UrgencyCard
            urgency="normal"
            icon={<Leaf />}
            title="Green"
            desc="Planned Support: Detailed Resources & Scheduling"
            onClick={() => { setActiveModal('normal'); }}
          />
        </div>

        {/* Tactical Signup */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-1 rounded-[40px] bg-gradient-to-br from-emergency via-red-500 to-primary shadow-2xl shadow-emergency/20">
          <div className="bg-[#0A192F] rounded-[39px] p-12 flex flex-col md:flex-row items-center justify-between gap-10 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none rotate-12"><Shield className="w-64 h-64" /></div>
            <div className="relative z-10">
              <h3 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">Persistent Signature</h3>
              <p className="text-muted-foreground text-sm max-w-sm leading-relaxed font-medium">Register your identity to enable mission tracking, two-way comms, and verified responder matching.</p>
            </div>
            <button onClick={() => setActiveModal('signup')}
              className="relative z-10 px-12 py-6 bg-emergency text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-emergency/40 flex items-center gap-3 group">
              <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Register Now
            </button>
          </div>
        </motion.div>
      </div>

      {/* MODAL SYSTEM */}
      <AnimatePresence mode="wait">
        {activeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-6" onClick={() => setActiveModal(null)}>
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
              className="bg-[#0A192F] rounded-[48px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] max-w-xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>

              <div className="p-12">
                {/* Emergency (RED) */}
                {activeModal === 'emergency' && (
                  <div className="text-center">
                    {sosSent ? (
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="py-20">
                        <div className="w-24 h-24 rounded-full bg-emergency/20 flex items-center justify-center mx-auto mb-8 border border-emergency/40 shadow-[0_0_30px_rgba(255,77,77,0.3)]"><CheckCircle className="w-12 h-12 text-emergency" /></div>
                        <h2 className="text-4xl font-black text-emergency mb-4 uppercase tracking-tighter">SOS LOCKED</h2>
                        <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Dispatch unit has intercepted your signal.</p>
                      </motion.div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-10">
                          <div className="text-left">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Emergency SOS</h2>
                            <p className="text-[10px] font-black text-emergency uppercase tracking-widest">Protocol: Direct Dispatch</p>
                          </div>
                          <button onClick={() => setActiveModal(null)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="space-y-6 text-left mb-10">
                          <InputField label="Operator Name" value={emergForm.name} onChange={(e: any) => setEmergForm({ ...emergForm, name: e.target.value })} placeholder="Required" />
                          <InputField label="Comm-Link (Phone)" value={emergForm.phone} onChange={(e: any) => setEmergForm({ ...emergForm, phone: e.target.value })} placeholder="Required" />
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Tactical Note (Optional)</label>
                            <textarea value={emergForm.note} onChange={(e: any) => setEmergForm({ ...emergForm, note: e.target.value })} placeholder="Nature of emergency..."
                              className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:ring-1 focus:ring-emergency/50 transition-all resize-none h-32 text-white" />
                          </div>
                        </div>
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 mb-10 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emergency/10 flex items-center justify-center border border-emergency/20">
                              <Navigation className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''} ${gpsLocation ? 'text-emergency' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="text-left">
                              <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">GPS Signature</p>
                              <p className="text-xs font-mono font-bold text-white tracking-tighter">{gpsLocation ? `${gpsLocation.lat.toFixed(5)}, ${gpsLocation.lng.toFixed(5)}` : 'AWAITING LOCK...'}</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => getGPS()} className="px-4 py-2 rounded-lg bg-emergency/10 text-[10px] font-black uppercase tracking-widest text-emergency border border-emergency/20 hover:bg-emergency/20 transition-all">Re-Lock</button>
                        </div>
                        <button onClick={handleSOS} className="w-full py-6 bg-emergency text-white rounded-3xl font-black text-lg uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-emergency/40 btn-emergency">
                          Dispatch SOS Now
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Moderate (YELLOW) */}
                {activeModal === 'moderate' && (
                  <div>
                    <div className="flex justify-between items-start mb-10">
                      <div className="text-left">
                        <h2 className="text-3xl font-black text-moderate uppercase tracking-tighter mb-2">Moderate Help</h2>
                        <p className="text-[10px] font-black text-moderate uppercase tracking-widest">Protocol: Custom Dispatch</p>
                      </div>
                      <button onClick={() => setActiveModal(null)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"><X className="w-6 h-6" /></button>
                    </div>
                    <div className="space-y-6 mb-10">
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Name" value={modForm.name} onChange={(e: any) => setModForm({ ...modForm, name: e.target.value })} />
                        <InputField label="Phone" value={modForm.phone} onChange={(e: any) => setModForm({ ...modForm, phone: e.target.value })} />
                      </div>
                      <InputField label="Issue Name" value={modForm.issue} onChange={(e: any) => setModForm({ ...modForm, issue: e.target.value })} placeholder="e.g. Food Shortage" />
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Description</label>
                        <textarea value={modForm.description} onChange={(e: any) => setModForm({ ...modForm, description: e.target.value })} placeholder="Write details here..."
                          className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:ring-1 focus:ring-moderate/50 transition-all resize-none h-32 text-white" />
                      </div>
                      <button onClick={() => getGPS()} className="w-full py-5 rounded-2xl border-2 border-moderate/30 bg-moderate/5 flex items-center justify-center gap-3 group hover:bg-moderate/10 transition-all">
                        <MapPin className="w-5 h-5 text-moderate group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest text-moderate">{gpsLocation ? 'Location Selected' : 'Select Location via GPS'}</span>
                      </button>
                    </div>
                    <button onClick={() => handleSubmit('moderate')} className="w-full py-6 bg-moderate text-primary-foreground rounded-3xl font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-moderate/20">
                      Execute Dispatch
                    </button>
                  </div>
                )}

                {/* Normal (GREEN) */}
                {activeModal === 'normal' && (
                  <div>
                    <div className="flex justify-between items-start mb-10">
                      <div className="text-left">
                        <h2 className="text-3xl font-black text-normal uppercase tracking-tighter mb-2">Planned Help</h2>
                        <p className="text-[10px] font-black text-normal uppercase tracking-widest">Protocol: Tactical Planning</p>
                      </div>
                      <button onClick={() => setActiveModal(null)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"><X className="w-6 h-6" /></button>
                    </div>
                    <div className="space-y-6 mb-10">
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Name" value={normForm.name} onChange={(e: any) => setNormForm({ ...normForm, name: e.target.value })} />
                        <InputField label="Phone" value={normForm.phone} onChange={(e: any) => setNormForm({ ...normForm, phone: e.target.value })} />
                      </div>
                      <InputField label="Requirement Title" value={normForm.plan} onChange={(e: any) => setNormForm({ ...normForm, plan: e.target.value })} placeholder="Plan everything here..." />
                      <InputField label="Preferred Date" type="date" value={normForm.date} onChange={(e: any) => setNormForm({ ...normForm, date: e.target.value })} />
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">More Info & Schedule</label>
                        <textarea value={normForm.details} onChange={(e: any) => setNormForm({ ...normForm, details: e.target.value })} placeholder="Provide full context for resource allocation..."
                          className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:ring-1 focus:ring-normal/50 transition-all resize-none h-32 text-white" />
                      </div>
                      <div className="p-5 rounded-2xl bg-normal/5 border border-normal/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-normal" />
                          <span className="text-[10px] font-black text-normal uppercase tracking-widest">GPS Location Fixed</span>
                        </div>
                        <CheckCircle className="w-4 h-4 text-normal" />
                      </div>
                    </div>
                    <button onClick={() => handleSubmit('normal')} className="w-full py-6 bg-normal text-primary-foreground rounded-3xl font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-normal/20">
                      Finalize Dispatch
                    </button>
                  </div>
                )}

                {/* SIGNUP */}
                {activeModal === 'signup' && (
                  <div>
                    <div className="flex justify-between items-center mb-10">
                      <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                        <UserPlus className="w-8 h-8 text-emergency" /> Register
                      </h2>
                      <button onClick={() => setActiveModal(null)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"><X className="w-6 h-6" /></button>
                    </div>
                    <form onSubmit={handleSignup} className="space-y-8">
                      <InputField label="Identity Name" value={signupForm.name} onChange={(e: any) => setSignupForm({ ...signupForm, name: e.target.value })} placeholder="Full Legal Name" required />
                      <InputField label="Comm-Link (Phone)" type="tel" value={signupForm.phone} onChange={(e: any) => setSignupForm({ ...signupForm, phone: e.target.value })} placeholder="+91 XXXX XXXX" required />
                      <InputField label="Email Address" type="email" value={signupForm.email} onChange={(e: any) => setSignupForm({ ...signupForm, email: e.target.value })} placeholder="optional@svas.network" />
                      <button type="submit" className="w-full py-6 bg-emergency text-white rounded-[28px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 shadow-2xl shadow-emergency/30 transition-all">
                        Lock Identity
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UrgencyCard({ urgency, icon, title, desc, onClick }: any) {
  const styles: any = {
    emergency: 'from-emergency/20 border-emergency/30 text-emergency btn-emergency',
    moderate: 'from-moderate/20 border-moderate/30 text-moderate btn-moderate shadow-moderate/10',
    normal: 'from-normal/20 border-normal/30 text-normal btn-normal shadow-normal/10'
  };

  return (
    <button onClick={onClick} className={`p-10 rounded-[48px] glass-effect border-2 ${styles[urgency]} text-left transition-all hover:scale-[1.03] active:scale-95 flex flex-col h-full shadow-2xl relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">{icon}</div>
      <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-10 text-3xl shadow-inner border border-white/5">
        {icon}
      </div>
      <h3 className="text-4xl font-black mb-3 uppercase tracking-tighter">{title}</h3>
      <p className="text-[10px] text-foreground/50 font-black uppercase tracking-[0.2em] leading-relaxed mb-10">{desc}</p>
      <div className="mt-auto flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] opacity-60 group-hover:opacity-100 transition-opacity">
        Initialize <ChevronLeft className="w-3 h-3 rotate-180" />
      </div>
    </button>
  );
}

function InputField({ label, value, onChange, placeholder, type = 'text', required = false }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-3">{label}</label>
      <input type={type} value={value} onChange={onChange} required={required} placeholder={placeholder}
        className="w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all font-medium" />
    </div>
  );
}
