import { useState } from 'react';
import { Calendar, Clock, User, Scissors, Check } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface Barber {
  id: string;
  name: string;
  title: string;
  image: string;
}

interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: string;
}

interface BookingViewProps {
  accessToken: string;
}

export function BookingView({ accessToken }: BookingViewProps) {
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);

  const services: Service[] = [
    {
      id: '1',
      name: 'Haircut & Style',
      duration: 20,
      price: '$45'
    },
    {
      id: '2',
      name: 'Beard Trim/Beard Trim Shave',
      duration: 20,
      price: '$30'
    },
    {
      id: '3',
      name: 'Haircut & Beard Trim',
      duration: 40,
      price: '$65'
    },
    {
      id: '4',
      name: 'Senior Citizen/Buzz',
      duration: 20,
      price: '$30'
    },
    {
      id: '5',
      name: 'Kids Haircut (under 12)',
      duration: 20,
      price: '$40'
    },
    {
      id: '6',
      name: 'Hot Towel Shave',
      duration: 20,
      price: '$40'
    },
    {
      id: '7',
      name: 'Haircut and Shave',
      duration: 40,
      price: '$70'
    },
    {
      id: '8',
      name: 'Head Shave',
      duration: 20,
      price: '$40'
    },
    {
      id: '9',
      name: 'Line Up',
      duration: 20,
      price: '$20'
    },
    {
      id: '10',
      name: 'Haircut (Long hair)',
      duration: 20,
      price: '$50'
    }
  ];

  const barbers: Barber[] = [
    {
      id: '1',
      name: 'Dardan',
      title: 'Master Barber',
      image: '/images/Dardan.png'
    },
    {
      id: '2',
      name: 'Jay',
      title: 'Master Barber',
      image: '/images/Jay.png'
    },
    {
      id: '3',
      name: 'Mike',
      title: 'Master Barber',
      image: '/images/mike.png'
    },
    {
      id: '4',
      name: 'Ronnie',
      title: 'Master Barber',
      image: '/images/ronnie.png'
    },
    {
      id: '5',
      name: 'Nick',
      title: 'Master Barber',
      image: '/images/nick.png'
    },
    {
      id: '6',
      name: 'Melo',
      title: 'Master Barber',
      image: '/images/melo.png'
    },
    {
      id: '7',
      name: 'Sam',
      title: 'Master Barber',
      image: '/images/sam.png'
    },
    {
      id: '8',
      name: 'Ellie',
      title: 'Master Barber',
      image: '/images/ellie.png'
    },
    {
      id: '9',
      name: 'Max',
      title: 'Master Barber',
      image: '/images/max.png'
    }
  ];

  const dates = [
    { day: 'Mon', date: '18', full: '2024-12-18' },
    { day: 'Tue', date: '19', full: '2024-12-19' },
    { day: 'Wed', date: '20', full: '2024-12-20' },
    { day: 'Thu', date: '21', full: '2024-12-21' },
    { day: 'Fri', date: '22', full: '2024-12-22' },
    { day: 'Sat', date: '23', full: '2024-12-23' }
  ];

  // Generate time slots based on selected service duration
  const generateTimeSlots = () => {
    const selectedServiceData = services.find(s => s.id === selectedService);
    if (!selectedServiceData) return [];

    const slots = [];
    const duration = selectedServiceData.duration;
    const startHour = 8; // 8 AM
    const endHour = 19; // 7 PM
    const startMinutes = 0;

    let currentHour = startHour;
    let currentMinutes = startMinutes;

    while (currentHour < endHour || (currentHour === endHour && currentMinutes === 0)) {
      const hour12 = currentHour > 12 ? currentHour - 12 : currentHour === 0 ? 12 : currentHour;
      const ampm = currentHour >= 12 ? 'PM' : 'AM';
      const minutesStr = currentMinutes.toString().padStart(2, '0');
      slots.push(`${hour12}:${minutesStr} ${ampm}`);

      // Add duration to current time
      currentMinutes += duration;
      if (currentMinutes >= 60) {
        currentHour += Math.floor(currentMinutes / 60);
        currentMinutes = currentMinutes % 60;
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleBooking = async () => {
    setIsBooking(true);
    const service = services.find(s => s.id === selectedService);
    const barber = barbers.find(b => b.id === selectedBarber);
    const date = dates.find(d => d.full === selectedDate);

    if (!service || !barber || !date) {
      setIsBooking(false);
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f79deb15/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': publicAnonKey
        },
        body: JSON.stringify({
          service: service.name,
          barber: barber.name,
          date: date.full,
          time: selectedTime,
          price: service.price,
          duration: service.duration
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPointsAwarded(data.pointsAwarded);
        setBookingSuccess(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setBookingSuccess(false);
          setSelectedService('');
          setSelectedBarber('');
          setSelectedDate('');
          setSelectedTime('');
        }, 3000);
      } else {
        console.error('Booking failed:', response.statusText);
      }
    } catch (error) {
      console.error('Booking error:', error);
    }

    setIsBooking(false);
  };

  return (
    <div className="flex flex-col px-6 py-6 pb-24 bg-white">
      <div className="mb-6">
        <h1 className="text-black mb-1 tracking-tight">Book Appointment</h1>
        <p className="text-zinc-600 text-sm">Select your preferred service and time</p>
      </div>

      {/* Select Service */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Scissors className="w-4 h-4 text-amber-500" />
          <h2 className="text-black text-sm">Choose Service</h2>
        </div>
        
        <div className="space-y-2">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => {
                setSelectedService(service.id);
                setSelectedTime(''); // Reset time when service changes
              }}
              className={`w-full rounded-xl p-3 transition-colors text-left border-2 ${
                selectedService === service.id
                  ? 'bg-black text-white border-amber-500/50'
                  : 'bg-white text-black border-black hover:border-amber-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm mb-0.5">{service.name}</p>
                  <p className={`text-xs ${selectedService === service.id ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {service.duration} minutes
                  </p>
                </div>
                <span className={`${selectedService === service.id ? 'text-amber-500' : 'text-amber-500'}`}>
                  {service.price}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Select Barber */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-amber-500" />
          <h2 className="text-black text-sm">Choose Your Barber</h2>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {barbers.map((barber) => (
            <button
              key={barber.id}
              onClick={() => setSelectedBarber(barber.id)}
              className={`flex-shrink-0 w-24 transition-all ${
                selectedBarber === barber.id
                  ? 'opacity-100'
                  : 'opacity-50'
              }`}
            >
              <div className={`relative w-24 h-24 rounded-2xl overflow-hidden mb-2 border-3 transition-colors ${
                selectedBarber === barber.id
                  ? 'border-amber-500 ring-2 ring-amber-500/20'
                  : 'border-black'
              }`}>
                <img
                  src={barber.image}
                  alt={barber.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-black text-xs text-center">{barber.name}</p>
              <p className="text-zinc-500 text-[10px] text-center">{barber.title}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Select Date */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-amber-500" />
          <h2 className="text-black text-sm">Select Date</h2>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {dates.map((date) => (
            <button
              key={date.full}
              onClick={() => setSelectedDate(date.full)}
              className={`flex-shrink-0 w-16 rounded-xl py-3 transition-colors border-2 ${
                selectedDate === date.full
                  ? 'bg-black text-amber-500 border-amber-500/50'
                  : 'bg-white text-zinc-600 border-black'
              }`}
            >
              <p className="text-[10px] mb-1">{date.day}</p>
              <p className="text-xl">{date.date}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Select Time */}
      {selectedService && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-amber-500" />
            <h2 className="text-black text-sm">Select Time</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-3 rounded-xl text-sm transition-colors border-2 ${
                  selectedTime === time
                    ? 'bg-black text-amber-500 border-amber-500/50'
                    : 'bg-white text-zinc-600 border-black'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Booking Summary */}
      {selectedService && selectedBarber && selectedDate && selectedTime && !bookingSuccess && (
        <div className="bg-black border-2 border-amber-500/30 rounded-2xl p-4 mb-4">
          <p className="text-amber-500 text-xs mb-2">Booking Summary</p>
          <div className="space-y-1 text-sm">
            <p className="text-white">
              {services.find(s => s.id === selectedService)?.name}
            </p>
            <p className="text-white">
              {barbers.find(b => b.id === selectedBarber)?.name} - {barbers.find(b => b.id === selectedBarber)?.title}
            </p>
            <p className="text-zinc-400 text-xs">
              {dates.find(d => d.full === selectedDate)?.day}, Dec {dates.find(d => d.full === selectedDate)?.date} at {selectedTime}
            </p>
            <p className="text-amber-500 mt-2">
              Total: {services.find(s => s.id === selectedService)?.price}
            </p>
          </div>
        </div>
      )}

      {/* Booking Success Message */}
      {bookingSuccess && (
        <div className="bg-black border-2 border-green-500 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-5 h-5 text-green-500" />
            <p className="text-green-500">Booking Confirmed!</p>
          </div>
          <p className="text-white text-sm mb-1">Your appointment has been booked successfully.</p>
          <p className="text-amber-500 text-xs">
            🎉 You earned {pointsAwarded} points!
          </p>
        </div>
      )}

      {/* Confirm Button */}
      <button
        disabled={!selectedService || !selectedBarber || !selectedDate || !selectedTime || isBooking || bookingSuccess}
        onClick={handleBooking}
        className="w-full bg-amber-500 hover:bg-amber-600 text-black rounded-full py-4 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm border-2 border-black"
      >
        {isBooking ? 'Booking...' : bookingSuccess ? 'Booked!' : 'Confirm Booking'}
      </button>
    </div>
  );
}