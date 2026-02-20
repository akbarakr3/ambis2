import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999] animate-fadeOut">
      <div className="text-center">
        <img 
          src="/ambis-cafe-logo.png" 
          alt="Ambi's Cafe" 
          className="w-32 h-32 mx-auto mb-6 animate-pulse"
        />
        <h1 className="text-3xl font-bold text-red-700">Ambi's Cafe</h1>
        <p className="text-gray-600 mt-2">Food Ordering System</p>
      </div>
    </div>
  );
}
