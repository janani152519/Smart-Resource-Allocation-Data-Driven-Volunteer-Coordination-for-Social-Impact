import { Link } from 'react-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Activity, AlertTriangle, Users, Layers, Navigation, ChevronLeft, Globe, Zap, Target, Shield, Leaf, Heart, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'sonner';

const API = '/api';

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// SVG symbols for each marker type - Updated for Cyber Theme
const svgSymbols: Record<string, string> = {
  critical: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  high: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  medium: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 11 6a7 7 0 0 1 0 14Zm8-3 3 3M11 9v4m-2-2h4"/></svg>`,
  available: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  busy: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>`,
};

const markerColors: Record<string, string> = {
  critical: '#FF4D4D',
  high: '#FFB84D',
  medium: '#3B82F6',
  available: '#64FFDA',
  busy: '#8892B0',
};

const createPinIcon = (status: string, type: string) => {
  const color = markerColors[status] || '#3B82F6';
  const symbol = svgSymbols[status] || svgSymbols.medium;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position:relative;width:40px;height:52px;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35));">
        <svg width="40" height="52" viewBox="0 0 40 52">
          <path d="M20 50 C20 50 2 30 2 18 A18 18 0 1 1 38 18 C38 30 20 50 20 50Z" fill="${color}" stroke="#112240" stroke-width="2"/>
        </svg>
        <div style="position:absolute;top:7px;left:11px;width:18px;height:18px;display:flex;align-items:center;justify-content:center;">
          ${symbol}
        </div>
      </div>`,
    iconSize: [40, 52],
    iconAnchor: [20, 52],
    popupAnchor: [0, -52],
  });
};

