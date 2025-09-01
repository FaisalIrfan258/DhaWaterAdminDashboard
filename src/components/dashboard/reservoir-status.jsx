'use client'

import React from 'react';
import { Droplet } from 'lucide-react';
import { useLatestWaterLevel } from '@/hooks';

const ReservoirStatus = () => {
  // React Query hook for fetching water level
  const { data: waterLevelData, isLoading, error } = useLatestWaterLevel(2);
  
  const reservoir = {
    id: 1,
    name: 'Reservoir A',
    capacity: 400000,
    icon: Droplet,
  };

  if (isLoading) {
    return <div className="text-center text-blue-700">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-700">Error loading reservoir status</div>;
  }

  const waterLevel = waterLevelData?.water_level || 0;
  const percentage = Math.round((waterLevel / reservoir.capacity) * 100);

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-8 text-blue-800 text-center">Reservoir Status</h2>

      <div className="bg-white p-6 rounded-xl shadow-md transform hover:scale-105 transition-transform duration-300">
        <h3 className="text-xl font-semibold mb-4 text-blue-700 flex items-center justify-center">
          <reservoir.icon className="mr-2" size={24} />
          {reservoir.name}
        </h3>
        <div className="relative w-40 h-64 mx-auto bg-blue-200 rounded-2xl overflow-hidden shadow-inner">
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-1000 ease-in-out"
            style={{
              height: `${percentage}%`,
              animation: 'wave 2s ease-in-out infinite'
            }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-white bg-blue-600 rounded-full px-3 py-1 shadow-lg">
              {percentage}%
            </span>
          </div>
        </div>
        <div className="text-center mt-4">
          <span className="text-sm font-semibold text-blue-600">
            {waterLevel.toLocaleString()} / {reservoir.capacity.toLocaleString()} units
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReservoirStatus;