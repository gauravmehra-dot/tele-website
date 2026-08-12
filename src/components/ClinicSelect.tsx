import { useEffect, useMemo, useRef, useState } from 'react'
import { CLINICS, clinicLabel } from '../data/clinics'

interface Props {
  value: string
  onChange: (clinicId: string) => void
  hasError?: boolean
}

export default function ClinicSelect({ value, onChange, hasError }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)

  const selected = CLINICS.find((c) => c.id === value) ?? null

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CLINICS
    return CLINICS.filter(
      (c) =>
        c.suburb.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.postcode.includes(q),
    )
  }, [query])

  // Close when clicking outside the combobox.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  const choose = (clinicId: string) => {
    onChange(clinicId)
    setQuery('')
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setHighlight((h) => Math.min(h + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && open && results[highlight]) {
      e.preventDefault()
      choose(results[highlight].id)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const borderClass = hasError
    ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-200'
    : 'border-[#E2EBF6] focus-within:border-[#0A6EBD] focus-within:ring-[#0A6EBD]/20'

  return (
    <div ref={wrapRef} className="relative">
      <div
        className={`flex items-center gap-2 w-full px-4 py-3 rounded-xl border bg-[#F5F9FF] transition-all focus-within:ring-2 ${borderClass}`}
      >
        <svg className="w-4 h-4 text-[#94A3B8] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          role="combobox"
          aria-expanded={open}
          aria-controls="clinic-listbox"
          className="flex-1 bg-transparent text-sm text-[#1A2B3C] placeholder-[#94A3B8] focus:outline-none min-w-0"
          placeholder={selected ? clinicLabel(selected) : 'Search clinic name or postcode'}
          value={open ? query : selected ? clinicLabel(selected) : ''}
          onChange={(e) => {
            setQuery(e.target.value)
            setHighlight(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {selected && !open && (
          <button
            onClick={() => onChange('')}
            aria-label="Clear selected clinic"
            className="text-[#94A3B8] hover:text-[#0A6EBD] transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle clinic list"
          className="text-[#94A3B8] hover:text-[#0A6EBD] transition-colors flex-shrink-0"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {open && (
        <ul
          id="clinic-listbox"
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-2 max-h-64 overflow-y-auto bg-white border border-[#E2EBF6] rounded-2xl shadow-xl shadow-blue-100/50 py-2"
        >
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-[#94A3B8]">No clinics match "{query}"</li>
          ) : (
            results.map((clinic, i) => (
              <li key={clinic.id} role="option" aria-selected={clinic.id === value}>
                <button
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => choose(clinic.id)}
                  className={`w-full text-left px-4 py-2.5 transition-colors ${
                    i === highlight ? 'bg-[#E8F4FE]' : 'hover:bg-[#F5F9FF]'
                  }`}
                >
                  <div className={`text-sm font-medium ${clinic.id === value ? 'text-[#0A6EBD]' : 'text-[#0A1628]'}`}>
                    {clinic.suburb} — {clinic.name}
                  </div>
                  <div className="text-xs text-[#94A3B8] mt-0.5">Postcode {clinic.postcode}</div>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
