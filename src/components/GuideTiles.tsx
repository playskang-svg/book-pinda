import Link from 'next/link'

import { GUIDE_GROUPS } from '@/collections/Guides'
import type { Guide } from '@/payload-types'

// Grouped chip links: readers start from who they are or who the book is for.
export function GuideTiles({ guides }: { guides: Guide[] }) {
  return (
    <div className="guide-groups">
      {GUIDE_GROUPS.map((group) => {
        const own = guides.filter((guide) => guide.group === group.value)
        if (!own.length) return null
        return (
          <div className="guide-group" key={group.value}>
            <h3>{group.label}</h3>
            <ul>
              {own.map((guide) => (
                <li key={guide.id}>
                  <Link href={`/guide/${guide.slug}`}>{guide.chip}</Link>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
