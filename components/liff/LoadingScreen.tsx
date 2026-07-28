/**
 * LINE-style Loading Screen
 * Consistent loading UI for all LIFF pages
 */

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'กำลังโหลด...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        {/* LINE-style Loading Spinner */}
        <div className="relative inline-flex items-center justify-center mb-6">
          {/* Outer rotating ring */}
          <div className="w-16 h-16 rounded-full border-4 border-gray-100"></div>
          <div className="absolute w-16 h-16 rounded-full border-4 border-transparent border-t-[#06C755] animate-spin"></div>
        </div>
        
        {/* Loading Text */}
        <p className="text-gray-600 text-sm font-medium animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}

/**
 * Inline Loading Spinner (for use inside pages)
 */
export function LoadingSpinner({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <div 
        className="rounded-full border-2 border-gray-100"
        style={{ width: size, height: size }}
      ></div>
      <div 
        className="absolute rounded-full border-2 border-transparent border-t-[#06C755] animate-spin"
        style={{ width: size, height: size }}
      ></div>
    </div>
  );
}
