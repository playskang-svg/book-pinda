import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { GuideTiles } from '@/components/GuideTiles'
import { PhotoHead } from '@/components/PhotoHead'
import { getClient } from '@/lib/payload'
import { pageMeta } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const TITLE = '상황별 책 추천'
const DESCRIPTION = '20대부터 60대까지 나이대별, 자녀·배우자·친구에게 줄 선물, 직업별로 지금 읽기 좋은 책을 골랐습니다.'

export const metadata: Metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: '/guide' })

export default async function GuideIndexPage() {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'guides', limit: 100, depth: 0, sort: 'order', pagination: false })
  return (
    <>
      <PhotoHead
        eyebrow={<Breadcrumbs items={[{ name: TITLE, path: '/guide' }]} />}
        lede="나이, 선물할 사람, 하는 일에 따라 맞는 책이 다릅니다. 내 상황부터 고르면 몇 권으로 좁혀 드립니다."
        photo="/photos/gift.webp"
        photoAlt="선물할 책을 포장하는 한국인 여성"
        title="누구에게 줄 책인가요?"
      />
      <section className="section">
        <div className="frame">
          <GuideTiles guides={docs} />
          <Link className="text-link" href="/exam">
            시험 준비 중이라면 수험서 비교 보기
          </Link>
        </div>
      </section>
    </>
  )
}
