import type { Book } from '@/payload-types'

// Direct product deep links issued through 3hoursahead, so a tap lands on the book's own page.
export function StoreButtons({
  book,
  compact = false,
}: {
  book: Pick<Book, 'title' | 'kyoboUrl' | 'yes24Url'> & Partial<Pick<Book, 'coupangUrl'>>
  compact?: boolean
}) {
  const stores = [
    { name: '교보문고', href: book.kyoboUrl },
    { name: '예스24', href: book.yes24Url },
  ].filter((store) => store.href)
  const coupang = book.coupangUrl ? (
    <a
      aria-label={`${book.title} 쿠팡에서 빠른배송으로 받기`}
      className="store-buttons__coupang"
      href={book.coupangUrl}
      rel="sponsored nofollow noopener"
      target="_blank"
    >
      {compact ? '쿠팡 빠른배송' : '쿠팡에서 빠른배송으로 받기'}
    </a>
  ) : null
  if (!stores.length && !coupang) return <small className="store-buttons__pending">구매 링크를 준비하고 있습니다.</small>
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
      {coupang}
    </div>
  )
}
