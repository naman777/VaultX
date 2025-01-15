'use client'

import { motion } from 'framer-motion'
import { Upload, Share2, Shield } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    title: 'I. Upload',
    description: 'Upload your files securely with end-to-end encryption and smart compression.',
  },
  {
    icon: Share2,
    title: 'II. Share',
    description: 'Share files instantly with anyone, anywhere, with customizable access controls.',
  },
  {
    icon: Shield,
    title: 'III. Secure & Access',
    description: 'Access your files anytime while maintaining complete security and privacy.',
  },
]

export default function Process() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-gray-800 text-gray-200 mb-4">
            The Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Three Simple Steps to
            <br />
            Start Sharing Files
          </h2>
          <p className="text-gray-400 text-lg">
            Begin your secure file sharing journey in just 3 easy steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative p-6 rounded-2xl bg-gray-800/20 backdrop-blur-sm border border-gray-700"
            >
              <div className="absolute -top-4 left-6 w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                <step.icon className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mt-4 mb-3">{step.title}</h3>
              <p className="text-gray-400">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

