import { Heart, Home as HomeIcon } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0e0714] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#160c22]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
          <Heart className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-bold font-mono text-rose-400">404</span>
          <h1 className="text-xl font-bold text-white">الصفحة غير موجودة</h1>
          <p className="text-xs text-rose-200/60 leading-relaxed">
            عذراً، الرابط الذي تحاول الوصول إليه غير صحيح أو تم إزالته.
          </p>
        </div>

        <a
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium text-sm shadow-lg shadow-rose-500/20 transition-all"
        >
          <HomeIcon className="w-4 h-4" />
          العودة للصفحة الرئيسية
        </a>
      </div>
    </div>
  )
}
