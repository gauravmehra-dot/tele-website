export interface Clinic {
  id: string
  suburb: string
  name: string
  postcode: string
}

/**
 * Placeholder bulk-billing clinic list — replace with the real network before launch.
 * Search matches on suburb, clinic name or postcode.
 */
export const CLINICS: Clinic[] = [
  { id: 'bencubbin-silver-chain', suburb: 'Bencubbin', name: 'Bencubbin Silver Chain Health Service', postcode: '6477' },
  { id: 'beverley-vines', suburb: 'Beverley', name: 'Vines Medical Practice - Beverley', postcode: '6304' },
  { id: 'gooseberry-hill', suburb: 'Gooseberry Hill', name: 'Gooseberry Hill Medical Centre', postcode: '6076' },
  { id: 'kellerberrin', suburb: 'Kellerberrin', name: 'Kellerberrin Medical Centre', postcode: '6410' },
  { id: 'narembeen', suburb: 'Narembeen', name: 'Narembeen Medical Centre', postcode: '6369' },
  { id: 'narrogin-wheatbelt', suburb: 'Narrogin', name: 'Wheatbelt Health Network - Aboriginal Health Narrogin', postcode: '6312' },
  { id: 'northam-wheatbelt-gp', suburb: 'Northam', name: 'Wheatbelt General Practice - Aboriginal Health Northam', postcode: '6401' },
  { id: 'northam-wheatbelt', suburb: 'Northam', name: 'Wheatbelt Health Network - Northam', postcode: '6401' },
  { id: 'toodyay-wheatbelt', suburb: 'Toodyay', name: 'Wheatbelt Health Network - Toodyay', postcode: '6566' },
  { id: 'wundowie-wheatbelt', suburb: 'Wundowie', name: 'Wheatbelt Health Network - Wundowie', postcode: '6560' },
]

export const clinicLabel = (clinic: Clinic) => `${clinic.suburb} — ${clinic.name}`

export const clinicLabelById = (id: string) => {
  const clinic = CLINICS.find((c) => c.id === id)
  return clinic ? clinicLabel(clinic) : ''
}
