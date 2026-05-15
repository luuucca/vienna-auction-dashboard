import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight, RefreshCw, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'
import { ButtonLink, Button } from '../components/ui/Button'

/**
 * "Can I buy property in Vienna?" — 7-question funnel that ends with a
 * tiered result + lead-capture handoff. Built to be a top-funnel hook
 * for social traffic.
 */

// ─── Question schema ────────────────────────────────────────────────────────
interface Choice {
  label: string
  value: string
  /** Points contribute to the "buy-readiness" score. Higher = greener. */
  score: number
}
interface Question {
  id: string
  prompt: string
  helper?: string
  choices: Choice[]
}

const QUESTIONS: Question[] = [
  {
    id: 'residency',
    prompt: '您目前的居留状态？',
    helper: '这是影响购房资格的最关键因素。',
    choices: [
      { label: '奥地利 / EU 公民',                value: 'eu',          score: 20 },
      { label: '奥地利长期居留 (NL / Daueraufenthalt-EU)', value: 'permanent', score: 18 },
      { label: '红白红卡 / 工作签 / 学生签',       value: 'rwr',         score: 10 },
      { label: '目前在中国 / 无奥地利身份',         value: 'china',       score: 4  },
    ],
  },
  {
    id: 'purpose',
    prompt: '您计划买房的目的？',
    choices: [
      { label: '自住',          value: 'self',       score: 12 },
      { label: '出租投资',       value: 'rental',     score: 10 },
      { label: '度假房 / 第二居所', value: 'vacation', score: 6  },
      { label: '长期持有 / 资产配置', value: 'hold',  score: 9  },
    ],
  },
  {
    id: 'budget',
    prompt: '您的预算？',
    helper: '维也纳中位数 60-80㎡ 公寓约 €300-450K。',
    choices: [
      { label: '< €300K',           value: 'low',     score: 8  },
      { label: '€300K – €500K',     value: 'mid',     score: 12 },
      { label: '€500K – €1M',       value: 'high',    score: 14 },
      { label: '> €1M 或暂未确定',   value: 'flex',    score: 10 },
    ],
  },
  {
    id: 'finance',
    prompt: '您计划在奥地利贷款吗？',
    choices: [
      { label: '是，需要本地贷款',      value: 'yes',      score: 8  },
      { label: '否，全款支付',         value: 'no',       score: 14 },
      { label: '不确定，想先了解',      value: 'unsure',   score: 10 },
    ],
  },
  {
    id: 'district',
    prompt: '您计划买在维也纳哪个区？',
    helper: '不同区有不同的非 EU 买家审批政策。',
    choices: [
      { label: '1–9 区（市中心 / Innere Bezirke）',    value: 'inner', score: 12 },
      { label: '10–17 区（核心居住区）',                value: 'mid',   score: 13 },
      { label: '18–19 区（高端区域 Döbling / Währing）', value: 'lux',   score: 12 },
      { label: '20–23 区（外围 / Donaustadt 等）',     value: 'outer', score: 11 },
      { label: '还在了解，全部考虑',                   value: 'any',   score: 10 },
    ],
  },
  {
    id: 'address',
    prompt: '您是否已经在奥地利有居所 / 注册地址？',
    choices: [
      { label: '有，已 Anmeldung',           value: 'yes',      score: 12 },
      { label: '没有，但有 EU 身份',          value: 'eu',       score: 10 },
      { label: '没有，计划购房后再处理',       value: 'after',    score: 6  },
    ],
  },
  {
    id: 'timeline',
    prompt: '您计划多久内出手？',
    choices: [
      { label: '1–3 个月内',     value: 'q',       score: 14 },
      { label: '3–6 个月',       value: 'half',    score: 12 },
      { label: '6–12 个月',      value: 'year',    score: 10 },
      { label: '还在观望了解',    value: 'browse',  score: 6  },
    ],
  },
]

// Tier thresholds (max possible ≈ 92 points)
function getTier(score: number, residency: string): 'green' | 'yellow' | 'red' {
  if (residency === 'china') return 'red'
  if (residency === 'rwr' && score < 65) return 'yellow'
  if (score >= 75) return 'green'
  if (score >= 55) return 'yellow'
  return 'red'
}

const TIER_META = {
  green:  { color: '#4ade80', icon: <CheckCircle2 size={20} strokeWidth={1.5} />, title: '可以直接进入',  caption: '您的条件非常成熟，可以立即开始看房' },
  yellow: { color: '#d4af37', icon: <AlertTriangle size={20} strokeWidth={1.5} />, title: '需要前期规划',  caption: '您有一些条件需要先处理，但完全可以买房' },
  red:    { color: '#f87171', icon: <AlertCircle   size={20} strokeWidth={1.5} />, title: '建议先做铺垫',  caption: '当前条件下需要更多前置准备工作' },
} as const

