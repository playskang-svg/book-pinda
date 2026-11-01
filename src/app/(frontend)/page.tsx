import type { Metadata } from 'next'
import Link from 'next/link'

import { BookGrid } from '@/components/BookGrid'
import { CategoryTiles } from '@/components/CategoryTiles'
import { JsonLd } from '@/components/JsonLd'
import { PhotoHead } from '@/components/PhotoHead'
import { ReviewList } from '@/components/ReviewList'
import { bookPath, getBooks, RANK_PERIOD } from '@/lib/books'
import { getClient, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/payload'
import { pageMeta, publisher } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  ...pageMeta({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: '/' }),
  title: { absolute: SITE_TITLE },
}

export default async function HomePage() {
  const payload = await getClient()
  const [books, recent, categories] = await Promise.all([
    getBooks(),
    getBooks({ recent: true, limit: 5 }),
    payload.find({ collection: 'categories', limit: 20, depth: 0, sort: 'order', pagination: false }),
  ])
  const newest = [...books].sort((a, b) => b.publishedOn.localeCompare(a.publishedOn)).slice(0, 6)

  return (
    <>
      <JsonLd
        data={{
          '@type': 'WebSite',
          name: SITE_NAME,
          alternateName: 'book.pinda.kr',
          url: SITE_URL,
          inLanguage: 'ko-KR',
          description: SITE_DESCRIPTION,
          publisher,
        }}
      />
      <PhotoHead
        aside={
          <div className="hero-shelf">
            {books.slice(0, 5).map((book) => (
              <Link href={bookPath(book)} key={book.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={`${book.title} 표지`} height={330} src={book.coverUrl} width={230} />
              </Link>
            ))}
          </div>
        }
        eyebrow={<p className="post__category">베스트셀러 서평과 할인 구매</p>}
        lede="누가 어떤 상황에서 읽으면 좋은지, 읽고 나면 무엇을 얻는지 먼저 보고 고르세요. 마음에 들면 바로 할인가로 살 수 있습니다."
        photo="/photos/hero.webp"
        photoAlt="서점 서가 앞에서 책을 펼쳐 보는 한국인 여성"
        tall
        title="지금 잘 팔리는 책, 사기 전에 읽어 보는 서평"
      >
        <div className="hero-actions">
          <a className="button button--buy" href="#best">
            베스트셀러 보기
          </a>
          <Link className="button button--ghost" href="/category">
            분야별로 찾기
          </Link>
        </div>
      </PhotoHead>

      <section className="section" id="best">
        <div className="frame">
          <h2>이번 주 베스트셀러</h2>
          <p className="section-lede">{RANK_PERIOD} 순위입니다. 표지를 누르면 서평으로, 서점 버튼을 누르면 해당 책의 구매 화면으로 갑니다.</p>
          <BookGrid books={books.slice(0, 10)} />
          <Link className="text-link" href="/books">
            베스트셀러 전체 보기
          </Link>
        </div>
      </section>

      <section className="section section--tone">
        <div className="frame">
          <h2>분야별 대표 책</h2>
          <CategoryTiles books={books} categories={categories.docs} />
        </div>
      </section>

      <section className="section">
        <div className="frame">
          <h2>요즘 나온 책 중 잘 팔리는 책</h2>
          <BookGrid books={recent} />
          <Link className="text-link" href="/new">
            신간 베스트 전체 보기
          </Link>
        </div>
      </section>

      <section className="section section--photo band">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" className="section__photo" height={800} loading="lazy" src="/photos/band.webp" width={1200} />
        <div className="frame section__body">
          <h2>정가로 사면 1년에 7만 원이 그냥 나갑니다</h2>
          <p>
            온라인 서점의 신간은 도서정가제 안에서 10% 할인과 5% 적립을 받습니다. 2만 원짜리 책을 매달 두 권 사면 1년에
            72,000원 차이입니다.
          </p>
          <Link className="button button--buy" href="/books">
            할인가로 책 고르기
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="frame">
          <h2>막 나온 책의 서평</h2>
          <ReviewList books={newest} />
        </div>
      </section>
    </>
  )
}
