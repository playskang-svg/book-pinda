import { getClient, publishedWhere } from '@/lib/payload'
import type { Book, Category } from '@/payload-types'

// Shown wherever ranks appear. Update together with sortOrder when the bestseller list is refreshed.
export const RANK_PERIOD = '2026년 10월 21~27일 주간 종합 베스트'
const TOP_RANK = 20
const RECENT_DAYS = 120

export const rankOf = (book: Pick<Book, 'sortOrder'>): number | null =>
  book.sortOrder <= TOP_RANK ? book.sortOrder : null

export const bookPath = (book: Pick<Book, 'isbn'>) => `/books/${book.isbn}`

export const formatWon = (value: number) => `${value.toLocaleString('ko-KR')}원`

export const formatDate = (value: string | null | undefined): string => {
  if (!value) return ''
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}

export const discountPercent = (book: Pick<Book, 'listPrice' | 'salePrice'>) =>
  Math.round(((book.listPrice - book.salePrice) / book.listPrice) * 100)

// Discount plus points: the amount a reader leaves on the table by paying list price.
export const savings = (book: Pick<Book, 'listPrice' | 'salePrice' | 'points'>) =>
  book.listPrice - book.salePrice + (book.points ?? 0)

export const categoryOf = (book: Book): Category | null =>
  typeof book.category === 'object' ? book.category : null

export const getBooks = async ({
  categoryId,
  recent = false,
  limit = 100,
  excludeId,
}: {
  categoryId?: number
  recent?: boolean
  limit?: number
  excludeId?: number
} = {}) => {
  const payload = await getClient()
  const and: Record<string, unknown>[] = [...publishedWhere().and]
  if (categoryId) and.push({ category: { equals: categoryId } })
  if (excludeId) and.push({ id: { not_equals: excludeId } })
  if (recent) {
    const since = new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000).toISOString()
    and.push({ publishedOn: { greater_than_equal: since } })
  }
  const { docs } = await payload.find({
    collection: 'books',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: { and } as any,
    limit,
    depth: 1,
    sort: 'sortOrder',
  })
  return docs
}
