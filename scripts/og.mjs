// Renders share thumbnails with the snsogg skill: one per book (public/og/<isbn>.jpg) plus the site default.
// Run: NODE_PATH=<sharp> node scripts/og.mjs   (expects public/covers and public/photos)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const sharp = createRequire(import.meta.url)(process.env.SHARP_PATH || 'sharp')
const SKILL = 'C:/Window_DEV/.claude/skills/snsogg/render.mjs'
const { renderCard } = await import(pathToFileURL(SKILL).href)

const theme = { brand: '#ffffff', accent: '#f2c9a1', cta: '#c8441a' }
const fontFiles = { 400: 'C:/Windows/Fonts/malgun.ttf', 700: 'C:/Windows/Fonts/malgunbd.ttf' }
const dataUrl = (buffer) => `data:image/jpeg;base64,${buffer.toString('base64')}`

// A blurred cover behind the card, with the sharp cover placed on the right edge.
const background = async (isbn) => {
  const cover = readFileSync(`public/covers/${isbn}.webp`)
  const blurred = await sharp(cover).resize(1200, 630, { fit: 'cover' }).blur(30).modulate({ brightness: 0.55 }).toBuffer()
  const sharpCover = await sharp(cover).resize({ height: 520 }).toBuffer()
  return dataUrl(
    await sharp(blurred)
      .composite([{ input: sharpCover, top: 55, left: 820 }])
      .jpeg({ quality: 80 })
      .toBuffer(),
  )
}

const toJpeg = (png) => sharp(png).jpeg({ quality: 78 }).toBuffer()

mkdirSync('public/og', { recursive: true })
const books = JSON.parse(readFileSync('scripts/books.json', 'utf8'))
const categories = { novel: '소설', essay: '에세이·시', humanities: '인문·역사', economics: '경제경영', 'self-help': '자기계발', science: '과학·IT', life: '건강·생활', kids: '어린이·청소년' }
for (const book of books) {
  const png = await renderCard({
    layout: 'article',
    badge: `${categories[book.category]} 서평`,
    title: book.title,
    hook: book.tagline,
    excerpt: book.summary,
    bgImage: await background(book.isbn),
    footerText: 'book.pinda.kr',
    cta: '서평 읽고 할인가 보기 →',
    theme,
    fontFiles,
  })
  writeFileSync(`public/og/${book.isbn}.jpg`, await toJpeg(png))
  console.log(book.isbn, book.title)
}
const fallback = await renderCard({
  layout: 'article',
  badge: '베스트셀러 서평',
  title: '지금 잘 팔리는 책, 사기 전에 읽어 보는 서평',
  hook: '누가 어떤 상황에서 읽으면 좋은지 먼저 보고 고르세요.',
  excerpt: '서평과 읽을 상황, 기대할 점을 정리하고 할인 구매 링크를 모았습니다.',
  bgImage: dataUrl(await sharp('public/photos/hero.webp').resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 72 }).toBuffer()),
  footerText: 'book.pinda.kr',
  cta: '서평 보러 가기 →',
  theme,
  fontFiles,
})
writeFileSync('public/og-default.png', fallback)
