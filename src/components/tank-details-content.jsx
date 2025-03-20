'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WaterTank } from '@/components/water-tank';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const TankDetailsContent = () => {
  const [waterLevel, setWaterLevel] = useState(0);
  const [loading, setLoading] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; // Ensure this is set in your environment variables

  useEffect(() => {
    const fetchTankData = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/tankStatus/latest-water-level/?tank_id=1`);
        if (!response.ok) {
          throw new Error('Failed to fetch tank data');
        }

        const data = await response.json();
        setWaterLevel(data.water_level || 0); // Set water level from the response
      } catch (error) {
        console.error('Error fetching tank data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTankData();
  }, [baseUrl]);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <motion.h1 
        className="text-3xl font-bold text-indigo-800 text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Tank Status
      </motion.h1>

      <div className="flex flex-col gap-6"> {/* Use flexbox for full width layout */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full"> {/* Full width card */}
            <CardHeader>
              <CardTitle className="text-indigo-700">Current Water Level</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-6">
              <WaterTank waterLevel={waterLevel} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full"> {/* Full width card */}
            <CardHeader>
              <CardTitle className="text-indigo-700">Tank Level Details</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="w-full h-12" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-indigo-100">
                        <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase">Level</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-indigo-200">
                        <td className="px-4 py-3">
                          <Badge variant={waterLevel > 50 ? 'success' : 'warning'}>
                            {waterLevel.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-indigo-800">N/A</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
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