import React from 'react'
import { ArrowRight } from 'lucide-react'
import { ButtonLink } from '../components/ui/Button'
import { MortgageCalculator } from '../components/ui/MortgageCalculator'

/**
 * Full-page mortgage calculator. The component lives in
 * src/components/ui/MortgageCalculator.tsx and is reused as a compact
 * widget on every listing detail page.
 */
export default function MortgagePage() {
  return (
    <div className="min-h-screen bg-bg-base text-fg-primary pt-16">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16">

        {/* Header */}
        <div className="mb-10 max-w-prose">
          <p className="text-overline text-gold/80 uppercase mb-3">Tool · 实时计算</p>
          <h1 className="font-serif text-display-lg sm:text-display-xl text-fg-primary mb-2 tracking-tight">
            贷款计算器
          </h1>
          <p className="text-body-lg text-fg-secondary">
            按奥地利市场实际利率与税费计算月供 + 全部前期成本。所有数字实时更新。
          </p>
        </div>

        <MortgageCalculator initialPrice={450_000} variant="full" hideFullLink />

        {/* CTA card */}
        <div className="mt-12 rounded-2xl p-6 sm:p-7 bg-gold-tint border border-gold-line flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-heading-md text-fg-primary mb-1">想看符合预算的房源？</h3>
            <p className="text-caption text-fg-secondary">
              告诉我们您的预算和首付，我们推荐 3–5 套精准匹配的房子。
            </p>
          </div>
          <ButtonLink to="/listings" variant="primary" size="md" trailingIcon={<ArrowRight size={14} strokeWidth={1.75} />}>
            浏览房源
          </ButtonLink>
        </div>

        {/* Disclaimer */}
        <p className="max-w-prose text-caption text-fg-tertiary mt-12 leading-relaxed">
          * 计算结果仅供参考。实际贷款条件以银行 KIM-V 标准与您个人资质为准。
          税费按 2026 年奥地利标准估算。具体金额请咨询银行或我们的合作律所 MONOLAW。
        </p>
      </div>
    </div>
  )
}
