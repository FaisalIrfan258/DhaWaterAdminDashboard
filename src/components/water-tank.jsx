import React from 'react';
import { motion } from 'framer-motion';

export const WaterTank = ({ waterLevel }) => {
  return (
    <div className="w-48 h-64 bg-gradient-to-b from-blue-100 to-blue-200 border-2 border-blue-400 rounded-lg relative overflow-hidden">
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-blue-400 to-blue-600"
        initial={{ height: '0%' }}
        animate={{ height: `${waterLevel}%` }}
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-blue-300 opacity-30 animate-wave"></div>
        <div className="absolute top-1 left-0 right-0 h-2 bg-blue-300 opacity-30 animate-wave-reverse"></div>
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-3xl font-bold text-white mix-blend-difference"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {waterLevel.toFixed(1)}%
        </motion.span>
      </div>
    </div>
  );
};