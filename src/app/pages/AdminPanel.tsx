import { Link } from 'react-router';
import { useState } from 'react';
import { Users, Activity, AlertTriangle, Settings, TrendingUp, UserCheck, Filter, ChevronLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

const performanceData = [
  { date: 'Mon', requests: 45, completed: 42, volunteers: 120 },
  { date: 'Tue', requests: 52, completed: 49, volunteers: 125 },
  { date: 'Wed', requests: 38, completed: 37, volunteers: 118 },
  { date: 'Thu', requests: 61, completed: 58, volunteers: 132 },
  { date: 'Fri', requests: 48, completed: 46, volunteers: 128 },
  { date: 'Sat', requests: 55, completed: 53, volunteers: 135 },
  { date: 'Sun', requests: 42, completed: 40, volunteers: 122 },
];

const volunteers = [
  { id: 1, name: 'John Smith', requests: 47, rating: 4.9, responseTime: '12 min', status: 'active' },
  { id: 2, name: 'Sarah Johnson', requests: 52, rating: 4.8, responseTime: '15 min', status: 'active' },
  { id: 3, name: 'Michael Brown', requests: 38, rating: 4.7, responseTime: '18 min', status: 'inactive' },
  { id: 4, name: 'Emily Davis', requests: 61, rating: 5.0, responseTime: '10 min', status: 'active' },
  { id: 5, name: 'David Wilson', requests: 43, rating: 4.6, responseTime: '20 min', status: 'active' },
];

const escalatedRequests = [
  { id: 1, type: 'Medical', location: 'Zone B', reason: 'No response after 30 min', level: 'L2' },
  { id: 2, type: 'Rescue', location: 'Zone A', reason: 'Critical urgency timeout', level: 'L3' },
  { id: 3, type: 'Food', location: 'Zone C', reason: 'Volunteer unavailable', level: 'L2' },
];

export default function AdminPanel() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'volunteers' | 'escalated'>('overview');

  return (
    <div className="min-h-screen bg-background">
      <nav className="px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mr-4">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <Link to="/" className="text-2xl font-bold text-foreground">SVAS 2.0</Link>
            <div className="flex gap-4">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
              <Link to="/request" className="text-muted-foreground hover:text-foreground">Request Help</Link>
              <Link to="/volunteer" className="text-muted-foreground hover:text-foreground">Volunteer</Link>
              <Link to="/map" className="text-muted-foreground hover:text-foreground">Map View</Link>
              <Link to="/admin" className="text-primary">Admin</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground" />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">System-wide monitoring and management</p>
        </div>

        {/* System Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            label="Total Requests (24h)"
            value="341"
            change="+18%"
            trend="up"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Active Volunteers"
            value="234"
            change="+12%"
            trend="up"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="System Efficiency"
            value="96.4%"
            change="+2.1%"
            trend="up"
          />
          <StatCard
            icon={<AlertTriangle className="w-6 h-6" />}
            label="Escalated Cases"
            value="3"
            change="-40%"
            trend="down"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-6 py-3 border-b-2 transition-colors ${
              selectedTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Performance Overview
          </button>
          <button
            onClick={() => setSelectedTab('volunteers')}
            className={`px-6 py-3 border-b-2 transition-colors ${
              selectedTab === 'volunteers'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Volunteer Management
          </button>
          <button
            onClick={() => setSelectedTab('escalated')}
            className={`px-6 py-3 border-b-2 transition-colors ${
              selectedTab === 'escalated'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Escalated Requests
          </button>
        </div>

        {/* Performance Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-card border border-border shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-card-foreground">Weekly Performance Trends</h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 163, 115, 0.1)" />
                  <XAxis dataKey="date" stroke="#A67B5B" />
                  <YAxis stroke="#A67B5B" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#4B2E2B', border: '1px solid rgba(212, 163, 115, 0.2)', borderRadius: '8px' }}
                    labelStyle={{ color: '#F5E6D3' }}
                  />
                  <Line type="monotone" dataKey="requests" stroke="#D4A373" strokeWidth={2} />
                  <Line type="monotone" dataKey="completed" stroke="#A67B5B" strokeWidth={2} />
                  <Line type="monotone" dataKey="volunteers" stroke="#C19A6B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-card border border-border">
                <h3 className="text-xl font-bold mb-4 text-card-foreground">Resource Allocation</h3>
                <div className="space-y-4">
                  <AllocationBar zone="Zone A" volunteers={45} requests={32} />
                  <AllocationBar zone="Zone B" volunteers={62} requests={58} />
                  <AllocationBar zone="Zone C" volunteers={38} requests={28} />
                  <AllocationBar zone="Zone D" volunteers={51} requests={45} />
                  <AllocationBar zone="Zone E" volunteers={38} requests={24} />
                </div>
              </div>

              <div className="p-6 rounded-xl bg-card border border-border">
                <h3 className="text-xl font-bold mb-4 text-card-foreground">AI Recommendations</h3>
                <div className="space-y-3">
                  <RecommendationCard
                    title="Increase Zone B Coverage"
                    description="High demand detected. Suggest 10 more volunteers."
                    priority="high"
                  />
                  <RecommendationCard
                    title="Reallocate from Zone E"
                    description="Low activity. 8 volunteers can be moved."
                    priority="medium"
                  />
                  <RecommendationCard
                    title="Prepare for Weather Event"
                    description="Heavy rain forecast in 6 hours for Zone A."
                    priority="high"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Volunteer Management Tab */}
        {selectedTab === 'volunteers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Volunteer Performance</h2>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>

            <div className="rounded-xl bg-card border border-border overflow-hidden shadow-lg">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Volunteer</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Completed</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Rating</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Avg. Response</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map((volunteer) => (
                    <tr key={volunteer.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            {volunteer.name.charAt(0)}
                          </div>
                          <span className="font-medium text-card-foreground">{volunteer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-card-foreground">{volunteer.requests}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-accent font-medium">{volunteer.rating}</span>
                          <span className="text-muted-foreground text-sm">/ 5.0</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-card-foreground">{volunteer.responseTime}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          volunteer.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {volunteer.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-primary hover:text-primary/80 text-sm">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Escalated Requests Tab */}
        {selectedTab === 'escalated' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Escalated Requests</h2>
              <p className="text-muted-foreground">Requests that require immediate attention</p>
            </div>

            <div className="space-y-4">
              {escalatedRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 rounded-xl bg-card border-2 border-destructive/50 shadow-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                        <h3 className="text-xl font-bold text-card-foreground">{request.type} Request</h3>
                        <span className="px-3 py-1 rounded-full text-xs bg-destructive/20 text-destructive">
                          {request.level} ESCALATION
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-2">{request.location}</p>
                      <p className="text-sm text-muted-foreground">Reason: {request.reason}</p>
                    </div>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all">
                        Reassign
                      </button>
                      <button className="px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-all">
                        Emergency
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {escalatedRequests.length === 0 && (
                <div className="p-12 rounded-xl bg-card border border-border text-center">
                  <UserCheck className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-card-foreground">All Clear!</h3>
                  <p className="text-muted-foreground">No escalated requests at the moment.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change, trend }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="p-6 rounded-xl bg-card border border-border shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-primary">{icon}</div>
        <span className={`text-sm ${trend === 'up' ? 'text-green-400' : 'text-accent'}`}>
          {change}
        </span>
      </div>
      <div className="text-3xl font-bold mb-1 text-card-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
}

function AllocationBar({ zone, volunteers, requests }: { zone: string; volunteers: number; requests: number }) {
  const ratio = (volunteers / requests) * 100;
  const isBalanced = ratio >= 80 && ratio <= 120;

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-card-foreground">{zone}</span>
        <span className="text-muted-foreground">{volunteers} volunteers / {requests} requests</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${isBalanced ? 'bg-green-400' : 'bg-accent'}`}
          style={{ width: `${Math.min(ratio, 100)}%` }}
        />
      </div>
    </div>
  );
}

function RecommendationCard({ title, description, priority }: {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}) {
  return (
    <div className={`p-4 rounded-lg border ${
      priority === 'high'
        ? 'bg-accent/10 border-accent/30'
        : 'bg-muted/50 border-border'
    }`}>
      <h4 className="font-bold mb-1 text-card-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
