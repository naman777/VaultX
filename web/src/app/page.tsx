import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import Process from '@/components/process'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Process />
      </div>
      {/* Grid background */}
      <div 
        className="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.2)_2px,transparent_2px),linear-gradient(90deg,rgba(0,0,0,0.2)_2px,transparent_2px)] bg-[size:50px_50px] opacity-20"
        style={{ backgroundPosition: "center" }}
      />
    </main>
  )
}

