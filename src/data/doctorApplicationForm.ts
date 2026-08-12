import type { FormSection } from './formTypes'
import { AU_STATES } from './australianHealth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^(\+?61|0)[\s-]?[2-478](?:[\s-]?\d){8}$/

export const DOCTOR_APPLICATION_SECTIONS: FormSection[] = [
  {
    title: 'Register your interest here',
    fields: [
      { name: 'firstName', label: 'What is your first name?', type: 'text', required: true },
      { name: 'surname', label: 'What is your surname?', type: 'text', required: true },
      {
        name: 'mobile',
        label: 'Mobile number',
        type: 'tel',
        required: true,
        placeholder: 'e.g. 0400000000',
        validate: (v) => (PHONE_RE.test(v.replace(/\s/g, '')) ? null : 'Enter a valid Australian mobile number'),
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        validate: (v) => (EMAIL_RE.test(v.trim()) ? null : 'Enter a valid email address'),
      },
      { name: 'city', label: 'Which town / city do you live in?', type: 'text', required: true },
      {
        name: 'state',
        label: 'Which state do you live in?',
        type: 'select',
        required: true,
        options: AU_STATES.map((s) => ({ value: s, label: s })),
      },
      {
        name: 'postcode',
        label: 'And what is your postcode?',
        type: 'text',
        required: true,
        maxLength: 4,
        validate: (v) => (/^\d{4}$/.test(v.trim()) ? null : 'Enter a 4-digit postcode'),
      },
      {
        name: 'doctorType',
        label: 'What type of Doctor are you?',
        type: 'select',
        options: [
          { value: 'General Practitioner', label: 'General Practitioner' },
          { value: 'GP Registrar', label: 'GP Registrar' },
          { value: 'Specialist', label: 'Specialist' },
          { value: 'Hospital Medical Officer', label: 'Hospital Medical Officer' },
          { value: 'Other', label: 'Other' },
        ],
      },
      {
        name: 'fullAhpra',
        label: 'Do you have full AHPRA registration?',
        type: 'select',
        required: true,
        options: [
          { value: 'Yes', label: 'Yes' },
          { value: 'No', label: 'No' },
        ],
      },
      {
        name: 'ahpraNumber',
        label: 'What is your AHPRA number? (MED XXXXXXXXXXXX)',
        type: 'text',
        required: true,
        placeholder: 'MED0001234567',
      },
      { name: 'ahpraExpiry', label: 'AHPRA expiry date', type: 'date', required: true },
      {
        name: 'workType',
        label: 'What type of work would you like to do?',
        type: 'select',
        options: [
          { value: 'Telehealth', label: 'Telehealth consultations' },
          { value: 'Home visits', label: 'Home visits' },
          { value: 'Both', label: 'Both' },
        ],
      },
      {
        name: 'aboutYou',
        label: 'Tell us a bit about you',
        type: 'textarea',
        required: true,
        rows: 4,
        wide: true,
      },
      {
        name: 'hoursPerWeek',
        label: 'How many hours a week are you available to work with us?',
        type: 'text',
        required: true,
        wide: true,
      },
      {
        name: 'referralSource',
        label: 'How did you find out about us?',
        type: 'select',
        wide: true,
        options: [
          { value: 'Google', label: 'Google search' },
          { value: 'Social media', label: 'Social media' },
          { value: 'Friend or colleague', label: 'Friend or colleague' },
          { value: 'Recruitment agency', label: 'Recruitment agency' },
          { value: 'Other', label: 'Other' },
        ],
      },
      {
        name: 'referrerName',
        label: 'If you were referred by a friend - what is their name?',
        type: 'text',
        wide: true,
        hint: 'Leave blank if not referred by a friend.',
      },
    ],
  },
]
