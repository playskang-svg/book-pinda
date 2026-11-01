import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import React from 'react'

import { SiteHeader } from '@/components/SiteHeader'
import { getClient, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/payload'

import './styles.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: [
    '북핀다',
    '베스트셀러 순위',
    '베스트셀러 서평',
    '책 추천',
    '도서 추천',
    '상황별 책 추천',
    '인생 책 추천',
    '2026 베스트셀러',
    '수험서 비교',
    '자격증 수험서 추천',
    '컴활 1급 교재 추천',
    '정보처리기사 교재 비교',
    '한국사 기본서',
    '자기계발서 추천',
    '경제경영 베스트셀러',
    '소설 베스트셀러',
    '도서 서평 요약',
    '온라인 서점 할인',
    '예스24 할인',
  ],
  applicationName: SITE_NAME,
  authors: [{ name: '북핀다' }],
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  // Prices must not turn into phone links on mobile browsers.
  formatDetection: { telephone: false },
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  openGraph: {
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', images: ['/og-default.png'] },
  alternates: {
    types: { 'application/rss+xml': '/rss.xml' },
  },
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

// Menus live in D1, which is empty during the build.
export const dynamic = 'force-dynamic'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getClient()
  const nav = await payload.findGlobal({ slug: 'navigation' })

  return (
    <html lang="ko">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@700&display=swap" rel="stylesheet" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  '@id': 'https://book.pinda.kr/#website',
                  url: 'https://book.pinda.kr',
                  name: '북핀다',
                  description: '베스트셀러 서평 및 상황별 맞춤 도서 추천과 할인 혜택 안내',
                  inLanguage: 'ko-KR',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                      '@type': 'EntryPoint',
                      urlTemplate: 'https://book.pinda.kr/search?q={search_term_string}',
                    },
                    'query-input': 'required name=search_term_string',
                  },
                },
                {
                  '@type': 'Organization',
                  '@id': 'https://book.pinda.kr/#organization',
                  name: '북핀다',
                  url: 'https://book.pinda.kr',
                  logo: 'https://book.pinda.kr/og-default.png',
                },
              ],
            }),
          }}
        />
      </head>
      <body>
        <a className="skip" href="#main">
          본문 바로가기
        </a>
        <SiteHeader items={nav.header ?? []} siteName={SITE_NAME} />
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="frame">
            <div className="site-footer__row">
              <strong>{SITE_NAME}</strong>
              <nav aria-label="하단 메뉴" className="site-footer__nav">
                {nav.footer?.map((item) => (
                  <Link href={item.url} key={item.id ?? item.url}>
                    {item.label}
                  </Link>
                ))}
              </nav>
              <span>© {new Date().getFullYear()} book.pinda.kr</span>
            </div>
            <p className="site-footer__note">
              공개 자료를 바탕으로 서평을 정리하는 개인 운영 정보 사이트입니다. 각 서점과 무관하며, 구매 버튼은 제휴 링크로 일정액의
              수수료를 받을 수 있습니다. 결제 전에는 서점 화면의 최신 가격을 확인해 주세요.
            </p>
          </div>
        </footer>
        {GA_ID ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  )
}
