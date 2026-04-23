import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ─── In-memory data store ──────────────────────────────────────────────────────
// Requests and volunteers are stored with lat/lng.
// On first load, the frontend sends the user's GPS location and the backend
// generates realistic data points scattered around that location.

let helpRequests = [];
let volunteers = [];
let zones = [];
let seeded = false;

// Load data from file on startup
function loadData() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      helpRequests = data.helpRequests || [];
      volunteers = data.volunteers || [];
      zones = data.zones || [];
      seeded = data.seeded || false;
      console.log('📦 Data loaded from persistent storage.');
    }
  } catch (e) {
    console.error('Error loading data:', e);
  }
}

function saveData() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify({ helpRequests, volunteers, zones, seeded }, null, 2));
  } catch (e) {
    console.error('Error saving data:', e);
  }
}

loadData();

// Helper: random offset around a center point (in degrees)
function randomNearby(center, radiusKm = 5) {
  // ~0.009 degrees ≈ 1 km
  const degPerKm = 0.009;
  const angle = Math.random() * 2 * Math.PI;
  const dist = Math.random() * radiusKm * degPerKm;
  return {
    lat: center.lat + dist * Math.sin(angle),
    lng: center.lng + dist * Math.cos(angle),
  };
}

function seedData(centerLat, centerLng) {
  const center = { lat: centerLat, lng: centerLng };

  helpRequests = [
    {
      id: 1,
      type: 'request',
      ...randomNearby(center, 3),
      status: 'pending',
      title: 'Medical Emergency',
      description: 'Person collapsed, needs immediate medical aid',
      urgency: 'critical',
      time: '2 min ago',
    },
    {
      id: 2,
      type: 'request',
      ...randomNearby(center, 4),
      status: 'pending',
      title: 'Food & Water Needed',
      description: 'Family of 5 without food for 2 days',
      urgency: 'high',
      time: '8 min ago',
    },
    {
      id: 3,
      type: 'request',
      ...randomNearby(center, 2),
      status: 'pending',
      title: 'Shelter Request',
      description: 'Elderly couple displaced, needs temporary shelter',
      urgency: 'medium',
      time: '15 min ago',
    },
    {
      id: 4,
      type: 'request',
      ...randomNearby(center, 5),
      status: 'pending',
      title: 'Flood Rescue Needed',
      description: 'People trapped on rooftop due to flooding',
      urgency: 'critical',
      time: '5 min ago',
    },
    {
      id: 5,
      type: 'request',
      ...randomNearby(center, 3),
      status: 'pending',
      title: 'Medicine Required',
      description: 'Diabetic patient needs insulin urgently',
      urgency: 'high',
      time: '12 min ago',
    },
    {
      id: 6,
      type: 'request',
      ...randomNearby(center, 6),
      status: 'pending',
      title: 'Transport Assistance',
      description: 'Pregnant woman needs ride to hospital',
      urgency: 'high',
      time: '20 min ago',
    },
    {
      id: 7,
      type: 'request',
      ...randomNearby(center, 1.5),
      status: 'pending',
      title: 'Building Collapse',
      description: 'Partial collapse, people may be trapped',
      urgency: 'critical',
      time: '1 min ago',
    },
    {
      id: 8,
      type: 'request',
      ...randomNearby(center, 4),
      status: 'pending',
      title: 'Power Outage Help',
      description: 'Hospital backup generator failing',
      urgency: 'high',
      time: '30 min ago',
    },
  ];

  volunteers = [
    {
      id: 101,
      type: 'volunteer',
      ...randomNearby(center, 2),
      status: 'available',
      title: 'Arjun Kumar',
      skill: 'Medical',
    },
    {
      id: 102,
      type: 'volunteer',
      ...randomNearby(center, 3),
      status: 'available',
      title: 'Priya Sharma',
      skill: 'Rescue',
    },
    {
      id: 103,
      type: 'volunteer',
      ...randomNearby(center, 4),
      status: 'busy',
      title: 'Rahul Verma',
      skill: 'Transport',
    },
    {
      id: 104,
      type: 'volunteer',
      ...randomNearby(center, 2.5),
      status: 'available',
      title: 'Deepa Nair',
      skill: 'Food Distribution',
    },
    {
      id: 105,
      type: 'volunteer',
      ...randomNearby(center, 5),
      status: 'available',
      title: 'Mohamed Rafi',
      skill: 'Medical',
    },
    {
      id: 106,
      type: 'volunteer',
      ...randomNearby(center, 3),
      status: 'busy',
      title: 'Kavitha Rajan',
      skill: 'Counseling',
    },
  ];

  // Create zones around the user's area
  const zoneOffsets = [
    { dx: 0.015, dy: 0.015 },
    { dx: -0.02, dy: 0.01 },
    { dx: 0.01, dy: -0.02 },
    { dx: -0.015, dy: -0.015 },
    { dx: 0.025, dy: -0.005 },
  ];

  zones = [
    {
      id: 'A',
      name: 'Zone A — North',
      activity: 'high',
      requests: 45,
      color: '#D4A373',
      center: { lat: center.lat + zoneOffsets[0].dx, lng: center.lng + zoneOffsets[0].dy },
      radiusKm: 1.5,
    },
    {
      id: 'B',
      name: 'Zone B — West',
      activity: 'critical',
      requests: 62,
      color: '#d4183d',
      center: { lat: center.lat + zoneOffsets[1].dx, lng: center.lng + zoneOffsets[1].dy },
      radiusKm: 2,
    },
    {
      id: 'C',
      name: 'Zone C — East',
      activity: 'medium',
      requests: 38,
      color: '#A67B5B',
      center: { lat: center.lat + zoneOffsets[2].dx, lng: center.lng + zoneOffsets[2].dy },
      radiusKm: 1.8,
    },
    {
      id: 'D',
      name: 'Zone D — South',
      activity: 'high',
      requests: 51,
      color: '#D4A373',
      center: { lat: center.lat + zoneOffsets[3].dx, lng: center.lng + zoneOffsets[3].dy },
      radiusKm: 1.5,
    },
    {
      id: 'E',
      name: 'Zone E — Central',
      activity: 'low',
      requests: 29,
      color: '#8B5A3C',
      center: { lat: center.lat + zoneOffsets[4].dx, lng: center.lng + zoneOffsets[4].dy },
      radiusKm: 1,
    },
  ];

  seeded = true;
  saveData();
}

