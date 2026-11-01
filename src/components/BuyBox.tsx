import { StoreButtons } from '@/components/StoreButtons'
import { discountPercent, formatDate, formatWon, savings } from '@/lib/books'
import type { Book } from '@/payload-types'

export function BuyBox({ book, title }: { book: Book; title?: string }) {
  return (
    <aside className="buy-box">
      {title ? <strong className="buy-box__title">{title}</strong> : null}
      <p className="buy-box__price">
        <em>{discountPercent(book)}%</em> <strong>{formatWon(book.salePrice)}</strong> <s>{formatWon(book.listPrice)}</s>
      </p>
      <p className="buy-box__loss">
        정가로 사면 <strong>{formatWon(savings(book))}</strong>을 그냥 더 내는 셈입니다.
        {book.points ? ` (할인 ${formatWon(book.listPrice - book.salePrice)} + 적립 ${formatWon(book.points)})` : ''}
      </p>
      <StoreButtons book={book} />
      <small>{formatDate(book.verifiedAt)} 기준 가격입니다. 결제 전에 서점 화면에서 확인해 주세요.</small>
    </aside>
  )
}
