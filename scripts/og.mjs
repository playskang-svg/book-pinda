// Renders share thumbnails: one per book (public/og/<isbn>.jpg) plus the site default via the snsogg skill.
// Book cards are drawn with sharp because the snsogg bubble spans the full width and would hide the cover.
// Run: SHARP_PATH=<sharp> node scripts/og.mjs   (expects public/covers and public/photos)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const sharp = createRequire(import.meta.url)(process.env.SHARP_PATH || 'sharp')
const SKILL = 'C:/Window_DEV/.claude/skills/snsogg/render.mjs'
const { renderCard } = await import(pathToFileURL(SKILL).href)

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Breaks at spaces only, so words never split across lines.
const wrap = (text, perLine, maxLines) => {
  const lines = ['']
  for (const word of text.split(' ')) {
    const last = lines[lines.length - 1]
    if (last && last.length + word.length + 1 > perLine) lines.push(word)
    else lines[lines.length - 1] = last ? `${last} ${word}` : word
  }
  return lines.slice(0, maxLines)
}

const categories = { novel: '소설', essay: '에세이·시', humanities: '인문·역사', economics: '경제경영', 'self-help': '자기계발', science: '과학·IT', life: '건강·생활', kids: '어린이·청소년' }

const bookCard = async (book) => {
  const cover = readFileSync(`public/covers/${book.isbn}.webp`)
  const bg = await sharp(cover).resize(1200, 630, { fit: 'cover' }).blur(28).modulate({ brightness: 0.42 }).png().toBuffer()
  const front = await sharp(cover).resize({ height: 530, width: 400, fit: 'inside' }).png().toBuffer()
  const { width, height } = await sharp(front).metadata()
  const size = 62
  const lines = wrap(book.tagline, 11, 4)
  const top = 315 - ((lines.length - 1) * size * 1.28) / 2
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" font-family="Malgun Gothic">
    <text x="500" y="${top - 92}" font-size="30" font-weight="700" fill="#f2c9a1">${esc(categories[book.category])} 서평</text>
    ${lines.map((line, i) => `<text x="500" y="${top + i * size * 1.28}" font-size="${size}" font-weight="700" fill="#fff">${esc(line)}</text>`).join('')}
    <rect x="500" y="500" width="400" height="76" rx="38" fill="#c8441a"/>
    <text x="700" y="550" font-size="32" font-weight="700" fill="#fff" text-anchor="middle">서평 읽고 할인가 보기 →</text>
    <text x="1140" y="550" font-size="24" fill="#dccfbe" text-anchor="end">book.pinda.kr</text>
  </svg>`
  return sharp(bg)
    .composite([
      { input: front, left: 60 + Math.round((400 - width) / 2), top: Math.round((630 - height) / 2) },
      { input: Buffer.from(svg), left: 0, top: 0 },
    ])
    .jpeg({ quality: 80 })
    .toBuffer()
}

mkdirSync('public/og', { recursive: true })
const books = JSON.parse(readFileSync('scripts/books.json', 'utf8'))
for (const book of books) {
  writeFileSync(`public/og/${book.isbn}.jpg`, await bookCard(book))
  console.log(book.isbn, book.title)
}

const photo = await sharp('public/photos/hero.webp').resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 72 }).toBuffer()
const fallback = await renderCard({
  layout: 'article',
  badge: '베스트셀러 서평',
  title: '지금 잘 팔리는 책, 사기 전에 읽어 보는 서평',
  hook: '지금 잘 팔리는 책, 사기 전에 먼저 읽어 보세요',
  excerpt: '서평과 읽을 상황, 기대할 점을 정리하고 할인 구매 링크를 모았습니다.',
  bgImage: `data:image/jpeg;base64,${photo.toString('base64')}`,
  footerText: 'book.pinda.kr',
  cta: '서평 보러 가기 →',
  theme: { brand: '#ffffff', accent: '#f2c9a1', cta: '#c8441a' },
  fontFiles: { 400: 'C:/Windows/Fonts/malgun.ttf', 700: 'C:/Windows/Fonts/malgunbd.ttf' },
})
writeFileSync('public/og-default.png', await sharp(fallback).png({ palette: true, quality: 85 }).toBuffer())
