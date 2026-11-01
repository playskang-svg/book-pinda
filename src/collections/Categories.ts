import type { CollectionConfig } from 'payload'

import { anyone, signedIn } from './access'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: '분야', plural: '분야' },
  admin: { useAsTitle: 'title', group: '콘텐츠', defaultColumns: ['title', 'slug', 'order'] },
  access: { read: anyone, create: signedIn, update: signedIn, delete: signedIn },
  defaultSort: 'order',
  fields: [
    { name: 'title', label: '이름', type: 'text', required: true },
    {
      name: 'slug',
      label: '주소',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: '/category/<주소>. 사진은 /photos/<주소>.webp' },
    },
    { name: 'lede', label: '소개 문장', type: 'text', required: true },
    { name: 'photoAlt', label: '사진 설명', type: 'text', required: true },
    { name: 'order', label: '순서', type: 'number', defaultValue: 100 },
  ],
}
