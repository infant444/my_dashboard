import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[9999]">
          <div className="relative">
            {/* Animated circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 border-4 border-transparent border-t-blue-400 border-r-purple-400 rounded-full animate-spin"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-4 border-transparent border-b-pink-400 border-l-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDuration: '0.7s' }}></div>
            </div>
            
            {/* Center content */}
            <div className="relative z-10 bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20">
              <div className="flex flex-col items-center space-y-4">
                {/* Pulsing dots */}
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                
                {/* Text */}
                <div className="text-center">
                  <h3 className="text-white font-bold text-xl mb-1 animate-pulse">Loading</h3>
                  <p className="text-blue-200 text-sm">Please wait...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
};