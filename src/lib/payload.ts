import config from '@payload-config'
import { getPayload } from 'payload'

export const getClient = () => getPayload({ config })

export const SITE_URL = 'https://book.pinda.kr'
export const SITE_NAME = '북핀다'
export const SITE_TITLE = `${SITE_NAME} — 베스트셀러 서평 · 상황별 맞춤 책 추천 · 수험서 비교`
export const SITE_DESCRIPTION =
  '북핀다는 베스트셀러 서평, 상황별 맞춤 도서 추천, 인기 자격증 수험서 비교 분석을 제공하여 내게 꼭 맞는 책을 찾고 할인 혜택까지 연결해 드리는 도서 큐레이션 가이드입니다.'

export const publishedWhere = () => ({
  and: [
    { _status: { equals: 'published' as const } },
    { publishedAt: { less_than_equal: new Date().toISOString() } },
  ],
})

// Media URLs already carry serverURL in production and are relative elsewhere.
export const absoluteUrl = (url: string): string => (url.startsWith('http') ? url : `${SITE_URL}${url}`)
