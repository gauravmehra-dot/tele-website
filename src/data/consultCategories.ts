export interface ConsultCategory {
  id: string
  title: string
  description: string
}

export const CONSULT_CATEGORIES: ConsultCategory[] = [
  {
    id: 'medical-certificate',
    title: 'Medical Certificate Only',
    description: 'Work, School, University, Fit-to-work etc',
  },
  {
    id: 'repeat-scripts',
    title: 'Urgent Repeat Scripts Only',
    description: 'Any Urgent Repeat Scripts',
  },
  {
    id: 'respiratory',
    title: 'Respiratory Related',
    description: 'Asthma, Cold & Flu, Hayfever, Covid-19, Sinuses or Middle ear',
  },
  {
    id: 'skin',
    title: 'Skin',
    description: 'Skin Infection, Rash, Acne or Minor Burns',
  },
  {
    id: 'gut',
    title: 'Gut Related',
    description: 'Diarrhoea, Vomiting, Constipation, Abdominal Pain or Blood in Stool',
  },
  {
    id: 'mental-health',
    title: 'Mental Health / Sleep / Headache',
    description: 'Depression, Anxiety, Insomnia or Headache',
  },
  {
    id: 'musculoskeletal',
    title: 'Musculoskeletal',
    description: 'Neck Pain, Back Pain, Shoulder Pain or Ankle Injuries',
  },
  {
    id: 'womens-health',
    title: "Women's Health",
    description:
      'Emergency Contraception, Urinary Tract Infection, Sexually Transmitted Diseases or Pregnancy Related Nausea',
  },
  {
    id: 'mens-health',
    title: "Men's Health",
    description: 'Sexual Dysfunction, Sexually Transmitted Diseases',
  },
  {
    id: 'other',
    title: 'Other Issues',
    description: 'Other Issues',
  },
]

/** Certificate options shown when the "Medical Certificate Only" category is chosen. */
export const CERTIFICATE_TYPES = [
  'Medical Certificate - Work',
  'Medical Certificate - School',
  'Medical Certificate - University',
  'Medical Certificate - Carers',
  'Medical Certificate - Fit To Return',
]

export const categoryTitle = (id: string) =>
  CONSULT_CATEGORIES.find((c) => c.id === id)?.title ?? ''
