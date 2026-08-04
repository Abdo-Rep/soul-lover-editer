import { ImagePlus, Trash2, X } from 'lucide-react'
import { DateInput, Field, TextArea } from './DashboardFields'

export default function MemoryEditor({
  memory,
  index,
  onChange,
  onImageUpload,
  onImageRemove,
  onRemove,
  canRemove,
  itemLabel = 'ذكرى',
  imageHint = 'رفع صورة',
  showImage = true,
}) {
  return (
    <article className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-rose-700">
          {itemLabel} #{index + 1}
        </span>
        {canRemove ? (
          <button
            type="button"
            onClick={() => onRemove(memory.id)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-rose-400 transition hover:bg-rose-100 hover:text-rose-600"
          >
            <Trash2 size={14} />
            حذف
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        {showImage ? (
      <div className="space-y-3">
        {/* Image Upload Area */}
        <div className="relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 aspect-[4/3]">
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
                className="absolute end-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white shadow-md transition hover:bg-rose-600"
                aria-label="حذف الصورة"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-3xl text-rose-200">
              ♥
            </div>
          )}
        </div>
        <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-rose-200 bg-white px-3 py-2.5 text-xs text-rose-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600">
          <ImagePlus size={14} />
          <span>{imageHint}</span>
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

        <div className="space-y-3">
          <Field label="التاريخ (اختياري)">
            <DateInput
              value={memory.date ?? ''}
              onChange={(value) => onChange(memory.id, { date: value })}
            />
          </Field>
          <Field label="النص">
            <TextArea
              value={memory.text ?? ''}
              onChange={(value) => onChange(memory.id, { text: value })}
              rows={3}
              placeholder="اكتب تفاصيل أو كلام هذه الذكرى هنا..."
            />
          </Field>
        </div>
      </div>
    </article>
  )
}
