import type { Metadata } from 'next'

import { BookGrid } from '@/components/BookGrid'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PhotoHead } from '@/components/PhotoHead'
import { ShareBar } from '@/components/ShareBar'
import { getBooks, RANK_PERIOD } from '@/lib/books'
import { SITE_URL } from '@/lib/payload'
import { pageMeta } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const TITLE = '베스트셀러 서평 모음'
const DESCRIPTION = '이번 주 베스트셀러와 분야별 인기 도서의 서평, 읽으면 좋은 상황, 할인 구매 링크를 한곳에 모았습니다.'

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: '/books' })

export default async function BooksPage() {
  const books = await getBooks()
  return (
    <>
      <PhotoHead
        eyebrow={<Breadcrumbs items={[{ name: TITLE, path: '/books' }]} />}
        lede={`1위부터 20위까지는 ${RANK_PERIOD} 순위이고, 그 뒤는 분야별 인기 도서입니다.`}
        photo="/photos/best.webp"
        photoAlt="평대에 놓인 책을 고르는 한국인 여성"
        title={TITLE}
      />
      <section className="section">
        <div className="frame">
          <BookGrid books={books} />
          <ShareBar card title={TITLE} url={`${SITE_URL}/books`} />
        </div>
      </section>
    </>
  )
}
