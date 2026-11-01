// Renders share thumbnails into public/og: one per book, guide and exam comparison, plus the site default via the snsogg skill.
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

// One cover stands alone; several fan out, later ones on top.
const card = async ({ covers, badge, hook, cta }) => {
  const first = readFileSync(`public${covers[0]}`)
  const bg = await sharp(first).resize(1200, 630, { fit: 'cover' }).blur(28).modulate({ brightness: 0.42 }).png().toBuffer()
  const single = covers.length === 1
  const layers = []
  for (const [i, cover] of covers.entries()) {
    const input = await sharp(readFileSync(`public${cover}`)).resize({ height: single ? 530 : 400, width: single ? 400 : 280, fit: 'inside' }).png().toBuffer()
    const { width, height } = await sharp(input).metadata()
    const left = single ? 60 + Math.round((400 - width) / 2) : 30 + i * 90
    layers.push({ input, left, top: Math.round((630 - height) / 2) + (single ? 0 : (i % 2) * 24 - 12) })
  }
  const size = 54
  const lines = wrap(hook, 13, 4)
  const top = 290 - ((lines.length - 1) * size * 1.3) / 2
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" font-family="Malgun Gothic">
    <text x="500" y="${top - 84}" font-size="30" font-weight="700" fill="#f2c9a1">${esc(badge)}</text>
    ${lines.map((line, i) => `<text x="500" y="${top + i * size * 1.3}" font-size="${size}" font-weight="700" fill="#fff">${esc(line)}</text>`).join('')}
    <rect x="500" y="500" width="400" height="76" rx="38" fill="#c8441a"/>
    <text x="700" y="550" font-size="32" font-weight="700" fill="#fff" text-anchor="middle">${esc(cta)}</text>
    <text x="1140" y="550" font-size="24" fill="#dccfbe" text-anchor="end">book.pinda.kr</text>
  </svg>`
  return sharp(bg)
    .composite([...layers, { input: Buffer.from(svg), left: 0, top: 0 }])
    .jpeg({ quality: 80 })
    .toBuffer()
}

mkdirSync('public/og', { recursive: true })
const books = JSON.parse(readFileSync('scripts/books.json', 'utf8'))
const coverOf = Object.fromEntries(books.map((b) => [b.isbn, b.coverUrl]))
for (const book of books) {
  const jpg = await card({
    covers: [book.coverUrl],
    badge: `${categories[book.category]} 서평`,
    hook: book.snsHook || book.tagline,
    cta: '서평 읽고 할인가 보기 →',
  })
  writeFileSync(`public/og/${book.isbn}.jpg`, jpg)
}
for (const guide of JSON.parse(readFileSync('scripts/guides.json', 'utf8'))) {
  const jpg = await card({
    covers: guide.picks.slice(0, 3).map((pick) => coverOf[pick.isbn]),
    badge: `${guide.chip} 추천`,
    hook: guide.snsHook,
    cta: '추천 책 바로 보기 →',
  })
  writeFileSync(`public/og/guide-${guide.slug}.jpg`, jpg)
}
for (const exam of JSON.parse(readFileSync('scripts/exams.json', 'utf8'))) {
  const jpg = await card({
    covers: exam.books.slice(0, 3).map((book) => book.coverUrl),
    badge: `${exam.exam} 수험서 비교`,
    hook: exam.snsHook,
    cta: '비교표 바로 보기 →',
  })
  writeFileSync(`public/og/exam-${exam.slug}.jpg`, jpg)
}

const photo = await sharp('public/photos/hero.webp').resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 72 }).toBuffer()
const fallback = await renderCard({
  layout: 'article',
  badge: '베스트셀러 서평',
  title: '책값보다 아까운 건, 안 맞는 책에 쓴 시간입니다',
  hook: '책값보다 아까운 건, 안 맞는 책에 쓴 시간입니다',
  excerpt: '읽고 나면 내 하루가 어떻게 달라지는지 먼저 보고 고르세요.',
  bgImage: `data:image/jpeg;base64,${photo.toString('base64')}`,
  footerText: 'book.pinda.kr',
  cta: '내 상황에 맞는 책 찾기 →',
  theme: { brand: '#ffffff', accent: '#f2c9a1', cta: '#c8441a' },
  fontFiles: { 400: 'C:/Windows/Fonts/malgun.ttf', 700: 'C:/Windows/Fonts/malgunbd.ttf' },
})
writeFileSync('public/og-default.png', await sharp(fallback).png({ palette: true, quality: 85 }).toBuffer())
