import type { Metadata } from 'next'
import Link from 'next/link'

import type { BodyBlock } from '@/components/BookBody'
import { BookGrid } from '@/components/BookGrid'
import { CategoryTiles } from '@/components/CategoryTiles'
import { GuideTiles } from '@/components/GuideTiles'
import { JsonLd } from '@/components/JsonLd'
import { PhotoHead } from '@/components/PhotoHead'
import { ReviewList } from '@/components/ReviewList'
import { bookPath, categoryOf, getBooks, RANK_PERIOD } from '@/lib/books'
import { getClient, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/payload'
import { pageMeta, publisher } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  ...pageMeta({ title: SITE_TITLE, shareTitle: '책값보다 아까운 건, 안 맞는 책에 쓴 시간입니다', description: SITE_DESCRIPTION, path: '/' }),
  title: { absolute: SITE_TITLE },
}

export default async function HomePage() {
  const payload = await getClient()
  const [books, recent, categories, guides, exams] = await Promise.all([
    getBooks(),
    getBooks({ recent: true, limit: 5 }),
    payload.find({ collection: 'categories', limit: 20, depth: 0, sort: 'order', pagination: false }),
    payload.find({ collection: 'guides', limit: 100, depth: 0, sort: 'order', pagination: false }),
    payload.find({ collection: 'exam-guides', limit: 50, depth: 0, sort: 'order', pagination: false }),
  ])
  const newest = [...books].sort((a, b) => b.publishedOn.localeCompare(a.publishedOn)).slice(0, 6)
  const marketing = books.filter((book) => categoryOf(book)?.slug === 'marketing').slice(0, 5)
  // A different few short passages each day, taken from the book pages themselves.
  const quotable = books.flatMap((book) => {
    const found = ((book.body as BodyBlock[] | null) ?? []).find((block) => 'quote' in block && block.quote.length <= 110)
    return found && 'quote' in found ? [{ book, quote: found.quote }] : []
  })
  const start = quotable.length ? Math.floor(Date.now() / 86400000) % quotable.length : 0
  const quotes = [...quotable.slice(start), ...quotable.slice(0, start)].slice(0, 3)

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
        eyebrow={<p className="post__category">북핀다 북카페</p>}
        lede="읽고 나면 내 하루가 어떻게 달라지는지 먼저 보고 고르세요. 마음에 들면 바로 할인가로 살 수 있습니다."
        photo="/photos/cafe.webp"
        photoAlt="따뜻한 조명 아래 책장이 늘어선 북카페"
        tall
        title="책값보다 아까운 건, 안 맞는 책에 쓴 시간입니다"
      >
        <div className="hero-actions">
          <a className="button button--buy" href="#best">
            베스트셀러 보기
          </a>
          <Link className="button button--ghost" href="/guide">
            내 상황으로 찾기
          </Link>
        </div>
      </PhotoHead>

      <section className="section section--tight">
        <div className="frame">
          <div className="cafe-hello">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="책방지기 핀이" height={84} src="/characters/host-calm.webp" width={84} />
            <p>어서 오세요, 책방지기 핀이예요. 앉아서 천천히 보고 가세요. 책의 절반쯤은 제가 풀어 드릴게요. 나머지는 책을 펴야 만나요.</p>
          </div>
          {quotes.length ? (
            <ul className="quote-shelf">
              {quotes.map(({ book, quote }) => (
                <li key={book.id}>
                  <Link href={bookPath(book)}>
                    <blockquote>{quote}</blockquote>
                    <span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="" height={72} loading="lazy" src={book.coverUrl} width={50} />
                      <small>
                        <strong>{book.title}</strong>
                        {book.author}
                      </small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

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

      {marketing.length ? (
        <section className="section">
          <div className="frame">
            <h2>파는 일을 하는 사람의 서가</h2>
            <p className="section-lede">스토리, 퍼널, 카피, 포지셔닝. 고객의 마음을 움직이는 일에 먼저 펴 볼 책들입니다.</p>
            <BookGrid books={marketing} />
            <Link className="text-link" href="/guide/marketer">
              마케터의 서가 전체 보기
            </Link>
          </div>
        </section>
      ) : null}

      <section className="section section--tone" id="guide">
        <div className="frame">
          <h2>누구에게 줄 책인가요?</h2>
          <p className="section-lede">나이, 선물할 사람, 하는 일을 고르면 몇 권으로 좁혀 드립니다.</p>
          <GuideTiles guides={guides.docs} />
        </div>
      </section>

      <section className="section">
        <div className="frame">
          <h2>수험서, 잘못 사면 시간까지 잃습니다</h2>
          <p className="section-lede">판수, 구성, 쪽수, 가격을 나란히 놓고 비교했습니다.</p>
          <ul className="exam-chips">
            {exams.docs.map((guide) => (
              <li key={guide.id}>
                <Link href={`/exam/${guide.slug}`}>{guide.exam}</Link>
              </li>
            ))}
          </ul>
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