function buildReasoning(answers: Record<string, string>, tier: 'green' | 'yellow' | 'red'): string[] {
  const reasons: string[] = []

  // Residency
  if (answers.residency === 'eu')        reasons.push('您拥有 EU 居留身份，全维也纳 23 区都可自由购房，无需额外审批。')
  if (answers.residency === 'permanent') reasons.push('长期居留持有人在大部分区域等同于 EU 公民，购房流程顺畅。')
  if (answers.residency === 'rwr')       reasons.push('非 EU 签证持有人需通过 Ausländergrundverkehrsgesetz 审批，不同区域差异较大。')
  if (answers.residency === 'china')     reasons.push('从中国境内直接购买奥地利房产，需特别申请 + 公证授权 + 银行账户。建议先取得居留身份或考虑商业实体购房。')

  // Budget vs purpose
  if (answers.budget === 'low' && answers.purpose === 'self')
    reasons.push('您的预算适合 1-2 区以外的小户型公寓（25-40㎡）或外围老房翻新。')
  if (answers.budget === 'mid')
    reasons.push('您的预算可以在 10-22 区买到不错的 60-80㎡ 公寓，性价比最高。')
  if (answers.budget === 'high' || answers.budget === 'flex')
    reasons.push('您的预算可以考虑 1-9 区市中心或 18-19 区高端区域，选择面广。')

  // Finance
  if (answers.finance === 'yes' && answers.residency !== 'eu' && answers.residency !== 'permanent')
    reasons.push('非 EU 身份贷款条件较严格，通常 LTV 60-70%，建议提前准备 30-40% 首付证明。')
  if (answers.finance === 'no')
    reasons.push('全款购买流程最简单，无需 KIM-V 限制，是大部分外国买家的常见路径。')

  // Address
  if (answers.address === 'after' && (answers.residency === 'china' || answers.residency === 'rwr'))
    reasons.push('建议在购房前先完成 Anmeldung（户籍登记）— 这能简化后续公证和银行流程。')

  // Timeline
  if (answers.timeline === 'q' && tier === 'red')
    reasons.push('1-3 个月内出手对您当前条件较紧迫，建议先把身份 / 资金确认到位。')
  if (answers.timeline === 'q' && tier !== 'red')
    reasons.push('1-3 个月内可以走完看房 → Kaufanbot → 公证 → 过户全流程。')

  return reasons.slice(0, 5)
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const totalSteps = QUESTIONS.length
  const currentQ = QUESTIONS[step]
  const isLast = step === totalSteps - 1

  const score = useMemo(() => {
    return Object.entries(answers).reduce((sum, [qid, val]) => {
      const q = QUESTIONS.find(q => q.id === qid)
      const c = q?.choices.find(c => c.value === val)
      return sum + (c?.score || 0)
    }, 0)
  }, [answers])

  const tier = useMemo(() => getTier(score, answers.residency || ''), [score, answers])
  const reasoning = useMemo(() => buildReasoning(answers, tier), [answers, tier])

  function selectChoice(value: string) {
    setAnswers(a => ({ ...a, [currentQ.id]: value }))
    // Auto-advance after a small delay
    if (!isLast) {
      setTimeout(() => setStep(s => s + 1), 250)
    } else {
      setTimeout(() => setSubmitted(true), 300)
    }
  }

  function restart() {
    setStep(0)
    setAnswers({})
    setSubmitted(false)
  }

  // ─── Results screen ─────────────────────────────────────────────────────
  if (submitted) {
    const meta = TIER_META[tier]
    return (
      <div className="min-h-screen bg-bg-base text-fg-primary pt-16">
        <div className="max-w-prose mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-20">

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-overline text-fg-tertiary uppercase mb-3">您的结果</p>

            {/* Tier badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}40`, color: meta.color }}>
              {meta.icon}
              <span className="font-semibold">{meta.title}</span>
            </div>

            <h1 className="font-serif text-display-lg text-fg-primary mb-3 tracking-tight">
              {tier === 'green' && '可以开始看房了'}
              {tier === 'yellow' && '需要先做几件事'}
              {tier === 'red' && '建议先打基础'}
            </h1>
            <p className="text-body-lg text-fg-secondary mb-10">
              {meta.caption}。基于您的回答，下面是我们针对您情况的具体建议：
            </p>

            {/* Score bar */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-2 text-caption text-fg-tertiary">
                <span>购房准备度</span>
                <span className="tabular">{score} / 92</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(score / 92) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  style={{ background: meta.color }}
                />
              </div>
            </div>

            {/* Reasoning */}
            <div className="mb-10">
              <h2 className="text-heading-md text-fg-primary mb-4">具体分析</h2>
              <ul className="space-y-3">
                {reasoning.map((r, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }}
                    className="flex gap-2.5 text-body text-fg-secondary"
                  >
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ background: meta.color }} />
                    <span>{r}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Next-step CTAs */}
            <div className="rounded-2xl p-6 sm:p-8 bg-bg-elev-1 border border-white/[0.06] mb-6">
              <h3 className="text-heading-md text-fg-primary mb-2">下一步</h3>
              <p className="text-body text-fg-secondary mb-5">
                {tier === 'green' && '您可以立即开始浏览房源，或预约一次免费咨询，我们会基于您的具体需求推荐 3-5 套精准匹配的房子。'}
                {tier === 'yellow' && '建议先和我们做一次 30 分钟的咨询，理清当前条件下的最优购房路径。'}
                {tier === 'red' && '建议先了解购房流程和您身份下的限制，我们可以一对一帮您规划路径。'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <ButtonLink to="/about" variant="primary" size="md" trailingIcon={<ArrowRight size={14} strokeWidth={1.75} />}>
                  联系我们咨询
                </ButtonLink>
                {tier !== 'red' && (
                  <ButtonLink to="/listings" variant="ghost" size="md">
                    浏览精选房源
                  </ButtonLink>
                )}
                <ButtonLink to="/buying-guide" variant="text" size="md">
                  阅读购房指南 →
                </ButtonLink>
              </div>
            </div>

            <button
              onClick={restart}
              className="inline-flex items-center gap-2 text-caption text-fg-tertiary hover:text-gold transition-colors duration-base ease-standard"
            >
              <RefreshCw size={12} strokeWidth={1.5} />
              重新测试
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  // ─── Question screen ────────────────────────────────────────────────────
  const progress = ((step + 1) / totalSteps) * 100

  return (
    <div className="min-h-screen bg-bg-base text-fg-primary pt-16">
      <div className="max-w-prose mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16">

        {/* Header */}
        <div className="mb-10">
          <p className="text-overline text-gold/80 uppercase mb-3">Quiz · 90 秒</p>
          <h1 className="font-serif text-display-lg sm:text-display-xl text-fg-primary mb-2 tracking-tight">
            我能在维也纳买房吗？
          </h1>
          <p className="text-body text-fg-secondary">
            回答 {totalSteps} 个简单问题，我们根据您的情况给出准确判断。
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2 text-caption text-fg-tertiary tabular">
            <span>第 {step + 1} 题 / 共 {totalSteps} 题</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden bg-white/[0.06]">
            <motion.div
              className="h-full bg-gold"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="font-serif text-heading-xl sm:text-display-lg text-fg-primary mb-2 tracking-tight">
              {currentQ.prompt}
            </h2>
            {currentQ.helper && (
              <p className="text-body text-fg-tertiary mb-7">{currentQ.helper}</p>
            )}

            {/* Choices */}
            <div className="space-y-2.5">
              {currentQ.choices.map((c, i) => {
                const selected = answers[currentQ.id] === c.value
                return (
                  <motion.button
                    key={c.value}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    onClick={() => selectChoice(c.value)}
                    className={[
                      'block w-full text-left px-5 py-4 rounded-xl text-body-lg',
                      'transition-[background,border-color,transform] duration-base ease-standard',
                      'active:scale-[0.99]',
                      selected
                        ? 'bg-gold-tint border-2 border-gold text-fg-primary'
                        : 'bg-bg-elev-1 border-2 border-white/[0.06] text-fg-secondary hover:border-white/[0.15] hover:text-fg-primary',
                    ].join(' ')}
                  >
                    {c.label}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Nav */}
        <div className="flex items-center justify-between mt-10">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 text-caption text-fg-secondary hover:text-fg-primary transition-colors duration-base ease-standard disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} strokeWidth={1.5} />
            上一题
          </button>
          {answers[currentQ.id] && !isLast && (
            <button
              onClick={() => setStep(s => Math.min(totalSteps - 1, s + 1))}
              className="inline-flex items-center gap-1.5 text-caption text-gold hover:text-gold-hover transition-colors duration-base ease-standard"
            >
              下一题
              <ChevronRight size={14} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
