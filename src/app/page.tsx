'use client'
import { FaChartLine, FaDatabase, FaExclamationTriangle } from 'react-icons/fa';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8 } }
};

const scaleUp = {
  hidden: { scale: 0.95, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { duration: 0.5 } }
};

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[url('/heroImage.jpg')] bg-cover bg-center flex items-center justify-center h-[60vh] py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {isMounted && (
              <motion.div 
                className="md:w-1/2 mb-10 md:mb-0"
                initial="hidden"
                animate="show"
                variants={container}
              >
                <motion.h1 
                  className="text-5xl font-bold text-zinc-100 mb-6"
                  variants={item}
                >
                  Flood Prediction in Endangered Areas of Pakistan
                </motion.h1>
                <motion.p 
                  className="text-xl text-zinc-200 mb-8"
                  variants={item}
                >
                  Leveraging advanced analytics and historical data to protect vulnerable communities from flood disasters.
                </motion.p>
                <motion.div 
                  className="flex gap-4"
                  variants={item}
                >
                  <Link href="/predictor" className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors">
                    Try Predictor
                  </Link>
                  <Link href="/history" className=" text-white bg-zinc-900 px-6 py-3 rounded-lg hover:bg-zinc-800 transition-colors shadow-lg">
                    View History
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            Key Features
          </motion.h2>
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={container}
          >
            {/* Predictive Analytics Card */}
            <motion.div 
              className="p-8 border-2 rounded-lg min-h-[300px] flex flex-col items-center justify-center hover:shadow-lg transition-shadow"
              variants={item}
              whileHover={{ y: -5 }}
            >
              <div className="flex justify-center mb-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                >
                  <FaChartLine className="text-4xl text-orange-600" />
                </motion.div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">Predictive Analytics</h3>
              <p className="text-zinc-600 text-center">
                Advanced machine learning models to forecast potential flood events.
              </p>
            </motion.div>

            {/* Historical Data Card */}
            <motion.div 
              className="p-8 border-2 rounded-lg min-h-[300px] flex flex-col items-center justify-center hover:shadow-lg transition-shadow"
              variants={item}
              whileHover={{ y: -5 }}
            >
              <div className="flex justify-center mb-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FaDatabase className="text-4xl text-orange-600" />
                </motion.div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">Historical Data</h3>
              <p className="text-zinc-600 text-center">
                Comprehensive database of past flood events and their impacts.
              </p>
            </motion.div>

            {/* Risk Assessment Card */}
            <motion.div 
              className="p-8 border-2 rounded-lg min-h-[300px] flex flex-col items-center justify-center hover:shadow-lg transition-shadow"
              variants={item}
              whileHover={{ y: -5 }}
            >
              <div className="flex justify-center mb-4">
                <motion.div
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <FaExclamationTriangle className="text-4xl text-orange-600" />
                </motion.div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">Risk Assessment</h3>
              <p className="text-zinc-600 text-center">
                Detailed analysis of vulnerable areas and population centers.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-zinc-800 text-white py-24 h-[40vh]">
        <motion.div 
          className="container mx-auto px-6 text-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <motion.h2 
            className="text-3xl font-bold mb-6"
            variants={scaleUp}
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p 
            className="text-lg mb-8"
            variants={scaleUp}
          >
            Join us in protecting communities through data-driven flood prediction.
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/signup" className="bg-white text-zinc-900 px-8 py-3 rounded-lg hover:bg-zinc-100 transition-colors inline-block">
              Sign Up Now
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}