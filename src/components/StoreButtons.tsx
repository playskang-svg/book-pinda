import type { Book } from '@/payload-types'

// Direct product deep links issued through 3hoursahead, so a tap lands on the book's own page.
export function StoreButtons({
  book,
  compact = false,
}: {
  book: Pick<Book, 'title' | 'kyoboUrl' | 'yes24Url'>
  compact?: boolean
}) {
  const stores = [
    { name: '교보문고', href: book.kyoboUrl },
    { name: '예스24', href: book.yes24Url },
  ].filter((store) => store.href)
  return (
    <div className={compact ? 'store-buttons store-buttons--compact' : 'store-buttons'}>
      {stores.map((store) => (
        <a
          aria-label={`${book.title} ${store.name}에서 할인 구매`}
          className="button button--buy"
          href={store.href ?? undefined}
          key={store.name}
          rel="sponsored nofollow noopener"
          target="_blank"
        >
          {compact ? store.name : `${store.name} 할인구매`}
        </a>
      ))}
    </div>
  )
}
