import { useMemo, useState } from 'react';
import {
  ArrowUpLeft,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  Edit3,
  Eye,
  FileText,
  Plus,
  Search,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  CurrencyCode,
  ProposalRecord,
  ProposalStatus,
  formatMoney,
  getStatusLabel,
} from '../types';

interface PipelineViewProps {
  proposals: ProposalRecord[];
  loading: boolean;
  defaultCurrency: CurrencyCode;
  isDemoMode: boolean;
  onCreateNew: () => void;
  onOpenOnboarding: () => void;
  onEditProposal: (proposal: ProposalRecord) => void;
  onPreviewOffer: (proposal: ProposalRecord) => void;
  onChangeStatus: (proposal: ProposalRecord, newStatus: ProposalStatus) => void;
  onCloneProposal: (proposal: ProposalRecord) => void;
  onDeleteProposal: (proposal: ProposalRecord) => void;
}

const FILTER_TABS: { id: 'all' | ProposalStatus; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'draft', label: 'مسودة' },
  { id: 'sent', label: 'مرسل' },
  { id: 'negotiating', label: 'قيد التفاوض' },
  { id: 'accepted', label: 'مقبول' },
  { id: 'rejected', label: 'مرفوض' },
];

function StatusSemanticLabel({ status }: { status: ProposalStatus }) {
  const label = getStatusLabel(status);
  if (status === 'accepted') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#34D399]">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>{label}</span>
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-400">
        <XCircle className="w-3.5 h-3.5 shrink-0" />
        <span>{label}</span>
      </span>
    );
  }
  if (status === 'negotiating' || status === 'sent') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E5BE72]">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span>{label}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#9A9891]">
      <FileText className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
}

