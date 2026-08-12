/**
 * Per-category clinical intake schemas.
 *
 * Each category gets its own question set so the doctor receives a relevant
 * history before the call. Fields marked with `redFlag` on an option surface a
 * safety callout when chosen — they warn and advise, they do not hard-block,
 * because triage is the doctor's job, not the form's.
 */

import type { FieldOption, FieldSchema, FormSection, FormValues } from './formTypes'

export type { FieldOption, FieldSchema, FieldType, FormSection, FormValues } from './formTypes'

export interface CategoryForm {
  intro: string
  sections: FormSection[]
}

const DURATION_OPTIONS: FieldOption[] = [
  { value: '<24 hours', label: 'Less than 24 hours' },
  { value: '1-3 days', label: '1 – 3 days' },
  { value: '4-7 days', label: '4 – 7 days' },
  { value: '1-2 weeks', label: '1 – 2 weeks' },
  { value: '2-4 weeks', label: '2 – 4 weeks' },
  { value: '>1 month', label: 'More than a month' },
]

const YES_NO = (yesFlag?: string): FieldOption[] => [
  { value: 'Yes', label: 'Yes', redFlag: yesFlag },
  { value: 'No', label: 'No' },
]

const YES_NO_UNSURE = (yesFlag?: string): FieldOption[] => [
  { value: 'Yes', label: 'Yes', redFlag: yesFlag },
  { value: 'No', label: 'No' },
  { value: 'Unsure', label: 'Not sure' },
]

const symptomsField = (placeholder: string): FieldSchema => ({
  name: 'symptoms',
  label: 'Describe your symptoms',
  type: 'textarea',
  required: true,
  minLength: 30,
  rows: 5,
  wide: true,
  placeholder,
  hint: 'The more detail you give, the better prepared your doctor will be.',
})

const durationField: FieldSchema = {
  name: 'duration',
  label: 'How long have you had this?',
  type: 'select',
  required: true,
  options: DURATION_OPTIONS,
}

