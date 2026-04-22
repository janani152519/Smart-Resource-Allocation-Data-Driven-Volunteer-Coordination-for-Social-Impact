import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Shield, Zap, AlertTriangle, Leaf, Navigation, Send, X, MapPin, Clock, CheckCircle, List, LogOut, Activity, BarChart3, Users, Lock, ArrowRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type ModalType = null | 'emergency' | 'moderate' | 'normal' | 'tracking';
type HelpRequest = { id: number; type: string; title: string; urgency: string; status: string; time: string; helper?: string; eta?: string; contact?: string; description?: string };

const requestHistory = [
  { time: '10:00', intensity: 20 },
  { time: '12:00', intensity: 45 },
  { time: '14:00', intensity: 30 },
  { time: '16:00', intensity: 60 },
  { time: '18:00', intensity: 40 },
  { time: '20:00', intensity: 25 },
];

export default function HelpDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [sosSent, setSosSent] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [trackingPos, setTrackingPos] = useState({ lat: 13.0827, lng: 80.2707 });
  const [authError, setAuthError] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);

  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [issueTitle, setIssueTitle] = useState('');
  const [helpType, setHelpType] = useState('Medical');
  const [otherHelpType, setOtherHelpType] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [issueLocation, setIssueLocation] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/requests');
      const data = await res.json();
      console.log('📡 Network Signals Refreshed:', data.length);
      setRequests(data);
    } catch (e) {
      console.error('Failed to fetch requests', e);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('svas_helpuser');
    if (stored) {
       setUser(JSON.parse(stored));
       setAuthError(false);
    } else {
       setAuthError(true);
    }

    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);

    // Simulate helper movement if tracking
    if (activeModal === 'tracking') {
      const trackingInterval = setInterval(() => {
        setTrackingPos(prev => ({ lat: prev.lat + 0.0001, lng: prev.lng + 0.0001 }));
      }, 1000);
      return () => {
        clearInterval(interval);
        clearInterval(trackingInterval);
      };
    }
    
    return () => clearInterval(interval);
  }, [navigate, activeModal]);

  const handleSubmitRequest = async () => {
    if (!issueTitle && activeModal !== 'emergency') {
      toast.error('Please enter an assistance type');
      return;
    }

    // Fallback coordinates if GPS fails
    const finalLat = gpsLocation?.lat || 13.0827;
    const finalLng = gpsLocation?.lng || 80.2707;
    const finalTitle = issueTitle || (activeModal === 'emergency' ? 'EMERGENCY SOS' : 'General Assistance');

    try {
      const res = await fetch('http://localhost:3001/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitle,
          description: `${issueDesc}${issueDate ? ' | Planned for: ' + issueDate : ''}${issueLocation ? ' | Location: ' + issueLocation : ''}${!gpsLocation ? ' (GPS NOT LOCKED)' : ''}`,
          urgency: activeModal === 'emergency' ? 'critical' : activeModal === 'moderate' ? 'high' : 'medium',
          type: helpType === 'Other' ? otherHelpType : helpType,
          lat: finalLat,
          lng: finalLng,
          contact: `${user.name} (${user.phone})`
        })
      });

      if (res.ok) {
        toast.success('Request Dispatched to Network!');
        setIssueTitle('');
        setIssueDesc('');
        setIssueDate('');
        setIssueLocation('');
        setHelpType('Medical');
        setOtherHelpType('');
        setActiveModal(null);
        fetchRequests();
      }
    } catch (e) {
      toast.error('Failed to send request');
    }
  };

  const getGPS = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setIsLocating(false); },
      () => setIsLocating(false)
    );
  };

  const handleLogout = () => { localStorage.removeItem('svas_helpuser'); navigate('/'); };

  if (authError) {
    return (
      <div className="min-h-screen bg-background data-grid flex items-center justify-center p-6">
         <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
           className="max-w-md w-full glass-effect rounded-[40px] border border-white/5 p-12 text-center shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-emergency/10 border border-emergency/20 flex items-center justify-center mx-auto mb-8">
               <Lock className="w-10 h-10 text-emergency" />
            </div>
            <h2 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tighter">Access Denied</h2>
            <p className="text-muted-foreground mb-10 leading-relaxed italic">Verification required to access the predictive network signals.</p>
            <div className="space-y-4">
               <Link to="/help-login" className="block w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
                  Authenticate Now
               </Link>
               <Link to="/quick-help" className="block text-sm font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 group">
                  <Zap className="w-4 h-4 text-emergency" /> Use Emergency Bypass Mode <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
         </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background data-grid pb-12">
      {/* Premium Navbar */}
      <nav className="px-6 py-4 glass-effect sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <span className="text-xl font-bold text-foreground block leading-none">SVAS 2.0</span>
                <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Requester Portal</span>
              </div>
            </Link>
            <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
               <ChevronLeft className="w-4 h-4" /> Back
            </button>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/help-requests" className="text-sm font-medium text-foreground/70 hover:text-primary flex items-center gap-2">
               <List className="w-4 h-4" /> Global Mission History
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-foreground">Hi, {user.name}</span>
              <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-emergency transition-all">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Action Section */}
          <div className="lg:col-span-2 space-y-10">
            <header>
              <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tighter uppercase">Request <span className="text-primary italic">Assistance</span></h1>
              <p className="text-muted-foreground">Predictive network is active. Average response time in your area: <span className="text-primary font-bold">12 mins</span></p>
            </header>

            {/* 3 Large Urgency Buttons */}
            <div className="grid md:grid-cols-3 gap-6">
              <UrgencyButton urgency="emergency" icon={<Zap />} title="Emergency" desc="SOS with Auto-GPS" onClick={() => {setActiveModal('emergency'); getGPS();}} />
              <UrgencyButton urgency="moderate" icon={<AlertTriangle />} title="Moderate" desc="Quick Support" onClick={() => {setActiveModal('moderate'); getGPS();}} />
              <UrgencyButton urgency="normal" icon={<Leaf />} title="Normal" desc="Planned Request" onClick={() => {setActiveModal('normal'); getGPS();}} />
            </div>

            {/* Active Monitoring (Graphs) */}
            <div className="p-8 rounded-3xl glass-effect border border-white/5 relative overflow-hidden">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                     <Activity className="w-5 h-5 text-primary" /> Regional Network Load
                  </h3>
                  <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-1 rounded">Live Data</span>
               </div>
               <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={requestHistory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100, 255, 218, 0.05)" />
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                      <Tooltip contentStyle={{ backgroundColor: '#112240', border: 'none', borderRadius: '12px' }} />
                      <Line type="monotone" dataKey="intensity" stroke="#64FFDA" strokeWidth={3} dot={false} animationDuration={2000} />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
               <p className="text-xs text-muted-foreground mt-4 italic text-center">Network intensity indicates resource availability. Current status: <span className="text-normal font-bold">Optimized</span></p>
            </div>
          </div>

          {/* Sidebar: Active Tracking & Recent */}
          <div className="space-y-8">
             <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary uppercase tracking-widest text-xs">
                   <Navigation className="w-4 h-4" /> Accepted Missions
                </h3>
                <div className="space-y-4">
                   {requests.filter(req => req.status === 'dispatched').map(req => (
                     <motion.div key={req.id} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={`p-6 rounded-2xl glass-effect border ${req.contact?.includes(user.phone) ? 'border-primary/50 bg-primary/5' : 'border-white/5'} relative group hover:border-primary/40 transition-all`}>
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-foreground">{req.type} Assistance</h4>
                                {req.contact?.includes(user.phone) && <span className="text-[8px] font-black bg-primary text-primary-foreground px-1.5 py-0.5 rounded uppercase">My Request</span>}
                              </div>
                              <p className="text-xs text-primary font-bold">Helper: {req.helper}</p>
                           </div>
                           <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">{req.eta}</span>
                        </div>
                        <button onClick={() => { setSelectedRequest(req); setActiveModal('tracking'); }} className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]">
                           Track Live Location
                        </button>
                     </motion.div>
                   ))}
                   {requests.filter(req => req.status === 'dispatched').length === 0 && (
                     <div className="p-8 rounded-2xl border border-white/5 bg-white/5 text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No Accepted Missions</p>
                     </div>
                   )}
                </div>
             </div>

             <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-widest text-xs">
                   <List className="w-4 h-4" /> Network Signals
                </h3>
                <div className="space-y-3">
                   {requests.filter(req => req.status === 'pending').map(req => (
                    <div key={req.id} className={`p-4 rounded-xl border ${req.contact?.includes(user.phone) ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-white/5'} flex items-center gap-4 hover:bg-white/10 transition-all`}>
                        <div className="w-10 h-10 rounded-lg bg-moderate/10 flex items-center justify-center text-moderate">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-foreground">{req.title}</p>
                            {req.contact?.includes(user.phone) && <span className="text-[8px] font-black bg-primary text-primary-foreground px-1.5 py-0.5 rounded uppercase">Mine</span>}
                          </div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">{req.time}</p>
                        </div>
                    </div>
                  ))}
                  {requests.filter(req => req.status === 'pending').length === 0 && (
                    <div className="p-8 rounded-2xl border border-white/5 bg-white/5 text-center">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No Active Signals</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Modal (Swiggy Style) */}
      <AnimatePresence>
        {activeModal === 'tracking' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-2xl bg-[#0A192F] rounded-3xl border border-primary/20 overflow-hidden shadow-2xl shadow-primary/10">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-card/50">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                         <Navigation className="w-5 h-5 text-primary rotate-45" />
                      </div>
                      <div>
                         <h3 className="font-bold text-foreground uppercase tracking-tight">Tracking {selectedRequest?.helper || 'Volunteer'}</h3>
                         <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Live Navigation Active</p>
                      </div>
                   </div>
                   <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-white/5 rounded-full"><X /></button>
                </div>
                <div className="h-96 bg-slate-900 relative">
                    {/* Simulated Map Background */}
                    <div className="absolute inset-0 opacity-20 data-grid"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <Navigation className="w-12 h-12 text-primary mx-auto mb-4 animate-bounce" />
                            <p className="text-sm text-primary font-bold uppercase tracking-[0.3em]">800m Away</p>
                            <p className="text-xs text-muted-foreground mt-2 font-medium">Crossing Anna Flyover</p>
                        </div>
                    </div>
                    {/* Pulsing Target */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary/20 animate-ping"></div>
                </div>
                <div className="p-8 bg-card">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                         <Users className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold uppercase tracking-tight">{selectedRequest?.helper || 'Volunteer'}</span>
                            <span className="text-xs text-normal font-bold bg-normal/10 px-2 py-0.5 rounded">4.9 ★ Verified</span>
                         </div>
                         <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: "0%" }} animate={{ width: "70%" }} transition={{ duration: 2, ease: "easeOut" }} className="h-full bg-primary shadow-[0_0_10px_rgba(100,255,218,0.5)]"></motion.div>
                         </div>
                         <p className="text-[10px] text-muted-foreground mt-3 uppercase font-black tracking-widest">Authorized volunteer arriving in 8 minutes</p>
                      </div>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
        
        {/* Urgency Modals */}
        {(activeModal === 'emergency' || activeModal === 'moderate' || activeModal === 'normal') && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-card w-full max-w-md p-10 rounded-[40px] border border-white/10 relative shadow-2xl">
                 <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"><X className="w-6 h-6" /></button>
                 <div className="text-center mb-10">
                    <h2 className="text-3xl font-black mb-3 uppercase tracking-tighter">Dispatch {activeModal}</h2>
                    <p className="text-sm text-muted-foreground">Regional command secure link established.</p>
                 </div>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto px-2 custom-scrollbar">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Type of Assistance</label>
                       <select 
                         value={helpType}
                         onChange={(e) => setHelpType(e.target.value)}
                         className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none focus:ring-2 focus:ring-primary/30 transition-all text-white appearance-none cursor-pointer"
                       >
                         <option value="Medical" className="bg-[#0A192F]">Medical Help</option>
                         <option value="Food" className="bg-[#0A192F]">Food & Water</option>
                         <option value="Rescue" className="bg-[#0A192F]">Search & Rescue</option>
                         <option value="Shelter" className="bg-[#0A192F]">Shelter Assistance</option>
                         <option value="Transport" className="bg-[#0A192F]">Emergency Transport</option>
                         <option value="Other" className="bg-[#0A192F]">Other (Specify Below)</option>
                       </select>
                    </div>

                    {helpType === 'Other' && (
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Specify Assistance</label>
                         <input 
                           type="text" 
                           value={otherHelpType}
                           onChange={(e) => setOtherHelpType(e.target.value)}
                           placeholder="Enter assistance type..." 
                           className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none focus:ring-2 focus:ring-primary/30 transition-all text-white" 
                         />
                      </div>
                    )}

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Brief Identifier (e.g. Flood Aid)</label>
                       <input 
                         type="text" 
                         value={issueTitle}
                         onChange={(e) => setIssueTitle(e.target.value)}
                         placeholder={activeModal === 'emergency' ? 'EMERGENCY SOS (Default)' : 'e.g. Medical, Food, Rescue'} 
                         className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none focus:ring-2 focus:ring-primary/30 transition-all text-white" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Location Details</label>
                       <input 
                         type="text" 
                         value={issueLocation}
                         onChange={(e) => setIssueLocation(e.target.value)}
                         placeholder="Specific street or landmark" 
                         className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none focus:ring-2 focus:ring-primary/30 transition-all text-white" 
                       />
                    </div>
                    {(activeModal === 'normal' || activeModal === 'moderate') && (
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Required Date / Preferred Time</label>
                         <input 
                           type="datetime-local" 
                           value={issueDate}
                           onChange={(e) => setIssueDate(e.target.value)}
                           className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none focus:ring-2 focus:ring-primary/30 transition-all text-white" 
                         />
                      </div>
                    )}
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Detailed Description</label>
                       <textarea 
                         value={issueDesc}
                         onChange={(e) => setIssueDesc(e.target.value)}
                         placeholder="Provide context for volunteers..." 
                         className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none focus:ring-2 focus:ring-primary/30 transition-all text-white resize-none h-24" 
                       />
                    </div>
                    
                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <MapPin className={`w-5 h-5 ${gpsLocation ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">GPS Status: {gpsLocation ? 'LOCATED' : 'WAITING...'}</span>
                       </div>
                       {!gpsLocation && <button onClick={getGPS} className="text-[10px] font-black text-primary border-b border-primary">Get GPS</button>}
                    </div>

                    <button onClick={handleSubmitRequest} className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all sticky bottom-0">Submit Secure Dispatch</button>
                  </div>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UrgencyButton({ urgency, icon, title, desc, onClick }: any) {
  const urgencyColors: any = {
    emergency: 'from-emergency/20 border-emergency/30 text-emergency btn-emergency',
    moderate: 'from-moderate/20 border-moderate/30 text-moderate btn-moderate',
    normal: 'from-normal/20 border-normal/30 text-normal btn-normal'
  };

  return (
    <button onClick={onClick} className={`p-8 rounded-[32px] bg-gradient-to-br to-transparent border-2 ${urgencyColors[urgency]} text-left transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col h-full`}>
      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 text-3xl shadow-lg border border-white/5">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">{title}</h3>
      <p className="text-[10px] text-foreground/60 font-black uppercase tracking-widest leading-relaxed mb-6">{desc}</p>
      <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
         Select Urgency Dispatch <ArrowRight className="w-3 h-3" />
      </div>
    </button>
  );
}
