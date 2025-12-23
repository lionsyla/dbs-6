import { House, Calendar, Scissors, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: House, label: 'Home' },
    { id: 'services', icon: Scissors, label: 'Services' },
    { id: 'booking', icon: Calendar, label: 'Book' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t-2 border-amber-500/30 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around px-6 py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1 min-w-[60px] transition-colors"
            >
              <Icon 
                className={`w-6 h-6 ${
                  isActive ? 'text-amber-500' : 'text-zinc-500'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-[10px] tracking-wide ${
                isActive ? 'text-amber-500' : 'text-zinc-500'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
