/**
 * Reference data and validators aligned to Australian healthcare requirements.
 *
 * The field sets here are chosen so the collected data lines up with:
 *  - HI Service IHI lookup minimum data set (family name, given name, date of
 *    birth, sex, plus Medicare number + IRN or DVA file number)
 *  - Medicare bulk-bill claiming (card number + IRN + expiry, assignment of benefit)
 *  - AIHW/METeOR standard categories for Indigenous status and sex
 *
 * Collecting the right fields is only the front half of conformance — the
 * actual HI Service / Medicare Web Services calls need PRODA device
 * credentials and a NASH certificate on a backend that does not exist yet.
 */

export const AU_STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']

/** Administrative sex as accepted by the HI Service. Distinct from gender identity. */
export const SEX_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'I', label: 'Intersex or indeterminate' },
  { value: 'N', label: 'Not stated' },
]

export const GENDER_OPTIONS = [
  { value: 'Man', label: 'Man' },
  { value: 'Woman', label: 'Woman' },
  { value: 'Non-binary', label: 'Non-binary' },
  { value: 'Different term', label: 'I use a different term' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
]

/** AIHW standard Indigenous status categories. */
export const INDIGENOUS_STATUS = [
  { value: '1', label: 'Aboriginal but not Torres Strait Islander origin' },
  { value: '2', label: 'Torres Strait Islander but not Aboriginal origin' },
  { value: '3', label: 'Both Aboriginal and Torres Strait Islander origin' },
  { value: '4', label: 'Neither Aboriginal nor Torres Strait Islander origin' },
  { value: '9', label: 'Prefer not to say' },
]

export const CONCESSION_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'pension', label: 'Pensioner Concession Card' },
  { value: 'healthcare', label: 'Health Care Card' },
  { value: 'seniors', label: 'Commonwealth Seniors Health Card' },
  { value: 'dva-gold', label: 'DVA Gold Card' },
  { value: 'dva-white', label: 'DVA White Card' },
]

/**
 * MBS telehealth generally requires a face-to-face service with the same
 * practice in the previous 12 months. These are the common exemption grounds.
 */
export const MBS_EXEMPTIONS = [
  { value: 'none', label: 'No exemption — I have visited a clinic in the last 12 months' },
  { value: 'under-12-months', label: 'Patient is under 12 months of age' },
  { value: 'homeless', label: 'Patient is experiencing homelessness' },
  { value: 'natural-disaster', label: 'Affected by a declared natural disaster' },
  { value: 'acchs', label: 'Patient of an Aboriginal Community Controlled Health Service' },
  { value: 'sexual-health', label: 'Blood-borne virus, sexual or reproductive health service' },
  { value: 'no-relationship', label: 'None of these apply — I understand a fee may be charged' },
]

/**
 * Medicare card numbers carry a check digit: the first 8 digits are weighted
 * [1,3,7,9,1,3,7,9] and the sum mod 10 must equal the 9th digit. The 10th
 * digit is the card issue number.
 */
export function isValidMedicareNumber(raw: string): boolean {
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 10) return false
  if (!/^[2-6]/.test(digits)) return false

  const weights = [1, 3, 7, 9, 1, 3, 7, 9]
  const sum = weights.reduce((acc, weight, i) => acc + weight * Number(digits[i]), 0)
  return sum % 10 === Number(digits[8])
}

/** The IRN is the single digit printed beside the patient's name on the card. */
export function isValidIrn(value: string): boolean {
  return /^[1-9]$/.test(value.trim())
}

/** DVA file numbers are a state prefix, digits, and an optional trailing letter. */
export function isValidDvaNumber(value: string): boolean {
  return /^[A-Z]{1,3}\s?\d{1,6}[A-Z]?$/i.test(value.trim())
}

/** Card expiry is captured as MM/YYYY and must not already be in the past. */
export function isExpiredCard(monthValue: string): boolean {
  if (!/^\d{4}-\d{2}$/.test(monthValue)) return false
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return monthValue < currentMonth
}

export const CRISIS_SUPPORTS = [
  { name: 'Emergency', detail: 'Call 000 if life is in danger' },
  { name: 'Lifeline', detail: '13 11 14 — 24 hours, 7 days' },
  { name: 'Beyond Blue', detail: '1300 22 4636' },
  { name: 'Suicide Call Back Service', detail: '1300 659 467' },
]
