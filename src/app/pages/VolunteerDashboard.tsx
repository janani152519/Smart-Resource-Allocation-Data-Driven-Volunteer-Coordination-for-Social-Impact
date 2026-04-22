import { Link, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { Star, MapPin, Clock, CheckCircle, AlertCircle, TrendingUp, Award, Shield, LogOut, Zap, AlertTriangle, Leaf, Navigation, Activity, BarChart3, LocateFixed, Lock, ArrowRight, X, Users, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const availableRequests = [
  { id: 1, type: 'Medical', location: 'T Nagar, 1.2 km away', urgency: 'emergency', time: '2 min ago', details: 'Severe respiratory distress, oxygen needed.', requester: 'Rajesh S.', phone: '+91 98765 43210', lat: 13.0418, lng: 80.2341 },
  { id: 2, type: 'Food', location: 'Adyar, 2.5 km away', urgency: 'moderate', time: '8 min ago', details: 'Flood affected family needs dry rations.', requester: 'Meena K.', phone: '+91 87654 32109', lat: 13.0067, lng: 80.2578 },
  { id: 3, type: 'Rescue', location: 'Velachery, 4.0 km away', urgency: 'emergency', time: '1 min ago', details: 'Water entering ground floor, family trapped.', requester: 'Vicky P.', phone: '+91 76543 21098', lat: 12.9796, lng: 80.2185 },
];

const performanceData = [
  { day: 'Mon', tasks: 4, hours: 6 },
  { day: 'Tue', tasks: 7, hours: 10 },
  { day: 'Wed', tasks: 5, hours: 8 },
  { day: 'Thu', tasks: 9, hours: 12 },
  { day: 'Fri', tasks: 12, hours: 15 },
  { day: 'Sat', tasks: 15, hours: 18 },
  { day: 'Sun', tasks: 8, hours: 9 },
];

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'analytics'>('available');
  const [isAvailable, setIsAvailable] = useState(true);
  const [trackingRequest, setTrackingRequest] = useState<any>(null);
  const [simulatedPos, setSimulatedPos] = useState({ lat: 13.0827, lng: 80.2707 });
  const [authError, setAuthError] = useState(false);

  const handleAcceptRequest = async (req: any) => {
    try {
      await fetch(`http://localhost:3001/api/requests/${req.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'dispatched',
          helper: user?.name || 'Authorized Volunteer',
          eta: '8 mins'
        })
      });
      
      const updatedReq = { ...req, status: 'dispatched', helper: user?.name || 'Authorized Volunteer', eta: '8 mins' };
      setTrackingRequest(updatedReq);
      localStorage.setItem('svas_active_mission_data', JSON.stringify(updatedReq));
      setActiveTab('active');
      toast.success('Request accepted! Starting live tracking...');
      
      // Simulate "Swiggy" style movement
      let step = 0;
      const interval = setInterval(() => {
        setSimulatedPos(prev => ({
          lat: prev.lat + (req.lat - prev.lat) * 0.1,
          lng: prev.lng + (req.lng - prev.lng) * 0.1,
        }));
        step++;
        if (step >= 10) clearInterval(interval);
      }, 2000);
    } catch (e) {
      toast.error('Failed to accept mission. Network error.');
    }
  };

  const handleSignalArrival = async () => {
    if (!trackingRequest) return;
    try {
      await fetch(`http://localhost:3001/api/requests/${trackingRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      toast.success('Mission Accomplished! Signal status updated to COMPLETED.');
      setTrackingRequest(null);
      localStorage.removeItem('svas_active_mission_data');
      setActiveTab('available');
    } catch (e) {
      toast.error('Failed to update signal arrival.');
    }
  };

  const handleAbortMission = () => {
    setTrackingRequest(null);
    localStorage.removeItem('svas_active_mission_data');
    setActiveTab('available');
    toast.info('Mission aborted. Signal returned to available queue.');
  };

  const handleLogout = () => { localStorage.removeItem('svas_volunteer'); navigate('/'); };

  const [requests, setRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/requests');
      setRequests(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('svas_volunteer');
    if (stored) {
       const u = JSON.parse(stored);
       setUser(u);
       setAuthError(false);
       
       // Restore active mission
       const savedMission = localStorage.getItem('svas_active_mission_data');
       if (savedMission) {
          setTrackingRequest(JSON.parse(savedMission));
          setActiveTab('active');
       }

       // Check for direct acceptance from Map
       const directMission = localStorage.getItem('svas_active_mission');
       if (directMission) {
          const mission = JSON.parse(directMission);
          handleAcceptRequest(mission);
          localStorage.removeItem('svas_active_mission');
       }
    } else {
       setAuthError(true);
    }
  }, [navigate]);

  if (authError) {
    return (
      <div className="min-h-screen bg-background data-grid flex items-center justify-center p-6">
         <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
           className="max-w-md w-full glass-effect rounded-[40px] border border-white/5 p-12 text-center shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
               <Lock className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tighter">Terminal Locked</h2>
            <p className="text-muted-foreground mb-10 leading-relaxed italic">Authorized operator credentials required to access the command center.</p>
            <div className="space-y-4">
               <Link to="/volunteer-login" className="block w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
                  Login to Terminal
               </Link>
               <Link to="/" className="block text-sm font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 group">
                  Return to Home <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
         </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background data-grid">
      {/* Premium Navbar */}
      <nav className="px-6 py-4 glass-effect sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground block leading-none tracking-tighter uppercase">SVAS Command</span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Operator: {user.name}</span>
            </div>
            <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
               <ChevronLeft className="w-4 h-4" /> Back
            </button>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/map" className="text-xs font-black uppercase text-foreground/60 hover:text-primary transition-colors flex items-center gap-2 tracking-widest">
              <LocateFixed className="w-4 h-4" /> Live Map
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-emergency transition-all">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-5xl font-black text-foreground mb-2 tracking-tighter uppercase">Command <span className="text-primary italic">Center</span></h1>
            <p className="text-muted-foreground flex items-center gap-2 font-medium">
              <Activity className="w-4 h-4 text-primary animate-pulse" /> 
              Real-time response network active in regional sectors.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#0A192F] p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button onClick={() => setIsAvailable(true)} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isAvailable ? 'bg-normal text-primary-foreground shadow-lg shadow-normal/20' : 'text-muted-foreground hover:text-foreground'}`}>Available</button>
            <button onClick={() => setIsAvailable(false)} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isAvailable ? 'bg-emergency text-white shadow-lg shadow-emergency/20' : 'text-muted-foreground hover:text-foreground'}`}>Busy</button>
          </div>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <QuickStat icon={<Zap />} label="Completed" value="128" trend="+12" color="primary" />
          <QuickStat icon={<Star />} label="Rating" value="4.92" trend="+0.2" color="moderate" />
          <QuickStat icon={<Award />} label="Network Rep" value="Lvl 12" trend="Elite" color="normal" />
          <QuickStat icon={<TrendingUp />} label="Impact Score" value="940" trend="+45" color="primary" />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-10 mb-8 border-b border-white/5">
          <TabButton active={activeTab === 'available'} onClick={() => setActiveTab('available')} label="Available Alerts" icon={<AlertTriangle className="w-4 h-4" />} count={requests.filter(r => r.status === 'pending').length} />
          <TabButton active={activeTab === 'active'} onClick={() => setActiveTab('active')} label="Active Mission" icon={<Navigation className="w-4 h-4" />} />
          <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} label="Operations Intel" icon={<BarChart3 className="w-4 h-4" />} />
        </div>

        <AnimatePresence mode="wait">
          {/* AVAILABLE ALERTS */}
          {activeTab === 'available' && (
            <motion.div key="available" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              {!isAvailable ? (
                <div className="p-20 text-center glass-effect rounded-[40px] border border-white/5">
                  <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/5">
                    <Activity className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-3xl font-black text-foreground mb-3 uppercase tracking-tighter">Network Standby</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto font-medium">Set your status to 'Available' to receive real-time emergency dispatch alerts.</p>
                </div>
              ) : (
                requests.filter(r => r.status === 'pending').map((req) => (
                  <motion.div key={req.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
                    className="p-8 rounded-[32px] glass-effect border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-primary/30 transition-all card-hover">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <span className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${req.urgency === 'critical' || req.urgency === 'emergency' ? 'bg-emergency text-white shadow-lg shadow-emergency/20' : 'bg-moderate text-primary-foreground'}`}>
                          {req.urgency} Dispatch
                        </span>
                        <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Clock className="w-4 h-4" /> {req.time || 'Just now'}</span>
                      </div>
                      <h3 className="text-3xl font-black text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors uppercase">{req.title || req.type} Signal</h3>
                      <p className="text-muted-foreground text-sm mb-6 leading-relaxed font-medium max-w-2xl">{req.description || req.details}</p>
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest"><MapPin className="w-4 h-4 text-primary" /> {req.location || `${req.lat.toFixed(2)}, ${req.lng.toFixed(2)}`}</span>
                        <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest"><Users className="w-4 h-4 text-primary" /> {req.contact || req.requester}</span>
                      </div>
                    </div>
                    <button onClick={() => handleAcceptRequest(req)} 
                       className="w-full md:w-auto px-12 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20">
                      Accept Mission
                    </button>
                  </motion.div>
                ))
              )}
              {isAvailable && requests.filter(r => r.status === 'pending').length === 0 && (
                <div className="p-20 text-center glass-effect rounded-[40px] border border-white/5">
                  <div className="w-24 h-24 rounded-3xl bg-primary/5 flex items-center justify-center mx-auto mb-8 border border-primary/10">
                    <CheckCircle className="w-12 h-12 text-primary/30" />
                  </div>
                  <h3 className="text-3xl font-black text-foreground mb-3 uppercase tracking-tighter">Sector Secured</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto font-medium">No active emergency signals detected in your current operational radius.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ACTIVE MISSION & TRACKING */}
          {activeTab === 'active' && (
            <motion.div key="active" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {trackingRequest ? (
                <div className="grid lg:grid-cols-3 gap-10">
                  {/* Left: Mission Info */}
                  <div className="lg:col-span-1 space-y-8">
                    <div className="p-10 rounded-[40px] glass-effect border border-primary/30 relative overflow-hidden shadow-2xl shadow-primary/5">
                      <div className="absolute -top-6 -right-6 p-4 opacity-5 pointer-events-none"><Navigation className="w-40 h-40" /></div>
                      <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6">Mission Parameters</h2>
                      <h3 className="text-4xl font-black text-foreground mb-4 uppercase tracking-tighter">{trackingRequest.type}</h3>
                      <p className="text-muted-foreground text-sm mb-10 font-medium leading-relaxed">{trackingRequest.details}</p>
                      
                      <div className="space-y-4 mb-10">
                        <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Vector</span>
                          <span className="text-sm font-bold">{trackingRequest.requester}</span>
                        </div>
                        <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Network ETA</span>
                          <span className="text-sm font-bold text-primary italic">~8 Minutes</span>
                        </div>
                      </div>
                      <button onClick={handleSignalArrival} className="w-full py-5 bg-normal text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-normal/20">
                        Signal Arrival
                      </button>
                      <button onClick={handleAbortMission} className="w-full py-3 mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-emergency transition-colors">
                        Abort Mission
                      </button>
                    </div>
                    
                    <div className="p-8 rounded-[32px] bg-white/5 border border-white/5">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Sector Load</h4>
                       <div className="flex gap-1 h-12 items-end">
                          {[30, 60, 40, 80, 50, 90, 40, 70].map((h, i) => <div key={i} className="flex-1 bg-primary/20 rounded-t-sm" style={{ height: `${h}%` }} />)}
                       </div>
                    </div>
                  </div>

                  {/* Right: Swiggy style Map Tracking */}
                  <div className="lg:col-span-2">
                    <div className="h-[550px] rounded-[40px] border border-white/5 glass-effect relative overflow-hidden shadow-2xl">
                      <div className="absolute inset-0 bg-[#0A192F] flex items-center justify-center">
                         <div className="text-center p-12 relative z-10">
                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8 border border-primary/20 animate-pulse">
                               <Navigation className="w-12 h-12 text-primary rotate-45" />
                            </div>
                            <p className="text-primary font-black animate-pulse uppercase tracking-[0.3em] text-sm mb-4">Live Vector Transmission Active</p>
                            <p className="text-muted-foreground text-xs font-mono mb-10">SIGNATURE: {user.name.toUpperCase()} // SECTOR: CHENNAI-04</p>
                            
                            <div className="flex gap-6 justify-center">
                               <div className="px-8 py-5 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md">
                                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Latitude</div>
                                  <div className="font-mono text-2xl text-foreground font-black tracking-tighter">{simulatedPos.lat.toFixed(5)}</div>
                                </div>
                                <div className="px-8 py-5 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md">
                                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Longitude</div>
                                  <div className="font-mono text-2xl text-foreground font-black tracking-tighter">{simulatedPos.lng.toFixed(5)}</div>
                                </div>
                            </div>
                         </div>
                         {/* Radar Circles */}
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-[300px] h-[300px] rounded-full border border-primary/5 animate-[ping_3s_linear_infinite]" />
                            <div className="w-[500px] h-[500px] rounded-full border border-primary/5 animate-[ping_4s_linear_infinite]" />
                         </div>
                      </div>
                      <div className="absolute bottom-8 left-8 right-8 p-6 glass-effect rounded-3xl border border-primary/30 flex items-center gap-6 shadow-2xl">
                        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shadow-lg">
                          <Navigation className="w-8 h-8 text-primary rotate-45" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Navigation Intel</p>
                          <p className="text-lg font-bold text-foreground tracking-tight">Intercept Anna Salai via Sector 4 Bypass</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-20 text-center glass-effect rounded-[40px] border border-white/5">
                  <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/5">
                    <Navigation className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-3xl font-black text-foreground mb-3 uppercase tracking-tighter">Mission Standby</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto font-medium">Select an active alert from the terminal to initialize deployment.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ANALYTICS & INTEL */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
               <div className="grid lg:grid-cols-2 gap-10">
                  <div className="p-10 rounded-[40px] glass-effect border border-white/5">
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter text-white">
                      <TrendingUp className="w-6 h-6 text-primary" /> Operator Velocity
                    </h3>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData}>
                          <defs>
                            <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#64FFDA" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#64FFDA" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100, 255, 218, 0.05)" />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#8892B0', fontSize: 12, fontWeight: 'bold'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#8892B0', fontSize: 12, fontWeight: 'bold'}} />
                          <Tooltip contentStyle={{ backgroundColor: '#0A192F', border: '1px solid rgba(100,255,218,0.2)', borderRadius: '20px', padding: '15px' }} />
                          <Area type="monotone" dataKey="tasks" stroke="#64FFDA" strokeWidth={4} fillOpacity={1} fill="url(#colorTasks)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-10 rounded-[40px] glass-effect border border-white/5">
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter text-white">
                      <BarChart3 className="w-6 h-6 text-primary" /> Sector Impact
                    </h3>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100, 255, 218, 0.05)" />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#8892B0', fontSize: 12, fontWeight: 'bold'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#8892B0', fontSize: 12, fontWeight: 'bold'}} />
                          <Tooltip cursor={{fill: 'rgba(100, 255, 218, 0.05)'}} contentStyle={{ backgroundColor: '#0A192F', border: 'none', borderRadius: '20px' }} />
                          <Bar dataKey="hours" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
               </div>
               
               <div className="p-10 rounded-[40px] bg-gradient-to-br from-primary/10 to-transparent border border-white/5 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Shield className="w-60 h-60" /></div>
                  <div className="relative z-10 max-w-2xl">
                     <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Global Network Resilience</h3>
                     <p className="text-muted-foreground font-medium leading-relaxed italic">"Your operational efficiency is currently in the top 2% of the regional sector. The predictive engine suggests a 15% increase in network reliability when you are active."</p>
                  </div>
                  <div className="relative z-10 p-8 rounded-3xl bg-white/5 border border-white/10 text-center min-w-[200px]">
                     <div className="text-5xl font-black text-primary mb-2 tracking-tighter">99.8%</div>
                     <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Success Index</div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function QuickStat({ icon, label, value, trend, color }: any) {
  const colors: any = {
    primary: 'text-primary bg-primary/10',
    moderate: 'text-moderate bg-moderate/10',
    normal: 'text-normal bg-normal/10'
  };

  return (
    <div className="p-8 rounded-[32px] glass-effect border border-white/5 hover:border-white/10 transition-all group card-hover">
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform shadow-lg`}>
          {icon}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${trend.includes('+') ? 'text-normal' : 'text-primary'}`}>{trend}</span>
      </div>
      <div className="text-4xl font-black text-foreground mb-1 tracking-tighter">{value}</div>
      <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">{label}</div>
    </div>
  );
}

function TabButton({ active, onClick, label, icon, count }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 pb-6 transition-all relative ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
      {icon}
      <span className="text-xs font-black uppercase tracking-[0.2em]">{label}</span>
      {count !== undefined && <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black">{count}</span>}
      {active && <motion.div layoutId="activeTabVolunteer" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(100,255,218,0.5)]" />}
    </button>
  );
}

