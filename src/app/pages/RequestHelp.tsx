import { Link } from 'react-router';
import { useState } from 'react';
import { MapPin, AlertCircle, Send, Wifi, WifiOff, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function RequestHelp() {
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    description: '',
    urgency: '',
    contact: '',
  });
  const [isOffline] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.type.toUpperCase() + ": " + formData.location,
          description: formData.description,
          urgency: formData.urgency || 'medium',
          type: formData.type,
          lat: 13.0827,
          lng: 80.2707,
          contact: formData.contact
        })
      });
      if (res.ok) {
        setSubmitted(true);
        toast.success('Help request submitted successfully!');
        setTimeout(() => {
          setSubmitted(false);
          setFormData({ type: '', location: '', description: '', urgency: '', contact: '' });
        }, 3000);
      }
    } catch (e) {
      toast.error('Failed to submit request.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
              <Link to="/request" className="text-primary">Request Help</Link>
              <Link to="/volunteer" className="text-muted-foreground hover:text-foreground">Volunteer</Link>
              <Link to="/map" className="text-muted-foreground hover:text-foreground">Map View</Link>
              <Link to="/admin" className="text-muted-foreground hover:text-foreground">Admin</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isOffline ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm">Offline Mode</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                <Wifi className="w-4 h-4" />
                <span className="text-sm">Connected</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-3 text-foreground">Request Help</h1>
          <p className="text-muted-foreground">Submit a help request and we'll match you with the best available volunteer</p>
        </motion.div>

        {submitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 rounded-xl bg-green-500/10 border border-green-500/30 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-green-400">Request Submitted!</h3>
            <p className="text-green-300">Our intelligent matching system is finding the best volunteer for you...</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-8 rounded-xl bg-card border border-border shadow-lg space-y-6">
            {/* Help Type */}
            <div>
              <label className="block mb-2 text-card-foreground">Type of Help Needed *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select type...</option>
                <option value="medical">Medical Assistance</option>
                <option value="food">Food & Water</option>
                <option value="rescue">Emergency Rescue</option>
                <option value="shelter">Shelter</option>
                <option value="transport">Transportation</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Urgency */}
            <div>
              <label className="block mb-2 text-card-foreground">Urgency Level *</label>
              <div className="grid grid-cols-4 gap-3">
                {['low', 'medium', 'high', 'critical'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, urgency: level })}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.urgency === level
                        ? level === 'critical'
                          ? 'border-destructive bg-destructive/20 text-destructive'
                          : level === 'high'
                          ? 'border-accent bg-accent/20 text-accent'
                          : 'border-primary bg-primary/20 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block mb-2 text-card-foreground">Location *</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Enter your location or address"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 text-card-foreground">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Please describe your situation in detail..."
                className="w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Contact */}
            <div>
              <label className="block mb-2 text-card-foreground">Contact Number *</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Alert Info */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/10 border border-accent/30">
              <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-accent mb-1">Smart Matching Enabled</p>
                <p>Our AI will automatically assign the best volunteer based on proximity, availability, and performance history.</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitted}
            className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-xl text-lg hover:bg-primary/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {submitted ? 'Submitting...' : 'Submit Help Request'}
          </button>
        </form>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <InfoCard
            title="Fast Response"
            description="Average response time under 15 minutes"
          />
          <InfoCard
            title="Verified Volunteers"
            description="All volunteers are background-checked and trained"
          />
          <InfoCard
            title="24/7 Available"
            description="Help is available around the clock, every day"
          />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 rounded-lg bg-card/50 border border-border text-center">
      <h4 className="font-bold mb-1 text-card-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
