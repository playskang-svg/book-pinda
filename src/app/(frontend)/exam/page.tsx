import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PhotoHead } from '@/components/PhotoHead'
import { getClient } from '@/lib/payload'
import { pageMeta } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const TITLE = '수험서 비교'
const DESCRIPTION = '컴활, 정보처리기사, 공인중개사, 한능검, 토익, 사회복지사 수험서를 판수, 구성, 쪽수, 가격으로 나란히 비교했습니다.'

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: '/exam' })

export default async function ExamIndexPage() {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'exam-guides', limit: 50, depth: 0, sort: 'order', pagination: false })
  return (
    <>
      <PhotoHead
        eyebrow={<Breadcrumbs items={[{ name: TITLE, path: '/exam' }]} />}
        lede="출제기준이 바뀐 시험은 구판을 사면 범위부터 어긋납니다. 판수, 구성, 쪽수, 가격을 나란히 놓고 고르세요."
        photo="/photos/exam.webp"
        photoAlt="도서관에서 문제집을 풀며 공부하는 한국인 여성"
        title="수험서, 잘못 사면 시간까지 잃습니다"
      />
      <section className="section">
        <div className="frame">
          <ul className="exam-list">
            {docs.map((guide) => (
              <li key={guide.id}>
                <Link href={`/exam/${guide.slug}`}>
                  <span aria-hidden="true" className="exam-list__covers">
                    {guide.books.slice(0, 3).map((book) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt="" height={150} key={book.id ?? book.title} loading="lazy" src={book.coverUrl} width={104} />
                    ))}
                  </span>
                  <strong>{guide.exam}</strong>
                  <small>{guide.snsHook}</small>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
