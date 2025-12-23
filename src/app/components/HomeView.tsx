import { Sparkles, Clock, MapPin, Phone } from 'lucide-react';

interface HomeViewProps {
  onNavigateToBooking: () => void;
}

export function HomeView({ onNavigateToBooking }: HomeViewProps) {
  return (
    <div className="flex flex-col bg-white">
      {/* Hero Section */}
      <div className="relative h-[280px] overflow-hidden bg-black">
        {/* Background Image */}
        <img
          src="/images/hero.png"
          alt="Dardan's Barbershop Interior"
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        {/* Logo and Title */}
        <div className="absolute bottom-4 left-6 right-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <h1 className="text-white tracking-tight">Your luxury barbers</h1>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="px-6 py-6 space-y-3">
        <div className="bg-white rounded-2xl p-4 border-2 border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-zinc-500 text-xs">Hours of Operation</p>
              <div className="text-black text-sm mt-0.5 space-y-0.5">
                <p>Monday-Friday: 8AM – 7:30PM</p>
                <p>Saturday: 8AM – 7PM</p>
                <p>Sunday: 10AM – 7PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border-2 border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
              <MapPin className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-zinc-500 text-xs">Location</p>
              <p className="text-black text-sm mt-0.5">688 6th Ave, New York, NY 10011</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border-2 border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
              <Phone className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-zinc-500 text-xs">Contact</p>
              <p className="text-black text-sm mt-0.5">(917)-388-2833</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="px-6 pb-6">
        <button
          className="w-full bg-black hover:bg-zinc-900 text-amber-500 border border-amber-500/30 rounded-full py-4 transition-colors shadow-sm"
          onClick={onNavigateToBooking}
        >
          Book an Appointment
        </button>
      </div>
    </div>
  );
}