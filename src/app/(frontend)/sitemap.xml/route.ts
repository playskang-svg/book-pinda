import { getClient, publishedWhere, SITE_URL } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const STATIC_PATHS = ['', '/books', '/new', '/category']

export async function GET() {
  const payload = await getClient()
  const [books, pages, categories] = await Promise.all([
    payload.find({ collection: 'books', where: publishedWhere(), limit: 2000, depth: 0, pagination: false }),
    payload.find({ collection: 'pages', limit: 100, depth: 0, pagination: false }),
    payload.find({ collection: 'categories', limit: 100, depth: 0, pagination: false }),
  ])
  const urls = [
    ...STATIC_PATHS.map((path) => `<url><loc>${SITE_URL}${path}</loc></url>`),
    ...categories.docs.map((c) => `<url><loc>${SITE_URL}/category/${c.slug}</loc></url>`),
    ...pages.docs.map(
      (page) => `<url><loc>${SITE_URL}/${page.slug}</loc><lastmod>${page.updatedAt}</lastmod></url>`,
    ),
    ...books.docs.map(
      (book) => `<url><loc>${SITE_URL}/books/${book.isbn}</loc><lastmod>${book.updatedAt}</lastmod></url>`,
    ),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } })
}
