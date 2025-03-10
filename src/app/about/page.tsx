'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <motion.h1 
        className="text-4xl font-bold text-center mb-6" 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        About Our Flood Prediction System
      </motion.h1>
      
      <Separator className="my-6" />
      
      <motion.p 
        className="text-lg text-center text-gray-600 mb-8 max-w-3xl mx-auto" 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Our flood prediction system leverages real-time data analysis and machine learning
        to provide early warnings and risk assessments. Our goal is to help communities
        stay safe and prepared for potential flood events.
      </motion.p>
      
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Accurate Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">We use advanced models to predict flood risks with high accuracy, minimizing uncertainty.</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Real-Time Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Our system continuously monitors river discharge levels and weather patterns.</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Community Safety</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">We provide early warnings to help people and authorities take preventive action.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      
    </div>
  );
}
