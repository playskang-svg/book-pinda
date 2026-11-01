import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { BookGrid } from '@/components/BookGrid'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { BuyBox } from '@/components/BuyBox'
import { JsonLd } from '@/components/JsonLd'
import { RichText } from '@/components/RichText'
import { ShareBar } from '@/components/ShareBar'
import { bookPath, categoryOf, formatDate, getBooks, rankOf, RANK_PERIOD } from '@/lib/books'
import { absoluteUrl, getClient, publishedWhere, SITE_URL } from '@/lib/payload'
import { pageMeta, publisher } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ isbn: string }> }

const getBook = cache(async (isbn: string) => {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'books',
    where: { and: [...publishedWhere().and, { isbn: { equals: isbn } }] },
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await getBook((await params).isbn)
  if (!book) return {}
  return pageMeta({
    title: `${book.title} 서평, 이런 분께 맞는 책입니다`,
    description: book.summary,
    path: bookPath(book),
    image: book.ogUrl || undefined,
    article: {
      publishedTime: book.publishedAt,
      modifiedTime: book.updatedAt,
      section: categoryOf(book)?.title,
    },
  })
}

export default async function BookPage({ params }: Props) {
  const book = await getBook((await params).isbn)
  if (!book) notFound()
  const category = categoryOf(book)
  const related = category ? await getBooks({ categoryId: category.id, excludeId: book.id, limit: 4 }) : []
  const url = `${SITE_URL}${bookPath(book)}`
  const rank = rankOf(book)

  return (
    <article className="post">
      <JsonLd
        data={{
          '@type': 'Review',
          name: `${book.title} 서평`,
          reviewBody: book.summary,
          datePublished: book.publishedAt,
          dateModified: book.updatedAt,
          inLanguage: 'ko-KR',
          url,
          author: publisher,
          publisher,
          itemReviewed: {
            '@type': 'Book',
            name: book.title,
            isbn: book.isbn,
            image: absoluteUrl(book.coverUrl),
            author: { '@type': 'Person', name: book.author },
            publisher: { '@type': 'Organization', name: book.publisher },
            datePublished: book.publishedOn.slice(0, 10),
          },
        }}
      />
      <header className="book-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" className="book-hero__bg" height={330} src={book.coverUrl} width={230} />
        <div className="frame book-hero__inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={`${book.title} 표지`} className="book-hero__cover" fetchPriority="high" height={420} src={book.coverUrl} width={290} />
          <div>
            <Breadcrumbs
              items={[
                ...(category ? [{ name: category.title, path: `/category/${category.slug}` }] : []),
                { name: book.title, path: bookPath(book) },
              ]}
            />
            {rank ? <p className="book-hero__rank">{RANK_PERIOD} {rank}위</p> : null}
            <h1>{book.title}</h1>
            <p className="book-hero__meta">
              {book.author} · {book.publisher} · {formatDate(book.publishedOn)} 출간
            </p>
            <p className="book-hero__tagline">{book.tagline}</p>
            <BuyBox book={book} />
          </div>
        </div>
      </header>
      <div className="frame frame--text post__body">
        <aside className="summary">
          <strong>💡 핵심 한 줄 요약</strong>
          <p>{book.summary}</p>
        </aside>
        <RichText data={book.review} />
        <section className="fit">
          <h2>이런 분이, 이런 상황에서 읽으면 좋습니다</h2>
          <ul>
            {book.situations.map((item) => (
              <li key={item.id ?? item.who}>
                <strong>{item.who}</strong>
                <p>{item.why}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="expect">
          <h2>읽고 나면 기대할 수 있는 것</h2>
          <ul>
            {book.expectations.map((item) => (
              <li key={item.id ?? item.text}>{item.text}</li>
            ))}
          </ul>
        </section>
        <BuyBox book={book} title={`${book.title}, 어디서 살까요?`} />
        <p className="disclosure">
          이 서평은 책 소개, 목차, 저자 소개, 출판사 서평 등 공개 자료를 바탕으로 작성했습니다.{' '}
          <Link href="/about">작성 기준 보기</Link>
          <br />
          구매 버튼은 제휴 링크이며, 구매가 이루어지면 일정액의 수수료를 받을 수 있습니다. 책값은 그대로입니다.
        </p>
        <ShareBar card text={book.summary} title={`${book.title} 서평`} url={url} />
      </div>
      {related.length ? (
        <section className="section section--tone post__related">
          <div className="frame">
            <h2>{category?.title} 분야의 다른 책</h2>
            <BookGrid books={related} />
          </div>
        </section>
      ) : null}
    </article>
  )
}
