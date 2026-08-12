import { useEffect, useRef, useState } from 'react'

const EMERGENCY_SYMPTOMS = [
  { title: 'Signs of a heart attack', desc: 'Chest pain, pressure, heaviness, tightness or squeezing across the chest' },
  { title: 'Signs of a stroke', desc: "Face dropping on one side, can't hold both arms up, difficulty speaking" },
  { title: 'Sudden confusion (delirium)', desc: 'Cannot be sure of own name or age' },
  { title: 'Suicide attempt', desc: 'By taking something or self-harming' },
  { title: 'Severe difficulty breathing', desc: 'Not being able to get words out, choking or gasping' },
  { title: 'Heavy bleeding', desc: 'Spraying, pouring or enough to make a puddle' },
  { title: 'Severe injuries', desc: 'After a serious accident' },
  { title: 'Seizure (fit)', desc: "Shaking or jerking because of a fit, or unconscious (can't be woken up)" },
  { title: 'Sudden, rapid swelling', desc: 'Of the lips, mouth, throat or tongue' },
  { title: 'Labour or childbirth', desc: 'Waters breaking, more frequent intense cramps (contractions), baby coming, or just born' },
]

interface Props {
  open: boolean
  onConfirm: () => void
}

export default function EmergencyModal({ open, onConfirm }: Props) {
  const [acknowledged, setAcknowledged] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Lock background scrolling so the page behind cannot be interacted with.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  useEffect(() => {
    if (open) dialogRef.current?.focus()
  }, [open])

  // Deliberately no Escape-to-close and no backdrop dismiss — this is a safety
  // gate, so the only way past it is an explicit acknowledgement.
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#0A1628]/70 backdrop-blur-sm px-4 py-8">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-title"
        tabIndex={-1}
        className="relative mx-auto w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden focus:outline-none"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#FFF1F1] to-[#FFF8F0] border-b border-red-100 px-6 sm:px-8 py-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-200">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <div>
              <h2 id="emergency-title" className="text-2xl sm:text-3xl text-red-600 leading-tight">
                Emergency Symptoms Warning
              </h2>
              <p className="text-sm text-red-900/70 mt-1">
                Telehealth is not suitable for life-threatening emergencies.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-7">
          {/* Call 000 banner */}
          <div className="flex items-center gap-4 rounded-2xl bg-[#F5F9FF] border border-[#E2EBF6] px-5 py-4 mb-7">
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
            </div>
            <p className="text-[#1A2B3C]">
              Call <strong className="text-2xl text-red-600 align-middle">000</strong> immediately if you have any of
              the following:
            </p>
          </div>

          {/* Symptom list */}
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mb-7">
            {EMERGENCY_SYMPTOMS.map((symptom) => (
              <div key={symptom.title} className="flex gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-[#0A1628]">{symptom.title}</div>
                  <div className="text-sm text-[#64748B] leading-relaxed mt-0.5">{symptom.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Acknowledgement */}
          <label
            className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              acknowledged
                ? 'border-[#0A6EBD] bg-[#E8F4FE]'
                : 'border-[#E2EBF6] bg-[#F5F9FF] hover:border-[#0A6EBD]/50'
            }`}
          >
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#0A6EBD] flex-shrink-0"
            />
            <span className="text-sm font-medium text-[#1A2B3C]">
              I confirm none of the above emergency symptoms are present
            </span>
          </label>

          <button
            onClick={onConfirm}
            disabled={!acknowledged}
            className={`mt-5 w-full py-4 font-bold text-lg rounded-2xl transition-all ${
              acknowledged
                ? 'bg-gradient-to-r from-[#0A6EBD] to-[#0099A8] text-white hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5'
                : 'bg-[#E2EBF6] text-[#94A3B8] cursor-not-allowed'
            }`}
          >
            Continue
          </button>

          <p className="mt-3 text-center text-xs text-[#94A3B8]">
            If you are unsure, call 000 or attend your nearest emergency department.
          </p>
        </div>
      </div>
    </div>
  )
}