const userIcon = L.divIcon({
  className: 'user-marker',
  html: `
    <div style="position:relative;width:48px;height:48px;">
      <div style="position:absolute;inset:0;border-radius:50%;background:rgba(100,255,218,0.2);animation:pulse-cyan 2s ease-out infinite;"></div>
      <div style="position:absolute;inset:10px;border-radius:50%;background:linear-gradient(135deg,#64FFDA,#3B82F6);border:3px solid #112240;box-shadow:0 0 15px rgba(100,255,218,0.5);display:flex;align-items:center;justify-content:center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A192F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>
      </div>
    </div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -24],
});

const iconMap: Record<string, (type: string) => L.DivIcon> = {
  critical: (type) => createPinIcon('critical', type),
  high: (type) => createPinIcon('high', type),
  medium: (type) => createPinIcon('medium', type),
  available: (type) => createPinIcon('available', type),
  busy: (type) => createPinIcon('busy', type),
};

type LocationItem = { id: number; type: string; lat: number; lng: number; status: string; title: string; description?: string; skill?: string };
type ZoneItem = { id: string; name: string; activity: string; requests: number; color: string; center: { lat: number; lng: number }; radiusKm: number };
type UpdateItem = { time: string; message: string; type: string };
type Stats = { critical: number; high: number; availableVolunteers: number; totalVolunteers: number };

function FlyTo({ position, zoom }: { position: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo(position, zoom, { duration: 1.5 }); }, [position, zoom, map]);
  return null;
}

function AutoLocate({ trigger, onLocated }: { trigger: boolean; onLocated: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => {
    if (!trigger) return;
    map.locate({ setView: true, maxZoom: 15, enableHighAccuracy: true });
    map.on('locationfound', (e) => {
       onLocated(e.latlng.lat, e.latlng.lng);
       toast.success('Vector Locked. Your sector identified.');
    });
    map.on('locationerror', () => {
       toast.error('Gps Signal Lost. Using default coordinates.');
    });
  }, [map, trigger, onLocated]);
  return null;
}

export default function MapView() {
  const [selectedLayer, setSelectedLayer] = useState<'all' | 'requests' | 'volunteers' | 'heatmap'>('all');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([13.0827, 80.2707]);
  const [mapZoom, setMapZoom] = useState(13);

  const [requests, setRequests] = useState<LocationItem[]>([]);
  const [volunteers, setVolunteers] = useState<LocationItem[]>([]);
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [stats, setStats] = useState<Stats>({ critical: 0, high: 0, availableVolunteers: 0, totalVolunteers: 0 });
  const seeded = useRef(false);

  const fetchMapData = useCallback(async () => {
    try {
      const res = await fetch(`${API}/map-data`);
      const data = await res.json();
      setRequests(data.requests || []);
      setVolunteers(data.volunteers || []);
      setZones(data.zones || []);
      setStats(data.stats || { critical: 0, high: 0, availableVolunteers: 0, totalVolunteers: 0 });
    } catch (e) { console.error('Failed to fetch map data', e); }
  }, []);

  const fetchUpdates = useCallback(async () => {
    try {
      const res = await fetch(`${API}/updates`);
      setUpdates(await res.json());
    } catch (e) { console.error('Failed to fetch updates', e); }
  }, []);

  const seedAndFetch = useCallback(async (lat: number, lng: number) => {
    if (seeded.current) return;
    seeded.current = true;
    try {
      await fetch(`${API}/seed`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lat, lng }) });
    } catch (e) { console.error('Seed failed', e); }
    await fetchMapData();
    await fetchUpdates();
  }, [fetchMapData, fetchUpdates]);

  useEffect(() => { fetchMapData(); fetchUpdates(); }, [fetchMapData, fetchUpdates]);

  const handleAutoLocated = useCallback((lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    setMapCenter([lat, lng]);
    setMapZoom(15);
    setIsLocating(false);
    seedAndFetch(lat, lng);
  }, [seedAndFetch]);

  const allLocations = [...requests, ...volunteers];
  const filtered = allLocations.filter((l) => {
    if (selectedLayer === 'requests') return l.type === 'request';
    if (selectedLayer === 'volunteers') return l.type === 'volunteer';
    return true;
  });

  return (
    <div className="min-h-screen bg-background data-grid flex flex-col">
      <nav className="px-6 py-4 glass-effect z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 group">
              <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                 <Shield className="w-4 h-4 text-primary" />
              </div>
              <span className="text-lg font-black text-foreground uppercase tracking-tighter">Tactical Terminal</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-4 py-1.5 rounded-full bg-emergency/10 border border-emergency/30 flex items-center gap-2 animate-pulse">
                <Activity className="w-3 h-3 text-emergency" />
                <span className="text-[10px] font-black text-emergency uppercase tracking-widest">Network Alert: {stats.critical} Critical</span>
             </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-96 bg-[#0A192F]/80 backdrop-blur-2xl border-r border-white/5 flex flex-col overflow-hidden">
          <div className="p-8 overflow-y-auto space-y-10">
            <div>
              <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6">Navigation Parameters</h2>
              <button onClick={() => setIsLocating(true)} disabled={isLocating}
                className="w-full py-5 glass-effect border border-primary/30 rounded-2xl flex items-center justify-center gap-3 group hover:bg-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/5">
                <Target className={`w-5 h-5 text-primary ${isLocating ? 'animate-spin' : ''}`} />
                <span className="text-xs font-black uppercase tracking-widest">Identify My Sector (GPS)</span>
              </button>
            </div>

            {/* Layer Selection */}
            <div>
               <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Display Layers</h3>
               <div className="grid grid-cols-2 gap-4">
                  {([
                    { value: 'all', label: 'Universal', icon: <Globe className="w-5 h-5" /> },
                    { value: 'requests', label: 'Hazards', icon: <AlertTriangle className="w-5 h-5" /> },
                    { value: 'volunteers', label: 'Responders', icon: <Users className="w-5 h-5" /> },
                    { value: 'heatmap', label: 'Heatmap', icon: <Zap className="w-5 h-5" /> },
                  ] as const).map((layer) => (
                    <button key={layer.value} onClick={() => setSelectedLayer(layer.value)}
                      className={`p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all ${selectedLayer === layer.value ? 'bg-primary/10 border-primary/50 text-primary shadow-xl shadow-primary/10' : 'bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10'}`}>
                      {layer.icon}
                      <span className="text-[10px] font-black uppercase tracking-widest">{layer.label}</span>
                    </button>
                  ))}
               </div>
            </div>

            {/* Regional Status Feed */}
            <div>
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Regional Status Log</h3>
              <div className="space-y-4">
                {zones.map((zone) => (
                  <motion.button key={zone.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    onClick={() => { setSelectedZone(zone.id); setMapCenter([zone.center.lat, zone.center.lng]); setMapZoom(15); }}
                    className={`w-full p-6 rounded-3xl glass-effect border transition-all relative overflow-hidden group ${selectedZone === zone.id ? 'border-primary/50 bg-primary/5' : 'border-white/5 hover:border-white/20'}`}>
                    <div className={`absolute top-0 left-0 w-1 h-full ${zone.activity === 'critical' ? 'bg-emergency' : 'bg-moderate'}`} />
                    <div className="flex justify-between items-start mb-3">
                      <div>
                         <span className="text-sm font-black text-foreground uppercase tracking-tight block mb-1">{zone.name}</span>
                         <div className="flex items-center gap-2">
                            {zone.activity === 'critical' ? <AlertCircle className="w-3.5 h-3.5 text-emergency" /> : <Activity className="w-3.5 h-3.5 text-moderate" />}
                            <span className={`text-[10px] font-black uppercase tracking-widest ${zone.activity === 'critical' ? 'text-emergency' : 'text-moderate'}`}>{zone.activity} Load</span>
                         </div>
                      </div>
                      <div className="text-right">
                         <span className="text-xl font-black text-foreground tracking-tighter">{zone.requests}</span>
                         <span className="text-[8px] font-black uppercase block text-muted-foreground tracking-widest">Active Nodes</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1.5 mt-4">
                       {[...Array(10)].map((_, i) => (
                         <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i < (zone.requests / 10) ? (zone.activity === 'critical' ? 'bg-emergency' : 'bg-primary') : 'bg-white/5'}`} />
                       ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Map View */}
        <main className="flex-1 relative">
           <MapContainer center={mapCenter} zoom={mapZoom} style={{ width: '100%', height: '100%', background: '#0A192F' }} zoomControl={false}>
              <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <AutoLocate trigger={isLocating} onLocated={handleAutoLocated} />
              <FlyTo position={mapCenter} zoom={mapZoom} />

              {/* Heatmap Clusters */}
              {selectedLayer === 'heatmap' && zones.map((z) => (
                <Circle key={`zone-${z.id}`} center={[z.center.lat, z.center.lng]} radius={z.radiusKm * 1000}
                  pathOptions={{ color: z.color, fillColor: z.color, fillOpacity: 0.15, weight: 1, dashArray: '5, 10' }} />
              ))}

              {/* Markers with specific icons for Helpers/Seekers */}
              {filtered.map((loc) => {
                const iconFn = iconMap[loc.status] || iconMap['medium'];
                return (
                  <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={iconFn(loc.type)}>
                    <Popup className="premium-popup">
                      <div className="p-3 bg-[#0A192F] text-white border border-white/10 rounded-2xl min-w-[200px]">
                        <div className="flex items-center gap-2 mb-3">
                           <div className={`p-1.5 rounded-lg ${loc.type === 'request' ? 'bg-emergency/20 text-emergency' : 'bg-primary/20 text-primary'}`}>
                              {loc.type === 'request' ? <AlertTriangle className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                           </div>
                           <h4 className="font-black uppercase tracking-tight text-sm">{loc.title}</h4>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-3">{loc.status} Mode</p>
                        <button 
                           onClick={() => {
                              localStorage.setItem('svas_active_mission', JSON.stringify(loc));
                              toast.success('Mission Accepted! Redirecting to Command Center...');
                              setTimeout(() => navigate('/volunteer'), 1500);
                           }}
                           className="w-full py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20">
                           Accept Help
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* User Position */}
              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                  <Popup>
                     <div className="p-2 text-slate-900 font-black uppercase text-xs">Origin Vector: Your Location</div>
                  </Popup>
                </Marker>
              )}
           </MapContainer>

           {/* Floating Stats */}
           <div className="absolute top-8 right-8 flex gap-4 pointer-events-none">
              <div className="glass-effect p-6 rounded-3xl border border-white/5 flex flex-col items-center min-w-[100px] shadow-2xl">
                 <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Response</span>
                 <span className="text-2xl font-black text-foreground tracking-tighter">8.4m</span>
              </div>
              <div className="glass-effect p-6 rounded-3xl border border-white/5 flex flex-col items-center min-w-[100px] shadow-2xl">
                 <span className="text-[10px] font-black text-normal uppercase tracking-[0.2em] mb-2">Capacity</span>
                 <span className="text-2xl font-black text-foreground tracking-tighter">94%</span>
              </div>
           </div>

           {/* Map Controls */}
           <div className="absolute bottom-8 right-8 flex flex-col gap-3">
              <button onClick={() => setMapZoom(prev => prev + 1)} className="w-14 h-14 glass-effect rounded-2xl border border-white/10 flex items-center justify-center font-black text-2xl hover:bg-primary hover:text-primary-foreground transition-all shadow-2xl">+</button>
              <button onClick={() => setMapZoom(prev => prev - 1)} className="w-14 h-14 glass-effect rounded-2xl border border-white/10 flex items-center justify-center font-black text-2xl hover:bg-primary hover:text-primary-foreground transition-all shadow-2xl">-</button>
           </div>
        </main>
      </div>
    </div>
  );
}
