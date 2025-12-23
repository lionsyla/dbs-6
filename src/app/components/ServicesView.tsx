import { ImageWithFallback } from './figma/ImageWithFallback';
import { Clock } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  image: string;
}

interface ServicesViewProps {
  onNavigateToBooking?: () => void;
}

export function ServicesView({ onNavigateToBooking }: ServicesViewProps) {
  const services: Service[] = [
    {
      id: '1',
      name: 'Haircut & Style',
      description: 'Professional haircut with styling',
      duration: '20 min',
      price: '$45',
      image: 'https://images.unsplash.com/photo-1736670648315-c5e8b3385562?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW5zJTIwaGFpcmN1dCUyMHN0eWxlfGVufDF8fHx8MTc2NjA2NzQ3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: '2',
      name: 'Beard Trim/Beard Trim Shave',
      description: 'Expert beard trimming and shaping',
      duration: '20 min',
      price: '$30',
      image: 'https://images.unsplash.com/photo-1594150608366-da1107c57702?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBiYXJiZXIlMjB3b3JraW5nfGVufDF8fHx8MTc2NjA2NzQ3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: '3',
      name: 'Haircut & Beard Trim',
      description: 'Complete grooming package',
      duration: '40 min',
      price: '$65',
      image: 'https://images.unsplash.com/photo-1678356163587-6bb3afb89679?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJiZXJzaG9wJTIwdG9vbHMlMjBzY2lzc29yc3xlbnwxfHx8fDE3NjYwNjc0Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: '4',
      name: 'Senior Citizen/Buzz',
      description: 'Special pricing for seniors',
      duration: '20 min',
      price: '$30',
      image: 'https://images.unsplash.com/photo-1736670648315-c5e8b3385562?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW5zJTIwaGFpcmN1dCUyMHN0eWxlfGVufDF8fHx8MTc2NjA2NzQ3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: '5',
      name: 'Kids Haircut (under 12)',
      description: 'Gentle cuts for young clients',
      duration: '20 min',
      price: '$40',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    },
    {
      id: '6',
      name: 'Hot Towel Shave',
      description: 'Traditional hot towel shave experience',
      duration: '20 min',
      price: '$40',
      image: 'https://images.unsplash.com/photo-1598915851612-ac6cb5d24587?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiYXJiZXIlMjBjaGFpcnxlbnwxfHx8fDE3NjYwNjc0Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: '7',
      name: 'Haircut and Shave',
      description: 'Premium haircut with classic shave',
      duration: '40 min',
      price: '$70',
      image: 'https://images.unsplash.com/photo-1594150608366-da1107c57702?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBiYXJiZXIlMjB3b3JraW5nfGVufDF8fHx8MTc2NjA2NzQ3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: '8',
      name: 'Head Shave',
      description: 'Full head shave service',
      duration: '20 min',
      price: '$40',
      image: 'https://images.unsplash.com/photo-1598915851612-ac6cb5d24587?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiYXJiZXIlMjBjaGFpcnxlbnwxfHx8fDE3NjYwNjc0Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: '9',
      name: 'Line Up',
      description: 'Edge up and line up service',
      duration: '20 min',
      price: '$20',
      image: 'https://images.unsplash.com/photo-1736670648315-c5e8b3385562?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW5zJTIwaGFpcmN1dCUyMHN0eWxlfGVufDF8fHx8MTc2NjA2NzQ3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: '10',
      name: 'Haircut (Long hair)',
      description: 'Specialized cut for longer hair',
      duration: '20 min',
      price: '$50',
      image: 'https://images.unsplash.com/photo-1736670648315-c5e8b3385562?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW5zJTIwaGFpcmN1dCUyMHN0eWxlfGVufDF8fHx8MTc2NjA2NzQ3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    }
  ];

  return (
    <div className="flex flex-col px-6 py-6 bg-white">
      <div className="mb-6">
        <h1 className="text-black mb-1 tracking-tight">Services & Pricing</h1>
        <p className="text-zinc-600 text-sm">Choose your grooming experience and let us show you the mastery in our craft.</p>
      </div>

      <div className="space-y-4 pb-24">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-2xl overflow-hidden border-2 bg-white border-black hover:border-amber-500/50 transition-all"
          >
            <div className="flex gap-4 p-4">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                <ImageWithFallback
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="text-sm mb-1 text-black">
                    {service.name}
                  </h3>
                  <p className="text-xs line-clamp-2 text-zinc-500">
                    {service.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-zinc-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{service.duration}</span>
                    </div>
                  </div>
                  <span className="text-amber-500">{service.price}</span>
                </div>
              </div>
            </div>
            
            <div className="px-4 pb-4">
              <button 
                onClick={onNavigateToBooking}
                className="w-full rounded-full py-2.5 text-sm transition-colors bg-black hover:bg-zinc-900 text-amber-500 border border-amber-500/30"
              >
                Select Service
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}