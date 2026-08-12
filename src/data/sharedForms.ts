import type { FormSection } from './categoryForms'
import {
  AU_STATES,
  CONCESSION_TYPES,
  GENDER_OPTIONS,
  INDIGENOUS_STATUS,
  MBS_EXEMPTIONS,
  SEX_OPTIONS,
  isExpiredCard,
  isValidDvaNumber,
  isValidIrn,
  isValidMedicareNumber,
} from './australianHealth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^(\+?61|0)[\s-]?[2-478](?:[\s-]?\d){8}$/

const today = () => new Date().toISOString().slice(0, 10)

/**
 * Step 3 — the HI Service IHI lookup minimum data set plus contact details.
 * Family name, given name, date of birth and sex are all mandatory for a
 * successful identifier match, which is why none of them are optional here.
 */
export const IDENTITY_SECTIONS: FormSection[] = [
  {
    title: 'Patient Identity',
    description: 'Enter these exactly as they appear on your Medicare card so we can verify your identity.',
    fields: [
      { name: 'givenName', label: 'Given name', type: 'text', required: true, placeholder: 'Emma' },
      { name: 'familyName', label: 'Family name', type: 'text', required: true, placeholder: 'Robertson' },
      {
        name: 'dob',
        label: 'Date of birth',
        type: 'date',
        required: true,
        validate: (v) => (v > today() ? 'Date of birth cannot be in the future' : null),
      },
      {
        name: 'sex',
        label: 'Sex',
        type: 'select',
        required: true,
        options: SEX_OPTIONS,
        hint: 'As recorded for Medicare and health records.',
      },
      { name: 'genderIdentity', label: 'Gender identity', type: 'select', options: GENDER_OPTIONS },
      {
        name: 'indigenousStatus',
        label: 'Are you of Aboriginal or Torres Strait Islander origin?',
        type: 'select',
        required: true,
        wide: true,
        options: INDIGENOUS_STATUS,
        hint: 'Asked of everyone. It helps us provide culturally appropriate care and access to Closing the Gap programs.',
      },
    ],
  },
  {
    title: 'Contact Details',
    description: 'Your doctor will call or text this number when they are ready.',
    fields: [
      {
        name: 'mobile',
        label: 'Mobile number',
        type: 'tel',
        required: true,
        placeholder: '0412 345 678',
        validate: (v) => (PHONE_RE.test(v.replace(/\s/g, '')) ? null : 'Enter a valid Australian mobile number'),
      },
      {
        name: 'email',
        label: 'Email address',
        type: 'email',
        required: true,
        placeholder: 'emma@example.com.au',
        validate: (v) => (EMAIL_RE.test(v.trim()) ? null : 'Enter a valid email address'),
      },
      { name: 'addressLine', label: 'Street address', type: 'text', required: true, wide: true, placeholder: '123 Collins Street' },
      { name: 'suburb', label: 'Suburb', type: 'text', required: true, placeholder: 'Melbourne' },
      {
        name: 'state',
        label: 'State',
        type: 'select',
        required: true,
        options: AU_STATES.map((s) => ({ value: s, label: s })),
      },
      {
        name: 'postcode',
        label: 'Postcode',
        type: 'text',
        required: true,
        maxLength: 4,
        placeholder: '3000',
        validate: (v) => (/^\d{4}$/.test(v.trim()) ? null : 'Enter a 4-digit postcode'),
      },
      {
        name: 'nominatedGp',
        label: 'Your regular GP or clinic',
        type: 'text',
        wide: true,
        placeholder: 'e.g. Dr Chen, Collins Street Medical',
        hint: 'Where we send your consultation summary, with your consent.',
      },
    ],
  },
]

/**
 * Step 4 — Medicare details for bulk-bill claiming. The card number is checked
 * against the Medicare check-digit algorithm before submission to cut down on
 * rejected claims.
 */
export const MEDICARE_SECTIONS: FormSection[] = [
  {
    title: 'Medicare',
    fields: [
      {
        name: 'medicareNotice',
        label: '',
        type: 'info',
        tone: 'info',
        body:
          'Bulk billing means there is nothing to pay — we claim the Medicare benefit directly. You need a valid Medicare or DVA card, and Medicare requires that you have seen a doctor at the same practice in person within the last 12 months.',
      },
      {
        name: 'hasMedicare',
        label: 'Do you have a Medicare or DVA card?',
        type: 'radio',
        required: true,
        wide: true,
        options: [
          { value: 'Medicare', label: 'Yes, a Medicare card' },
          { value: 'DVA', label: 'Yes, a DVA card' },
          { value: 'No', label: 'No card', hint: 'A private consultation fee will apply' },
        ],
      },
      {
        name: 'medicareNumber',
        label: 'Medicare card number',
        type: 'text',
        required: true,
        maxLength: 13,
        placeholder: '2123 45670 1',
        showIf: (v) => v.hasMedicare === 'Medicare',
        validate: (v) =>
          isValidMedicareNumber(v) ? null : 'That does not look like a valid Medicare number — please check the digits',
      },
      {
        name: 'medicareIrn',
        label: 'IRN',
        type: 'text',
        required: true,
        maxLength: 1,
        placeholder: '1',
        hint: 'The single digit beside your name on the card.',
        showIf: (v) => v.hasMedicare === 'Medicare',
        validate: (v) => (isValidIrn(v) ? null : 'The IRN is a single digit from 1 to 9'),
      },
      {
        name: 'medicareExpiry',
        label: 'Card expiry',
        type: 'month',
        required: true,
        showIf: (v) => v.hasMedicare === 'Medicare',
        validate: (v) => (isExpiredCard(v) ? 'This card has expired' : null),
      },
      {
        name: 'dvaNumber',
        label: 'DVA file number',
        type: 'text',
        required: true,
        placeholder: 'NX123456',
        showIf: (v) => v.hasMedicare === 'DVA',
        validate: (v) => (isValidDvaNumber(v) ? null : 'Enter a valid DVA file number'),
      },
      {
        name: 'concessionType',
        label: 'Concession card',
        type: 'select',
        wide: true,
        options: CONCESSION_TYPES,
      },
    ],
  },
]

export const MBS_EXEMPTION_FIELD = {
  name: 'mbsExemption',
  label: 'Why does the 12-month rule not apply?',
  type: 'select' as const,
  required: true,
  wide: true,
  options: MBS_EXEMPTIONS,
}
