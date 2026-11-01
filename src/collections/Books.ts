import type { Access, CollectionConfig } from 'payload'

import { signedIn } from './access'

const publishedOnly: Access = ({ req }) => {
  if (req.user) return true
  return {
    and: [
      { _status: { equals: 'published' } },
      { publishedAt: { less_than_equal: new Date().toISOString() } },
    ],
  }
}

export const Books: CollectionConfig = {
  slug: 'books',
  labels: { singular: '책', plural: '책' },
  admin: {
    useAsTitle: 'title',
    group: '콘텐츠',
    defaultColumns: ['title', 'author', 'category', 'sortOrder', '_status'],
  },
  // A future publish date acts as scheduling; Workers have no job runner for schedulePublish.
  versions: { drafts: true },
  access: { read: publishedOnly, create: signedIn, update: signedIn, delete: signedIn },
  defaultSort: 'sortOrder',
  fields: [
    { name: 'title', label: '책 제목', type: 'text', required: true },
    {
      name: 'isbn',
      label: 'ISBN',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: '서평 주소로 쓰입니다. 13자리 숫자.' },
    },
    {
      name: 'publishedAt',
      label: '서평 공개 시각',
      type: 'date',
      required: true,
      index: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: '미래 시각으로 발행하면 그 시각에 공개됩니다(예약 발행).',
      },
    },
    {
      name: 'category',
      label: '분야',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'sortOrder',
      label: '진열 순서',
      type: 'number',
      required: true,
      defaultValue: 500,
      index: true,
      admin: { position: 'sidebar', description: '1~20은 주간 종합 순위로 표시됩니다. 나머지는 100 이상.' },
    },
    {
      name: 'verifiedAt',
      label: '가격 확인일',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      type: 'row',
      fields: [
        { name: 'author', label: '저자', type: 'text', required: true },
        { name: 'publisher', label: '출판사', type: 'text', required: true },
        {
          name: 'publishedOn',
          label: '출간일',
          type: 'date',
          required: true,
          index: true,
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
      ],
    },
    {
      name: 'coverUrl',
      label: '표지 이미지 주소',
      type: 'text',
      required: true,
      admin: { description: '/covers/<ISBN>.webp 또는 이미지 전체 주소' },
    },
    {
      name: 'ogUrl',
      label: '공유 썸네일 주소',
      type: 'text',
      admin: { description: '비워 두면 사이트 기본 썸네일을 씁니다.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'listPrice', label: '정가', type: 'number', required: true },
        { name: 'salePrice', label: '할인가', type: 'number', required: true },
        { name: 'points', label: '적립금', type: 'number', defaultValue: 0 },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'kyoboUrl',
          label: '교보문고 제휴 링크',
          type: 'text',
          admin: { description: '세시간전에서 발급한 https://3ha.in/r/... 비우면 버튼을 숨깁니다.' },
        },
        {
          name: 'yes24Url',
          label: '예스24 제휴 링크',
          type: 'text',
          admin: { description: '세시간전에서 발급한 https://3ha.in/r/... 비우면 버튼을 숨깁니다.' },
        },
      ],
    },
    { name: 'tagline', label: '표지 옆 한 줄', type: 'text', required: true },
    {
      name: 'summary',
      label: '핵심 한 줄 요약',
      type: 'textarea',
      required: true,
      admin: { description: '서평 맨 위 요약 상자와 검색 설명에 함께 쓰입니다.' },
    },
    { name: 'review', label: '서평', type: 'richText', required: true },
    {
      name: 'situations',
      label: '이런 분이 이런 상황에서',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'who', label: '누가·어떤 상황', type: 'text', required: true },
        { name: 'why', label: '왜 좋은지', type: 'textarea', required: true },
      ],
    },
    {
      name: 'expectations',
      label: '읽으면 기대할 수 있는 점',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [{ name: 'text', label: '내용', type: 'text', required: true }],
    },
  ],
}
