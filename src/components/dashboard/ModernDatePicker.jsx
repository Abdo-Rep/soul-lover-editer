import { useState, useRef, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react'
import { useContent } from '../../context/ContentContext'

export default function ModernDatePicker({ value, onChange, placeholder = 'اختر التاريخ' }) {
  const { content } = useContent()
  const lang = content?.language || 'ar'
  const isEn = lang === 'en' || lang === 'en-GB'
  const isEs = lang === 'es'

  // Dynamic days & months translation
  const MONTH_NAMES = isEs ? [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ] : isEn ? [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ] : [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ]

  const DAYS = isEs 
    ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] 
    : isEn 
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] 
    : ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']

  const defaultPlaceholder = isEs ? 'Seleccionar fecha' : isEn ? 'Select date' : 'اختر التاريخ'
  const finalPlaceholder = placeholder === 'اختر التاريخ' ? defaultPlaceholder : placeholder

  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Parse initial date (YYYY-MM-DD)
  const parsedDate = value ? new Date(value) : null
  const isValidDate = parsedDate && !isNaN(parsedDate.getTime())

  const [currentYear, setCurrentYear] = useState(isValidDate ? parsedDate.getFullYear() : new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(isValidDate ? parsedDate.getMonth() : new Date().getMonth())

  useEffect(() => {
    if (value) {
      const d = new Date(value)
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear())
        setCurrentMonth(d.getMonth())
      }
    }
  }, [value])

  // Close calendar popover on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const handleSelectDay = (day) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0')
    const formattedDay = String(day).padStart(2, '0')
    const formattedDate = `${currentYear}-${formattedMonth}-${formattedDay}`
    onChange(formattedDate)
    setIsOpen(false)
  }

  const handleSetToday = () => {
    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const d = String(today.getDate()).padStart(2, '0')
    onChange(`${y}-${m}-${d}`)
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange('')
    setIsOpen(false)
  }

  // Days matrix for current month
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const selectedDay = isValidDate && parsedDate.getFullYear() === currentYear && parsedDate.getMonth() === currentMonth
    ? parsedDate.getDate()
    : null

  const today = new Date()
  const isCurrentMonthToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth ? today.getDate() : null

  // Format display text
  let displayText = finalPlaceholder
  if (value) {
    const d = new Date(value)
    if (!isNaN(d.getTime())) {
      displayText = isEn || isEs 
        ? `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
        : `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
    } else {
      displayText = value
    }
  }

  return (
    <div className={`relative w-full ${lang === 'ar' ? 'text-right' : 'text-left'}`} ref={containerRef} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all shadow-sm ${
          isOpen
            ? 'border-rose-400 bg-white ring-2 ring-rose-200/60'
            : 'border-rose-200/80 bg-white/90 hover:border-rose-300 hover:bg-white'
        }`}
      >
        <div className={`flex items-center gap-2 text-rose-900 ${lang !== 'ar' && 'flex-row-reverse'}`}>
          <CalendarIcon className="h-4 w-4 text-rose-400 transition-transform group-hover:scale-110" />
          <span className={value ? 'text-rose-950 font-semibold' : 'text-rose-400/80 font-normal'}>
            {displayText}
          </span>
        </div>
        {value ? (
          <span
            onClick={(e) => {
              e.stopPropagation()
              handleClear()
            }}
            className="rounded-full p-1 text-rose-400 hover:bg-rose-100 hover:text-rose-600 transition-colors cursor-pointer"
            title={isEs ? 'Eliminar fecha' : isEn ? 'Clear date' : 'مسح التاريخ'}
          >
            <X className="h-3.5 w-3.5" />
          </span>
        ) : (
          <Sparkles className="h-3.5 w-3.5 text-rose-300" />
        )}
      </button>

      {/* Popover Calendar Modal */}
      {isOpen && (
        <div className={`absolute ${lang === 'ar' ? 'right-0' : 'left-0'} z-50 mt-2 w-80 rounded-2xl border border-rose-100 bg-white p-4 shadow-2xl shadow-rose-900/10 backdrop-blur-lg animate-in fade-in zoom-in-95 duration-150`}>
          {/* Calendar Header */}
          <div className="mb-3 flex items-center justify-between pb-2 border-b border-rose-100/60">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
              title={isEs ? 'Mes anterior' : isEn ? 'Previous month' : 'الشهر السابق'}
            >
              {lang === 'ar' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            <div className="flex items-center gap-1.5 font-bold text-rose-900 text-sm">
              <span>{MONTH_NAMES[currentMonth]}</span>
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="bg-transparent text-rose-700 font-bold focus:outline-none cursor-pointer"
              >
                {Array.from({ length: 40 }, (_, i) => 1990 + i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
              title={isEs ? 'Mes siguiente' : isEn ? 'Next month' : 'الشهر التالي'}
            >
              {lang === 'ar' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>

          {/* Weekday Names */}
          <div className="mb-1.5 grid grid-cols-7 text-center text-[11px] font-bold text-rose-400">
            {DAYS.map((day, idx) => (
              <div key={idx} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
            {/* Empty slots for leading days */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-8" />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1
              const isSelected = selectedDay === day
              const isToday = isCurrentMonthToday === day

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-rose-400 to-pink-500 font-bold text-white shadow-md shadow-rose-300/80 scale-105'
                      : isToday
                      ? 'border border-rose-300 font-bold text-rose-600 bg-rose-50/80'
                      : 'text-rose-900 hover:bg-rose-50 hover:text-rose-600'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Quick Footer Controls */}
          <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-rose-100/60 text-xs">
            <button
              type="button"
              onClick={handleSetToday}
              className="font-bold text-rose-500 hover:text-rose-700 transition-colors"
            >
              {isEs ? 'Hoy 🎯' : isEn ? 'Today 🎯' : 'اليوم 🎯'}
            </button>
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="text-rose-400 hover:text-rose-600 transition-colors"
              >
                {isEs ? 'Limpiar' : isEn ? 'Clear' : 'إلغاء التحديد'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