export function PipelineView({
  proposals,
  loading,
  defaultCurrency,
  isDemoMode,
  onCreateNew,
  onOpenOnboarding,
  onEditProposal,
  onPreviewOffer,
  onChangeStatus,
  onCloneProposal,
  onDeleteProposal,
}: PipelineViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProposalStatus>('all');

  const metrics = useMemo(() => {
    const activeDeals = proposals.filter(
      (p) => p.status === 'sent' || p.status === 'negotiating' || p.status === 'draft'
    );
    const acceptedDeals = proposals.filter((p) => p.status === 'accepted');
    const negotiatingDeals = proposals.filter((p) => p.status === 'negotiating');
    const decidedDeals = proposals.filter(
      (p) =>
        p.status === 'accepted' ||
        p.status === 'rejected' ||
        p.status === 'sent' ||
        p.status === 'negotiating'
    );

    const activeVolume = activeDeals.reduce((sum, p) => sum + (Number(p.dealValue) || 0), 0);
    const acceptedVolume = acceptedDeals.reduce((sum, p) => sum + (Number(p.dealValue) || 0), 0);
    const totalVolume = Math.max(1, activeVolume + acceptedVolume);
    const winRate =
      decidedDeals.length > 0
        ? Math.round((acceptedDeals.length / decidedDeals.length) * 100)
        : 0;
    const avgDeal =
      proposals.length > 0
        ? Math.round(
            proposals.reduce((sum, p) => sum + (Number(p.dealValue) || 0), 0) / proposals.length
          )
        : 0;

    const topNegotiating = [...negotiatingDeals].sort((a, b) => b.dealValue - a.dealValue)[0] || proposals[0] || null;

    return {
      activeCount: activeDeals.length,
      activeVolume,
      acceptedCount: acceptedDeals.length,
      acceptedVolume,
      acceptedSharePct: Math.round((acceptedVolume / totalVolume) * 100),
      winRate,
      avgDeal,
      topNegotiating,
    };
  }, [proposals]);

  const filteredProposals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return proposals.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.industry.toLowerCase().includes(q)
      );
    });
  }, [proposals, searchQuery, statusFilter]);

  return (
    <div className="space-y-7">
      {isDemoMode && (
        <div className="bg-[#111216] border border-[#D4A853]/25 rounded-xl px-5 py-3 flex flex-wrap items-center justify-between gap-4 text-xs text-[#D8D5CD]">
          <span>
            أنت الآن تستكشف وضع التجربة الفورية. جرّب توليد العروض وحاسبة العائد، وسجّل دخولك عبر Google لحفظ صفقاتك دائماً.
          </span>
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="inline-flex items-center gap-1.5 text-[#E5BE72] hover:text-[#F5E6C4] font-medium whitespace-nowrap"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>افتح دليل الشرح نقطة بنقطة</span>
          </button>
        </div>
      )}

      {/* Asymmetric Executive Command Strip */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Right 8 cols: Revenue & 30%+ Win Rate Engine */}
        <div className="xl:col-span-8 bg-[#111216] border border-[#F5EEE0]/[0.08] rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-xs text-[#9A9891]">إجمالي الإيرادات المعتمدة والفرص الجارية</div>
              <div className="text-3xl sm:text-4xl font-bold font-mono-num text-[#F5F3EE] tracking-tight">
                {formatMoney(metrics.acceptedVolume + metrics.activeVolume, defaultCurrency)}
              </div>
            </div>

            <div className="text-left space-y-1">
              <div className="text-xs text-[#9A9891]">معدل قبول الصفقات الفعلي</div>
              <div className="flex items-baseline gap-2 justify-end">
                <span className="text-2xl font-bold font-mono-num text-[#D4A853]">
                  {metrics.winRate}%
                </span>
                <span className="text-[11px] text-[#9A9891]">
                  {metrics.winRate >= 30 ? 'يتجاوز هدف 30%' : 'الهدف 30%+'}
                </span>
              </div>
            </div>
          </div>

          {/* 30% Win-Rate Visual Progress Track */}
          <div className="space-y-2">
            <div className="relative h-2.5 w-full rounded-full bg-[#1C1E26] overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-[#D4A853] to-[#34D399] transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(4, metrics.winRate))}%` }}
              />
              {/* 30% Benchmark Marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-[#F5F3EE]/60"
                style={{ right: '30%' }}
                title="العتبة التجارية المستهدفة 30%"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#9A9891]">
              <span>توزيع محفظة الصفقات الحالية</span>
              <span className="font-mono-num">
                عروض مقبولة: {metrics.acceptedCount} · قيد المتابعة: {metrics.activeCount}
              </span>
            </div>
          </div>

          {/* 3-Metric Hairline Footer inside same single-elevation panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 pt-5 border-t border-[#F5EEE0]/[0.07] gap-5">
            <div>
              <div className="text-[11px] text-[#9A9891]">صفقات مقبولة</div>
              <div className="text-lg font-bold font-mono-num text-[#34D399] mt-0.5">
                {formatMoney(metrics.acceptedVolume, defaultCurrency)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#9A9891]">فرص قيد التفاوض</div>
              <div className="text-lg font-bold font-mono-num text-[#F5F3EE] mt-0.5">
                {formatMoney(metrics.activeVolume, defaultCurrency)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#9A9891]">متوسط قيمة العرض</div>
              <div className="text-lg font-bold font-mono-num text-[#E5BE72] mt-0.5">
                {formatMoney(metrics.avgDeal, defaultCurrency)}
              </div>
            </div>
          </div>
        </div>

        {/* Left 4 cols: Focus Deal & Next Smart Action */}
        <div className="xl:col-span-4 bg-[#14151B] border border-[#D4A853]/25 rounded-2xl p-6 flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <div className="text-xs font-medium text-[#D4A853]">أولوية الإغلاق الآن</div>
            {metrics.topNegotiating ? (
              <>
                <h2 className="font-display font-bold text-lg text-[#F5F3EE] leading-snug">
                  {metrics.topNegotiating.title}
                </h2>
                <div className="text-xs text-[#9A9891]">
                  {metrics.topNegotiating.clientName} ·{' '}
                  <span className="font-mono-num text-[#F5F3EE]">
                    {formatMoney(metrics.topNegotiating.dealValue, metrics.topNegotiating.currency)}
                  </span>
                </div>
                <p className="text-xs text-[#9A9891] leading-relaxed pt-1">
                  افتح معاينة العميل واستعرض حاسبة العائد المالي أمام صانع القرار لتسريع الموافقة.
                </p>
              </>
            ) : (
              <>
                <h2 className="font-display font-bold text-lg text-[#F5F3EE]">
                  ابدأ أول عرض خلال 60 ثانية
                </h2>
                <p className="text-xs text-[#9A9891] leading-relaxed">
                  اختر قطاعاً جاهزاً أو ألصق طلب العميل ليتم بناء 3 باقات تسعير وحاسبة عائد مخصصة.
                </p>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            {metrics.topNegotiating ? (
              <button
                type="button"
                onClick={() => onPreviewOffer(metrics.topNegotiating!)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#D4A853] hover:bg-[#E5BE72] text-[#08080A] rounded-xl transition-colors"
              >
                <ArrowUpLeft className="w-4 h-4" />
                <span>فتح العرض التنفيذي للعميل</span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={onCreateNew}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#1B1D25] hover:bg-[#222530] text-[#F5F3EE] border border-[#F5EEE0]/[0.09] rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4 text-[#D4A853]" />
              <span>بناء عرض جديد بالذكاء الاصطناعي</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filter Toolbar & Executive Deal Ledger */}
      <section className="bg-[#111216] border border-[#F5EEE0]/[0.08] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#F5EEE0]/[0.07] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-1 p-1 bg-[#0B0B0E] border border-[#F5EEE0]/[0.07] rounded-xl overflow-x-auto">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === tab.id
                    ? 'bg-[#1B1D25] text-[#E5BE72]'
                    : 'text-[#9A9891] hover:text-[#F5F3EE]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-[#6E6C66] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث باسم المشروع أو العميل..."
              className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.08] focus:border-[#D4A853]/60 focus:outline-none rounded-xl pr-9 pl-3 py-2 text-xs text-[#F5F3EE] placeholder:text-[#6E6C66]"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4].map((row) => (
              <div key={row} className="h-12 rounded-lg bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-4">
            <div className="text-base font-display font-semibold text-[#F5F3EE]">
              {proposals.length === 0
                ? 'لا توجد عروض مسجلة حتى الآن'
                : 'لا توجد نتائج مطابقة للتصفية الحالية'}
            </div>
            <p className="text-xs text-[#9A9891] max-w-md mx-auto leading-relaxed">
              ابدأ بتوليد أول عرض تجاري من استوديو العروض عبر لصق طلب العميل ليتم بناء نطاق العمل والباقات الثلاث تلقائياً.
            </p>
            <button
              type="button"
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#D4A853] hover:bg-[#E5BE72] text-[#08080A] rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء أول عرض تجاري</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-[#F5EEE0]/[0.07] text-[11px] font-medium text-[#9A9891]">
                  <th className="py-3.5 px-5">المشروع والعميل</th>
                  <th className="py-3.5 px-4">القطاع</th>
                  <th className="py-3.5 px-4">القيمة المختارة</th>
                  <th className="py-3.5 px-4">المدة</th>
                  <th className="py-3.5 px-4">حالة الصفقة</th>
                  <th className="py-3.5 px-5 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EEE0]/[0.05] text-sm">
                {filteredProposals.map((proposal) => {
                  const isLocked =
                    proposal.status === 'accepted' || proposal.status === 'rejected';
                  return (
                    <tr
                      key={proposal.id}
                      className="hover:bg-white/[0.02] transition-colors h-13"
                    >
                      <td className="py-3 px-5">
                        <div className="font-medium text-[#F5F3EE] truncate max-w-[300px]">
                          {proposal.title}
                        </div>
                        <div className="text-xs text-[#9A9891] truncate max-w-[300px]">
                          {proposal.clientName}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#C8C5BD] whitespace-nowrap">
                        {proposal.industry}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold font-mono-num text-[#E5BE72] whitespace-nowrap">
                        {formatMoney(proposal.dealValue, proposal.currency)}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono-num text-[#9A9891] whitespace-nowrap">
                        {proposal.timelineWeeks} أسابيع
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isLocked ? (
                          <StatusSemanticLabel status={proposal.status} />
                        ) : (
                          <select
                            aria-label={`تغيير حالة ${proposal.title}`}
                            value={proposal.status}
                            onChange={(e) =>
                              onChangeStatus(proposal, e.target.value as ProposalStatus)
                            }
                            className="bg-[#0B0B0E] border border-[#F5EEE0]/[0.1] rounded-lg px-2.5 py-1 text-xs text-[#F5F3EE] focus:border-[#D4A853] focus:outline-none"
                          >
                            <option value="draft">مسودة</option>
                            <option value="sent">مرسل</option>
                            <option value="negotiating">قيد التفاوض</option>
                            <option value="accepted">مقبول (إغلاق فوز)</option>
                            <option value="rejected">مرفوض</option>
                          </select>
                        )}
                      </td>
                      <td className="py-3 px-5 whitespace-nowrap text-left">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onPreviewOffer(proposal)}
                            title="معاينة عرض العميل"
                            className="p-1.5 rounded-lg text-[#9A9891] hover:text-[#E5BE72] hover:bg-[#D4A853]/10 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isLocked ? (
                            <button
                              type="button"
                              onClick={() => onCloneProposal(proposal)}
                              title="نسخ كمسودة جديدة"
                              className="p-1.5 rounded-lg text-[#9A9891] hover:text-[#F5F3EE] hover:bg-white/[0.06] transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onEditProposal(proposal)}
                              title="تعديل العرض في الاستوديو"
                              className="p-1.5 rounded-lg text-[#9A9891] hover:text-[#F5F3EE] hover:bg-white/[0.06] transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onDeleteProposal(proposal)}
                            title="حذف العرض"
                            className="p-1.5 rounded-lg text-[#9A9891] hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
