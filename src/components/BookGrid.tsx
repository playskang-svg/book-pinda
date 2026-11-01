import Link from 'next/link'

import { StoreButtons } from '@/components/StoreButtons'
import { bookPath, discountPercent, formatWon, rankOf } from '@/lib/books'
import type { Book } from '@/payload-types'

export function BookGrid({ books, showRank = true }: { books: Book[]; showRank?: boolean }) {
  if (books.length === 0) return <p>아직 올라온 책이 없습니다.</p>
  return (
    <ul className="book-grid">
      {books.map((book) => {
        const rank = showRank ? rankOf(book) : null
        return (
          <li key={book.id}>
            <Link className="book-card" href={bookPath(book)}>
              <span className="book-card__cover">
                {rank ? <em className="rank">{rank}</em> : null}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={`${book.title} 표지`} height={330} loading="lazy" src={book.coverUrl} width={230} />
              </span>
              <strong>{book.title}</strong>
              <small>{book.author}</small>
            </Link>
            <p className="book-card__price">
              <em>{discountPercent(book)}%</em> <strong>{formatWon(book.salePrice)}</strong>{' '}
              <s>{formatWon(book.listPrice)}</s>
            </p>
            <StoreButtons book={book} compact />
          </li>
        )
      })}
    </ul>
  )
}
