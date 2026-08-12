import { useState, type ReactNode } from 'react'
import EmergencyModal from '../components/EmergencyModal'
import ClinicSelect from '../components/ClinicSelect'
import DynamicField from '../components/DynamicField'
import { labelClass } from '../components/formStyles'
import { CATEGORY_FORMS, type FormSection, type FormValues } from '../data/categoryForms'
import { IDENTITY_SECTIONS, MBS_EXEMPTION_FIELD, MEDICARE_SECTIONS } from '../data/sharedForms'
import { CONSULT_CATEGORIES, categoryTitle } from '../data/consultCategories'
import { clinicLabelById } from '../data/clinics'

interface BookProps {
  setPage: (page: string) => void
}

type Errors = Record<string, string>

/**
 * Temporary switch for design review — lets you click straight through every
 * step without filling anything in. Set back to false to re-enable validation.
 */
const SKIP_VALIDATION = true

const STEPS = ['Reason', 'Details', 'Identity', 'Medicare', 'Consent & Review']

const CATEGORY_ICONS: Record<string, ReactNode> = {
  'medical-certificate': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M9 15l2 2 4-4" />
    </svg>
  ),
  'repeat-scripts': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M10.5 20.5a5 5 0 01-7-7l6-6a5 5 0 017 7l-6 6z" />
      <path d="M8.5 8.5l7 7" />
    </svg>
  ),
  respiratory: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M12 3v8M8 21c-2.2 0-3.5-1.8-3.5-4 0-3 1.5-5 3-7 .8-1 1.5-.6 1.5.6V17c0 2.2-.8 4-1 4z" />
      <path d="M16 21c2.2 0 3.5-1.8 3.5-4 0-3-1.5-5-3-7-.8-1-1.5-.6-1.5.6V17c0 2.2.8 4 1 4z" />
    </svg>
  ),
  skin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="10" r="1.2" />
      <circle cx="14.5" cy="13.5" r="1.2" />
      <circle cx="12.5" cy="8" r="0.8" />
    </svg>
  ),
  gut: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M8 3v6a4 4 0 004 4 4 4 0 014 4v4" />
      <path d="M16 3v4a3 3 0 01-3 3" />
    </svg>
  ),
  'mental-health': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M9.5 3A4.5 4.5 0 005 7.5c-1.2.8-2 2.1-2 3.6 0 1.4.7 2.7 1.8 3.5-.2 2.2 1.6 4.4 4.2 4.4 1 0 1.9-.3 2.5-.9V3.9A3 3 0 009.5 3z" />
      <path d="M14.5 3A4.5 4.5 0 0119 7.5c1.2.8 2 2.1 2 3.6 0 1.4-.7 2.7-1.8 3.5.2 2.2-1.6 4.4-4.2 4.4-1 0-1.9-.3-2.5-.9" />
    </svg>
  ),
  musculoskeletal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M7 4a2 2 0 100 4 2 2 0 002-2M7 8l3 4-2 8M10 12l5-1 3 3" />
      <circle cx="17" cy="6" r="2" />
    </svg>
  ),
  'womens-health': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <circle cx="12" cy="9" r="5" />
      <path d="M12 14v7M9 18h6" />
    </svg>
  ),
  'mens-health': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <circle cx="10" cy="14" r="5" />
      <path d="M14 10l6-6M15 4h5v5" />
    </svg>
  ),
  other: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 113.5 2.3V13M12 16.5h.01" />
    </svg>
  ),
}

const CONSENTS = [
  {
    name: 'consentIdentity',
    required: true,
    label: 'I consent to my Healthcare Identifier being used to confirm my identity for this consultation.',
  },
  {
    name: 'consentAssignment',
    required: true,
    showIf: (v: FormValues) => v.hasMedicare === 'Medicare' || v.hasMedicare === 'DVA',
    label: 'I assign my Medicare benefit for this service to the treating practitioner (bulk billing).',
  },
  {
    name: 'consentGp',
    required: true,
    label: 'I agree to have this consultation summary sent to my nominated GP.',
  },
  {
    name: 'consentMhr',
    required: false,
    label: 'I consent to information from this consultation being uploaded to my My Health Record.',
  },
  {
    name: 'consentTerms',
    required: true,
    label: 'I agree to the Terms of Service and Privacy Policy.',
  },
  {
    name: 'consentAccurate',
    required: true,
    label: 'I confirm the information I have given is accurate and complete to the best of my knowledge.',
  },
]

