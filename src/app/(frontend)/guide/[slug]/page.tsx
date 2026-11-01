import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { GuideTiles } from '@/components/GuideTiles'
import { HookBox } from '@/components/HookBox'
import { JsonLd } from '@/components/JsonLd'
import { PhotoHead } from '@/components/PhotoHead'
import { StoreButtons } from '@/components/StoreButtons'
import { bookPath, discountPercent, formatWon, savings } from '@/lib/books'
import { getClient, SITE_URL } from '@/lib/payload'
import { pageMeta } from '@/lib/seo'
import type { Book } from '@/payload-types'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

const getGuide = cache(async (slug: string) => {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'guides',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = await getGuide((await params).slug)
  if (!guide) return {}
  return pageMeta({
    title: guide.title,
    description: guide.lede,
    path: `/guide/${guide.slug}`,
    image: guide.ogUrl || undefined,
  })
}

export default async function GuidePage({ params }: Props) {
  const guide = await getGuide((await params).slug)
  if (!guide) notFound()
  const payload = await getClient()
  const others = await payload.find({ collection: 'guides', limit: 100, depth: 0, sort: 'order', pagination: false })
  const path = `/guide/${guide.slug}`
  // A draft book comes back as a bare id for public readers, so it drops out of the list.
  const picks = guide.picks.filter((pick) => typeof pick.book === 'object')

  return (
    <article className="post">
      <JsonLd
        data={{
          '@type': 'ItemList',
          name: guide.title,
          itemListElement: picks.map((pick, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_URL}${bookPath(pick.book as Book)}`,
            name: (pick.book as Book).title,
          })),
        }}
      />
      <PhotoHead
        eyebrow={
          <Breadcrumbs
            items={[
              { name: '상황별 추천', path: '/guide' },
              { name: guide.chip, path },
            ]}
          />
        }
        lede={guide.lede}
        photo={guide.photo}
        photoAlt={guide.photoAlt}
        title={guide.title}
      />
      <div className="frame frame--text post__body">
        <aside className="loss-box">
          <strong>미루면 잃는 것</strong>
          <p>{guide.loss}</p>
        </aside>
        <ol className="picks">
          {picks.map((pick) => {
            const book = pick.book as Book
            return (
              <li className="pick" key={pick.id ?? book.id}>
                <Link className="pick__cover" href={bookPath(book)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={`${book.title} 표지`} height={330} loading="lazy" src={book.coverUrl} width={230} />
                </Link>
                <div className="pick__body">
                  <h2>
                    <Link href={bookPath(book)}>{book.title}</Link>
                  </h2>
                  <p className="pick__meta">{book.author}</p>
                  <p>{pick.why}</p>
                  <p className="pick__imagine">
                    <strong>읽고 난 뒤</strong> {pick.imagine}
                  </p>
                  <p className="book-card__price">
                    <em>{discountPercent(book)}%</em> <strong>{formatWon(book.salePrice)}</strong>{' '}
                    <s>{formatWon(book.listPrice)}</s> <small>정가로 사면 {formatWon(savings(book))} 더 냅니다</small>
                  </p>
                  <StoreButtons book={book} />
                  <Link className="pick__more" href={bookPath(book)}>
                    서평 전체 읽기
                  </Link>
                </div>
              </li>
            )
          })}
        </ol>
        <HookBox hook={guide.snsHook} title={guide.title} url={`${SITE_URL}${path}`} />
        <p className="disclosure">
          추천은 책 소개, 목차, 출판사 서평 등 공개 자료를 바탕으로 정리했습니다. <Link href="/about">작성 기준 보기</Link>
          <br />
          구매 버튼은 제휴 링크이며, 구매가 이루어지면 일정액의 수수료를 받을 수 있습니다. 책값은 그대로입니다.
        </p>
      </div>
      <section className="section section--tone post__related">
        <div className="frame">
          <h2>다른 상황도 보기</h2>
          <GuideTiles guides={others.docs} />
        </div>
      </section>
    </article>
  )
}
