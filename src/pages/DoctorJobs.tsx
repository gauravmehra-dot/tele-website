import { useState } from 'react'
import DynamicField from '../components/DynamicField'
import { DOCTOR_APPLICATION_SECTIONS } from '../data/doctorApplicationForm'
import { validateSections, type Errors, type FormValues } from '../data/formTypes'

const benefits = [
  { icon: '🌏', title: 'Work from Anywhere', desc: 'Consult with patients from your home, office, or anywhere with a reliable connection.' },
  { icon: '📅', title: 'Flexible Schedule', desc: 'Set your own hours and availability. Work when it suits you, not the other way around.' },
  { icon: '⏱️', title: 'Part-Time or Full-Time', desc: 'Whether you want to supplement your income or transition fully to telehealth, we accommodate both.' },
  { icon: '💰', title: 'Competitive Earnings', desc: 'Earn competitive consultation fees with transparent, timely payments deposited fortnightly.' },
  { icon: '💻', title: 'Modern Telehealth Platform', desc: 'Our purpose-built platform makes consultations smooth, with integrated records and prescribing.' },
  { icon: '🤝', title: 'Dedicated Support Team', desc: 'A dedicated doctor support team is available to assist you with onboarding and ongoing queries.' },
]

const requirements = [
  'Registered Medical Practitioner with AHPRA',
  'Valid Medical Board registration (no restrictions)',
  'Strong communication skills for online consultations',
  'Reliable internet connection (minimum 25 Mbps)',
  'Comfortable with video consultation technology',
  'Public liability and professional indemnity insurance',
]

/** Matches the booking form's review switch — set to false to re-enable validation. */
const SKIP_VALIDATION = true

export default function DoctorJobs() {
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [values, setValues] = useState<FormValues>({
    employment: 'Part-Time',
  })

  const setValue = (name: string, value: string | string[]) => {
    setValues(prev => ({ ...prev, [name]: value }))
    setErrors(prev => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const handleSubmit = () => {
    const found = SKIP_VALIDATION ? {} : validateSections(DOCTOR_APPLICATION_SECTIONS, values)
    setErrors(found)

    if (Object.keys(found).length === 0) {
      setSubmitted(true)
      return
    }
    // Bring the first problem into view.
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const errorCount = Object.keys(errors).length

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-[#0A1628] via-[#0A3060] to-[#0A1628]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0099A8]/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#0A6EBD]/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#0A6EBD]/20 text-[#60B4FF] text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
                Now Accepting Applications
              </div>
              <h1 className="text-4xl sm:text-5xl text-white leading-tight mb-5">
                Become a Telehealth Doctor
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                Join our growing network of Australian doctors and work remotely with the flexibility you deserve. Make a real impact from anywhere.
              </p>
              <a href="#apply" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#0A6EBD] to-[#0099A8] text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-blue-900/40 transition-all hover:-translate-y-1">
                Apply Now →
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: '200+', label: 'Active Doctors', color: 'from-[#0A6EBD]/20 to-[#0099A8]/20' },
                { val: '$120+', label: 'Per Consultation', color: 'from-[#0099A8]/20 to-[#0A6EBD]/20' },
                { val: '15+', label: 'Specialties', color: 'from-[#0A6EBD]/20 to-[#0099A8]/20' },
                { val: '4.8★', label: 'Doctor Satisfaction', color: 'from-[#0099A8]/20 to-[#0A6EBD]/20' },
              ].map((stat) => (
                <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 border border-white/10 text-center`}>
                  <div className="text-3xl font-bold text-white mb-1">{stat.val}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl text-[#0A1628] mb-4">Why Join Telehealth?</h2>
            <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
              We built this platform with doctors in mind — flexible, well-supported, and rewarding.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#F5F9FF] hover:bg-white hover:shadow-xl hover:shadow-blue-100/50 border border-transparent hover:border-[#E2EBF6] transition-all duration-300 group cursor-default">
                <div className="text-3xl mb-4">{b.icon}</div>
                <h3 className="font-['DM_Serif_Display'] text-lg text-[#0A1628] mb-2">{b.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 bg-[#F5F9FF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl text-[#0A1628] mb-4">Requirements</h2>
            <p className="text-[#64748B]">To join the Telehealth platform, you must meet the following criteria.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {requirements.map((req, i) => (
              <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-[#E2EBF6]">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                </div>
                <span className="text-sm text-[#1A2B3C]">{req}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl text-[#0A1628] mb-4">Apply to Join</h2>
            <p className="text-[#64748B]">Complete the form below and our team will be in touch within 2 business days.</p>
          </div>

          {submitted ? (
            <div className="bg-white rounded-3xl border border-[#E2EBF6] p-10 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0A6EBD] to-[#0099A8] flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>
              <h3 className="text-2xl text-[#0A1628] mb-3">Application Submitted!</h3>
              <p className="text-[#64748B]">
                Thank you for applying{values.surname ? `, Dr. ${values.surname}` : ''}. Our medical team will
                verify your AHPRA registration and be in touch within 2 business days.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {errorCount > 0 && (
                <div className="flex gap-3 p-4 rounded-2xl bg-red-50 border border-red-200">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  <p className="text-sm text-red-800">
                    Please review {errorCount} {errorCount === 1 ? 'field' : 'fields'} highlighted below before submitting.
                  </p>
                </div>
              )}

              {DOCTOR_APPLICATION_SECTIONS.map((section) => {
                const visible = section.fields.filter((f) => !f.showIf || f.showIf(values))
                if (visible.length === 0) return null

                return (
                  <div key={section.title} className="bg-white rounded-3xl border border-[#E2EBF6] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-[#F5F9FF] border-b border-[#E2EBF6]">
                      <h3 className="font-semibold text-[#0A1628]">{section.title}</h3>
                      {section.description && (
                        <p className="text-sm text-[#64748B] mt-0.5">{section.description}</p>
                      )}
                    </div>
                    <div className="p-6 grid sm:grid-cols-2 gap-5">
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
              })}

              <div className="bg-white rounded-3xl border border-[#E2EBF6] shadow-sm p-6">
                <button
                  onClick={handleSubmit}
                  className="w-full py-4 bg-gradient-to-r from-[#0A6EBD] to-[#0099A8] text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-blue-200 transition-all hover:-translate-y-0.5 text-lg"
                >
                  Submit Application →
                </button>
                <p className="text-xs text-center text-[#94A3B8] mt-3">
                  We verify every applicant against the AHPRA public register before onboarding.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
