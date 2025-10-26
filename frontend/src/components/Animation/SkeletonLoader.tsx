import React from 'react';
import { motion } from 'framer-motion';
import { skeletonAnimation, shimmerAnimation } from '../../utils/animations.ts';

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  width = '100%', 
  height = '20px',
  className = '',
  rounded = true 
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className={`bg-gray-200 ${rounded ? 'rounded' : ''}`}
        style={{ width, height }}
        variants={skeletonAnimation}
        animate="animate"
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
        variants={shimmerAnimation}
        animate="animate"
      />
    </div>
  );
};

export default SkeletonLoader;
