import { ImagePlus, Trash2, X, GripVertical } from 'lucide-react'
import { DateInput, TextArea } from './DashboardFields'
import { useContent } from '../../context/ContentContext'

export default function MemoryEditor({
  memory,
  index,
  onChange,
  onImageUpload,
  onImageRemove,
  onRemove,
  canRemove,
  itemLabel,
  showImage = true,
  showDragHandle = false,
  dragControls,
}) {
  const { content } = useContent()
  const lang = content?.language || 'ar'
  const isEn = lang === 'en' || lang === 'en-GB'
  const isEs = lang === 'es'

  const defaultItemLabel = itemLabel || (isEs ? 'Recuerdo' : isEn ? 'Memory' : 'ذكرى')
  const uploadLabel = isEs ? 'Subir imagen' : isEn ? 'Upload image' : 'رفع صورة'
  const changeLabel = isEs ? 'Cambiar imagen' : isEn ? 'Change image' : 'تغيير الصورة'
  const hasImage = Boolean(memory.image || memory.url)
  const imageButtonText = hasImage ? changeLabel : uploadLabel

  const deleteLabel = isEs ? 'Eliminar' : isEn ? 'Delete' : 'حذف'
  const textPlaceholder = isEs ? 'Escribe los detalles aquí...' : isEn ? 'Write details here...' : 'اكتب تفاصيل أو كلام هذه الذكرى هنا...'

  return (
    <article className="rounded-2xl border border-rose-100 bg-rose-50/40 p-3.5 shadow-sm space-y-3">
      {/* 1. Top Bar: Handle & Title + Delete button */}
      <div className="flex items-center justify-between border-b border-rose-100/60 pb-2">
        <div
          {...(dragControls ? { onPointerDown: (e) => dragControls.start(e) } : {})}
          className={`flex items-center gap-2 select-none py-1 px-2 -mx-2 rounded-xl transition ${
            showDragHandle ? 'cursor-grab active:cursor-grabbing hover:bg-rose-100/60' : ''
          }`}
          style={showDragHandle ? { touchAction: 'none' } : undefined}
        >
          {showDragHandle && (
            <GripVertical size={16} className="text-rose-400" />
          )}
          <span className="text-xs font-bold text-rose-800">
            {defaultItemLabel} #{index + 1}
          </span>
        </div>
        {canRemove ? (
          <button
            type="button"
            onClick={() => onRemove(memory.id)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-rose-400 transition hover:bg-rose-100 hover:text-rose-600 cursor-pointer"
          >
            <Trash2 size={13} />
            <span>{deleteLabel}</span>
          </button>
        ) : null}
      </div>

      {/* 2. Middle Row: Image (Gap 1) + Beside it: [Upload/Change Button, Date Input] (Gap 2) */}
      <div className="flex items-center gap-3">
        {showImage && (
          <div className="shrink-0">
            {/* Image Box */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 flex items-center justify-center shadow-xs">
              {hasImage ? (
                <>
                  <img
                    src={memory.image || memory.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onImageRemove?.(memory.id)}
                    className="absolute start-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white shadow-md transition hover:bg-rose-600 cursor-pointer"
                    aria-label={isEs ? 'Eliminar imagen' : isEn ? 'Remove image' : 'حذف الصورة'}
                  >
                    <X size={11} />
                  </button>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-rose-400 hover:text-rose-600 hover:bg-rose-100/50 transition">
                  <ImagePlus size={22} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) onImageUpload(memory.id, file)
                      e.target.value = ''
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        )}

        {/* Column beside image: Change/Upload button above Date input */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Upload/Change Button */}
          {showImage && (
            <label className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-300 shadow-2xs text-xs font-semibold cursor-pointer transition active:scale-98">
              <ImagePlus size={14} className="text-rose-500" />
              <span>{imageButtonText}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onImageUpload(memory.id, file)
                  e.target.value = ''
                }}
              />
            </label>
          )}

          {/* Date Input without label, centered calendar modal */}
          <div>
            <DateInput
              value={memory.date ?? ''}
              onChange={(value) => onChange(memory.id, { date: value })}
              centered={true}
            />
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: TextArea without label */}
      <TextArea
        value={memory.text ?? memory.description ?? ''}
        onChange={(value) => onChange(memory.id, { text: value, description: value })}
        rows={2}
        placeholder={textPlaceholder}
      />
    </article>
  )
}
