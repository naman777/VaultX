'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function Hero() {
  return (
    <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center rounded-full px-4 py-1 text-sm bg-gray-800/50 backdrop-blur-sm border border-gray-700 mb-8"
        >
          <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
          <span className="text-gray-200">Launching Soon</span>
          <span className="ml-2 text-gray-400">→</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl sm:text-6xl font-bold text-white mb-6 tracking-tight"
        >
          Secure File Sharing
          <br />
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            For Everyone
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-400 mb-10"
        >
          Share, store, and collaborate on files securely through our decentralized platform,
          while maintaining complete control over your data.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="inline-flex items-center rounded-full px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium text-lg cursor-pointer transition-all"
        >
          <span className="mr-2">Join the Future of File Sharing Now!</span>
          <Button variant="ghost" size="sm" className="text-white">
            <Link href="/signin" className="text-white">
            Get Started →
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

