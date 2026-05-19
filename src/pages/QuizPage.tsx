import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight, RefreshCw, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'
import { ButtonLink } from '../components/ui/Button'

/**
 * "Can I buy property in Vienna?" — 6-question eligibility funnel.
 *
 * Focuses on the LEGAL gates that decide whether a Chinese-speaking
 * buyer can actually purchase in Vienna, not their budget or taste:
 *   1. Citizenship                    (the master switch)
 *   2. Residence permit               (modifies citizenship's effect)
 *   3. Anmeldung registration         (affects bank + notary flow)
 *   4. Existing Austrian property     (KIM-V + AGVG implications)
 *   5. Purpose                        (self / rental / vacation / hold)
 *   6. Mortgage need                  (financing pathway)
 *
 * Result is one of three tiers:
 *   - green  : full eligibility, can proceed normally
 *   - yellow : some restrictions; needs planning
 *   - red    : direct purchase blocked; we offer compliant
 *              alternatives (GmbH ownership, residence-application
 *              pathway, etc.) → strong contact CTA.
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
    id: 'citizenship',
    prompt: '您的身份？',
    helper: '这是影响购房资格的最关键因素。',
    choices: [
      { label: '奥地利公民',                       value: 'austrian', score: 25 },
      { label: 'EU 公民',                          value: 'eu',       score: 22 },
      { label: '红白红卡 / 工作签 / 学生签（非 EU）', value: 'rwr',      score: 12 },
      { label: '无奥地利身份，纯境外',                value: 'foreign',  score: 3  },
    ],
  },
  {
    id: 'residence',
    prompt: '您的居留许可状态？',
    helper: '永久居留（NL / Daueraufenthalt-EU）在购房上等同于 EU 公民。',
    choices: [
      { label: 'NL / Daueraufenthalt-EU 长期居留', value: 'permanent', score: 18 },
      { label: '临时居留（红白红卡 / 工作 / 学生）', value: 'temporary', score: 10 },
      { label: '无居留许可',                        value: 'none',      score: 2  },
    ],
  },
  {
    id: 'anmeldung',
    prompt: '您在奥地利的登记地址（Anmeldung）？',
    helper: '登记地址影响开户、贷款审批与公证流程。',
    choices: [
      { label: '维也纳有',         value: 'wien',        score: 15 },
      { label: '其他州有',         value: 'other_state', score: 10 },
      { label: '没有',             value: 'none',        score: 4  },
    ],
  },
  {
    id: 'existing_property',
    prompt: '您在奥地利名下是否已有房产？',
    helper: '非 EU 身份 + 已有房产可能触发购房限制（KIM-V / AGVG）。',
    choices: [
      { label: '没有',                  value: 'no',        score: 10 },
      { label: '有 1 套（自住）',         value: 'one_self',  score: 6  },
      { label: '有多套 / 投资性持有',     value: 'multiple',  score: 3  },
    ],
  },
  {
    id: 'purpose',
    prompt: '您计划买房的目的？',
    choices: [
      { label: '自住',              value: 'self',     score: 10 },
      { label: '出租投资',           value: 'rental',   score: 8  },
      { label: '度假房 / 第二居所',    value: 'vacation', score: 5  },
      { label: '长期资产配置',        value: 'hold',     score: 7  },
    ],
  },
  {
    id: 'finance',
    prompt: '您计划在奥地利贷款吗？',
    choices: [
      { label: '是，需要本地贷款',      value: 'yes',      score: 6  },
      { label: '否，全款支付',         value: 'no',       score: 10 },
      { label: '不确定，想先了解',      value: 'unsure',   score: 8  },
    ],
  },
]

// maxScore is computed dynamically per active question set, since
// Austrian / EU citizens skip the residence question (max 18) — see
// `activeQuestions` derivation in the component below.

// ─── Tier logic ─────────────────────────────────────────────────────────────
// Decisive rules override numeric score so legal hard-stops are caught.
function getTier(a: Record<string, string>, score: number): 'green' | 'yellow' | 'red' {
  // Hard-red: zero foothold in Austria
  if (a.citizenship === 'foreign' && a.residence === 'none' && a.anmeldung === 'none') return 'red'
  // Hard-red: non-EU + multiple existing properties (KIM-V / AGVG block)
  if (a.citizenship === 'rwr' && a.existing_property === 'multiple') return 'red'
  if (a.citizenship === 'foreign' && a.existing_property === 'multiple') return 'red'

  // Hard-green: full Austrian/EU rights
  if (a.citizenship === 'austrian' || a.citizenship === 'eu') return 'green'
  if (a.residence === 'permanent') return 'green'

  // Numeric thresholds (only RWR + foreign without overrides reach here)
  if (score >= 60) return 'green'
  if (score >= 40) return 'yellow'
  return 'red'
}

const TIER_META = {
  green: {
    color: '#4ade80',
    icon: <CheckCircle2 size={20} strokeWidth={1.5} />,
    title: '可以直接购房',
    heading: '您完全符合购房资格',
    caption: '基于您的身份与居留状态，可以立即开始看房 — 没有额外审批障碍',
  },
  yellow: {
    color: '#d4af37',
    icon: <AlertTriangle size={20} strokeWidth={1.5} />,
    title: '可以买，但需规划',
    heading: '您有一些条件需要先处理',
    caption: '当前条件下能买房，但建议先完成登记 / 居留 / 资金等准备工作',
  },
  red: {
    color: '#f87171',
    icon: <AlertCircle size={20} strokeWidth={1.5} />,
    title: '直接购房受限',
    heading: '直接购房有限制，但仍有合规通道',
    caption: '当前身份下直接购房较难，我们有合规合法的方式助您实现在维也纳买房',
  },
} as const

function buildReasoning(a: Record<string, string>, tier: 'green' | 'yellow' | 'red'): string[] {
  const r: string[] = []

  // Citizenship-driven explanations
  if (a.citizenship === 'austrian' || a.citizenship === 'eu') {
    r.push('您拥有奥地利 / EU 公民身份，全维也纳 23 区均可自由购房，与本地公民同等待遇。')
  } else if (a.residence === 'permanent') {
    r.push('您持有奥地利长期居留（NL / Daueraufenthalt-EU），在购房上等同于 EU 公民，流程顺畅。')
  } else if (a.citizenship === 'rwr') {
    r.push('非 EU 签证持有人购房需通过 Ausländergrundverkehrsgesetz 审批，部分区域需 MA 35 协调。')
  } else if (a.citizenship === 'foreign') {
    r.push('从境外直接购买奥地利房产，需特殊审批 + 公证授权 + 在奥银行账户，或通过设立奥地利公司持有。')
  }

  // Anmeldung
  if (a.anmeldung === 'wien') {
    r.push('维也纳已有 Anmeldung，公证、开户、税务流程都更顺。')
  } else if (a.anmeldung === 'none' && (a.citizenship === 'rwr' || a.citizenship === 'foreign')) {
    r.push('建议先完成 Anmeldung — 没有登记地址会显著拉长开户和公证流程。')
  }

  // Existing property
  if (a.existing_property === 'multiple' && a.citizenship !== 'austrian' && a.citizenship !== 'eu') {
    r.push('已持有多套房产 + 非 EU 身份会触发 KIM-V 限制，需提前与税务师 / 律师评估架构。')
  } else if (a.existing_property === 'no' && (a.citizenship === 'rwr')) {
    r.push('首套房身份下条件相对宽松，建议优先以自住名义申请。')
  }

  // Finance
  if (a.finance === 'yes' && a.citizenship !== 'austrian' && a.citizenship !== 'eu' && a.residence !== 'permanent') {
    r.push('非 EU 身份贷款门槛较高，通常 LTV 60-70%，建议准备 30-40% 首付证明。')
  } else if (a.finance === 'no') {
    r.push('全款购买流程最简单，无 KIM-V 限制，是大部分外国买家的常见路径。')
  }

  // Purpose
  if (a.purpose === 'rental' && a.citizenship === 'rwr') {
    r.push('非 EU 身份做出租投资，部分区域需要额外审批；我们可以协助预审。')
  }
  if (a.purpose === 'vacation' && tier === 'red') {
    r.push('度假房 / 第二居所类购房对非居民审批最严，建议先建立居留身份。')
  }

  return r.slice(0, 5)
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  // Austrian / EU citizens already have full purchase rights — asking
  // them about residence permit adds zero signal and feels patronizing.
  // Filter the question list once citizenship is answered.
  const activeQuestions = useMemo(() => {
    if (answers.citizenship === 'austrian' || answers.citizenship === 'eu') {
      return QUESTIONS.filter(q => q.id !== 'residence')
    }
    return QUESTIONS
  }, [answers.citizenship])

  const totalSteps = activeQuestions.length
  // Clamp step in case the user goes back, changes citizenship to
  // austrian/eu, and the active set shrinks.
  const safeStep = Math.min(step, totalSteps - 1)
  const currentQ = activeQuestions[safeStep]
  const isLast = safeStep === totalSteps - 1

  const maxScore = useMemo(() => activeQuestions.reduce((sum, q) => {
    return sum + Math.max(...q.choices.map(c => c.score))
  }, 0), [activeQuestions])

  const score = useMemo(() => {
    // Only count answers to currently active questions, so a stale
    // residence answer left over from before the user switched their
    // citizenship doesn't inflate the readiness bar.
    const activeIds = new Set(activeQuestions.map(q => q.id))
    return Object.entries(answers).reduce((sum, [qid, val]) => {
      if (!activeIds.has(qid)) return sum
      const q = activeQuestions.find(q => q.id === qid)
      const c = q?.choices.find(c => c.value === val)
      return sum + (c?.score || 0)
    }, 0)
  }, [answers, activeQuestions])

  const tier = useMemo(() => getTier(answers, score), [score, answers])
  const reasoning = useMemo(() => buildReasoning(answers, tier), [answers, tier])

  function selectChoice(value: string) {
    setAnswers(a => ({ ...a, [currentQ.id]: value }))
    if (!isLast) {
      // Use safeStep so we stay aligned with the (possibly filtered)
      // active question list — important when citizenship just flipped
      // to austrian/eu and the residence step disappeared.
      setTimeout(() => setStep(safeStep + 1), 250)
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

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}40`, color: meta.color }}>
              {meta.icon}
              <span className="font-semibold">{meta.title}</span>
            </div>

            <h1 className="font-serif text-display-lg text-fg-primary mb-3 tracking-tight">
              {meta.heading}
            </h1>
            <p className="text-body-lg text-fg-secondary mb-10">
              {meta.caption}。基于您的回答，下面是具体分析：
            </p>

            {/* Score bar */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-2 text-caption text-fg-tertiary">
                <span>购房准备度</span>
                <span className="tabular">{score} / {maxScore}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(score / maxScore) * 100}%` }}
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

            {/* RED-tier special block: compliant pathways */}
            {tier === 'red' && (
              <div
                className="rounded-2xl p-6 sm:p-8 mb-6"
                style={{
                  background: 'linear-gradient(180deg, rgba(212,175,55,0.10), rgba(212,175,55,0.04))',
                  border: '1px solid var(--gold-line)',
                }}
              >
                <h3 className="text-heading-md text-gold mb-3">我们有合规合法的方式助您买房</h3>
                <ul className="space-y-2 mb-5 text-body text-fg-secondary">
                  <li className="flex gap-2.5">
                    <span className="text-gold flex-shrink-0">·</span>
                    <span>通过<strong className="text-fg-primary">设立奥地利 GmbH 公司</strong>持有房产 — 绕开外国人个人购房限制</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="text-gold flex-shrink-0">·</span>
                    <span>协助申请<strong className="text-fg-primary">居留许可</strong>（红白红卡 / 投资移民） — 先建立身份再购房</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="text-gold flex-shrink-0">·</span>
                    <span>合作<strong className="text-fg-primary">奥地利律师走特殊审批通道</strong> — 部分情形可通过 MA 35 / Bezirkshauptmannschaft 单独申请</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="text-gold flex-shrink-0">·</span>
                    <span>购房后协助办理<strong className="text-fg-primary">税务架构 + 持有人结构</strong>优化</span>
                  </li>
                </ul>
                <ButtonLink
                  to="/about"
                  variant="primary"
                  size="md"
                  trailingIcon={<ArrowRight size={14} strokeWidth={1.75} />}
                >
                  联系我们一对一规划
                </ButtonLink>
              </div>
            )}

            {/* Standard next-step CTAs (green / yellow) */}
            {tier !== 'red' && (
              <div className="rounded-2xl p-6 sm:p-8 bg-bg-elev-1 border border-white/[0.06] mb-6">
                <h3 className="text-heading-md text-fg-primary mb-2">下一步</h3>
                <p className="text-body text-fg-secondary mb-5">
                  {tier === 'green' && '您可以立即开始浏览房源，或预约一次免费咨询，我们会基于您的具体需求推荐 3-5 套精准匹配的房子。'}
                  {tier === 'yellow' && '建议先和我们做一次 30 分钟的咨询，理清当前条件下的最优购房路径。'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <ButtonLink to="/about" variant="primary" size="md" trailingIcon={<ArrowRight size={14} strokeWidth={1.75} />}>
                    联系我们咨询
                  </ButtonLink>
                  <ButtonLink to="/listings" variant="ghost" size="md">
                    浏览精选房源
                  </ButtonLink>
                  <ButtonLink to="/buying-guide" variant="text" size="md">
                    阅读购房指南 →
                  </ButtonLink>
                </div>
              </div>
            )}

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
  const progress = ((safeStep + 1) / totalSteps) * 100

  return (
    <div className="min-h-screen bg-bg-base text-fg-primary pt-16">
      <div className="max-w-prose mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16">

        {/* Header */}
        <div className="mb-10">
          <p className="text-overline text-gold/80 uppercase mb-3">Quiz · 60 秒</p>
          <h1 className="font-serif text-display-lg sm:text-display-xl text-fg-primary mb-2 tracking-tight">
            我能在维也纳买房吗？
          </h1>
          <p className="text-body text-fg-secondary">
            回答 {totalSteps} 个问题，我们根据您的身份与情况给出准确判断。
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2 text-caption text-fg-tertiary tabular">
            <span>第 {safeStep + 1} 题 / 共 {totalSteps} 题</span>
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
            onClick={() => setStep(Math.max(0, safeStep - 1))}
            disabled={safeStep === 0}
            className="inline-flex items-center gap-1.5 text-caption text-fg-secondary hover:text-fg-primary transition-colors duration-base ease-standard disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} strokeWidth={1.5} />
            上一题
          </button>
          {answers[currentQ.id] && !isLast && (
            <button
              onClick={() => setStep(Math.min(totalSteps - 1, safeStep + 1))}
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
