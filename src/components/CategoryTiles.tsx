import Link from 'next/link'

import type { Book, Category } from '@/payload-types'

// One tile per category with its top covers fanned out, so the shelf reads as books before text.
export function CategoryTiles({ categories, books }: { categories: Category[]; books: Book[] }) {
  return (
    <ul className="category-tiles">
      {categories.map((category) => {
        const own = books.filter((book) => typeof book.category === 'object' && book.category?.id === category.id)
        return (
          <li key={category.id}>
            <Link href={`/category/${category.slug}`}>
              <span aria-hidden="true" className="category-tiles__covers">
                {own.slice(0, 3).map((book) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" height={180} key={book.id} loading="lazy" src={book.coverUrl} width={125} />
                ))}
              </span>
              <strong>{category.title}</strong>
              <small>{own.length}권의 서평</small>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
