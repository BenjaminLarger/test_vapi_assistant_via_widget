export const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY || '';
export const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '';

export const ASSISTANTS = {
  acts: {
    id: '539f665c-076c-4b7f-b647-06c4e34f62fe',
    name: 'ACTS',
    slug: 'acts',
  },
  electricidadAbril: {
    id: 'e96dda97-fb77-4ed6-a80f-57217235a6d2',
    name: 'Electricidad Abril',
    slug: 'electricidad-abril',
  },
} as const;
