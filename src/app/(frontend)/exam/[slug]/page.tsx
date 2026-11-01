import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { HookBox } from '@/components/HookBox'
import { JsonLd } from '@/components/JsonLd'
import { PhotoHead } from '@/components/PhotoHead'
import { StoreButtons } from '@/components/StoreButtons'
import { discountPercent, formatDate, formatWon, savings } from '@/lib/books'
import { getClient, SITE_URL } from '@/lib/payload'
import { pageMeta } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

const getGuide = cache(async (slug: string) => {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'exam-guides',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = await getGuide((await params).slug)
  if (!guide) return {}
  return pageMeta({
    title: guide.title,
    description: guide.lede,
    path: `/exam/${guide.slug}`,
    image: guide.ogUrl || undefined,
  })
}

export default async function ExamGuidePage({ params }: Props) {
  const guide = await getGuide((await params).slug)
  if (!guide) notFound()
  const path = `/exam/${guide.slug}`

  return (
    <article className="post">
      <JsonLd
        data={{
          '@type': 'ItemList',
          name: guide.title,
          itemListElement: guide.books.map((book, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: book.title,
          })),
        }}
      />
      <PhotoHead
        eyebrow={
          <Breadcrumbs
            items={[
              { name: '수험서 비교', path: '/exam' },
              { name: guide.exam, path },
            ]}
          />
        }
        lede={guide.lede}
        photo="/photos/exam.webp"
        title={guide.title}
      />
      <div className="frame frame--wide post__body">
        <aside className="loss-box">
          <strong>사기 전에 확인할 것</strong>
          <p>{guide.notice}</p>
          <p>{guide.loss}</p>
        </aside>

        <section className="compare">
          <h2>한눈에 비교</h2>
          <div className="compare__scroll" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th scope="col">책</th>
                  <th scope="col">구성</th>
                  <th scope="col">출간</th>
                  <th scope="col">쪽수</th>
                  <th scope="col">판매지수</th>
                  <th scope="col">할인가</th>
                </tr>
              </thead>
              <tbody>
                {guide.books.map((book) => (
                  <tr key={book.id ?? book.title}>
                    <th scope="row">
                      {book.shortTitle}
                      <small>{book.publisher}</small>
                    </th>
                    <td>{book.makeup}</td>
                    <td>{book.publishedOn}</td>
                    <td>{book.pages.toLocaleString('ko-KR')}쪽</td>
                    <td>{book.sales ? book.sales.toLocaleString('ko-KR') : '표시 없음'}</td>
                    <td>{formatWon(book.salePrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small>
            판매지수와 가격은 {formatDate(guide.verifiedAt)} 예스24 화면 기준입니다. 판매지수는 서점이 매긴 값이며, 출간 시기에 따라 차이가
            큽니다.
          </small>
        </section>

        <section className="fit">
          <h2>이렇게 고르세요</h2>
          <ul>
            {guide.verdicts.map((item) => (
              <li key={item.id ?? item.who}>
                <strong>{item.who}</strong>
                <p>{item.pick}</p>
              </li>
            ))}
          </ul>
        </section>

        <h2 className="exam-books__title">책별로 자세히</h2>
        <ol className="picks">
          {guide.books.map((book) => (
            <li className="pick" key={book.id ?? book.title}>
              <span className="pick__cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={`${book.title} 표지`} height={330} loading="lazy" src={book.coverUrl} width={230} />
              </span>
              <div className="pick__body">
                <h3>{book.title}</h3>
                <p className="pick__meta">{book.publisher}</p>
                <p>
                  <strong>이런 수험생:</strong> {book.bestFor}
                </p>
                <p>
                  <strong>아쉬운 점:</strong> {book.caution}
                </p>
                <p className="pick__imagine">
                  <strong>이 책으로 공부하면</strong> {book.imagine}
                </p>
                <p className="book-card__price">
                  <em>{discountPercent(book)}%</em> <strong>{formatWon(book.salePrice)}</strong>{' '}
                  <s>{formatWon(book.listPrice)}</s> <small>정가로 사면 {formatWon(savings(book))} 더 냅니다</small>
                </p>
                <StoreButtons book={book} />
              </div>
            </li>
          ))}
        </ol>
        <HookBox hook={guide.snsHook} title={guide.title} url={`${SITE_URL}${path}`} />
        <p className="disclosure">
          비교는 책 소개, 목차, 출판사 설명 등 공개 자료를 바탕으로 정리했으며, 합격을 보장하지 않습니다. 시험 일정과 출제기준은 시행 기관 공고를
          확인해 주세요. <Link href="/about">작성 기준 보기</Link>
          <br />
          구매 버튼은 제휴 링크이며, 구매가 이루어지면 일정액의 수수료를 받을 수 있습니다. 책값은 그대로입니다.
        </p>
      </div>
    </article>
  )
}
