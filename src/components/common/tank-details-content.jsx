'use client';

import React, { Suspense, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WaterTank } from '@/components/common/water-tank';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useTankData } from '@/hooks';

const TankDetailsContent = () => {
  // React Query hook for fetching tank data
  const { waterLevel, waterLevelGallons, isLoading, error } = useTankData(2);
  
  const totalCapacity = 1285777; // Total capacity in US gallons
  const totalHeight = 15; // Total height in feet
  const gallonsPerFeet = totalCapacity / totalHeight; // Calculation for gallons per feet
  
  // Calculate water level in feet
  const waterLevelFeet = useMemo(() => {
    return waterLevelGallons / gallonsPerFeet;
  }, [waterLevelGallons, gallonsPerFeet]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center text-indigo-600">Loading Tank Details...</div>
        <div className="flex justify-center">
          <Skeleton className="h-64 w-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        Error loading tank data. Please try again later.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.h1 
        className="text-3xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Tank Status
      </motion.h1>

      <div className="flex flex-col gap-6 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-9xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tank Container */}
            <Card className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex-shrink-0 mb-6"
                >
                  <WaterTank waterLevel={waterLevel} />
                </motion.div>
                <div className="flex flex-col gap-4 w-full">
                  <div className="p-4 rounded-lg border border-white/20 bg-white/10">
                    <h3 className="text-lg font-semibold text-white/90 mb-1">Current Volume</h3>
                    <p className="text-3xl font-bold text-white">
                      {waterLevelGallons.toLocaleString()} <span className="text-xl text-white/80">gallons</span>
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-white/20 bg-white/10">
                    <h3 className="text-lg font-semibold text-white/90 mb-1">Water Level (feet)</h3>
                    <p className="text-3xl font-bold text-white">
                      {waterLevelFeet.toFixed(3)} <span className="text-xl text-white/80">ft</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tank Specifications & Capacity Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Tank Specifications & Capacity Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Tank Specifications */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-white/20 bg-white/10">
                      <h3 className="text-lg font-semibold text-white/90 mb-1">Total Capacity</h3>
                      <p className="text-3xl font-bold text-white">
                        {totalCapacity.toLocaleString()} <span className="text-xl text-white/80">gallons</span>
                      </p>
                      <p className="mt-1 text-white/80">at {totalHeight} feet height</p>
                    </div>
                    <div className="p-4 rounded-lg border border-white/20 bg-white/10">
                      <h3 className="text-lg font-semibold text-white/90 mb-1">Gallons Per Feet</h3>
                      <p className="text-3xl font-bold text-white">
                        {gallonsPerFeet.toLocaleString(undefined, {maximumFractionDigits: 1})} <span className="text-xl text-white/80">gallons/ft</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Capacity Overview */}
                  <div className="border-t border-white/20 pt-6">
                    <h3 className="text-lg font-semibold mb-4 text-white">Current Status</h3>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center justify-center w-32 h-32 rounded-full bg-white/20">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-white">{Math.floor(waterLevel)}%</div>
                          <div className="text-sm text-white/80">Filled</div>
                        </div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-white/90">Total Capacity:</span>
                          <span className="font-bold text-white">{totalCapacity.toLocaleString()} gallons</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-white/90">Current Volume:</span>
                          <span className="font-bold text-white">{waterLevelGallons.toLocaleString()} gallons</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-white/90">Remaining Capacity:</span>
                          <span className="font-bold text-white">{(totalCapacity - waterLevelGallons).toLocaleString()} gallons</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2.5 mt-2">
                          <div className="bg-white h-2.5 rounded-full" style={{ width: `${waterLevel}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>


      </div>
    </div>
  );
};

export default function TankDetails() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading Tank Details...</div>}>
      <TankDetailsContent />
    </Suspense>
  );
}
