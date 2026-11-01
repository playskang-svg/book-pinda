import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { BookGrid } from '@/components/BookGrid'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PhotoHead } from '@/components/PhotoHead'
import { ShareBar } from '@/components/ShareBar'
import { getBooks } from '@/lib/books'
import { getClient, SITE_URL } from '@/lib/payload'
import { pageMeta } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

const getCategory = cache(async (slug: string) => {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategory((await params).slug)
  if (!category) return {}
  return pageMeta({
    title: `${category.title} 베스트셀러 서평`,
    description: category.lede,
    path: `/category/${category.slug}`,
  })
}

export default async function CategoryPage({ params }: Props) {
  const category = await getCategory((await params).slug)
  if (!category) notFound()
  const books = await getBooks({ categoryId: category.id })
  const path = `/category/${category.slug}`
  return (
    <>
      <PhotoHead
        eyebrow={
          <Breadcrumbs
            items={[
              { name: '분야별 서평', path: '/category' },
              { name: category.title, path },
            ]}
          />
        }
        lede={category.lede}
        photo={`/photos/${category.slug}.webp`}
        photoAlt={category.photoAlt}
        title={`${category.title} 베스트셀러 서평`}
      />
      <section className="section">
        <div className="frame">
          <BookGrid books={books} />
          <ShareBar card title={`${category.title} 베스트셀러 서평`} url={`${SITE_URL}${path}`} />
        </div>
      </section>
    </>
  )
}
