import { Link } from 'react-router';
import { AlertTriangle, Users, MapPin, Activity, TrendingUp, Clock, CheckCircle, Shield, Globe, Zap, Target, ArrowUpRight, ChevronLeft } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'motion/react';

const alertsData = [
  { id: 1, type: 'warning', message: 'Heavy rainfall predicted in Zone A', severity: 'high', time: '2 min ago' },
  { id: 2, type: 'danger', message: 'Flood risk detected in Zone B', severity: 'critical', time: '30 min ago' },
  { id: 3, type: 'info', message: 'Heat wave alert for Zone C', severity: 'medium', time: '15 min ago' },
];

const activityData = [
  { time: '00:00', requests: 12, responses: 10 },
  { time: '04:00', requests: 8, responses: 7 },
  { time: '08:00', requests: 25, responses: 23 },
  { time: '12:00', requests: 35, responses: 32 },
  { time: '16:00', requests: 28, responses: 26 },
  { time: '20:00', requests: 18, responses: 17 },
];

const zoneData = [
  { zone: 'Zone A', requests: 45, volunteers: 12 },
  { zone: 'Zone B', requests: 62, volunteers: 18 },
  { zone: 'Zone C', requests: 38, volunteers: 15 },
  { zone: 'Zone D', requests: 51, volunteers: 22 },
];

const resourceData = [
  { name: 'Medical', value: 400 },
  { name: 'Food', value: 300 },
  { name: 'Shelter', value: 300 },
  { name: 'Rescue', value: 200 },
];

const COLORS = ['#64FFDA', '#3B82F6', '#9333EA', '#F59E0B'];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background data-grid">
      {/* Premium Admin Navbar */}
      <nav className="px-6 py-4 glass-effect sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
               <Shield className="w-6 h-6 text-primary" />
            </div>
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mr-4">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <div>
               <span className="text-xl font-black text-foreground tracking-tighter">SVAS COMMAND</span>
               <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Global Network Control</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <Link to="/map" className="text-xs font-bold text-foreground/60 hover:text-primary transition-colors flex items-center gap-2">
                <Globe className="w-4 h-4" /> Live Heatmap
             </Link>
             <div className="w-px h-4 bg-white/10" />
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">AD</div>
                <span className="text-sm font-bold">Admin Panel</span>
             </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-5xl font-black text-foreground mb-3 tracking-tighter uppercase">Operations <span className="text-primary italic">Intelligence</span></h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary animate-pulse" /> 
              Monitoring 42 active sectors across the regional network.
            </p>
          </div>
          <div className="hidden md:flex gap-4">
             <button className="px-6 py-3 glass-effect rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 border border-white/5 transition-all">Generate Report</button>
             <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Emergency Broadcast</button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <StatCard icon={<Zap />} label="Active Requests" value="1,427" change="+14.2%" trend="up" />
          <StatCard icon={<Users />} label="Responders" value="842" change="+3.1%" trend="up" />
          <StatCard icon={<Clock />} label="Dispatch Time" value="4.2m" change="-12.5%" trend="down" />
          <StatCard icon={<Target />} label="Success Rate" value="98.8%" change="+0.4%" trend="up" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Main Activity Graph */}
          <div className="lg:col-span-2 p-8 rounded-3xl glass-effect border border-white/5">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Traffic Velocity</h3>
               <select className="bg-white/5 border border-white/5 text-[10px] font-bold uppercase p-2 rounded-lg text-muted-foreground outline-none">
                  <option>Last 24 Hours</option>
                  <option>Last 7 Days</option>
               </select>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64FFDA" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#64FFDA" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,255,218,0.05)" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#8892B0', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#8892B0', fontSize: 10}} />
                  <Tooltip contentStyle={{ backgroundColor: '#112240', border: 'none', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="requests" stroke="#64FFDA" strokeWidth={3} fillOpacity={1} fill="url(#colorReq)" />
                  <Area type="monotone" dataKey="responses" stroke="#3B82F6" strokeWidth={3} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side: Predictive Alerts */}
          <div className="p-8 rounded-3xl glass-effect border border-white/5 flex flex-col">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-emergency" /> Intelligence Feed</h3>
            <div className="space-y-4 flex-1">
              {alertsData.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-2xl border transition-all hover:bg-white/5 ${alert.severity === 'critical' ? 'border-emergency/30 bg-emergency/5' : 'border-white/5 bg-white/5'}`}>
                  <div className="flex justify-between items-start mb-2">
                     <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded ${alert.severity === 'critical' ? 'bg-emergency text-white' : 'bg-moderate text-primary-foreground'}`}>{alert.severity}</span>
                     <span className="text-[10px] text-muted-foreground font-bold">{alert.time}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground leading-snug">{alert.message}</p>
                </div>
              ))}
            </div>
            <button className="w-full py-4 mt-6 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">View All Alerts</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
           {/* Zone Efficiency Bar Chart */}
           <div className="p-8 rounded-3xl glass-effect border border-white/5">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2"><BarChart className="w-5 h-5 text-primary" /> Sector Load Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={zoneData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,255,218,0.05)" />
                    <XAxis dataKey="zone" axisLine={false} tickLine={false} tick={{fill: '#8892B0', fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#8892B0', fontSize: 10}} />
                    <Tooltip cursor={{fill: 'rgba(100, 255, 218, 0.05)'}} contentStyle={{ backgroundColor: '#112240', border: 'none', borderRadius: '12px' }} />
                    <Bar dataKey="requests" fill="#64FFDA" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="volunteers" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Resource Pie Chart */}
           <div className="p-8 rounded-3xl glass-effect border border-white/5">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2"><PieChart className="w-5 h-5 text-primary" /> Resource Allocation</h3>
              <div className="h-[300px] flex items-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={resourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                          {resourceData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                       </Pie>
                       <Tooltip contentStyle={{ backgroundColor: '#112240', border: 'none', borderRadius: '12px' }} />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="space-y-4 pr-8">
                    {resourceData.map((entry, index) => (
                       <div key={entry.name} className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                          <div className="text-xs">
                             <span className="block font-bold text-foreground">{entry.name}</span>
                             <span className="text-muted-foreground text-[10px]">{entry.value} Units</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change, trend }: any) {
  return (
    <div className="p-8 rounded-3xl glass-effect border border-white/5 group hover:border-primary/30 transition-all card-hover">
       <div className="flex justify-between items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-colors shadow-lg shadow-primary/5">
             {icon}
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-normal' : 'text-primary'}`}>
             {change} <ArrowUpRight className={`w-3 h-3 ${trend === 'down' ? 'rotate-90' : ''}`} />
          </div>
       </div>
       <div className="text-4xl font-black text-foreground mb-1 tracking-tighter">{value}</div>
       <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{label}</div>
    </div>
  );
}
