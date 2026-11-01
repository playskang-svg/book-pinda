import config from '@payload-config'
import { getPayload } from 'payload'

export const getClient = () => getPayload({ config })

export const SITE_URL = 'https://book.pinda.kr'
export const SITE_NAME = '북핀다'
export const SITE_TITLE = `${SITE_NAME} — 베스트셀러 서평과 할인 구매`
export const SITE_DESCRIPTION =
  '북핀다는 베스트셀러 서평과 함께 누가 어떤 상황에서 읽으면 좋은지, 읽고 나면 무엇을 기대할 수 있는지 정리하고 할인 구매 링크를 모아 둔 사이트입니다.'

export const publishedWhere = () => ({
  and: [
    { _status: { equals: 'published' as const } },
    { publishedAt: { less_than_equal: new Date().toISOString() } },
  ],
})

// Media URLs already carry serverURL in production and are relative elsewhere.
export const absoluteUrl = (url: string): string => (url.startsWith('http') ? url : `${SITE_URL}${url}`)
