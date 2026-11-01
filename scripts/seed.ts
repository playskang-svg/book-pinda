// Fills categories, pages, menus and books from scripts/books.json. Safe to re-run: records are matched by slug or ISBN.
// Run: NODE_ENV=production pnpm payload run scripts/seed.ts   (remote D1)
import fs from 'node:fs'

import { type CollectionSlug, getPayload } from 'payload'

import config from '../src/payload.config'
import { type Block, categories, navigation, pages } from './seed-data'

const payload = await getPayload({ config })

/* eslint-disable @typescript-eslint/no-explicit-any */
const upsert = async (collection: CollectionSlug, where: any, data: any): Promise<any> => {
  const { docs } = await payload.find({ collection, where, limit: 1, depth: 0, draft: true })
  if (docs[0]) return payload.update({ collection, id: docs[0].id, data, depth: 0 } as any)
  return payload.create({ collection, data, depth: 0 } as any)
}

const textNode = (text: string) => ({
  type: 'text',
  version: 1,
  text,
  format: 0,
  mode: 'normal',
  style: '',
  detail: 0,
})
const element = (type: string, children: any[], extra: any = {}) => ({
  type,
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children,
  ...extra,
})

const toLexical = (blocks: Block[]) => ({
  root: element(
    'root',
    blocks.map((block) => {
      if ('h2' in block) return element('heading', [textNode(block.h2)], { tag: 'h2' })
      if ('h3' in block) return element('heading', [textNode(block.h3)], { tag: 'h3' })
      if ('quote' in block) return element('quote', [textNode(block.cite ? `${block.quote} (${block.cite})` : block.quote)])
      if ('ul' in block) {
        return element(
          'list',
          block.ul.map((item, index) => element('listitem', [textNode(item)], { value: index + 1 })),
          { listType: 'bullet', tag: 'ul', start: 1 },
        )
      }
      return element('paragraph', [textNode(block.p)], { textFormat: 0, textStyle: '' })
    }),
  ),
})

const categoryIds: Record<string, number> = {}
for (const item of categories) {
  categoryIds[item.slug] = (await upsert('categories', { slug: { equals: item.slug } }, item)).id
}

for (const { body, ...rest } of pages) {
  await upsert('pages', { slug: { equals: rest.slug } }, { ...rest, content: toLexical(body) })
}
await payload.updateGlobal({ slug: 'navigation', data: navigation })
console.log('categories', categories.length, 'pages', pages.length)

const books = JSON.parse(fs.readFileSync('scripts/books.json', 'utf8'))
for (const [index, { review, ending, category, expectations, status, ...book }] of books.entries()) {
  await upsert(
    'books',
    { isbn: { equals: book.isbn } },
    {
      ...book,
      category: categoryIds[category],
      review: toLexical(review),
      ending: ending?.length ? ending : null,
      expectations: expectations.map((text: string) => ({ text })),
      _status: status,
    },
  )
  console.log(index + 1, book.title)
}

const bookIds = Object.fromEntries(
  (await payload.find({ collection: 'books', limit: 500, depth: 0, draft: true, pagination: false })).docs.map((doc) => [doc.isbn, doc.id]),
)
const guides = JSON.parse(fs.readFileSync('scripts/guides.json', 'utf8'))
for (const guide of guides) {
  const picks = guide.picks.map(({ isbn, ...pick }: { isbn: string }) => ({ ...pick, book: bookIds[isbn] }))
  await upsert('guides', { slug: { equals: guide.slug } }, { ...guide, picks })
  console.log('guide', guide.slug)
}
const exams = JSON.parse(fs.readFileSync('scripts/exams.json', 'utf8'))
for (const exam of exams) {
  await upsert('exam-guides', { slug: { equals: exam.slug } }, exam)
  console.log('exam', exam.slug)
}
process.exit(0)
