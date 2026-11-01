import type { Metadata } from 'next'

import { BookGrid } from '@/components/BookGrid'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PhotoHead } from '@/components/PhotoHead'
import { ShareBar } from '@/components/ShareBar'
import { getBooks } from '@/lib/books'
import { SITE_URL } from '@/lib/payload'
import { pageMeta } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const TITLE = '요즘 나온 책 중 잘 팔리는 책'
const DESCRIPTION = '최근 4개월 안에 나온 책 가운데 베스트셀러에 오른 책의 서평과 할인 구매 링크를 모았습니다.'

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: '/new' })

export default async function NewBooksPage() {
  const books = await getBooks({ recent: true })
  return (
    <>
      <PhotoHead
        eyebrow={<Breadcrumbs items={[{ name: '요즘 신간', path: '/new' }]} />}
        lede="최근 4개월 안에 나온 책 가운데 베스트셀러에 오른 책입니다."
        photo="/photos/new.webp"
        photoAlt="새로 나온 책을 살펴보는 한국인 남성"
        title={TITLE}
      />
      <section className="section">
        <div className="frame">
          <BookGrid books={books} />
          <ShareBar card title={TITLE} url={`${SITE_URL}/new`} />
        </div>
      </section>
    </>
  )
}