/** Runs required, minLength and custom validators across a set of sections. */
function validateSections(sections: FormSection[], values: FormValues): Errors {
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
          field.type === 'radio' || field.type === 'select' || field.type === 'checkbox-group'
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

export default function BookTelehealth({ setPage }: BookProps) {
  const [emergencyCleared, setEmergencyCleared] = useState(false)
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Errors>({})
  const [values, setValues] = useState<FormValues>({
    consultMethod: 'Video',
    hasMedicare: 'Medicare',
    concessionType: 'none',
  })
  const [consents, setConsents] = useState<Record<string, boolean>>({})

  const category = String(values.category ?? '')
  const detailSections = CATEGORY_FORMS[category]?.sections ?? []
  const usesBulkBilling = values.hasMedicare === 'Medicare' || values.hasMedicare === 'DVA'
  const clinicSelected = Boolean(values.clinic)

  const setValue = (name: string, value: string | string[]) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const setConsent = (name: string, checked: boolean) => {
    setConsents((prev) => ({ ...prev, [name]: checked }))
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const validate = (target: number): Errors => {
    // Choosing a category is a navigation prerequisite rather than a validation
    // rule — step 2 has no questions to render without one, so this stays on.
    if (target === 1) return values.category ? {} : { category: 'Please choose a category' }
    if (SKIP_VALIDATION) return {}

    if (target === 2) return validateSections(detailSections, values)
    if (target === 3) return validateSections(IDENTITY_SECTIONS, values)

    if (target === 4) {
      const found = validateSections(MEDICARE_SECTIONS, values)
      // Medicare's existing-relationship rule: either a clinic seen in the last
      // 12 months, or a stated exemption.
      if (usesBulkBilling && !clinicSelected && !values.mbsExemption) {
        found.mbsExemption = 'Select a clinic above, or tell us why the 12-month rule does not apply'
      }
      return found
    }

    if (target === 5) {
      const found: Errors = {}
      for (const consent of CONSENTS) {
        if (consent.showIf && !consent.showIf(values)) continue
        if (consent.required && !consents[consent.name]) found[consent.name] = 'This consent is required'
      }
      return found
    }

    return {}
  }

  const goNext = () => {
    const found = validate(step)
    setErrors(found)
    if (Object.keys(found).length === 0) setStep((s) => s + 1)
  }

  const goBack = () => {
    setErrors({})
    setStep((s) => s - 1)
  }

  const goToStep = (target: number) => {
    setErrors({})
    setStep(target)
  }

  const handleSubmit = () => {
    for (const s of [1, 2, 3, 4, 5]) {
      const found = validate(s)
      if (Object.keys(found).length > 0) {
        setErrors(found)
        setStep(s)
        return
      }
    }
    setPage('submitted')
  }

  const renderSections = (sections: FormSection[]) =>
    sections.map((section) => {
      const visible = section.fields.filter((f) => !f.showIf || f.showIf(values))
      if (visible.length === 0) return null

      return (
        <div key={section.title} className="rounded-2xl border border-[#E2EBF6] overflow-hidden">
          <div className="px-5 py-4 bg-[#F5F9FF] border-b border-[#E2EBF6]">
            <h3 className="font-semibold text-[#0A1628]">{section.title}</h3>
            {section.description && <p className="text-sm text-[#64748B] mt-0.5">{section.description}</p>}
          </div>
          <div className="p-5 grid sm:grid-cols-2 gap-5">
            {visible.map((field) => (
              <DynamicField
                key={field.name}
                field={field}
                values={values}
                error={errors[field.name]}
                onChange={setValue}
              />
            ))}
          </div>
        </div>
      )
    })

  /** Flattens visible answers for the review step. */
  const summarise = (sections: FormSection[]) =>
    sections
      .flatMap((s) => s.fields)
      .filter((f) => f.type !== 'info' && (!f.showIf || f.showIf(values)))
      .map((f) => {
        const raw = values[f.name]
        const text = Array.isArray(raw) ? raw.join(', ') : String(raw ?? '')
        return { label: f.label, value: text.trim() }
      })
      .filter((row) => row.value)

  return (
    <div className="min-h-screen bg-[#F5F9FF] pt-16">
      <EmergencyModal open={!emergencyCleared} onConfirm={() => setEmergencyCleared(true)} />

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 text-sm text-[#94A3B8] mb-6">
          <button onClick={() => setPage('home')} className="hover:text-[#0A6EBD] transition-colors">
            Consult
          </button>
          {STEPS.slice(0, step).map((label, i) => (
            <span key={label} className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
              {i + 1 === step ? (
                <span className="text-[#0A6EBD] font-medium">{label}</span>
              ) : (
                <button onClick={() => goToStep(i + 1)} className="hover:text-[#0A6EBD] transition-colors">
                  {label}
                </button>
              )}
            </span>
          ))}
        </nav>

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl text-[#0A1628] mb-3">Book a Telehealth Consultation</h1>
          <p className="text-[#64748B]">
            Bulk-billed consultations with AHPRA-registered Australian doctors.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > i + 1
                    ? 'bg-[#0099A8] text-white'
                    : step === i + 1
                    ? 'bg-[#0A6EBD] text-white shadow-lg shadow-blue-200'
                    : 'bg-white border-2 border-[#E2EBF6] text-[#94A3B8]'
                }`}>
                  {step > i + 1 ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  ) : i + 1}
                </div>
                <span className={`text-xs mt-1 text-center hidden sm:block ${step === i + 1 ? 'text-[#0A6EBD] font-semibold' : 'text-[#94A3B8]'}`}>
                  {s}
                </span>
              </div>
            ))}
          </div>
          <div className="relative h-2 bg-[#E2EBF6] rounded-full mt-2">
            <div
              className="absolute left-0 top-0 h-2 bg-gradient-to-r from-[#0A6EBD] to-[#0099A8] rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
          <div className="text-center mt-2 text-xs text-[#94A3B8]">Step {step} of {STEPS.length}</div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#E2EBF6] overflow-hidden">
          {/* Step 1 — Category */}
          {step === 1 && (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#E8F4FE] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0A6EBD]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 6h16M4 12h16M4 18h10" />
                  </svg>
                </div>
                <h2 className="text-2xl text-[#0A1628]">Choose a Category</h2>
              </div>
              <p className="text-[#64748B] mb-6">
                Each category asks a few tailored questions so your doctor is prepared before the call.
              </p>

              {errors.category && <p className="mb-3 text-xs text-red-600">{errors.category}</p>}

              <div className="space-y-3">
                {CONSULT_CATEGORIES.map((cat) => {
                  const selected = category === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setValue('category', cat.id); setStep(2) }}
                      className={`group w-full flex items-center gap-4 text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 ${
                        selected
                          ? 'border-[#0A6EBD] bg-[#E8F4FE] shadow-sm'
                          : 'border-[#E2EBF6] hover:border-[#0A6EBD]/50 hover:bg-[#F5F9FF] hover:shadow-sm'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                        selected
                          ? 'bg-gradient-to-br from-[#0A6EBD] to-[#0099A8] text-white'
                          : 'bg-gradient-to-br from-[#0A6EBD]/10 to-[#0099A8]/10 text-[#0A6EBD] group-hover:from-[#0A6EBD] group-hover:to-[#0099A8] group-hover:text-white'
                      }`}>
                        {CATEGORY_ICONS[cat.id]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold ${selected ? 'text-[#0A6EBD]' : 'text-[#0A1628]'}`}>{cat.title}</div>
                        <div className="text-sm text-[#64748B] leading-relaxed mt-0.5">{cat.description}</div>
                      </div>
                      <svg
                        className={`w-5 h-5 flex-shrink-0 transition-all duration-200 ${
                          selected ? 'text-[#0A6EBD]' : 'text-[#CBD5E1] group-hover:text-[#0A6EBD] group-hover:translate-x-0.5'
                        }`}
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2 — Category-specific details */}
          {step === 2 && (
            <div className="p-8 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A6EBD] to-[#0099A8] text-white flex items-center justify-center">
                    {CATEGORY_ICONS[category]}
                  </div>
                  <div>
                    <h2 className="text-2xl text-[#0A1628] leading-tight">{categoryTitle(category)}</h2>
                    <button onClick={() => goToStep(1)} className="text-xs text-[#0A6EBD] font-semibold hover:underline">
                      Change category
                    </button>
                  </div>
                </div>
                <p className="text-[#64748B]">{CATEGORY_FORMS[category]?.intro}</p>
              </div>

              {renderSections(detailSections)}

              <div className="rounded-2xl border border-[#E2EBF6] overflow-hidden">
                <div className="px-5 py-4 bg-[#F5F9FF] border-b border-[#E2EBF6]">
                  <h3 className="font-semibold text-[#0A1628]">How would you like to speak to your doctor?</h3>
                  <p className="text-sm text-[#64748B] mt-0.5">
                    We will aim for your preference. Keep your phone nearby — your doctor will text or call when ready.
                  </p>
                </div>
                <div className="p-5 grid sm:grid-cols-2 gap-4">
                  {[
                    { val: 'Video', label: 'Video call (recommended)', desc: 'Face-to-face via secure video' },
                    { val: 'Phone', label: 'Phone call', desc: 'A simple audio call to your mobile' },
                  ].map((opt) => {
                    const selected = values.consultMethod === opt.val
                    return (
                      <button
                        key={opt.val}
                        onClick={() => setValue('consultMethod', opt.val)}
                        className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                          selected ? 'border-[#0A6EBD] bg-[#E8F4FE]' : 'border-[#E2EBF6] hover:border-[#0A6EBD]/50'
                        }`}
                      >
                        <span className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selected ? 'border-[#0A6EBD]' : 'border-[#CBD5E1]'
                        }`}>
                          {selected && <span className="w-2.5 h-2.5 rounded-full bg-[#0A6EBD]" />}
                        </span>
                        <span>
                          <span className={`block font-semibold text-sm ${selected ? 'text-[#0A6EBD]' : 'text-[#0A1628]'}`}>
                            {opt.label}
                          </span>
                          <span className="block text-xs text-[#64748B] mt-0.5">{opt.desc}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Identity */}
          {step === 3 && (
            <div className="p-8 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F4FE] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#0A6EBD]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl text-[#0A1628]">Patient Details</h2>
                </div>
                <p className="text-[#64748B]">
                  These details are used to verify your identity against your Healthcare Identifier.
                </p>
              </div>
              {renderSections(IDENTITY_SECTIONS)}
            </div>
          )}

          {/* Step 4 — Medicare & bulk billing */}
          {step === 4 && (
            <div className="p-8 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#E6F7F9] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#0099A8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20M6 15h4" />
                    </svg>
                  </div>
                  <h2 className="text-2xl text-[#0A1628]">Medicare & Bulk Billing</h2>
                </div>
                <p className="text-[#64748B]">Confirm your card details so we can bulk bill this consultation.</p>
              </div>

              {renderSections(MEDICARE_SECTIONS)}

              {usesBulkBilling && (
                <div className="rounded-2xl border border-[#E2EBF6] overflow-hidden">
                  <div className="px-5 py-4 bg-[#F5F9FF] border-b border-[#E2EBF6]">
                    <h3 className="font-semibold text-[#0A1628]">Your Regular Clinic</h3>
                    <p className="text-sm text-[#64748B] mt-0.5">
                      Select a clinic you have visited in person within the last 12 months to continue with bulk billing.
                    </p>
                  </div>
                  <div className="p-5 space-y-5">
                    <div>
                      <label className={labelClass}>Select a clinic</label>
                      <ClinicSelect
                        value={String(values.clinic ?? '')}
                        onChange={(id) => setValue('clinic', id)}
                        hasError={Boolean(errors.clinic)}
                      />
                    </div>

                    {!clinicSelected && (
                      <DynamicField
                        field={MBS_EXEMPTION_FIELD}
                        values={values}
                        error={errors.mbsExemption}
                        onChange={setValue}
                      />
                    )}

                    {values.mbsExemption === 'no-relationship' && !clinicSelected && (
                      <div className="flex gap-3 p-4 rounded-2xl bg-[#FFF8F0] border border-orange-200">
                        <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                        <p className="text-sm text-orange-900 leading-relaxed">
                          Without a face-to-face visit in the last 12 months, Medicare will not rebate this
                          consultation. A private fee will apply and will be confirmed before your call.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5 — Consent & review */}
          {step === 5 && (
            <div className="p-8 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#E6F7F9] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#0099A8]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl text-[#0A1628]">Consent & Review</h2>
                </div>
                <p className="text-[#64748B]">Check your answers, then give the consents needed to proceed.</p>
              </div>

              {[
                { title: categoryTitle(category), rows: summarise(detailSections), step: 2 },
                { title: 'Patient Details', rows: summarise(IDENTITY_SECTIONS), step: 3 },
                {
                  title: 'Medicare & Bulk Billing',
                  rows: [
                    ...summarise(MEDICARE_SECTIONS),
                    { label: 'Clinic visited in last 12 months', value: clinicLabelById(String(values.clinic ?? '')) || 'Not selected' },
                  ],
                  step: 4,
                },
              ].map((section) => (
                <div key={section.title} className="border border-[#E2EBF6] rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-[#F5F9FF] border-b border-[#E2EBF6]">
                    <h3 className="font-semibold text-sm text-[#0A1628]">{section.title}</h3>
                    <button onClick={() => goToStep(section.step)} className="text-xs text-[#0A6EBD] hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="divide-y divide-[#E2EBF6]">
                    {section.rows.map((row) => (
                      <div key={row.label} className="flex justify-between px-5 py-3 gap-4">
                        <span className="text-sm text-[#64748B] flex-shrink-0">{row.label}</span>
                        <span className="text-sm text-[#0A1628] text-right break-words">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="space-y-3">
                {CONSENTS.filter((c) => !c.showIf || c.showIf(values)).map((consent) => {
                  const checked = Boolean(consents[consent.name])
                  const invalid = Boolean(errors[consent.name])
                  return (
                    <div key={consent.name}>
                      <label
                        className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          checked
                            ? 'border-[#0A6EBD] bg-[#E8F4FE]'
                            : invalid
                            ? 'border-red-400 bg-red-50'
                            : 'border-[#E2EBF6] bg-[#F5F9FF] hover:border-[#0A6EBD]/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => setConsent(consent.name, e.target.checked)}
                          className="mt-0.5 w-4 h-4 accent-[#0A6EBD] flex-shrink-0"
                        />
                        <span className={`text-sm ${checked || !consent.required ? 'text-[#1A2B3C]' : 'text-red-700'}`}>
                          {consent.label}
                          {!consent.required && <span className="text-[#94A3B8]"> (optional)</span>}
                        </span>
                      </label>
                      {invalid && <p className="mt-1.5 text-xs text-red-600">{errors[consent.name]}</p>}
                    </div>
                  )
                })}
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-4 font-bold text-lg rounded-2xl bg-gradient-to-r from-[#0A6EBD] to-[#0099A8] text-white hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all"
              >
                Submit Consultation Request
              </button>
            </div>
          )}

          {/* Navigation */}
          {(step > 1 || values.category) && step < 5 && (
            <div className="px-8 pb-8 flex gap-4">
              {step > 1 && (
                <button
                  onClick={goBack}
                  className="flex-1 py-3.5 border-2 border-[#E2EBF6] text-[#64748B] font-semibold rounded-xl hover:border-[#0A6EBD]/50 hover:text-[#0A6EBD] transition-all"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={goNext}
                className="flex-[2] py-3.5 bg-gradient-to-r from-[#0A6EBD] to-[#0099A8] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all"
              >
                Next →
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="px-8 pb-8">
              <button
                onClick={goBack}
                className="w-full py-3.5 border-2 border-[#E2EBF6] text-[#64748B] font-semibold rounded-xl hover:border-[#0A6EBD]/50 hover:text-[#0A6EBD] transition-all"
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
