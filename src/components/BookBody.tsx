import type React from 'react'

type Mood = 'calm' | 'point' | 'wow' | 'laugh'

// The book-cafe article: plain reading blocks plus the two hosts talking and small visual aids.
export type BodyBlock =
  | { h2: string }
  | { h3: string }
  | { p: string }
  | { ul: string[] }
  | { quote: string; cite?: string }
  | { chat: { who: 'host' | 'guest'; mood?: Mood; say: string }[] }
  | { say: string }
  | { scene: { title?: string; text: string; image?: string } }
  | { flow: { label: string; text: string }[] }
  | { table: { head: string[]; rows: string[][] } }
  | { compare: { title: string; items: string[] }[] }
  | { cards: { name: string; text: string }[] }
  | { big: { num: string; text: string } }
  | { img: { src: string; alt: string; caption: string } }

export const HOSTS = {
  host: { name: '핀이', role: '책방지기' },
  guest: { name: '지우', role: '단골' },
}

const Avatar = ({ who, mood = 'calm' }: { who: 'host' | 'guest'; mood?: Mood }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img alt={`${HOSTS[who].role} ${HOSTS[who].name}`} className="talk__face" height={84} loading="lazy" src={`/characters/${who}-${mood}.webp`} width={84} />
)

const renderBlock = (block: BodyBlock, key: number, anchor: number): React.ReactNode => {
  if ('h2' in block) return <h2 id={`s${anchor}`} key={key}>{block.h2}</h2>
  if ('h3' in block) return <h3 key={key}>{block.h3}</h3>
  if ('p' in block) return <p key={key}>{block.p}</p>
  if ('ul' in block) {
    return (
      <ul key={key}>
        {block.ul.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )
  }
  if ('quote' in block) {
    return (
      <blockquote key={key}>
        {block.quote}
        {block.cite ? <cite>{block.cite}</cite> : null}
      </blockquote>
    )
  }
  if ('chat' in block) {
    return (
      <div className="talk" key={key}>
        {block.chat.map((line, index) => (
          <div className={`talk__line talk__line--${line.who}`} key={index}>
            <Avatar mood={line.mood} who={line.who} />
            <div className="talk__bubble">
              <small>{HOSTS[line.who].name}</small>
              <p>{line.say}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }
  if ('say' in block) {
    return (
      <div className="talk talk--aside" key={key}>
        <div className="talk__line talk__line--host">
          <Avatar mood="point" who="host" />
          <div className="talk__bubble">
            <small>{HOSTS.host.name}의 한마디</small>
            <p>{block.say}</p>
          </div>
        </div>
      </div>
    )
  }
  if ('scene' in block) {
    return (
      <figure className={block.scene.image ? 'scene scene--image' : 'scene'} key={key}>
        {block.scene.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" height={640} loading="lazy" src={block.scene.image} width={960} />
        ) : null}
        <figcaption>
          <strong>{block.scene.title ?? '잠깐, 이 장면을 그려 보세요'}</strong>
          <span>{block.scene.text}</span>
        </figcaption>
      </figure>
    )
  }
  if ('flow' in block) {
    return (
      <ol className="flow" key={key}>
        {block.flow.map((step) => (
          <li key={step.label}>
            <strong>{step.label}</strong>
            <span>{step.text}</span>
          </li>
        ))}
      </ol>
    )
  }
  if ('table' in block) {
    return (
      <div className="viz-table" key={key}>
        <table>
          <thead>
            <tr>
              {block.table.head.map((cell) => (
                <th key={cell}>{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.table.rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  if ('compare' in block) {
    return (
      <div className="compare" key={key}>
        {block.compare.map((side) => (
          <section key={side.title}>
            <strong>{side.title}</strong>
            <ul>
              {side.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    )
  }
  if ('cards' in block) {
    return (
      <ul className="people" key={key}>
        {block.cards.map((card) => (
          <li key={card.name}>
            <strong>{card.name}</strong>
            <span>{card.text}</span>
          </li>
        ))}
      </ul>
    )
  }
  if ('big' in block) {
    return (
      <p className="big-number" key={key}>
        <strong>{block.big.num}</strong>
        <span>{block.big.text}</span>
      </p>
    )
  }
  if ('img' in block) {
    return (
      <figure className="book-image" key={key}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={block.img.alt} loading="lazy" src={block.img.src} />
        <figcaption>▲ {block.img.caption}</figcaption>
      </figure>
    )
  }
  return null
}

export const headingsOf = (blocks: BodyBlock[]) => blocks.flatMap((block) => ('h2' in block ? [block.h2] : []))

const textOf = (block: BodyBlock): string => {
  if ('h2' in block) return block.h2
  if ('h3' in block) return block.h3
  if ('p' in block) return block.p
  if ('ul' in block) return block.ul.join('')
  if ('quote' in block) return block.quote
  if ('chat' in block) return block.chat.map((line) => line.say).join('')
  if ('say' in block) return block.say
  if ('scene' in block) return block.scene.text
  if ('flow' in block) return block.flow.map((step) => step.label + step.text).join('')
  if ('table' in block) return block.table.rows.flat().join('')
  if ('compare' in block) return block.compare.flatMap((side) => side.items).join('')
  if ('cards' in block) return block.cards.map((card) => card.name + card.text).join('')
  if ('big' in block) return block.big.num + block.big.text
  return ''
}

export const minutesOf = (blocks: BodyBlock[]) => Math.max(1, Math.round(blocks.map(textOf).join('').length / 500))

// `midway` lands before the third heading, once the reader has the facts.
export function BookBody({ blocks, midway }: { blocks: BodyBlock[]; midway?: React.ReactNode }) {
  let anchor = 0
  return (
    <div className="prose book-body">
      {blocks.flatMap((block, index) => {
        if ('h2' in block) anchor += 1
        const node = renderBlock(block, index, anchor)
        return 'h2' in block && anchor === 3 && midway ? [<div key="midway">{midway}</div>, node] : [node]
      })}
    </div>
  )
}
