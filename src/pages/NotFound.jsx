import { motion } from 'framer-motion'
import { HeartOff, ShieldAlert } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      className="min-h-screen bg-slate-950 flex items-center justify-center p-5 text-center select-none"
      dir="rtl"
      style={{ fontFamily: "'Playpen Sans', 'Cairo', 'Tajawal', sans-serif" }}
    >
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-rose-500/10 blur-[100px]" />
        <div className="absolute right-10 bottom-20 h-80 w-80 rounded-full bg-pink-500/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-3xl border border-rose-950/40 bg-slate-900/80 backdrop-blur-xl shadow-2xl relative z-10 space-y-6"
      >
        {/* Glowing Broken Heart / Security Badge */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full scale-150 animate-pulse" />
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg relative z-10">
              <HeartOff size={38} className="text-white animate-bounce" />
            </div>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-3">
          <h1 className="text-2xl font-black text-white tracking-wide">
            هذا اللينك غير متاح الان 🔒
          </h1>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-1.5 opacity-30">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          <span className="w-8 h-[1px] bg-rose-400" />
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        </div>
      </motion.div>
    </div>
  )
}
