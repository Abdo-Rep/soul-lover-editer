import { Heart } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0e0714] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#160c22]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
          <Heart className="w-8 h-8 opacity-60" />
        </div>

        <div className="space-y-1">
          <span className="text-3xl font-bold font-mono text-rose-400">404</span>
          <h1 className="text-lg font-bold text-white">الصفحة غير موجودة</h1>
          <p className="text-xs text-rose-200/50 leading-relaxed">
            الرابط الذي تحاول الوصول إليه غير صحيح.
          </p>
        </div>
      </div>
    </div>
  )
}
