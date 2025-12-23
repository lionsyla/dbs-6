import { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, RefreshCw, Phone } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface Booking {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  service: string;
  barber: string;
  date: string;
  time: string;
  price: string;
  duration: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: string;
}

interface EmployeeViewProps {
  accessToken: string;
}

export function EmployeeView({ accessToken }: EmployeeViewProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');

  useEffect(() => {
    fetchAllBookings();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAllBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllBookings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f79deb15/admin/bookings`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': publicAnonKey
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
      } else {
        console.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, userId: string, status: 'completed' | 'cancelled') => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f79deb15/admin/bookings/${bookingId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': publicAnonKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId, status })
        }
      );

      if (response.ok) {
        // Refresh bookings
        fetchAllBookings();
      } else {
        console.error('Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  // Sort by date and time
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  // Group by date
  const bookingsByDate = sortedBookings.reduce((acc, booking) => {
    if (!acc[booking.date]) {
      acc[booking.date] = [];
    }
    acc[booking.date].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-zinc-600 bg-zinc-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
        <p className="text-zinc-500">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 bg-gradient-to-b from-zinc-50 to-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-black mb-1">Employee Dashboard</h1>
            <p className="text-zinc-500 text-sm">Manage all bookings</p>
          </div>
          <button
            onClick={fetchAllBookings}
            className="p-3 rounded-full bg-white border border-zinc-200 hover:border-amber-500 transition-all active:scale-95"
          >
            <RefreshCw className="w-5 h-5 text-amber-500" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`p-3 rounded-xl border transition-all ${
              filter === 'all' 
                ? 'bg-amber-500 border-amber-500 text-white' 
                : 'bg-white border-zinc-200 text-zinc-700'
            }`}
          >
            <div className="text-2xl font-light mb-1">{bookings.length}</div>
            <div className="text-xs">All</div>
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`p-3 rounded-xl border transition-all ${
              filter === 'upcoming' 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'bg-white border-zinc-200 text-zinc-700'
            }`}
          >
            <div className="text-2xl font-light mb-1">
              {bookings.filter(b => b.status === 'upcoming').length}
            </div>
            <div className="text-xs">Upcoming</div>
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`p-3 rounded-xl border transition-all ${
              filter === 'completed' 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'bg-white border-zinc-200 text-zinc-700'
            }`}
          >
            <div className="text-2xl font-light mb-1">
              {bookings.filter(b => b.status === 'completed').length}
            </div>
            <div className="text-xs">Done</div>
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`p-3 rounded-xl border transition-all ${
              filter === 'cancelled' 
                ? 'bg-red-500 border-red-500 text-white' 
                : 'bg-white border-zinc-200 text-zinc-700'
            }`}
          >
            <div className="text-2xl font-light mb-1">
              {bookings.filter(b => b.status === 'cancelled').length}
            </div>
            <div className="text-xs">Cancelled</div>
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="flex-1 overflow-y-auto px-6 pb-24">
        {Object.keys(bookingsByDate).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Calendar className="w-16 h-16 text-zinc-300 mb-4" />
            <p className="text-zinc-500">No {filter !== 'all' ? filter : ''} bookings</p>
          </div>
        ) : (
          Object.entries(bookingsByDate).map(([date, dateBookings]) => (
            <div key={date} className="mb-6">
              <h3 className="text-sm font-medium text-zinc-500 mb-3 sticky top-0 bg-white py-2">
                {formatDate(date)}
              </h3>
              <div className="space-y-3">
                {dateBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white border border-zinc-200 rounded-2xl p-4 hover:border-amber-500 transition-all"
                  >
                    {/* Booking Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-amber-500" />
                          <span className="font-medium text-black">{booking.userName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                          <Phone className="w-3.5 h-3.5" />
                          <a href={`tel:${booking.userPhone}`} className="hover:text-amber-500">
                            {booking.userPhone}
                          </a>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    {/* Service Details */}
                    <div className="bg-zinc-50 rounded-xl p-3 mb-3">
                      <div className="font-medium text-black mb-2">{booking.service}</div>
                      <div className="flex items-center gap-4 text-sm text-zinc-600">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-amber-500" />
                          <span>{booking.barber}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span>{booking.time}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-zinc-500">{booking.duration}</span>
                        <span className="font-medium text-amber-500">{booking.price}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {booking.status === 'upcoming' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateBookingStatus(booking.id, booking.userId, 'completed')}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all active:scale-95"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Complete</span>
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, booking.userId, 'cancelled')}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all active:scale-95"
                        >
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
