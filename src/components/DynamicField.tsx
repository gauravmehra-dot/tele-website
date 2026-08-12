import type { FieldOption, FieldSchema, FormValues } from '../data/categoryForms'
import { fieldClass, labelClass } from './formStyles'

interface Props {
  field: FieldSchema
  values: FormValues
  error?: string
  onChange: (name: string, value: string | string[]) => void
}

const TONE_STYLES = {
  info: 'bg-[#F5F9FF] border-[#E2EBF6] text-[#1A2B3C]',
  warning: 'bg-[#FFF8F0] border-orange-200 text-orange-900',
  danger: 'bg-red-50 border-red-200 text-red-800',
}

/** Safety callout shown when a selected option carries a red flag. */
function RedFlag({ message }: { message: string }) {
  return (
    <div className="mt-2 flex gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200">
      <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
      <p className="text-xs text-red-800 leading-relaxed">{message}</p>
    </div>
  )
}

export default function DynamicField({ field, values, error, onChange }: Props) {
  if (field.showIf && !field.showIf(values)) return null

  const raw = values[field.name]
  const value = Array.isArray(raw) ? '' : (raw ?? '')
  const list = Array.isArray(raw) ? raw : []
  const hasError = Boolean(error)

  // Surface the red flag attached to whichever option is currently chosen.
  const activeFlags = (field.options ?? [])
    .filter((o) => o.redFlag && (o.value === value || list.includes(o.value)))
    .map((o) => o.redFlag as string)

  const label = field.label && (
    <label className={labelClass}>
      {field.label}
      {field.required && ' *'}
      {!field.required && field.type !== 'info' && (
        <span className="text-[#94A3B8] font-normal"> (optional)</span>
      )}
    </label>
  )

  const hint = field.hint && <p className="mt-1.5 text-xs text-[#94A3B8]">{field.hint}</p>
  const errorNode = error && <p className="mt-1.5 text-xs text-red-600">{error}</p>
  const flags = activeFlags.map((message) => <RedFlag key={message} message={message} />)

  const wrap = (control: React.ReactNode) => (
    <div className={field.wide ? 'sm:col-span-2' : ''}>
      {label}
      {control}
      {errorNode}
      {hint}
      {flags}
    </div>
  )

  switch (field.type) {
    case 'info':
      return (
        <div className={field.wide === false ? '' : 'sm:col-span-2'}>
          <div className={`flex gap-3 p-4 rounded-2xl border ${TONE_STYLES[field.tone ?? 'info']}`}>
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <p className="text-sm leading-relaxed">{field.body}</p>
          </div>
        </div>
      )

    case 'textarea':
      return wrap(
        <>
          <textarea
            className={`${fieldClass(hasError)} resize-none`}
            rows={field.rows ?? 4}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
          />
          {field.minLength && (
            <div className="flex justify-end mt-1">
              <span
                className={`text-xs font-semibold ${
                  value.trim().length >= field.minLength ? 'text-[#0099A8]' : 'text-[#94A3B8]'
                }`}
              >
                {value.trim().length} / {field.minLength}
              </span>
            </div>
          )}
        </>,
      )

    case 'select':
      return wrap(
        <select
          className={fieldClass(hasError)}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
        >
          <option value="">Select an option</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>,
      )

    case 'radio':
      return wrap(
        <div className="grid sm:grid-cols-2 gap-3">
          {field.options?.map((option: FieldOption) => {
            const selected = value === option.value
            return (
              <button
                key={option.value}
                onClick={() => onChange(field.name, option.value)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                  selected
                    ? 'border-[#0A6EBD] bg-[#E8F4FE]'
                    : hasError
                    ? 'border-red-300 hover:border-[#0A6EBD]/50'
                    : 'border-[#E2EBF6] hover:border-[#0A6EBD]/50'
                }`}
              >
                <span
                  className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selected ? 'border-[#0A6EBD]' : 'border-[#CBD5E1]'
                  }`}
                >
                  {selected && <span className="w-2 h-2 rounded-full bg-[#0A6EBD]" />}
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-semibold ${selected ? 'text-[#0A6EBD]' : 'text-[#0A1628]'}`}>
                    {option.label}
                  </span>
                  {option.hint && <span className="block text-xs text-[#64748B] mt-0.5">{option.hint}</span>}
                </span>
              </button>
            )
          })}
        </div>,
      )

    case 'checkbox-group':
      return wrap(
        <div className="grid sm:grid-cols-2 gap-3">
          {field.options?.map((option) => {
            const checked = list.includes(option.value)
            return (
              <button
                key={option.value}
                onClick={() =>
                  onChange(
                    field.name,
                    checked ? list.filter((v) => v !== option.value) : [...list, option.value],
                  )
                }
                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                  checked ? 'border-[#0A6EBD] bg-[#E8F4FE]' : 'border-[#E2EBF6] hover:border-[#0A6EBD]/50'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    checked ? 'border-[#0A6EBD] bg-[#0A6EBD]' : 'border-[#CBD5E1]'
                  }`}
                >
                  {checked && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  )}
                </span>
                <span className={`text-sm font-medium ${checked ? 'text-[#0A6EBD]' : 'text-[#0A1628]'}`}>
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>,
      )

    case 'scale':
      return wrap(
        <div className="flex items-center gap-3 pt-1">
          <input
            type="range"
            min={field.min ?? 0}
            max={field.max ?? 10}
            value={value || String(field.min ?? 0)}
            onChange={(e) => onChange(field.name, e.target.value)}
            className="flex-1 accent-[#0A6EBD]"
          />
          <span className="w-9 h-9 rounded-lg bg-[#0A6EBD] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            {value || field.min || 0}
          </span>
        </div>,
      )

    case 'files':
      return wrap(
        <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-[#E2EBF6] cursor-pointer hover:border-[#0A6EBD]/50 transition-colors bg-[#F5F9FF]">
          <svg className="w-6 h-6 text-[#0A6EBD] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <span className="text-sm text-[#64748B]">Click to upload or drag a file here</span>
          <input type="file" accept={field.accept ?? 'image/*'} multiple className="hidden" />
        </label>,
      )

    case 'consent': {
      const checked = value === 'yes'
      return (
        <div className={field.wide ? 'sm:col-span-2' : ''}>
          <label
            className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              checked
                ? 'border-[#0A6EBD] bg-[#E8F4FE]'
                : hasError
                ? 'border-red-400 bg-red-50'
                : 'border-[#E2EBF6] bg-[#F5F9FF] hover:border-[#0A6EBD]/50'
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange(field.name, e.target.checked ? 'yes' : '')}
              className="mt-0.5 w-4 h-4 accent-[#0A6EBD] flex-shrink-0"
            />
            <span className={`text-sm ${checked || !field.required ? 'text-[#1A2B3C]' : 'text-red-700'}`}>
              {field.label}
              {!field.required && <span className="text-[#94A3B8]"> (optional)</span>}
            </span>
          </label>
          {errorNode}
        </div>
      )
    }

    default:
      return wrap(
        <input
          type={field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : field.type === 'month' ? 'month' : 'text'}
          className={fieldClass(hasError)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
        />,
      )
  }
}
