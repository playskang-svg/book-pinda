import type { CollectionConfig } from 'payload'

import { anyone, signedIn } from './access'

export const GUIDE_GROUPS = [
  { label: '나이대별', value: 'age' },
  { label: '선물할 사람별', value: 'recipient' },
  { label: '직업별', value: 'job' },
  { label: '주제별', value: 'topic' },
] as const

export const Guides: CollectionConfig = {
  slug: 'guides',
  labels: { singular: '상황별 추천', plural: '상황별 추천' },
  admin: { useAsTitle: 'title', group: '콘텐츠', defaultColumns: ['title', 'group', 'order'] },
  access: { read: anyone, create: signedIn, update: signedIn, delete: signedIn },
  defaultSort: 'order',
  fields: [
    { name: 'title', label: '제목', type: 'text', required: true },
    {
      name: 'slug',
      label: '주소',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: '/guide/<주소>' },
    },
    {
      name: 'group',
      label: '묶음',
      type: 'select',
      required: true,
      options: [...GUIDE_GROUPS],
      admin: { position: 'sidebar' },
    },
    { name: 'chip', label: '짧은 이름', type: 'text', required: true, admin: { position: 'sidebar' } },
    { name: 'order', label: '순서', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
    { name: 'photo', label: '사진 주소', type: 'text', required: true, admin: { position: 'sidebar' } },
    { name: 'photoAlt', label: '사진 설명', type: 'text', required: true, admin: { position: 'sidebar' } },
    { name: 'ogUrl', label: '공유 썸네일 주소', type: 'text', admin: { position: 'sidebar' } },
    {
      name: 'snsHook',
      label: 'SNS 후킹 문구',
      type: 'text',
      required: true,
      admin: { description: '공유 글과 썸네일에 쓰는 한 줄입니다.' },
    },
    { name: 'lede', label: '도입 문장', type: 'textarea', required: true },
    { name: 'loss', label: '미루면 잃는 것', type: 'textarea', required: true },
    {
      name: 'picks',
      label: '추천 책',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'book', label: '책', type: 'relationship', relationTo: 'books', required: true },
        { name: 'why', label: '왜 이 책인가', type: 'textarea', required: true },
        { name: 'imagine', label: '읽고 난 뒤의 장면', type: 'textarea', required: true },
      ],
    },
  ],
}