export const CATEGORY_FORMS: Record<string, CategoryForm> = {
  /* ------------------------------------------------------------------ */
  'medical-certificate': {
    intro: 'A certificate is only issued where the doctor considers it clinically appropriate.',
    sections: [
      {
        title: 'Your Condition',
        fields: [
          symptomsField('Describe the illness or injury the certificate relates to...'),
          durationField,
          {
            name: 'stillUnwell',
            label: 'Are you still unwell today?',
            type: 'radio',
            required: true,
            options: YES_NO(),
          },
        ],
      },
      {
        title: 'Certificate Details',
        description: 'Australian doctors can only certify the period they can reasonably assess.',
        fields: [
          {
            name: 'certificateType',
            label: 'Certificate type',
            type: 'select',
            required: true,
            wide: true,
            options: [
              { value: 'Medical Certificate - Work', label: 'Medical Certificate - Work' },
              { value: 'Medical Certificate - School', label: 'Medical Certificate - School' },
              { value: 'Medical Certificate - University', label: 'Medical Certificate - University' },
              { value: 'Medical Certificate - Carers', label: 'Medical Certificate - Carers' },
              { value: 'Medical Certificate - Fit To Return', label: 'Medical Certificate - Fit To Return' },
            ],
          },
          { name: 'certificateStart', label: 'Start', type: 'date', required: true },
          {
            name: 'certificateEnd',
            label: 'End',
            type: 'date',
            required: true,
            validate: (value, values) => {
              const start = values.certificateStart as string
              if (start && value < start) return 'End date must be on or after the start date'
              return null
            },
          },
          {
            name: 'issuedTo',
            label: 'Employer, school or institution name',
            type: 'text',
            wide: true,
            placeholder: 'e.g. Coles Supermarkets, Monash University',
            hint: 'Optional — printed on the certificate if provided.',
          },
          {
            name: 'carerFor',
            label: 'Who are you caring for, and what is your relationship?',
            type: 'text',
            required: true,
            wide: true,
            placeholder: 'e.g. My daughter, age 6',
            showIf: (v) => v.certificateType === 'Medical Certificate - Carers',
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  'repeat-scripts': {
    intro: 'For continuing medication you have been prescribed before and are stable on.',
    sections: [
      {
        title: 'Important',
        fields: [
          {
            name: 'scriptNotice',
            label: '',
            type: 'info',
            tone: 'warning',
            body:
              'Schedule 8 medicines and drugs of dependence (including opioids, benzodiazepines, and stimulants such as ADHD medication) cannot be prescribed through this service. Requests for these will be declined.',
          },
        ],
      },
      {
        title: 'Medication Requested',
        fields: [
          {
            name: 'medicationName',
            label: 'Medication name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Metformin',
          },
          {
            name: 'medicationStrength',
            label: 'Strength',
            type: 'text',
            required: true,
            placeholder: 'e.g. 500mg',
          },
          {
            name: 'medicationDose',
            label: 'How do you take it?',
            type: 'text',
            required: true,
            wide: true,
            placeholder: 'e.g. One tablet twice daily with food',
          },
          {
            name: 'isControlled',
            label: 'Is this a Schedule 8 medicine or drug of dependence?',
            type: 'radio',
            required: true,
            wide: true,
            options: YES_NO_UNSURE(
              'This service cannot prescribe Schedule 8 medicines. Please see your regular GP in person.',
            ),
          },
          { name: 'lastPrescribed', label: 'When was it last prescribed?', type: 'date', required: true },
          {
            name: 'prescriberClinic',
            label: 'Which clinic or doctor prescribed it?',
            type: 'text',
            required: true,
            placeholder: 'e.g. Collins Street Medical',
          },
          {
            name: 'conditionStable',
            label: 'Has your condition been stable on this medication?',
            type: 'radio',
            required: true,
            wide: true,
            options: [
              { value: 'Yes', label: 'Yes, stable' },
              { value: 'No', label: 'No, it has changed', redFlag: 'A full review may be needed rather than a repeat script.' },
            ],
          },
        ],
      },
      {
        title: 'Delivery',
        fields: [
          {
            name: 'scriptDelivery',
            label: 'How would you like the prescription?',
            type: 'radio',
            required: true,
            wide: true,
            options: [
              { value: 'eScript SMS', label: 'eScript token by SMS', hint: 'Sent to your mobile' },
              { value: 'eScript Email', label: 'eScript token by email' },
              { value: 'Pharmacy', label: 'Send directly to my pharmacy' },
            ],
          },
          {
            name: 'pharmacyName',
            label: 'Pharmacy name and suburb',
            type: 'text',
            required: true,
            wide: true,
            placeholder: 'e.g. Chemist Warehouse, Richmond',
            showIf: (v) => v.scriptDelivery === 'Pharmacy',
          },
          { name: 'otherMedications', label: 'Other current medications', type: 'text', wide: true, placeholder: 'List anything else you take regularly' },
          { name: 'allergies', label: 'Known allergies', type: 'text', wide: true, placeholder: 'e.g. Penicillin' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  respiratory: {
    intro: 'For asthma, cold and flu, hayfever, COVID-19, sinus and middle ear problems.',
    sections: [
      {
        title: 'Your Symptoms',
        fields: [
          {
            name: 'condition',
            label: 'What best describes the problem?',
            type: 'select',
            required: true,
            options: [
              { value: 'Cold & Flu', label: 'Cold & Flu' },
              { value: 'COVID-19', label: 'COVID-19' },
              { value: 'Asthma', label: 'Asthma' },
              { value: 'Hayfever', label: 'Hayfever / allergies' },
              { value: 'Sinus', label: 'Sinus problem' },
              { value: 'Middle ear', label: 'Middle ear problem' },
              { value: 'Other', label: 'Other respiratory issue' },
            ],
          },
          durationField,
          symptomsField('Describe your breathing, cough, throat and any other symptoms...'),
          {
            name: 'symptomList',
            label: 'Which symptoms do you have?',
            type: 'checkbox-group',
            wide: true,
            options: [
              { value: 'Cough', label: 'Cough' },
              { value: 'Sore throat', label: 'Sore throat' },
              { value: 'Runny or blocked nose', label: 'Runny or blocked nose' },
              { value: 'Ear pain', label: 'Ear pain' },
              { value: 'Facial pain', label: 'Facial or sinus pain' },
              { value: 'Loss of taste or smell', label: 'Loss of taste or smell' },
              { value: 'Body aches', label: 'Body aches' },
              { value: 'Wheeze', label: 'Wheeze' },
            ],
          },
          {
            name: 'fever',
            label: 'Do you have a fever?',
            type: 'radio',
            required: true,
            wide: true,
            options: [
              { value: 'No', label: 'No' },
              { value: 'Feels feverish', label: 'Feels feverish, not measured' },
              { value: 'Measured over 38', label: 'Measured over 38°C' },
            ],
          },
          {
            name: 'breathlessness',
            label: 'How is your breathing?',
            type: 'radio',
            required: true,
            wide: true,
            options: [
              { value: 'Normal', label: 'Normal' },
              { value: 'Short of breath on exertion', label: 'Short of breath when active' },
              {
                value: 'Short of breath at rest',
                label: 'Short of breath at rest',
                redFlag: 'Breathlessness at rest can be serious. If you are struggling to speak in full sentences, call 000 now.',
              },
            ],
          },
          {
            name: 'coughType',
            label: 'What is the cough like?',
            type: 'radio',
            wide: true,
            showIf: (v) => Array.isArray(v.symptomList) && v.symptomList.includes('Cough'),
            options: [
              { value: 'Dry', label: 'Dry' },
              { value: 'Productive', label: 'Bringing up phlegm' },
              { value: 'Coughing blood', label: 'Coughing up blood', redFlag: 'Coughing up blood needs urgent in-person assessment.' },
            ],
          },
          {
            name: 'covidTest',
            label: 'Have you tested for COVID-19?',
            type: 'radio',
            wide: true,
            showIf: (v) => v.condition === 'COVID-19',
            options: [
              { value: 'Positive RAT', label: 'Positive RAT' },
              { value: 'Positive PCR', label: 'Positive PCR' },
              { value: 'Negative', label: 'Negative' },
              { value: 'Not tested', label: 'Not tested' },
            ],
          },
        ],
      },
      {
        title: 'Background',
        fields: [
          {
            name: 'asthmaHistory',
            label: 'Do you have asthma or a chronic lung condition?',
            type: 'radio',
            required: true,
            wide: true,
            options: YES_NO(),
          },
          {
            name: 'inhalers',
            label: 'Which inhalers or lung medicines do you use?',
            type: 'text',
            wide: true,
            placeholder: 'e.g. Ventolin as needed, Seretide twice daily',
            showIf: (v) => v.asthmaHistory === 'Yes',
          },
          {
            name: 'smoking',
            label: 'Smoking or vaping',
            type: 'select',
            options: [
              { value: 'Never', label: 'Never smoked' },
              { value: 'Ex-smoker', label: 'Ex-smoker' },
              { value: 'Current smoker', label: 'Current smoker' },
              { value: 'Vaper', label: 'Vape' },
            ],
          },
          { name: 'allergies', label: 'Known allergies', type: 'text', placeholder: 'e.g. Penicillin' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  skin: {
    intro: 'Photos make a big difference for skin problems — please upload if you can.',
    sections: [
      {
        title: 'The Skin Problem',
        fields: [
          {
            name: 'concern',
            label: 'What best describes it?',
            type: 'select',
            required: true,
            options: [
              { value: 'Rash', label: 'Rash' },
              { value: 'Skin infection', label: 'Skin infection' },
              { value: 'Acne', label: 'Acne' },
              { value: 'Minor burn', label: 'Minor burn' },
              { value: 'Bite or sting', label: 'Bite or sting' },
              { value: 'Other', label: 'Other skin issue' },
            ],
          },
          durationField,
          {
            name: 'bodyLocation',
            label: 'Where on your body is it?',
            type: 'text',
            required: true,
            wide: true,
            placeholder: 'e.g. Left forearm and inner elbow',
          },
          symptomsField('Describe the appearance, how it started, and how it has changed...'),
          {
            name: 'skinFeatures',
            label: 'Does it have any of these?',
            type: 'checkbox-group',
            wide: true,
            options: [
              { value: 'Itchy', label: 'Itchy' },
              { value: 'Painful', label: 'Painful' },
              { value: 'Blistering', label: 'Blistering' },
              { value: 'Weeping or pus', label: 'Weeping or pus' },
              { value: 'Warm to touch', label: 'Warm to touch' },
              { value: 'Scaly or flaking', label: 'Scaly or flaking' },
            ],
          },
          {
            name: 'spreading',
            label: 'Is the redness spreading?',
            type: 'radio',
            required: true,
            wide: true,
            options: YES_NO('Spreading redness with fever can indicate a serious infection needing urgent care.'),
          },
          {
            name: 'fever',
            label: 'Do you have a fever or feel generally unwell?',
            type: 'radio',
            required: true,
            wide: true,
            options: YES_NO('Fever with a spreading skin infection needs same-day in-person assessment.'),
          },
          {
            name: 'burnCause',
            label: 'What caused the burn, and how large is it?',
            type: 'text',
            required: true,
            wide: true,
            placeholder: 'e.g. Hot water, about the size of a 50 cent coin',
            hint: 'Burns to the face, hands, feet or genitals, or larger than your palm, need emergency care.',
            showIf: (v) => v.concern === 'Minor burn',
          },
          {
            name: 'priorTreatment',
            label: 'What have you already tried?',
            type: 'text',
            wide: true,
            placeholder: 'e.g. Hydrocortisone cream for 3 days',
          },
          {
            name: 'photos',
            label: 'Photos of the affected area',
            type: 'files',
            wide: true,
            hint: 'Clear, well-lit photos in focus. JPG or PNG up to 10MB each.',
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  gut: {
    intro: 'For diarrhoea, vomiting, constipation, abdominal pain and related problems.',
    sections: [
      {
        title: 'Your Symptoms',
        fields: [
          {
            name: 'gutSymptoms',
            label: 'Which symptoms do you have?',
            type: 'checkbox-group',
            required: true,
            wide: true,
            options: [
              { value: 'Diarrhoea', label: 'Diarrhoea' },
              { value: 'Vomiting', label: 'Vomiting' },
              { value: 'Nausea', label: 'Nausea' },
              { value: 'Constipation', label: 'Constipation' },
              { value: 'Abdominal pain', label: 'Abdominal pain' },
              { value: 'Reflux or heartburn', label: 'Reflux or heartburn' },
              { value: 'Bloating', label: 'Bloating' },
            ],
          },
          durationField,
          symptomsField('Describe your symptoms, how often, and anything that makes them better or worse...'),
          {
            name: 'painLocation',
            label: 'Where is the pain?',
            type: 'select',
            wide: true,
            showIf: (v) => Array.isArray(v.gutSymptoms) && v.gutSymptoms.includes('Abdominal pain'),
            options: [
              { value: 'Upper abdomen', label: 'Upper abdomen' },
              { value: 'Lower abdomen', label: 'Lower abdomen' },
              { value: 'Right side', label: 'Right side' },
              {
                value: 'Lower right',
                label: 'Lower right',
                redFlag: 'Severe lower right pain can indicate appendicitis and needs urgent in-person assessment.',
              },
              { value: 'Left side', label: 'Left side' },
              { value: 'All over', label: 'All over' },
            ],
          },
          { name: 'painSeverity', label: 'Pain severity', type: 'scale', min: 0, max: 10, wide: true },
          {
            name: 'bloodInStool',
            label: 'Is there blood in your stool, or is it black and tarry?',
            type: 'radio',
            required: true,
            wide: true,
            options: YES_NO('Blood in the stool or black tarry stool needs urgent in-person assessment.'),
          },
          {
            name: 'vomitingBlood',
            label: 'Are you vomiting blood or material that looks like coffee grounds?',
            type: 'radio',
            required: true,
            wide: true,
            options: YES_NO('Vomiting blood is a medical emergency. Call 000 or go to an emergency department now.'),
          },
          {
            name: 'fluidsDown',
            label: 'Are you able to keep fluids down?',
            type: 'radio',
            required: true,
            wide: true,
            options: [
              { value: 'Yes', label: 'Yes' },
              {
                value: 'No',
                label: 'No',
                redFlag: 'Not keeping fluids down risks dehydration and may need in-person care today.',
              },
            ],
          },
          { name: 'fever', label: 'Do you have a fever?', type: 'radio', required: true, options: YES_NO() },
          { name: 'recentTravel', label: 'Recent overseas travel?', type: 'radio', options: YES_NO() },
        ],
      },
      {
        title: 'Background',
        fields: [
          { name: 'weightLoss', label: 'Unintentional weight loss?', type: 'radio', options: YES_NO('Unexplained weight loss should be reviewed in person.') },
          { name: 'existingGutCondition', label: 'Known bowel or stomach condition?', type: 'text', placeholder: 'e.g. IBS, coeliac disease, reflux' },
          { name: 'currentMedications', label: 'Current medications', type: 'text', wide: true, placeholder: 'Include anti-inflammatories and blood thinners' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  'mental-health': {
    intro: 'You will speak with a doctor who can discuss treatment, referrals and a Mental Health Treatment Plan.',
    sections: [
      {
        title: 'Safety',
        description: 'Please answer honestly — this helps us get you the right level of care.',
        fields: [
          {
            name: 'safetyRisk',
            label: 'In the past two weeks, have you had thoughts of harming yourself or ending your life?',
            type: 'radio',
            required: true,
            wide: true,
            options: [
              { value: 'No', label: 'No' },
              {
                value: 'Some thoughts',
                label: 'Yes, some thoughts',
                redFlag:
                  'Support is available right now. Lifeline 13 11 14 (24/7), Suicide Call Back Service 1300 659 467. If you are in immediate danger, call 000.',
              },
              {
                value: 'Thoughts with a plan',
                label: 'Yes, with a plan',
                redFlag:
                  'Please seek help immediately — call 000 or go to your nearest emergency department. Lifeline 13 11 14 is available 24/7.',
              },
            ],
          },
        ],
      },
      {
        title: 'Your Concern',
        fields: [
          {
            name: 'concern',
            label: 'What would you like to discuss?',
            type: 'select',
            required: true,
            options: [
              { value: 'Anxiety', label: 'Anxiety' },
              { value: 'Depression', label: 'Depression' },
              { value: 'Stress', label: 'Stress or burnout' },
              { value: 'Insomnia', label: 'Insomnia or sleep problems' },
              { value: 'Headache', label: 'Headache or migraine' },
              { value: 'Other', label: 'Other' },
            ],
          },
          durationField,
          symptomsField('Describe how you have been feeling and what has been happening...'),
          {
            name: 'impact',
            label: 'How much is this affecting daily life?',
            type: 'radio',
            required: true,
            wide: true,
            options: [
              { value: 'Mild', label: 'Mild — coping most days' },
              { value: 'Moderate', label: 'Moderate — struggling regularly' },
              { value: 'Severe', label: 'Severe — unable to manage usual activities' },
            ],
          },
          {
            name: 'sleepPattern',
            label: 'What is the sleep problem?',
            type: 'radio',
            wide: true,
            showIf: (v) => v.concern === 'Insomnia',
            options: [
              { value: 'Falling asleep', label: 'Trouble falling asleep' },
              { value: 'Staying asleep', label: 'Waking through the night' },
              { value: 'Waking early', label: 'Waking too early' },
              { value: 'Both', label: 'A mix of these' },
            ],
          },
          {
            name: 'headacheOnset',
            label: 'How did the headache come on?',
            type: 'radio',
            wide: true,
            showIf: (v) => v.concern === 'Headache',
            options: [
              { value: 'Gradual', label: 'Gradually' },
              {
                value: 'Sudden severe',
                label: 'Suddenly and severely, peaking within minutes',
                redFlag: 'A sudden, severe "worst ever" headache is a medical emergency. Call 000 now.',
              },
            ],
          },
          {
            name: 'headacheNeuro',
            label: 'Any weakness, numbness, vision changes or confusion?',
            type: 'radio',
            wide: true,
            showIf: (v) => v.concern === 'Headache',
            options: YES_NO('Neurological symptoms with headache need emergency assessment. Call 000.'),
          },
        ],
      },
      {
        title: 'Current Care',
        fields: [
          { name: 'existingDiagnosis', label: 'Existing mental health diagnosis?', type: 'text', placeholder: 'e.g. Generalised anxiety disorder' },
          { name: 'currentMedications', label: 'Current medications', type: 'text', placeholder: 'e.g. Sertraline 50mg daily' },
          {
            name: 'mentalHealthPlan',
            label: 'Do you have a GP Mental Health Treatment Plan?',
            type: 'radio',
            wide: true,
            options: [
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' },
              { value: 'Interested', label: 'No, but I would like one' },
            ],
          },
          { name: 'currentSupport', label: 'Seeing a psychologist or counsellor?', type: 'radio', wide: true, options: YES_NO() },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  musculoskeletal: {
    intro: 'For neck, back, shoulder, joint and limb pain or injuries.',
    sections: [
      {
        title: 'The Problem',
        fields: [
          {
            name: 'region',
            label: 'Which area?',
            type: 'select',
            required: true,
            options: [
              { value: 'Neck', label: 'Neck' },
              { value: 'Back', label: 'Back' },
              { value: 'Shoulder', label: 'Shoulder' },
              { value: 'Elbow', label: 'Elbow' },
              { value: 'Wrist or hand', label: 'Wrist or hand' },
              { value: 'Hip', label: 'Hip' },
              { value: 'Knee', label: 'Knee' },
              { value: 'Ankle or foot', label: 'Ankle or foot' },
              { value: 'Other', label: 'Other' },
            ],
          },
          {
            name: 'onset',
            label: 'How did it start?',
            type: 'radio',
            required: true,
            options: [
              { value: 'Sudden injury', label: 'Sudden injury' },
              { value: 'Gradual', label: 'Came on gradually' },
            ],
          },
          {
            name: 'injuryDate',
            label: 'Date of injury',
            type: 'date',
            required: true,
            showIf: (v) => v.onset === 'Sudden injury',
          },
          {
            name: 'mechanism',
            label: 'How did the injury happen?',
            type: 'text',
            required: true,
            wide: true,
            placeholder: 'e.g. Rolled my ankle playing netball',
            showIf: (v) => v.onset === 'Sudden injury',
          },
          symptomsField('Describe the pain, when it is worst, and what movements are affected...'),
          { name: 'painSeverity', label: 'Pain severity', type: 'scale', min: 0, max: 10, wide: true },
          {
            name: 'features',
            label: 'Any of these present?',
            type: 'checkbox-group',
            wide: true,
            options: [
              { value: 'Swelling', label: 'Swelling' },
              { value: 'Bruising', label: 'Bruising' },
              { value: 'Visible deformity', label: 'Visible deformity', redFlag: 'Visible deformity suggests a possible fracture or dislocation — please attend an emergency department.' },
              { value: 'Locking or giving way', label: 'Locking or giving way' },
              { value: 'Redness and heat', label: 'Redness and heat' },
            ],
          },
          {
            name: 'weightBearing',
            label: 'Can you use or bear weight on it?',
            type: 'radio',
            required: true,
            wide: true,
            options: [
              { value: 'Yes', label: 'Yes' },
              { value: 'With difficulty', label: 'With difficulty' },
              { value: 'No', label: 'No', redFlag: 'Being unable to bear weight may indicate a fracture and needs imaging in person.' },
            ],
          },
          {
            name: 'neuroSymptoms',
            label: 'Any numbness, pins and needles, or weakness?',
            type: 'radio',
            required: true,
            wide: true,
            options: YES_NO('Numbness or weakness needs prompt in-person assessment.'),
          },
          {
            name: 'bladderBowel',
            label: 'Any loss of bladder or bowel control, or numbness around the groin?',
            type: 'radio',
            required: true,
            wide: true,
            showIf: (v) => v.region === 'Back',
            options: YES_NO('These are emergency symptoms of spinal cord compression. Go to an emergency department now.'),
          },
        ],
      },
      {
        title: 'Background',
        fields: [
          { name: 'priorInjury', label: 'Previous injury to this area?', type: 'radio', options: YES_NO() },
          { name: 'imaging', label: 'Any imaging done already?', type: 'text', placeholder: 'e.g. X-ray last week, no fracture' },
          { name: 'painRelief', label: 'What pain relief have you tried?', type: 'text', wide: true, placeholder: 'e.g. Paracetamol and ice' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  'womens-health': {
    intro: 'Confidential consultations for contraception, urinary, sexual and pregnancy-related health.',
    sections: [
      {
        title: 'Your Concern',
        fields: [
          {
            name: 'concern',
            label: 'What would you like to discuss?',
            type: 'select',
            required: true,
            wide: true,
            options: [
              { value: 'Emergency contraception', label: 'Emergency contraception' },
              { value: 'UTI', label: 'Urinary tract infection' },
              { value: 'STI', label: 'Sexually transmitted infection' },
              { value: 'Pregnancy nausea', label: 'Pregnancy-related nausea' },
              { value: 'Contraception', label: 'Regular contraception' },
              { value: 'Other', label: 'Other' },
            ],
          },
          symptomsField('Describe your symptoms or what you would like to discuss...'),
        ],
      },
      {
        title: 'Emergency Contraception',
        description: 'Timing matters — emergency contraception is more effective the sooner it is taken.',
        fields: [
          {
            name: 'timeSinceIntercourse',
            label: 'How long since the unprotected intercourse?',
            type: 'radio',
            required: true,
            wide: true,
            showIf: (v) => v.concern === 'Emergency contraception',
            options: [
              { value: '<24 hours', label: 'Less than 24 hours' },
              { value: '24-72 hours', label: '24 – 72 hours' },
              { value: '72-120 hours', label: '72 – 120 hours (3 – 5 days)' },
              {
                value: '>120 hours',
                label: 'More than 5 days',
                redFlag: 'Oral emergency contraception is unlikely to be effective beyond 120 hours. A copper IUD may still be an option — discuss with the doctor.',
              },
            ],
          },
          {
            name: 'lastPeriod',
            label: 'First day of your last period',
            type: 'date',
            required: true,
            showIf: (v) => v.concern === 'Emergency contraception' || v.concern === 'Contraception',
          },
          {
            name: 'currentContraception',
            label: 'Current contraception, if any',
            type: 'text',
            placeholder: 'e.g. Combined pill, missed 2 days',
            showIf: (v) => v.concern === 'Emergency contraception' || v.concern === 'Contraception',
          },
        ],
      },
      {
        title: 'Urinary Symptoms',
        fields: [
          {
            name: 'utiSymptoms',
            label: 'Which symptoms do you have?',
            type: 'checkbox-group',
            wide: true,
            showIf: (v) => v.concern === 'UTI',
            options: [
              { value: 'Burning on urination', label: 'Burning when passing urine' },
              { value: 'Frequency', label: 'Going more often' },
              { value: 'Urgency', label: 'Sudden urgency' },
              { value: 'Blood in urine', label: 'Blood in urine' },
              { value: 'Cloudy or smelly urine', label: 'Cloudy or strong-smelling urine' },
            ],
          },
          {
            name: 'flankPain',
            label: 'Any back or flank pain, fever, or vomiting?',
            type: 'radio',
            required: true,
            wide: true,
            showIf: (v) => v.concern === 'UTI',
            options: YES_NO('These suggest a kidney infection, which needs urgent in-person assessment.'),
          },
          {
            name: 'recurrentUti',
            label: 'Have you had more than two UTIs in the last six months?',
            type: 'radio',
            wide: true,
            showIf: (v) => v.concern === 'UTI',
            options: YES_NO(),
          },
        ],
      },
      {
        title: 'Sexual Health',
        fields: [
          {
            name: 'exposureDate',
            label: 'Approximate date of possible exposure',
            type: 'date',
            showIf: (v) => v.concern === 'STI',
          },
          {
            name: 'stiSymptoms',
            label: 'Any symptoms?',
            type: 'text',
            wide: true,
            placeholder: 'e.g. Unusual discharge, pelvic pain, or no symptoms',
            showIf: (v) => v.concern === 'STI',
          },
          {
            name: 'previousSti',
            label: 'Previous STI diagnosis?',
            type: 'radio',
            wide: true,
            showIf: (v) => v.concern === 'STI',
            options: YES_NO(),
          },
        ],
      },
      {
        title: 'Pregnancy',
        fields: [
          {
            name: 'gestation',
            label: 'How many weeks pregnant are you?',
            type: 'text',
            required: true,
            placeholder: 'e.g. 9 weeks',
            showIf: (v) => v.concern === 'Pregnancy nausea',
          },
          {
            name: 'fluidsDown',
            label: 'Are you able to keep fluids down?',
            type: 'radio',
            required: true,
            wide: true,
            showIf: (v) => v.concern === 'Pregnancy nausea',
            options: [
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No', redFlag: 'Persistent vomiting in pregnancy (hyperemesis) can need in-person treatment and fluids.' },
            ],
          },
          {
            name: 'pregnancyStatus',
            label: 'Are you currently pregnant or breastfeeding?',
            type: 'radio',
            required: true,
            wide: true,
            options: [
              { value: 'Not pregnant', label: 'Neither' },
              { value: 'Pregnant', label: 'Pregnant' },
              { value: 'Breastfeeding', label: 'Breastfeeding' },
              { value: 'Possibly pregnant', label: 'Possibly pregnant' },
            ],
          },
          { name: 'allergies', label: 'Known allergies', type: 'text', wide: true, placeholder: 'e.g. Penicillin' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  'mens-health': {
    intro: 'Confidential consultations for sexual health and related concerns.',
    sections: [
      {
        title: 'Your Concern',
        fields: [
          {
            name: 'concern',
            label: 'What would you like to discuss?',
            type: 'select',
            required: true,
            wide: true,
            options: [
              { value: 'Erectile dysfunction', label: 'Sexual dysfunction' },
              { value: 'STI', label: 'Sexually transmitted infection' },
              { value: 'Other', label: 'Other' },
            ],
          },
          durationField,
          symptomsField('Describe your symptoms or what you would like to discuss...'),
        ],
      },
      {
        title: 'Sexual Function',
        description: 'These questions matter because some treatments interact dangerously with heart medication.',
        fields: [
          {
            name: 'nitrates',
            label: 'Do you take nitrates, or medication for angina or chest pain?',
            type: 'radio',
            required: true,
            wide: true,
            showIf: (v) => v.concern === 'Erectile dysfunction',
            options: YES_NO_UNSURE(
              'Erectile dysfunction medicines cannot be taken with nitrates — the combination can cause a dangerous drop in blood pressure. The doctor will discuss alternatives.',
            ),
          },
          {
            name: 'cardiacHistory',
            label: 'Any heart disease, stroke, or very high or low blood pressure?',
            type: 'radio',
            required: true,
            wide: true,
            showIf: (v) => v.concern === 'Erectile dysfunction',
            options: YES_NO_UNSURE(),
          },
          {
            name: 'metabolic',
            label: 'Diabetes or high cholesterol?',
            type: 'radio',
            wide: true,
            showIf: (v) => v.concern === 'Erectile dysfunction',
            options: YES_NO_UNSURE(),
          },
          {
            name: 'previousTreatment',
            label: 'Have you tried treatment for this before?',
            type: 'text',
            wide: true,
            placeholder: 'e.g. Sildenafil 50mg, worked well',
            showIf: (v) => v.concern === 'Erectile dysfunction',
          },
        ],
      },
      {
        title: 'Sexual Health',
        fields: [
          { name: 'exposureDate', label: 'Approximate date of possible exposure', type: 'date', showIf: (v) => v.concern === 'STI' },
          {
            name: 'stiSymptoms',
            label: 'Any symptoms?',
            type: 'text',
            wide: true,
            placeholder: 'e.g. Discharge, pain passing urine, or no symptoms',
            showIf: (v) => v.concern === 'STI',
          },
          { name: 'previousSti', label: 'Previous STI diagnosis?', type: 'radio', wide: true, showIf: (v) => v.concern === 'STI', options: YES_NO() },
        ],
      },
      {
        title: 'Background',
        fields: [
          { name: 'currentMedications', label: 'Current medications', type: 'text', wide: true, placeholder: 'List everything you take regularly' },
          { name: 'allergies', label: 'Known allergies', type: 'text', wide: true, placeholder: 'e.g. Penicillin' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  other: {
    intro: 'Tell us what is going on and the doctor will take it from there.',
    sections: [
      {
        title: 'Your Concern',
        fields: [
          symptomsField('Describe what is happening, when it started, and what you would like help with...'),
          durationField,
          { name: 'severity', label: 'How severe is it?', type: 'scale', min: 0, max: 10 },
          {
            name: 'gettingWorse',
            label: 'Is it getting worse?',
            type: 'radio',
            required: true,
            wide: true,
            options: [
              { value: 'Improving', label: 'Improving' },
              { value: 'Same', label: 'About the same' },
              { value: 'Worse', label: 'Getting worse' },
            ],
          },
          { name: 'priorTreatment', label: 'What have you already tried?', type: 'text', wide: true, placeholder: 'e.g. Rest and paracetamol' },
          { name: 'existingConditions', label: 'Existing medical conditions', type: 'text', wide: true, placeholder: 'e.g. Type 2 diabetes, hypertension' },
          { name: 'currentMedications', label: 'Current medications', type: 'text', wide: true },
          { name: 'allergies', label: 'Known allergies', type: 'text', wide: true, placeholder: 'e.g. Penicillin' },
        ],
      },
    ],
  },
}
