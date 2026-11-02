import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { BookGrid } from '@/components/BookGrid'
import { BookBody, type BodyBlock, headingsOf, minutesOf } from '@/components/BookBody'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { BuyBox } from '@/components/BuyBox'
import { CoupangBanner } from '@/components/CoupangBanner'
import { HookBox } from '@/components/HookBox'
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

const shareTitleOf = (book: { title: string; snsHook?: string | null }) =>
  book.snsHook ? `《${book.title}》 ${book.snsHook}` : `《${book.title}》`

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await getBook((await params).isbn)
  if (!book) return {}
  return pageMeta({
    title: `${book.title} ${['novel', 'kids'].includes(categoryOf(book)?.slug ?? '') ? '줄거리' : '내용'} 요약과 서평`,
    shareTitle: shareTitleOf(book),
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
  const body = (book.body as BodyBlock[] | null) ?? null
  const ending = (book.ending as BodyBlock[] | null) ?? null
  const sections = body ? headingsOf(body) : []

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
        {book.coverage && body ? (
          <aside className="coverage">
            <strong>이 글로 알 수 있는 범위 · 약 {minutesOf(body)}분</strong>
            <p>{book.coverage}</p>
            {sections.length > 2 ? (
              <ol>
                {sections.map((name, index) => (
                  <li key={name}>
                    <a href={`#s${index + 1}`}>{name}</a>
                  </li>
                ))}
              </ol>
            ) : null}
          </aside>
        ) : null}
        {body ? (
          <BookBody blocks={body} midway={<CoupangBanner slot={category?.slug} />} />
        ) : (
          <RichText data={book.review} />
        )}
        {ending?.length ? (
          <details className="ending">
            <summary>결말까지 읽기 (내용을 밝힙니다)</summary>
            <BookBody blocks={ending} />
          </details>
        ) : null}
        {book.onlyInBook ? (
          <aside className="only-in-book">
            <strong>여기까지 읽어도 책을 펴야만 얻는 것</strong>
            <p>{book.onlyInBook}</p>
          </aside>
        ) : null}
        {book.imagine ? (
          <aside className="imagine-box">
            <strong>이 책을 읽고 난 뒤의 장면</strong>
            <p>{book.imagine}</p>
          </aside>
        ) : null}
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
        {book.lossNote ? (
          <aside className="loss-box">
            <strong>안 읽고 넘어가면</strong>
            <p>{book.lossNote}</p>
          </aside>
        ) : null}
        <BuyBox book={book} title={`${book.title}, 어디서 살까요?`} />
        <p className="disclosure">
          이 글은 책 소개, 목차, 책 속 발췌, 출판사 서평, 공개된 독자 리뷰와 널리 알려진 내용을 바탕으로 AI의 도움을 받아
          정리했습니다. 저자·출판사와 무관한 개인 해설입니다.{' '}
          <Link href="/about">작성 기준 보기</Link>
          <br />
          구매 버튼과 쿠팡 배너는 제휴 링크이며, 구매가 이루어지면 일정액의 수수료를 받을 수 있습니다. 책값은 그대로입니다.
        </p>
        {book.snsHook ? (
          <HookBox hook={book.snsHook} title={shareTitleOf(book)} url={url} />
        ) : (
          <ShareBar card text={book.summary} title={shareTitleOf(book)} url={url} />
        )}
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
