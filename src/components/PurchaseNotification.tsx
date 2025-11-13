import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, MapPin } from 'lucide-react';

const PurchaseNotification: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(0);

  const notifications = [
    { name: 'Ahmed Hassan', location: 'Karachi, Pakistan', product: 'ChatGPT Premium', country: '🇵🇰' },
    { name: 'John Smith', location: 'New York, USA', product: 'Canva Pro', country: '🇺🇸' },
    { name: 'Maria Garcia', location: 'Madrid, Spain', product: 'Netflix Premium', country: '🇪🇸' },
    { name: 'Priya Sharma', location: 'Mumbai, India', product: 'Spotify Premium', country: '🇮🇳' },
    { name: 'Ali Khan', location: 'Lahore, Pakistan', product: 'Adobe Creative', country: '🇵🇰' },
    { name: 'Michael Brown', location: 'Los Angeles, USA', product: 'YouTube Premium', country: '🇺🇸' },
    { name: 'Carlos Lopez', location: 'Barcelona, Spain', product: 'Grammarly Premium', country: '🇪🇸' },
    { name: 'Rahul Patel', location: 'Delhi, India', product: 'Notion Pro', country: '🇮🇳' },
  ];

  useEffect(() => {
    const showNotification = () => {
      setIsVisible(true);
      setCurrentNotification(Math.floor(Math.random() * notifications.length));
      
      setTimeout(() => {
        setIsVisible(false);
      }, 4000);
    };

    // Show first notification after 3 seconds
    const initialTimer = setTimeout(showNotification, 3000);
    
    // Then show every 90 seconds (1.5 minutes)
    const intervalTimer = setInterval(showNotification, 90000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  if (!isVisible) return null;

  const notification = notifications[currentNotification];

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-left-5 duration-500">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white p-4 rounded-lg shadow-lg max-w-sm border border-green-400/20 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{notification.name}</span>
              <span className="text-lg">{notification.country}</span>
            </div>
            <div className="flex items-center gap-1 mb-2 text-white/90">
              <MapPin className="h-3 w-3" />
              <span className="text-xs">{notification.location}</span>
            </div>
            <p className="text-sm text-white/95">
              Just purchased <span className="font-semibold">{notification.product}</span>
            </p>
            <Badge className="mt-2 bg-white/20 text-white hover:bg-white/30 border-0 text-xs">
              🎉 Verified Purchase
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseNotification;