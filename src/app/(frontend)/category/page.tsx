import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CategoryTiles } from '@/components/CategoryTiles'
import { PhotoHead } from '@/components/PhotoHead'
import { getBooks } from '@/lib/books'
import { getClient } from '@/lib/payload'
import { pageMeta } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const TITLE = '분야별 서평'
const DESCRIPTION = '소설, 에세이, 인문, 경제경영, 자기계발, 과학, 건강, 어린이 책까지 분야별 인기 도서 서평을 모았습니다.'

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: '/category' })

export default async function CategoryIndexPage() {
  const payload = await getClient()
  const [books, categories] = await Promise.all([
    getBooks(),
    payload.find({ collection: 'categories', limit: 20, depth: 0, sort: 'order', pagination: false }),
  ])
  return (
    <>
      <PhotoHead
        eyebrow={<Breadcrumbs items={[{ name: TITLE, path: '/category' }]} />}
        lede="관심 있는 분야부터 고르세요. 분야마다 지금 잘 팔리는 책을 앞에 놓았습니다."
        photo="/photos/humanities.webp"
        photoAlt="도서관에서 책을 읽는 한국인 남성"
        title={TITLE}
      />
      <section className="section section--tone">
        <div className="frame">
          <CategoryTiles books={books} categories={categories.docs} />
        </div>
      </section>
    </>
  )
}
