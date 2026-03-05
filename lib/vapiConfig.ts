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
  electrecidadParedes: {
    id: '4b3fa264-d837-46ad-8906-187714f93f16',
    name: 'Electrecidad Paredes',
    slug: 'electrecidad-paredes',
  },
} as const;
