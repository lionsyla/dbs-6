import { User, Calendar, Star, Phone, MapPin, Clock, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface ProfileViewProps {
  userName: string;
  accessToken: string;
  onSignOut: () => void;
}

interface Booking {
  id: string;
  service: string;
  barber: string;
  date: string;
  time: string;
  price?: string;
  status: string;
  createdAt: string;
}

export function ProfileView({ userName, accessToken, onSignOut }: ProfileViewProps) {
  const [points, setPoints] = useState(0);
  const [visits, setVisits] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f79deb15/user-stats`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': publicAnonKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPoints(data.points);
        setVisits(data.visits);
        setBookings(data.bookings);
      } else {
        const errorData = await response.json();
        console.error('Error fetching user stats:', errorData);
        // Set default values if fetch fails
        setPoints(0);
        setVisits(0);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Set default values if fetch fails
      setPoints(0);
      setVisits(0);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const pastBookings = bookings.filter(b => b.status === 'completed');

  return (
    <div className="flex flex-col px-6 py-6 pb-24 bg-white">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-black border-2 border-amber-500 flex items-center justify-center shadow-sm">
            <User className="w-10 h-10 text-amber-500" />
          </div>
          <div>
            <h1 className="text-black mb-1 tracking-tight">{userName}</h1>
            <p className="text-zinc-500 text-sm">Member since 2024</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black rounded-2xl p-4 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-amber-500" />
              <p className="text-zinc-400 text-xs">Total Visits</p>
            </div>
            <p className="text-white text-2xl">{visits}</p>
          </div>
          
          <div className="bg-black rounded-2xl p-4 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-amber-500" />
              <p className="text-zinc-400 text-xs">Points</p>
            </div>
            <p className="text-white text-2xl">{points}</p>
          </div>
        </div>
      </div>

      {/* Rewards Info */}
      {points >= 100 && (
        <div className="mb-6 bg-amber-500/10 border-2 border-amber-500 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <p className="text-black text-sm">Rewards Available!</p>
          </div>
          <p className="text-zinc-600 text-xs">
            You can redeem {Math.floor(points / 100) * 10} dollars off your next service!
          </p>
        </div>
      )}

      {/* Upcoming Appointments */}
      <div className="mb-8">
        <h2 className="text-black mb-3 tracking-tight">Upcoming</h2>
        {upcomingBookings.length === 0 ? (
          <p className="text-zinc-500 text-sm">No upcoming appointments</p>
        ) : (
          upcomingBookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-black rounded-2xl p-4 border-2 border-amber-500/30 mb-3"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white mb-1">{booking.service}</h3>
                <p className="text-zinc-400 text-sm">with {booking.barber}</p>
              </div>
              <span className="text-amber-500">{booking.price}</span>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{booking.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{booking.time}</span>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button className="flex-1 bg-amber-500 hover:bg-amber-600 text-black rounded-full py-2.5 text-sm transition-colors">
                Reschedule
              </button>
              <button className="flex-1 bg-white hover:bg-zinc-100 text-black border-2 border-white rounded-full py-2.5 text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Past Appointments */}
      <div className="mb-4">
        <h2 className="text-black mb-3 tracking-tight">History</h2>
        {pastBookings.length === 0 ? (
          <p className="text-zinc-500 text-sm">No past appointments</p>
        ) : (
        <div className="space-y-3">
          {pastBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl p-4 border-2 border-black"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-black text-sm mb-1">{booking.service}</h3>
                  <p className="text-zinc-500 text-xs">with {booking.barber}</p>
                </div>
                <span className="text-amber-500 text-xs">{booking.price}</span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{booking.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{booking.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 space-y-3">
        <a 
          href="tel:+19173882833"
          className="w-full bg-white hover:bg-zinc-50 text-black rounded-2xl p-4 border-2 border-black flex items-center gap-3 transition-colors"
        >
          <Phone className="w-5 h-5 text-amber-500" />
          <span className="text-sm">Contact Us</span>
        </a>
        
        <a 
          href="https://dardansbarbershop.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full bg-white hover:bg-zinc-50 text-black rounded-2xl p-4 border-2 border-black flex items-center gap-3 transition-colors"
        >
          <MapPin className="w-5 h-5 text-amber-500" />
          <span className="text-sm">Visit Our Website</span>
        </a>
        
        <button 
          onClick={onSignOut}
          className="w-full bg-black hover:bg-zinc-900 text-white rounded-2xl p-4 border-2 border-amber-500/30 flex items-center gap-3 transition-colors"
        >
          <LogOut className="w-5 h-5 text-amber-500" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
}