// ─── API Routes ────────────────────────────────────────────────────────────────

// Seed data based on user's GPS location
app.post('/api/seed', (req, res) => {
  const { lat, lng } = req.body;
  if (lat == null || lng == null) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }
  seedData(parseFloat(lat), parseFloat(lng));
  res.json({ message: 'Data seeded around your location', requestCount: helpRequests.length, volunteerCount: volunteers.length });
});

// Get all map data (requests + volunteers + zones)
app.get('/api/map-data', (req, res) => {
  if (!seeded) {
    // Default seed at Chennai if not seeded yet
    seedData(13.0827, 80.2707);
  }
  res.json({
    requests: helpRequests,
    volunteers,
    zones,
    stats: {
      critical: helpRequests.filter((r) => r.status === 'critical').length,
      high: helpRequests.filter((r) => r.status === 'high').length,
      availableVolunteers: volunteers.filter((v) => v.status === 'available').length,
      totalVolunteers: volunteers.length,
    },
  });
});

// Get help requests
app.get('/api/requests', (req, res) => {
  if (!seeded) {
    seedData(13.0827, 80.2707); // Default to Chennai
  }
  res.json(helpRequests);
});

// Create a new help request
app.post('/api/requests', (req, res) => {
  const { title, description, urgency, lat, lng, type: helpType, contact } = req.body;
  const newRequest = {
    id: Date.now(),
    type: helpType || 'request',
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    status: 'pending',
    title: title || helpType || 'Help Request',
    description: description || '',
    urgency: urgency || 'medium',
    contact: contact || '',
    time: 'Just now',
    helper: null,
    eta: null
  };
  helpRequests.push(newRequest);
  saveData();
  res.status(201).json(newRequest);
});

// Update a help request status
app.patch('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  const { status, helper, eta } = req.body;
  const request = helpRequests.find(r => r.id === parseInt(id));
  
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  if (status) request.status = status;
  if (helper) request.helper = helper;
  if (eta) request.eta = eta;

  saveData();
  res.json(request);
});

// Get volunteers
app.get('/api/volunteers', (req, res) => {
  res.json(volunteers);
});

// Get zones
app.get('/api/zones', (req, res) => {
  res.json(zones);
});

// Get live updates (latest activity)
app.get('/api/updates', (req, res) => {
  const updates = [
    ...helpRequests.slice(-3).reverse().map((r) => ({
      time: r.time,
      message: `${r.status === 'critical' ? '🚨' : '⚠️'} ${r.title}`,
      type: 'request',
    })),
    ...volunteers
      .filter((v) => v.status === 'busy')
      .slice(-2)
      .map((v) => ({
        time: '5 min ago',
        message: `${v.title} assigned to active request`,
        type: 'volunteer',
      })),
  ].slice(0, 5);
  res.json(updates);
});

// ─── Start Server ──────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n  🚀 SVAS Backend API running at http://localhost:${PORT}`);
    console.log(`  📡 Endpoints:`);
    console.log(`     POST /api/seed         — Seed data around GPS location`);
    console.log(`     GET  /api/map-data     — All map data (requests, volunteers, zones)`);
    console.log(`     GET  /api/requests     — Help requests`);
    console.log(`     POST /api/requests     — Create new request`);
    console.log(`     GET  /api/volunteers   — Volunteers`);
    console.log(`     GET  /api/zones        — Zones`);
    console.log(`     GET  /api/updates      — Live updates\n`);
  });
}

export default app;
