import { ShareBar } from '@/components/ShareBar'

// The line a reader would actually send a friend, right above the share buttons that carry it.
export function HookBox({ hook, title, url }: { hook: string; title: string; url: string }) {
  return (
    <aside className="hook-box">
      <p className="hook-box__label">친구에게 이렇게 권해 보세요</p>
      <p className="hook-box__line">“{hook}”</p>
      <ShareBar text={hook} title={title} url={url} />
    </aside>
  )
}
