import Link from 'next/link'

import { bookPath, categoryOf } from '@/lib/books'
import type { Book } from '@/payload-types'

export function ReviewList({ books }: { books: Book[] }) {
  if (books.length === 0) return <p>아직 올라온 서평이 없습니다.</p>
  return (
    <ul className="review-list">
      {books.map((book) => (
        <li key={book.id}>
          <Link href={bookPath(book)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" height={150} loading="lazy" src={book.coverUrl} width={104} />
            <span>
              <small>{categoryOf(book)?.title}</small>
              <strong>{book.title}</strong>
              <em>{book.tagline}</em>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
