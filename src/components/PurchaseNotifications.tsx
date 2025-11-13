import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useProductsContext } from '@/context/ProductsContext';

interface PurchaseNotification {
  id: string;
  customerName: string;
  location: string;
  productName: string;
  timeAgo: string;
  isVisible: boolean;
}

const PurchaseNotifications: React.FC = () => {
  const { settings } = useSettings();
  const { products } = useProductsContext();
  const [notification, setNotification] = useState<PurchaseNotification | null>(null);

  // Enhanced regional data
  const regionalData = {
    pakistan: {
      names: ['Ahmed Hassan', 'Fatima Khan', 'Muhammad Ali', 'Ayesha Sheikh', 'Usman Ahmed', 'Zara Malik', 'Ali Raza', 'Sana Tariq', 'Hassan Mahmud', 'Amna Siddique'],
      locations: ['Karachi, Pakistan', 'Lahore, Pakistan', 'Islamabad, Pakistan', 'Rawalpindi, Pakistan', 'Faisalabad, Pakistan', 'Multan, Pakistan', 'Hyderabad, Pakistan', 'Peshawar, Pakistan', 'Quetta, Pakistan', 'Sialkot, Pakistan']
    },
    usa: {
      names: ['Michael Johnson', 'Sarah Williams', 'David Brown', 'Emily Davis', 'James Wilson', 'Ashley Miller', 'Christopher Moore', 'Jennifer Taylor', 'Robert Anderson', 'Jessica Thomas'],
      locations: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA']
    },
    spain: {
      names: ['Carlos García', 'María Rodríguez', 'José Martínez', 'Ana López', 'David Sánchez', 'Laura Pérez', 'Miguel González', 'Carmen Fernández', 'Antonio Jiménez', 'Isabel Ruiz'],
      locations: ['Madrid, Spain', 'Barcelona, Spain', 'Valencia, Spain', 'Seville, Spain', 'Zaragoza, Spain', 'Málaga, Spain', 'Murcia, Spain', 'Palma, Spain', 'Las Palmas, Spain', 'Bilbao, Spain']
    },
    india: {
      names: ['Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Kavya Patel', 'Rohit Gupta', 'Sneha Agarwal', 'Vikram Reddy', 'Ananya Joshi', 'Arjun Nair', 'Pooja Iyer'],
      locations: ['Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Chennai, India', 'Kolkata, India', 'Pune, India', 'Hyderabad, India', 'Ahmedabad, India', 'Jaipur, India', 'Lucknow, India']
    }
  };

  const getRandomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const getRandomProduct = () => products[Math.floor(Math.random() * products.length)];

  const getTimeAgo = () => {
    const times = ['2 min ago', '5 min ago', '12 min ago', '18 min ago', '25 min ago', '35 min ago', '1 hour ago', '2 hours ago'];
    return getRandomElement(times);
  };

  const getUserRegion = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    if (timezone.includes('Asia/Karachi')) return 'pakistan';
    if (timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta')) return 'india';
    if (timezone.includes('Europe/Madrid')) return 'spain';
    if (timezone.includes('America/') && !timezone.includes('America/Argentina')) return 'usa';
    
    // Fallback based on broader timezone patterns
    if (timezone.includes('Asia/')) {
      return Math.random() > 0.5 ? 'pakistan' : 'india';
    }
    if (timezone.includes('Europe/')) return 'spain';
    
    return 'usa'; // Default fallback
  };

  const createNotification = (): PurchaseNotification => {
    const region = getUserRegion();
    const data = regionalData[region];
    const product = getRandomProduct();

    return {
      id: Math.random().toString(36).substr(2, 9),
      customerName: getRandomElement(data.names),
      location: getRandomElement(data.locations),
      productName: product.name,
      timeAgo: getTimeAgo(),
      isVisible: true
    };
  };

  const showNotification = () => {
    const newNotification = createNotification();
    setNotification(newNotification);

    // Hide after 3 seconds
    setTimeout(() => {
      setNotification(prev => prev ? { ...prev, isVisible: false } : null);
    }, 3000);

    // Remove completely after animation
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  useEffect(() => {
    if (!settings.enablePurchaseNotifications) {
      setNotification(null);
      return;
    }

    const initialTimeout = setTimeout(showNotification, 5000);
    const interval = setInterval(() => {
      const randomDelay = Math.random() * (120000 - 60000) + 60000;
      setTimeout(showNotification, randomDelay);
    }, 90000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [settings.enablePurchaseNotifications]);

  if (!settings.enablePurchaseNotifications || !notification) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 pointer-events-none">
      <Card 
        className={`
          backdrop-blur-sm border shadow-2xl max-w-sm
          transition-all duration-500 ease-out transform
          ${notification.isVisible 
            ? 'translate-x-0 opacity-100 scale-100' 
            : '-translate-x-full opacity-0 scale-95'
          }
        `}
        style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 0.95) 100%)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 text-xs px-2 py-0.5">
                  🎉 New Purchase
                </Badge>
                <span className="text-xs text-white/80">{notification.timeAgo}</span>
              </div>
              <p className="text-sm font-semibold text-white">
                {notification.customerName}
              </p>
              <p className="text-xs text-white/80 mb-1">
                from {notification.location}
              </p>
              <p className="text-xs text-white font-medium">
                purchased {notification.productName}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseNotifications;