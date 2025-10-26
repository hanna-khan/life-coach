import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  fadeInUp, 
  scaleIn, 
  bounceIn, 
  pulseAnimation, 
  floatingAnimation,
  gradientAnimation,
  staggerContainer 
} from '../utils/animations.ts';
import Button from '../components/UI/Button.tsx';
import Card from '../components/UI/Card.tsx';
import Input from '../components/UI/Input.tsx';
import LoadingSpinner from '../components/Animation/LoadingSpinner.tsx';
import SkeletonLoader from '../components/Animation/SkeletonLoader.tsx';
import Notification from '../components/UI/Notification.tsx';

const AnimationShowcase: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  const triggerNotification = (type: 'success' | 'error' | 'warning' | 'info') => {
    setNotificationType(type);
    setShowNotification(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-max">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Animation Showcase</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the beautiful animations and interactions throughout the Life Coach platform
          </p>
        </motion.div>

        {/* Animation Categories */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Fade In Up Animation */}
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Fade In Up</h3>
            <p className="text-gray-600 mb-4">Elements gracefully fade in from below</p>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <motion.div
                  key={item}
                  className="bg-primary-100 p-4 rounded-lg"
                  variants={fadeInUp}
                  custom={item}
                >
                  <p className="text-primary-700">Animated item {item}</p>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Scale In Animation */}
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Scale In</h3>
            <p className="text-gray-600 mb-4">Elements scale up from center</p>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <motion.div
                  key={item}
                  className="bg-secondary-100 p-4 rounded-lg text-center"
                  variants={scaleIn}
                  custom={item}
                >
                  <p className="text-secondary-700 font-semibold">{item}</p>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Bounce Animation */}
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Bounce In</h3>
            <p className="text-gray-600 mb-4">Spring-based bounce effect</p>
            <motion.div
              className="bg-green-100 p-6 rounded-lg text-center"
              variants={bounceIn}
            >
              <p className="text-green-700 font-semibold">Bouncy Element!</p>
            </motion.div>
          </Card>

          {/* Pulse Animation */}
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Pulse Effect</h3>
            <p className="text-gray-600 mb-4">Continuous pulsing animation</p>
            <motion.div
              className="bg-purple-100 p-6 rounded-lg text-center"
              variants={pulseAnimation}
              animate="animate"
            >
              <p className="text-purple-700 font-semibold">Pulsing Element</p>
            </motion.div>
          </Card>
        </motion.div>

        {/* Interactive Components */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Buttons */}
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Animated Buttons</h3>
            <div className="space-y-4">
              <Button variant="primary" size="md">
                Primary Button
              </Button>
              <Button variant="outline" size="md">
                Outline Button
              </Button>
              <Button variant="ghost" size="md">
                Ghost Button
              </Button>
            </div>
          </Card>

          {/* Form Elements */}
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Animated Forms</h3>
            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
              />
            </div>
          </Card>

          {/* Loading States */}
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Loading States</h3>
            <div className="space-y-4">
              <div className="text-center">
                <LoadingSpinner size="md" />
                <p className="text-gray-600 mt-2">Loading Spinner</p>
              </div>
              <div>
                <SkeletonLoader height="20px" className="mb-2" />
                <SkeletonLoader height="20px" width="75%" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Notification Demo */}
        <motion.div
          className="text-center mb-8"
          variants={fadeInUp}
        >
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Notification System</h3>
          <p className="text-gray-600 mb-6">Click buttons to see animated notifications</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="primary" 
              onClick={() => triggerNotification('success')}
            >
              Success Notification
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => triggerNotification('error')}
            >
              Error Notification
            </Button>
            <Button 
              variant="outline" 
              onClick={() => triggerNotification('warning')}
            >
              Warning Notification
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => triggerNotification('info')}
            >
              Info Notification
            </Button>
          </div>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center overflow-hidden"
          variants={gradientAnimation}
          animate="animate"
        >
          <motion.div
            className="absolute top-4 left-4 w-8 h-8 bg-white bg-opacity-20 rounded-full"
            variants={floatingAnimation}
            animate="animate"
          />
          <motion.div
            className="absolute top-8 right-8 w-6 h-6 bg-white bg-opacity-20 rounded-full"
            variants={floatingAnimation}
            animate="animate"
            transition={{ delay: 0.5 }}
          />
          <motion.div
            className="absolute bottom-4 left-8 w-4 h-4 bg-white bg-opacity-20 rounded-full"
            variants={floatingAnimation}
            animate="animate"
            transition={{ delay: 1 }}
          />
          <motion.div
            className="absolute bottom-8 right-4 w-10 h-10 bg-white bg-opacity-20 rounded-full"
            variants={floatingAnimation}
            animate="animate"
            transition={{ delay: 1.5 }}
          />
          
          <h3 className="text-2xl font-bold mb-4 relative z-10">Gradient Background Animation</h3>
          <p className="text-blue-100 relative z-10">
            This background features a moving gradient with floating elements
          </p>
        </motion.div>

        {/* Notification Component */}
        <Notification
          type={notificationType}
          message={`This is a ${notificationType} notification with smooth animations!`}
          isVisible={showNotification}
          onClose={() => setShowNotification(false)}
        />
      </div>
    </div>
  );
};

export default AnimationShowcase;
