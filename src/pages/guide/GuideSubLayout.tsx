import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ChevronLeft, ArrowRight } from 'lucide-react'
import { ButtonLink } from '../../components/ui/Button'

/**
 * Shared layout for /buying-guide/* sub-pages.
 *
 * Each sub-page targets a single long-tail Chinese query — the goal is
 * SEO breadth across the buying-guide topic cluster. The page sets its
 * own document.title, meta description, and FAQPage JSON-LD on mount,
 * cleaning up on unmount.
 */

export interface GuideSubProps {
  metaTitle: string
  metaDescription: string
  faqSchema: { question: string; answer: string }[]
  /** Path of THIS page — used as the schema id and for unique faq element id */
  pageId: string
  hero: {
    kicker: string
    title: string
    subtitle: string
    readTimeMin: number
  }
  toc: { id: string; label: string }[]
  children: React.ReactNode
}

export function GuideSubLayout(props: GuideSubProps) {
  const [activeId, setActiveId] = useState<string>(props.toc[0]?.id ?? '')

  // Inject SEO: title, description, FAQ schema
  useEffect(() => {
    const orig = document.title
    document.title = props.metaTitle

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
      if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el) }
      el.content = content
    }
    setMeta('description', props.metaDescription)

    const schemaId = `guide-sub-faq-${props.pageId}`
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: props.faqSchema.map(f => ({
        '@type': 'Question', name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    }
    let el = document.getElementById(schemaId) as HTMLScriptElement | null
    if (!el) {
      el = document.createElement('script')
      el.type = 'application/ld+json'
      el.id = schemaId
      document.head.appendChild(el)
    }
    el.text = JSON.stringify(schema)

    return () => {
      document.title = orig
      el?.remove()
    }
  }, [props.metaTitle, props.metaDescription, props.faqSchema, props.pageId])

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    const sections = props.toc.map(t => document.getElementById(t.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) {
          const top = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b))
          setActiveId(top.target.id)
        }
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    sections.forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [props.toc])

  return (
    <div className="min-h-screen bg-bg-base text-fg-primary pt-16">

      {/* Hero */}
      <header className="px-4 sm:px-6 lg:px-10 pt-14 pb-10 border-b border-white/[0.06]">
        <div className="max-w-content mx-auto">
          <Link
            to="/buying-guide"
            className="inline-flex items-center gap-1.5 text-caption text-fg-tertiary hover:text-gold transition-colors duration-base ease-standard mb-6"
          >
            <ChevronLeft size={12} strokeWidth={1.5} />
            返回购房指南
          </Link>
          <p className="text-overline text-gold/80 uppercase mb-3">{props.hero.kicker}</p>
          <h1 className="font-serif text-display-lg sm:text-display-xl lg:text-display-2xl text-fg-primary mb-4 tracking-tight">
            {props.hero.title}
          </h1>
          <p className="text-body-lg text-fg-secondary max-w-prose mb-5">
            {props.hero.subtitle}
          </p>
          <p className="inline-flex items-center gap-1.5 text-caption text-fg-tertiary">
            <Clock size={12} strokeWidth={1.5} />
            阅读约 {props.hero.readTimeMin} 分钟
          </p>
        </div>
      </header>

      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16 grid lg:grid-cols-4 gap-10 lg:gap-16">

        {/* Sticky TOC */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <p className="text-overline text-fg-tertiary uppercase mb-4 hidden lg:block">目录</p>
            <nav className="flex lg:flex-col gap-x-3 gap-y-1 overflow-x-auto pb-2 lg:pb-0 lg:overflow-visible">
              {props.toc.map(t => (
                <a
                  key={t.id}
                  href={`#${t.id}`}
                  className={[
                    'flex-shrink-0 text-caption py-1.5 transition-colors duration-base ease-standard',
                    'lg:border-l-2 lg:pl-4',
                    activeId === t.id
                      ? 'text-gold lg:border-gold'
                      : 'text-fg-secondary lg:border-transparent hover:text-fg-primary',
                  ].join(' ')}
                >
                  {t.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Body */}
        <article className="lg:col-span-3 prose-content max-w-prose text-body-lg text-fg-secondary">
          {props.children}

          {/* CTA — sits at end of every sub-page */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 rounded-2xl p-7 sm:p-8 bg-bg-elev-1 border border-white/[0.06]"
          >
            <h3 className="font-serif text-heading-xl text-fg-primary mb-3">
              还有具体问题？
            </h3>
            <p className="text-body text-fg-secondary mb-5">
              我们可以基于您的身份、预算、目标做一对一规划。先做一次 90 秒的<Link to="/quiz" className="text-gold hover:underline underline-offset-4">资格测试</Link>，或直接联系。
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <ButtonLink to="/quiz" variant="primary" size="md" trailingIcon={<ArrowRight size={14} strokeWidth={1.75} />}>
                做一次资格测试
              </ButtonLink>
              <ButtonLink to="/about" variant="ghost" size="md">
                联系我们
              </ButtonLink>
            </div>
          </motion.div>
        </article>
      </div>
    </div>
  )
}

// ─── Section block — used inside <GuideSubLayout> children ─────────────────
export function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mb-14 scroll-mt-24"
    >
      <h2 className="font-serif text-heading-xl sm:text-display-lg text-fg-primary mb-5 tracking-tight">
        {title}
      </h2>
      <div className="space-y-4 leading-relaxed">
        {children}
      </div>
    </motion.section>
  )
}
