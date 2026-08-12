const base =
  'w-full px-4 py-3 rounded-xl border bg-[#F5F9FF] text-[#1A2B3C] text-sm focus:outline-none focus:ring-2 placeholder-[#94A3B8] transition-all'

export const inputClass = `${base} border-[#E2EBF6] focus:border-[#0A6EBD] focus:ring-[#0A6EBD]/20`
export const errorInputClass = `${base} border-red-400 focus:border-red-500 focus:ring-red-200`
export const labelClass = 'block text-sm font-semibold text-[#1A2B3C] mb-1.5'

export const fieldClass = (hasError: boolean) => (hasError ? errorInputClass : inputClass)
