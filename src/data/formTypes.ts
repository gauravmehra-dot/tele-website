export type FormValues = Record<string, string | string[]>

export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox-group'
  | 'consent'
  | 'date'
  | 'month'
  | 'scale'
  | 'tel'
  | 'email'
  | 'files'
  | 'info'

export interface FieldOption {
  value: string
  label: string
  hint?: string
  /** Shown as a callout when this option is selected. */
  redFlag?: string
}

export interface FieldSchema {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  hint?: string
  required?: boolean
  options?: FieldOption[]
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  rows?: number
  /** File input accept attribute. */
  accept?: string
  /** Span both columns in a two-column section. */
  wide?: boolean
  showIf?: (values: FormValues) => boolean
  validate?: (value: string, values: FormValues) => string | null
  /** For type 'info' */
  tone?: 'info' | 'warning' | 'danger'
  body?: string
}

export interface FormSection {
  title: string
  description?: string
  fields: FieldSchema[]
}

export type Errors = Record<string, string>

/** Runs required, minLength and custom validators across a set of sections. */
export function validateSections(sections: FormSection[], values: FormValues): Errors {
  const errors: Errors = {}

  for (const section of sections) {
    for (const field of section.fields) {
      if (field.type === 'info') continue
      if (field.showIf && !field.showIf(values)) continue

      const raw = values[field.name]
      const isList = Array.isArray(raw)
      const text = isList ? (raw as string[]).join(', ') : String(raw ?? '')
      const empty = isList ? (raw as string[]).length === 0 : !text.trim()

      if (field.required && empty) {
        errors[field.name] =
          field.type === 'consent'
            ? 'This declaration is required'
            : field.type === 'radio' || field.type === 'select' || field.type === 'checkbox-group'
            ? 'Please answer this question'
            : 'This field is required'
        continue
      }
      if (empty) continue

      if (field.minLength && text.trim().length < field.minLength) {
        errors[field.name] = `Please use at least ${field.minLength} characters`
        continue
      }

      const custom = field.validate?.(text, values)
      if (custom) errors[field.name] = custom
    }
  }

  return errors
}
