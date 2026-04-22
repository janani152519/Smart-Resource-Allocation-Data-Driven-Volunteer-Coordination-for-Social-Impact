import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Shield, MapPin, Clock, ChevronLeft, Filter, Eye, X, Navigation, Users, Phone, Zap, AlertTriangle, Leaf, Activity, Search, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

type HelpRequest = {
  id: number; title: string; type: string; urgency: string;
  status: string; time: string; description: string; lat: number; lng: number;
  requester: string; phone: string; volunteer?: string; volunteerPhone?: string;
};

export default function HelpRequests() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'emergency' | 'moderate' | 'normal'>('all');
  const [selectedReq, setSelectedReq] = useState<HelpRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/requests');
      const json = await res.json();
      setData(json);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('svas_helpuser');
    const volStored = localStorage.getItem('svas_volunteer');
    if (!stored && !volStored) navigate('/');
    
    if (stored) setUser(JSON.parse(stored));
    else if (volStored) setUser(JSON.parse(volStored));

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const filtered = data
    .filter(r => {
      if (filter === 'all') return true;
      if (filter === 'emergency') return r.urgency === 'critical' || r.urgency === 'emergency';
      if (filter === 'moderate') return r.urgency === 'high' || r.urgency === 'moderate';
      if (filter === 'normal') return r.urgency === 'medium' || r.urgency === 'normal';
      return r.urgency === filter;
    })
    .filter(r => !searchQuery || r.title?.toLowerCase().includes(searchQuery.toLowerCase()) || r.type?.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(r => !user?.phone || r.contact?.includes(user.phone) || r.contact?.includes(user.name));

  const urgencyConfig: any = {
    critical: { bg: 'bg-emergency/10', text: 'text-emergency', border: 'border-emergency/30', dot: 'bg-emergency', label: '🔴 Critical', icon: <Zap className="w-4 h-4" /> },
    emergency: { bg: 'bg-emergency/10', text: 'text-emergency', border: 'border-emergency/30', dot: 'bg-emergency', label: '🔴 Emergency', icon: <Zap className="w-4 h-4" /> },
    high: { bg: 'bg-moderate/10', text: 'text-moderate', border: 'border-moderate/30', dot: 'bg-moderate', label: '🟡 High', icon: <AlertTriangle className="w-4 h-4" /> },
    moderate: { bg: 'bg-moderate/10', text: 'text-moderate', border: 'border-moderate/30', dot: 'bg-moderate', label: '🟡 Moderate', icon: <AlertTriangle className="w-4 h-4" /> },
    medium: { bg: 'bg-normal/10', text: 'text-normal', border: 'border-normal/30', dot: 'bg-normal', label: '🟢 Medium', icon: <Leaf className="w-4 h-4" /> },
    normal: { bg: 'bg-normal/10', text: 'text-normal', border: 'border-normal/30', dot: 'bg-normal', label: '🟢 Normal', icon: <Leaf className="w-4 h-4" /> },
  };

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    dispatched: { bg: 'bg-emergency/10', text: 'text-emergency', label: '🚨 Dispatched' },
    matched: { bg: 'bg-moderate/10', text: 'text-moderate', label: '✅ Matched' },
    pending: { bg: 'bg-white/5', text: 'text-muted-foreground', label: '⏳ Pending' },
    completed: { bg: 'bg-normal/10', text: 'text-normal', label: '✔️ Completed' },
  };

  return (
    <div className="min-h-screen bg-background data-grid pb-20">
      {/* Premium Navbar */}
      <nav className="px-6 py-4 glass-effect sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-black uppercase tracking-tighter text-foreground">Mission History</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search mission log..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/40 w-64 transition-all" />
             </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="text-5xl font-black text-foreground mb-3 tracking-tighter uppercase">Signal <span className="text-primary italic">Archive</span></h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
               <Activity className="w-4 h-4 text-primary animate-pulse" />
               Regional network logs synced. Showing {filtered.length} active signals.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 bg-[#0A192F] p-2 rounded-2xl border border-white/5 shadow-inner">
            {(['all', 'emergency', 'moderate', 'normal'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f
                  ? f === 'emergency' ? 'bg-emergency text-white' : f === 'moderate' ? 'bg-moderate text-primary-foreground' : f === 'normal' ? 'bg-normal text-primary-foreground' : 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((req, idx) => {
              const uc = urgencyConfig[req.urgency] || urgencyConfig.normal;
              const sc = statusConfig[req.status] || statusConfig.pending;
              return (
                <motion.div key={req.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.05 } }}
                  className="group relative" onClick={() => setSelectedReq(req)}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${req.urgency === 'emergency' ? 'from-emergency/5' : req.urgency === 'moderate' ? 'from-moderate/5' : 'from-normal/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px]`} />
                  
                  <div className="relative p-8 rounded-[32px] glass-effect border border-white/5 group-hover:border-white/20 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-8 cursor-pointer card-hover shadow-2xl shadow-black/20">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                         <div className={`p-2 rounded-lg ${uc.bg} ${uc.text} border border-white/5 shadow-lg`}>
                            {uc.icon}
                         </div>
                         <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${uc.text}`}>{uc.label}</span>
                         <span className="w-1 h-1 rounded-full bg-white/20" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Clock className="w-3 h-3" /> {req.time}
                         </span>
                      </div>
                      
                      <h3 className="text-2xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors uppercase">{req.title}</h3>
                      
                      <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                         <span className="flex items-center gap-2"><Navigation className="w-3.5 h-3.5 text-primary" /> Sector {req.lat.toFixed(2)}, {req.lng.toFixed(2)}</span>
                         <span className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-primary" /> {req.requester}</span>
                         <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-primary" /> {req.type} Assistance</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 self-end md:self-center">
                       <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${sc.bg} ${sc.text} border border-white/5`}>
                          {sc.label}
                       </span>
                       <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
                          <Eye className="w-5 h-5" />
                       </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-20 text-center glass-effect rounded-[40px] border border-white/5">
               <Search className="w-12 h-12 text-muted-foreground/20 mx-auto mb-6" />
               <h3 className="text-2xl font-black text-foreground mb-2 uppercase">No Signals Found</h3>
               <p className="text-muted-foreground font-medium">Try adjusting your filter parameters or search query.</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedReq && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[60] flex items-center justify-center p-4" onClick={() => setSelectedReq(null)}>
            <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
              className="bg-[#0A192F] rounded-[40px] border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${(urgencyConfig[selectedReq.urgency] || urgencyConfig.normal).bg} flex items-center justify-center border border-white/5`}>
                       {(urgencyConfig[selectedReq.urgency] || urgencyConfig.normal).icon}
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{selectedReq.title}</h2>
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary">Signal Ref ID: #{selectedReq.id}042X</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedReq(null)} className="p-3 hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6 text-muted-foreground" /></button>
                </div>

                <div className="space-y-8">
                  <div className="flex flex-wrap gap-3">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${(urgencyConfig[selectedReq.urgency] || urgencyConfig.normal).bg} ${(urgencyConfig[selectedReq.urgency] || urgencyConfig.normal).text} border border-white/5`}>{(urgencyConfig[selectedReq.urgency] || urgencyConfig.normal).label}</span>
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${(statusConfig[selectedReq.status] || statusConfig.pending).bg} ${(statusConfig[selectedReq.status] || statusConfig.pending).text} border border-white/5`}>{(statusConfig[selectedReq.status] || statusConfig.pending).label}</span>
                  </div>

                  <div className="p-8 rounded-3xl bg-white/5 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><Activity className="w-20 h-20" /></div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">Signal Payload</h4>
                    <p className="text-foreground text-sm leading-relaxed font-medium">{selectedReq.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 flex items-center gap-2"><MapPin className="w-4 h-4" /> Vector Data</h4>
                        <div className="text-sm font-bold mb-4 flex items-center gap-2">
                           <span className="text-muted-foreground">LAT:</span> {selectedReq.lat.toFixed(5)}
                           <span className="text-muted-foreground ml-2">LNG:</span> {selectedReq.lng.toFixed(5)}
                        </div>
                        <Link to="/map" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline group">
                           View Tactical Map <Navigation className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Link>
                     </div>

                     <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> Source Node</h4>
                        <div className="space-y-1">
                           <div className="text-sm font-bold text-foreground">{selectedReq.requester}</div>
                           <div className="text-xs text-muted-foreground font-mono">{selectedReq.phone}</div>
                        </div>
                     </div>
                  </div>

                  {selectedReq.volunteer && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="p-8 rounded-[32px] bg-primary/10 border border-primary/20 relative group">
                      <div className="flex items-center justify-between mb-6">
                         <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">Deployed Hero</h4>
                            <div className="text-2xl font-black text-foreground uppercase tracking-tighter">{selectedReq.volunteer}</div>
                         </div>
                         <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                            <Shield className="w-8 h-8 text-primary" />
                         </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-primary">
                         <Phone className="w-4 h-4" /> Secure Channel: {selectedReq.volunteerPhone}
                      </div>
                    </motion.div>
                  )}

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <Calendar className="w-4 h-4" /> Signal Logged {selectedReq.time}
                     </div>
                     <button onClick={() => {toast.success('Log downloaded to secure terminal.'); setSelectedReq(null);}} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Download Signal Log</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
