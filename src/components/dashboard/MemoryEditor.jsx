import { ImagePlus, Trash2, X } from 'lucide-react'
import { DateInput, Field, TextArea } from './DashboardFields'
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
  imageHint,
  showImage = true,
}) {
  const { content } = useContent()
  const lang = content?.language || 'ar'
  const isEn = lang === 'en' || lang === 'en-GB'
  const isEs = lang === 'es'

  const defaultItemLabel = itemLabel || (isEs ? 'Recuerdo' : isEn ? 'Memory' : 'ذكرى')
  const defaultImageHint = imageHint || (isEs ? 'Subir imagen' : isEn ? 'Upload image' : 'رفع صورة')

  const deleteLabel = isEs ? 'Eliminar' : isEn ? 'Delete' : 'حذف'
  const dateLabel = isEs ? 'Fecha (Opcional)' : isEn ? 'Date (Optional)' : 'التاريخ (اختياري)'
  const textLabel = isEs ? 'Texto' : isEn ? 'Text' : 'النص'
  const textPlaceholder = isEs ? 'Escribe los detalles aquí...' : isEn ? 'Write details here...' : 'اكتب تفاصيل أو كلام هذه الذكرى هنا...'

  return (
    <article className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-rose-700">
          {defaultItemLabel} #{index + 1}
        </span>
        {canRemove ? (
          <button
            type="button"
            onClick={() => onRemove(memory.id)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-rose-400 transition hover:bg-rose-100 hover:text-rose-600 cursor-pointer"
          >
            <Trash2 size={14} />
            {deleteLabel}
          </button>
        ) : null}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {showImage ? (
          <div className="w-full sm:w-28 shrink-0 flex flex-col items-center gap-2">
            {/* Image Preview Box */}
            <div className="relative w-28 h-28 overflow-hidden rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 flex items-center justify-center shadow-inner">
              {(memory.image || memory.url) ? (
                <>
                  <img
                    src={memory.image || memory.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onImageRemove?.(memory.id)}
                    className="absolute start-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white shadow-md transition hover:bg-rose-600 cursor-pointer"
                    aria-label={isEs ? 'Eliminar imagen' : isEn ? 'Remove image' : 'حذف الصورة'}
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <div className="text-xl text-rose-200">♥</div>
              )}
            </div>
            {/* Upload Button */}
            <label className="w-28 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-rose-200 bg-white px-2 py-2 text-[10px] text-rose-500 font-bold text-center leading-normal transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600">
              <ImagePlus size={12} className="mb-0.5" />
              <span>{defaultImageHint}</span>
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
          </div>
        ) : null}

        {/* Inputs (Date & Text) */}
        <div className="flex-1 w-full space-y-3">
          <Field label={dateLabel}>
            <DateInput
              value={memory.date ?? ''}
              onChange={(value) => onChange(memory.id, { date: value })}
            />
          </Field>
          <Field label={textLabel}>
            <TextArea
              value={memory.text ?? memory.description ?? ''}
              onChange={(value) => onChange(memory.id, { text: value, description: value })}
              rows={3}
              placeholder={textPlaceholder}
            />
          </Field>
        </div>
      </div>
    </article>
  )
}
