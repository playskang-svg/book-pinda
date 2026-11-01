import type { CollectionConfig } from 'payload'

import { anyone, signedIn } from './access'

export const ExamGuides: CollectionConfig = {
  slug: 'exam-guides',
  labels: { singular: '수험서 비교', plural: '수험서 비교' },
  admin: { useAsTitle: 'title', group: '콘텐츠', defaultColumns: ['title', 'exam', 'order'] },
  access: { read: anyone, create: signedIn, update: signedIn, delete: signedIn },
  defaultSort: 'order',
  fields: [
    { name: 'title', label: '제목', type: 'text', required: true },
    { name: 'exam', label: '시험 이름', type: 'text', required: true },
    {
      name: 'slug',
      label: '주소',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: '/exam/<주소>' },
    },
    { name: 'order', label: '순서', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
    {
      name: 'verifiedAt',
      label: '정보 확인일',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    { name: 'ogUrl', label: '공유 썸네일 주소', type: 'text', admin: { position: 'sidebar' } },
    { name: 'snsHook', label: 'SNS 후킹 문구', type: 'text', required: true },
    { name: 'lede', label: '도입 문장', type: 'textarea', required: true },
    { name: 'notice', label: '사기 전에 확인할 것', type: 'textarea', required: true },
    { name: 'loss', label: '잘못 사면 잃는 것', type: 'textarea', required: true },
    {
      name: 'books',
      label: '비교할 책',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', label: '책 제목', type: 'text', required: true },
            { name: 'shortTitle', label: '짧은 이름', type: 'text', required: true },
            { name: 'publisher', label: '출판사', type: 'text', required: true },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'publishedOn', label: '출간일', type: 'text', required: true },
            { name: 'pages', label: '쪽수', type: 'number', required: true },
            { name: 'sales', label: '판매지수', type: 'number' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'listPrice', label: '정가', type: 'number', required: true },
            { name: 'salePrice', label: '할인가', type: 'number', required: true },
            { name: 'points', label: '적립금', type: 'number', defaultValue: 0 },
          ],
        },
        { name: 'coverUrl', label: '표지 주소', type: 'text', required: true },
        { name: 'makeup', label: '구성', type: 'textarea', required: true },
        { name: 'bestFor', label: '이런 수험생', type: 'textarea', required: true },
        { name: 'caution', label: '아쉬운 점', type: 'textarea', required: true },
        { name: 'imagine', label: '이 책으로 공부하면', type: 'textarea', required: true },
        {
          type: 'row',
          fields: [
            { name: 'kyoboUrl', label: '교보문고 제휴 링크', type: 'text' },
            { name: 'yes24Url', label: '예스24 제휴 링크', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'verdicts',
      label: '이렇게 고르세요',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'who', label: '이런 경우', type: 'text', required: true },
        { name: 'pick', label: '이 책', type: 'text', required: true },
      ],
    },
  ],
}
