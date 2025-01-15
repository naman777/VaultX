'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold">Vx</span>
              </div>
              <span className="text-white text-xl font-bold">VaultX</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#blog" className="text-gray-300 hover:text-white transition-colors">
              Blog
            </Link>
          </div>

          <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
            Get Started
          </Button>
        </div>
      </div>
    </motion.nav>
  )
}

