// Renders share thumbnails into public/og: one per book, guide and exam comparison, plus the site default.
// Drawn with sharp because the snsogg bubble spans the full width and would hide the cover.
// Run: SHARP_PATH=<sharp> node scripts/og.mjs   (expects public/covers and public/photos)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const sharp = createRequire(import.meta.url)(process.env.SHARP_PATH || 'sharp')

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

// Which quote stands for each book, by ISBN tail. Unlisted books use their first quote.
const QUOTE_PICK = { 37635: 2, 31784: 2, 82045: 2, 38826: 2, 59100: 2, 52180: 2, 87679: 2, 80292: 1, 43430: 2, 14166: 2, 40640: 1, 52302: 1, 42560: 1, 11892: 1, 12250: 2, 76506: 2, 85134: 1, 95083: 1, 75680: 2, 87700: 1, 63503: 2, 15656: 2, 16295: 1, 16875: 2, 22398: 2, 28033: 1, 47680: 2, 74403: 1, 81213: 2, 67784: 1, 91672: 2, '04152': 1, 27068: 1, 41555: 1, 69680: 1, '08846': 2, '07820': 1, 39529: 2, 50002: 2, 57191: 1, 28759: 1, 31796: 2, 73690: 1, 75169: 1, 40770: 2, 83796: 1, 10041: 2 }
const quoteOf = (book) => (book.body ?? []).filter((block) => block.quote).map((block) => block.quote.replace(/\s+/g, ' '))[QUOTE_PICK[book.isbn.slice(-5)] ?? 0]

const SERIF = 'Noto Serif KR'
const ACCENT = '#7d2e3a'
const TEXT_X = 500
const TEXT_WIDTH = 640

// The covers sit on a panel of their own colour; the words get a white page, with no button or price, so it reads as a page from the book.
const card = async ({ covers, quote, main, foot }) => {
  const first = readFileSync(`public${covers[0]}`)
  const panel = await sharp(first).resize(440, 630, { fit: 'cover' }).blur(24).modulate({ brightness: 0.8 }).png().toBuffer()
  const single = covers.length === 1
  const layers = [{ input: panel, left: 0, top: 0 }]
  for (const [i, cover] of covers.entries()) {
    const input = await sharp(readFileSync(`public${cover}`)).resize({ height: single ? 480 : 340, width: single ? 340 : 230, fit: 'inside' }).png().toBuffer()
    const { width, height } = await sharp(input).metadata()
    const left = single ? Math.round((440 - width) / 2) : 30 + i * 80
    const top = Math.round((630 - height) / 2) + (single ? 0 : (i % 2) * 24 - 12)
    const shadow = `<svg xmlns="http://www.w3.org/2000/svg" width="${width + 60}" height="${height + 60}"><filter id="s"><feGaussianBlur stdDeviation="12"/></filter><rect x="30" y="36" width="${width}" height="${height}" fill="#000" opacity=".4" filter="url(#s)"/></svg>`
    layers.push({ input: Buffer.from(shadow), left: Math.max(0, left - 30), top: Math.max(0, top - 30) }, { input, left, top })
  }
  const size = main.length <= 30 ? 58 : main.length <= 50 ? 50 : main.length <= 70 ? 44 : main.length <= 95 ? 38 : 34
  const lines = wrap(main, Math.floor(TEXT_WIDTH / (size * 0.88)), 99)
  const lineHeight = size * 1.42
  const footLines = foot.flatMap((f) => wrap(f.text, f.bold ? 24 : 28, f.lines ?? 1).map((text) => ({ ...f, text })))
  const height = (quote ? 74 : 0) + lines.length * lineHeight + 44 + footLines.length * 40
  let y = (630 - height) / 2 + (quote ? 74 : 0) + size
  const parts = []
  if (quote) parts.push(`<text x="${TEXT_X - 6}" y="${y - size + 26}" font-family="${SERIF}" font-size="120" font-weight="700" fill="${ACCENT}">“</text>`)
  for (const line of lines) {
    parts.push(`<text x="${TEXT_X}" y="${y}" font-family="${SERIF}" font-size="${size}" font-weight="600" fill="#1f1a17">${esc(line)}</text>`)
    y += lineHeight
  }
  y += 44 - lineHeight + 34
  for (const f of footLines) {
    parts.push(`<text x="${TEXT_X}" y="${y}" font-family="Malgun Gothic" font-size="${f.bold ? 28 : 25}" font-weight="${f.bold ? 700 : 400}" fill="${f.bold ? ACCENT : '#6b5d4f'}">${esc(f.text)}</text>`)
    y += 40
  }
  if (lines.length > 7) console.log('long card', main.slice(0, 30), lines.length)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">${parts.join('')}</svg>`
  return sharp({ create: { width: 1200, height: 630, channels: 3, background: '#ffffff' } })
    .composite([...layers, { input: Buffer.from(svg), left: 0, top: 0 }])
    .jpeg({ quality: 82 })
    .toBuffer()
}

mkdirSync('public/og', { recursive: true })
const books = JSON.parse(readFileSync('scripts/books.json', 'utf8'))
const coverOf = Object.fromEntries(books.map((b) => [b.isbn, b.coverUrl]))
for (const book of books) {
  const quote = quoteOf(book)
  const jpg = await card({
    covers: [book.coverUrl],
    quote: Boolean(quote),
    main: quote ?? book.tagline,
    foot: [{ text: `《${book.title}》`, bold: true, lines: 2 }, { text: book.author }, ...(quote ? [{ text: book.tagline }] : [])],
  })
  writeFileSync(`public/og/${book.isbn}.jpg`, jpg)
}
for (const guide of JSON.parse(readFileSync('scripts/guides.json', 'utf8'))) {
  const jpg = await card({
    covers: guide.picks.slice(0, 3).map((pick) => coverOf[pick.isbn]),
    main: guide.snsHook,
    foot: [{ text: guide.title, bold: true, lines: 2 }],
  })
  writeFileSync(`public/og/guide-${guide.slug}.jpg`, jpg)
}
for (const exam of JSON.parse(readFileSync('scripts/exams.json', 'utf8'))) {
  const jpg = await card({
    covers: exam.books.slice(0, 3).map((book) => book.coverUrl),
    main: exam.snsHook,
    foot: [{ text: `${exam.exam} 수험서 비교`, bold: true }],
  })
  writeFileSync(`public/og/exam-${exam.slug}.jpg`, jpg)
}

const fallback = await card({
  covers: books.slice(0, 3).map((book) => book.coverUrl),
  main: '책값보다 아까운 건, 안 맞는 책에 쓴 시간입니다',
  foot: [{ text: '읽고 나면 내 하루가 어떻게 달라지는지', bold: true }],
})
writeFileSync('public/og-default.png', await sharp(fallback).png({ palette: true, quality: 85 }).toBuffer())
