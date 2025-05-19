'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WaterTank } from '@/components/water-tank';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const TankDetailsContent = () => {
  const [waterLevel, setWaterLevel] = useState(0);
  const [waterLevelGallons, setWaterLevelGallons] = useState(0);
  const [waterLevelFeet, setWaterLevelFeet] = useState(0);
  const [loading, setLoading] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; // Ensure this is set in your environment variables
  const totalCapacity = 1285777; // Total capacity in US gallons
  const totalHeight = 15; // Total height in feet
  const gallonsPerFoot = totalCapacity / totalHeight; // Calculation for gallons per foot

  useEffect(() => {
    const fetchTankData = async () => {
      try {
        // Fetch water level percentage
        const levelResponse = await fetch(`${baseUrl}/api/tankStatus/latest-water-level/?tank_id=2`);
        if (!levelResponse.ok) {
          throw new Error('Failed to fetch tank level data');
        }
        const levelData = await levelResponse.json();
        const level = levelData.water_level || 0;
        setWaterLevel(level);
        
        // Fetch water level in gallons
        const gallonsResponse = await fetch(`${baseUrl}/api/tankStatus/latest-water-level-gallons/?tank_id=1`);
        if (!gallonsResponse.ok) {
          throw new Error('Failed to fetch tank gallons data');
        }
        const gallons = await gallonsResponse.text();
        setWaterLevelGallons(parseInt(gallons) || 0);
        
        // Calculate water level in feet
        const feetValue = parseInt(gallons) / gallonsPerFoot;
        setWaterLevelFeet(feetValue);
      } catch (error) {
        console.error('Error fetching tank data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTankData();
  }, [baseUrl]);

  return (
    <div className="p-6 space-y-6">
      <motion.h1 
        className="text-3xl font-bold text-indigo-800 text-center mb-8"
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
          className="w-full max-w-4xl"
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full">
            
            <CardContent className="flex flex-col md:flex-row items-center justify-center p-6">
              <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-0">
                <WaterTank waterLevel={waterLevel} />
              </div>
              <div className="flex flex-col gap-4 ml-0 md:ml-4">
                <div className="bg-blue-100 p-4 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-blue-800 mb-1">Water Capacity</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {waterLevelGallons.toLocaleString()} <span className="text-xl text-blue-500">gallons</span>
                  </p>
                </div>
                <div className="bg-blue-100 p-4 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-blue-800 mb-1">Water Level (feet)</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {waterLevelFeet.toFixed(3)} <span className="text-xl text-blue-500">ft</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-full max-w-4xl"
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-indigo-800">Tank Specifications</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="bg-indigo-100 p-4 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-indigo-800 mb-1">Total Capacity</h3>
                <p className="text-3xl font-bold text-indigo-600">
                  {totalCapacity.toLocaleString()} <span className="text-xl text-indigo-500">gallons</span>
                </p>
                <p className="mt-1 text-indigo-600">at {totalHeight} feet height</p>
              </div>
              <div className="bg-indigo-100 p-4 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-indigo-800 mb-1">Gallons Per Foot</h3>
                <p className="text-3xl font-bold text-indigo-600">
                  {gallonsPerFoot.toLocaleString(undefined, {maximumFractionDigits: 1})} <span className="text-xl text-indigo-500">gallons/ft</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="w-full max-w-4xl"
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-indigo-800">Tank Capacity Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center justify-center w-32 h-32 rounded-full bg-indigo-100 shadow-inner">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-indigo-700">{Math.floor(waterLevel)}%</div>
                    <div className="text-sm text-indigo-600">Filled</div>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-700 font-medium">Total Capacity:</span>
                    <span className="text-indigo-900 font-bold">{totalCapacity.toLocaleString()} gallons</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-700 font-medium">Current Volume:</span>
                    <span className="text-indigo-900 font-bold">{waterLevelGallons.toLocaleString()} gallons</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-700 font-medium">Remaining Capacity:</span>
                    <span className="text-indigo-900 font-bold">{(totalCapacity - waterLevelGallons).toLocaleString()} gallons</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${waterLevel}%` }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default function TankDetails() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-indigo-600">Loading Tank Details...</div>}>
      <TankDetailsContent />
    </Suspense>
  );
}
