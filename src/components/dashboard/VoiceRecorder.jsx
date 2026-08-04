import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Play, Pause, RefreshCw, Check, AlertCircle } from 'lucide-react'

export default function VoiceRecorder({ onRecordingComplete, isUploading }) {
  const [status, setStatus] = useState('idle') // 'idle' | 'recording' | 'recorded'
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [isPlayingPreview, setIsPlayingPreview] = useState(false)
  const [error, setError] = useState('')

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)
  const previewAudioRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const startRecording = async () => {
    setError('')
    audioChunksRef.current = []
    setRecordingTime(0)

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('المتصفح لا يدعم تسجيل الصوت المباشر')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        setStatus('recorded')

        // Stop all mic tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(100)
      setStatus('recording')

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Mic access error:', err)
      setError('يرجى السماح بنفاذ المايكروفون في المتصفح لبدء التسجيل')
    }
  }

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setAudioBlob(null)
    setStatus('idle')
    setRecordingTime(0)
    setIsPlayingPreview(false)
  }

  const handleConfirmUpload = () => {
    if (!audioBlob) return
    const file = new File(
      [audioBlob],
      `voice-note-${Date.now()}.webm`,
      { type: 'audio/webm' }
    )
    onRecordingComplete(file)
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const togglePreviewPlay = () => {
    if (!previewAudioRef.current) return
    if (isPlayingPreview) {
      previewAudioRef.current.pause()
      setIsPlayingPreview(false)
    } else {
      previewAudioRef.current.play()
      setIsPlayingPreview(true)
    }
  }

  return (
    <div className="w-full rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/80 to-pink-50/50 p-4 text-center">
      {error && (
        <div className="mb-3 flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-100/90 px-3 py-2 text-xs font-semibold text-rose-700">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* IDLE STATE */}
      {status === 'idle' && (
        <div className="flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={startRecording}
            disabled={isUploading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-3 text-xs font-bold text-white shadow-md shadow-rose-200 transition hover:brightness-105 active:scale-95 disabled:opacity-50"
          >
            <Mic size={18} className="animate-pulse" />
            <span>ابدأ تسجيل صوتك الآن 🎙️</span>
          </button>
          <p className="text-[11px] text-rose-500 font-medium">
            تحدّث مباشرة من المايكروفون وسيتم حفظ صوتك ونقله للموقع
          </p>
        </div>
      )}

      {/* RECORDING STATE */}
      {status === 'recording' && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
            <span className="h-3 w-3 rounded-full bg-rose-600 animate-ping" />
            <span>جاري التسجيل: {formatTime(recordingTime)}</span>
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-rose-700 active:scale-95"
          >
            <Square size={16} />
            <span>إيقاف ومعاينة التسجيل ⏹️</span>
          </button>
        </div>
      )}

      {/* RECORDED STATE */}
      {status === 'recorded' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-white p-2.5 shadow-sm border border-rose-100">
            <button
              type="button"
              onClick={togglePreviewPlay}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm transition hover:bg-rose-600 active:scale-95"
            >
              {isPlayingPreview ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
            </button>
            <span className="text-xs font-semibold text-rose-800">
              تسجيلك الصوتي ({formatTime(recordingTime)})
            </span>
            <button
              type="button"
              onClick={resetRecording}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-rose-500 hover:bg-rose-50 transition"
              title="إعادة التسجيل"
            >
              <RefreshCw size={13} />
              إعادة
            </button>
          </div>

          <audio
            ref={previewAudioRef}
            src={audioUrl}
            onEnded={() => setIsPlayingPreview(false)}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleConfirmUpload}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-xs font-bold text-white shadow-md transition hover:brightness-105 active:scale-95 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>جاري حفظ ورفع التسجيل...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>اعتماد ورفع التسجيل الصوتي للموقع ✨</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
