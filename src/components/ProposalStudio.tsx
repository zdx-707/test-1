import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Eye,
  Lightbulb,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { TARGET_SECTOR_PRESETS } from '../data/presets';
import {
  ClientRecord,
  CurrencyCode,
  DealAuditResult,
  LIMITS,
  PricingPackage,
  ProposalRecord,
  RoiAssumptions,
  ScopeItem,
  formatMoney,
} from '../types';

interface ProposalStudioProps {
  initialProposal: ProposalRecord | null;
  clients: ClientRecord[];
  companyName: string;
  defaultCurrency: CurrencyCode;
  ownerUid: string;
  onSaveProposal: (
    draft: Omit<ProposalRecord, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string,
    openOfferAfter?: boolean
  ) => Promise<void>;
  onCloneProposal: (proposal: ProposalRecord) => void;
  onCoachTip?: (tip: string) => void;
}

const DEFAULT_PACKAGES: PricingPackage[] = [
  {
    tier: 'basic',
    name: 'الباقة الأساسية',
    price: 25000,
    deliveryWeeks: 4,
    recommended: false,
    features: ['تنفيذ النطاق الأساسي', 'توثيق التشغيل', 'دعم فني 30 يوماً'],
  },
  {
    tier: 'pro',
    name: 'الباقة الاحترافية',
    price: 42000,
    deliveryWeeks: 6,
    recommended: true,
    features: [
      'تنفيذ كامل النطاق مع الأتمتة',
      'لوحة متابعة الأداء والتقارير',
      'تدريب الفريق ودعم 90 يوماً',
    ],
  },
  {
    tier: 'enterprise',
    name: 'الباقة المؤسسية',
    price: 68000,
    deliveryWeeks: 8,
    recommended: false,
    features: [
      'تكاملات مخصصة مع أنظمة الشركة',
      'أولوية تنفيذ ومدير حساب مخصص',
      'اتفاقية SLA لمدة 12 شهراً',
    ],
  },
];

export function ProposalStudio({
  initialProposal,
  clients,
  companyName,
  defaultCurrency,
  ownerUid,
  onSaveProposal,
  onCloneProposal,
  onCoachTip,
}: ProposalStudioProps) {
  const isLocked =
    initialProposal?.status === 'accepted' || initialProposal?.status === 'rejected';

  const [clientId, setClientId] = useState<string>(initialProposal?.clientId || 'standalone');
  const [clientName, setClientName] = useState<string>(initialProposal?.clientName || '');
  const [title, setTitle] = useState<string>(initialProposal?.title || '');
  const [industry, setIndustry] = useState<string>(
    initialProposal?.industry || TARGET_SECTOR_PRESETS[0].sectorLabel
  );
  const [currency, setCurrency] = useState<CurrencyCode>(
    initialProposal?.currency || defaultCurrency
  );
  const [budgetHint, setBudgetHint] = useState<number>(initialProposal?.dealValue || 45000);
  const [brief, setBrief] = useState<string>(initialProposal?.brief || '');
  const [executiveSummary, setExecutiveSummary] = useState<string>(
    initialProposal?.executiveSummary || ''
  );
  const [timelineWeeks, setTimelineWeeks] = useState<number>(
    initialProposal?.timelineWeeks || 6
  );
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>(
    initialProposal?.scopeItems || [
      {
        title: 'التحليل وتصميم الحل',
        deliverable: 'وثيقة المتطلبات وهيكلة المسار التشغيلي.',
        weeks: 2,
      },
      {
        title: 'التنفيذ والإطلاق التجريبي',
        deliverable: 'بناء المنظومة واختبار الجودة مع الفريق.',
        weeks: 4,
      },
    ]
  );
  const [packages, setPackages] = useState<PricingPackage[]>(
    initialProposal?.packages || DEFAULT_PACKAGES
  );
  const [selectedPackageIndex, setSelectedPackageIndex] = useState<number>(
    initialProposal?.selectedPackageIndex ?? 1
  );
  const [roiAssumptions, setRoiAssumptions] = useState<RoiAssumptions>(
    initialProposal?.roiAssumptions || {
      monthlyHoursSaved: 60,
      hourlyRate: 180,
      monthlyRevenueLift: 25000,
    }
  );
  const [termsNote, setTermsNote] = useState<string>(
    initialProposal?.termsNote ||
      '50% دفعة أولى عند التعميد، 30% عند تسليم النسخة التجريبية، 20% عند الإطلاق النهائي.'
  );

  const [generating, setGenerating] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<DealAuditResult | null>(null);

  useEffect(() => {
    if (initialProposal) {
      setClientId(initialProposal.clientId);
      setClientName(initialProposal.clientName);
      setTitle(initialProposal.title);
      setIndustry(initialProposal.industry);
      setCurrency(initialProposal.currency);
      setBudgetHint(initialProposal.dealValue);
      setBrief(initialProposal.brief);
      setExecutiveSummary(initialProposal.executiveSummary);
      setTimelineWeeks(initialProposal.timelineWeeks);
      setScopeItems(initialProposal.scopeItems);
      setPackages(initialProposal.packages);
      setSelectedPackageIndex(initialProposal.selectedPackageIndex);
      setRoiAssumptions(initialProposal.roiAssumptions);
      setTermsNote(initialProposal.termsNote);
      setAuditResult(null);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [initialProposal]);

  const handleSelectClient = (id: string) => {
    setClientId(id);
    if (id !== 'standalone') {
      const found = clients.find((c) => c.id === id);
      if (found) {
        setClientName(found.companyName);
        setIndustry(found.industry);
        onCoachTip?.(
          `تم ربط العرض بملف ${found.companyName}. أضف في وصف الطلب أي نقطة ذكرها ${found.contactName} لزيادة التخصيص.`
        );
      }
    }
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = TARGET_SECTOR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setIndustry(preset.sectorLabel);
    setTitle(preset.projectTitle);
    setBudgetHint(preset.budgetHint);
    setBrief(preset.brief);
    if (!clientName.trim()) {
      setClientName('شركة مستهدفة — ' + preset.sectorLabel);
    }
    setErrorMsg(null);
    onCoachTip?.(
      'تمت تعبئة بيانات القطاع الجاهز. اضغط الآن «توليد العرض الذكي» ليتم بناء الباقات الثلاث وحاسبة العائد تلقائياً.'
    );
  };

  const handleGenerateWithAI = async () => {
    if (isLocked) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (title.trim().length < 2) {
      setErrorMsg('يرجى إدخال عنوان المشروع أولاً.');
      return;
    }
    if (brief.trim().length < 10) {
      setErrorMsg('يرجى إدخال وصف كافٍ لمتطلبات العميل (10 أحرف على الأقل).');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: title,
          clientName: clientName || 'العميل',
          industry,
          currency,
          budgetHint,
          brief,
          companyName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'تعذر توليد العرض من الخادم.');
      }

      setExecutiveSummary(String(data.executiveSummary || ''));
      if (Number(data.timelineWeeks) > 0) {
        setTimelineWeeks(Math.min(LIMITS.MAX_WEEKS, Math.round(Number(data.timelineWeeks))));
      }
      if (Array.isArray(data.scopeItems) && data.scopeItems.length > 0) {
        setScopeItems(
          data.scopeItems.slice(0, LIMITS.MAX_SCOPE_ITEMS).map((item: ScopeItem) => ({
            title: String(item.title || 'مرحلة تنفيذ'),
            deliverable: String(item.deliverable || 'مخرج معتمد'),
            weeks: Math.max(1, Math.round(Number(item.weeks) || 1)),
          }))
        );
      }
      if (Array.isArray(data.packages) && data.packages.length > 0) {
        const normalized: PricingPackage[] = data.packages
          .slice(0, 3)
          .map((pkg: PricingPackage, idx: number) => ({
            tier:
              pkg.tier === 'basic' || pkg.tier === 'pro' || pkg.tier === 'enterprise'
                ? pkg.tier
                : idx === 0
                  ? 'basic'
                  : idx === 1
                    ? 'pro'
                    : 'enterprise',
            name: String(pkg.name || `الباقة ${idx + 1}`),
            price: Math.max(0, Math.round(Number(pkg.price) || 0)),
            deliveryWeeks: Math.max(1, Math.round(Number(pkg.deliveryWeeks) || 4)),
            recommended: Boolean(pkg.recommended),
            features: Array.isArray(pkg.features)
              ? pkg.features.map((f) => String(f)).slice(0, LIMITS.MAX_FEATURES)
              : ['تنفيذ النطاق المعتمد'],
          }));
        setPackages(normalized);
        const recIdx = normalized.findIndex((p) => p.recommended);
        setSelectedPackageIndex(recIdx >= 0 ? recIdx : Math.min(1, normalized.length - 1));
      }
      if (data.roiAssumptions) {
        setRoiAssumptions({
          monthlyHoursSaved: Math.max(0, Number(data.roiAssumptions.monthlyHoursSaved) || 0),
          hourlyRate: Math.max(0, Number(data.roiAssumptions.hourlyRate) || 0),
          monthlyRevenueLift: Math.max(0, Number(data.roiAssumptions.monthlyRevenueLift) || 0),
        });
      }
      if (typeof data.termsNote === 'string' && data.termsNote.trim()) {
        setTermsNote(data.termsNote);
      }
      setAuditResult(null);
      setSuccessMsg('تم توليد العرض والباقات الثلاث بنجاح. راجع الأسعار ثم اضغط «حفظ ومعاينة عرض العميل».');
      onCoachTip?.(
        'ممتاز! الباقة الوسطى مضبوطة الآن كنقطة ارتكاز لرفع القبول فوق 30%. جرّب «تشخيص فرصة الفوز» أو انتقل مباشرة لمعاينة العميل.'
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'حدث خطأ أثناء الاتصال بالخادم.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAuditDeal = async () => {
    setErrorMsg(null);
    setAuditing(true);
    try {
      const res = await fetch('/api/proposals/deal-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'عرض مشروع',
          industry,
          currency,
          packages,
          selectedPackageIndex,
          roiAssumptions,
          brief,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'تعذر إجراء تشخيص الصفقة.');
      }
      setAuditResult(data as DealAuditResult);
      onCoachTip?.(
        'طبّق إحدى التوصيات الظاهرة في تقرير التشخيص على الباقة الوسطى أو شروط الدفع قبل التصدير.'
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'تعذر إجراء التدقيق.');
    } finally {
      setAuditing(false);
    }
  };

  const handleSave = async (openOfferAfter: boolean) => {
    if (isLocked) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (title.trim().length < 2) {
      setErrorMsg('يرجى إدخال عنوان العرض قبل الحفظ.');
      return;
    }
    if (!clientName.trim()) {
      setErrorMsg('يرجى إدخال اسم العميل أو اختياره من القائمة.');
      return;
    }
    if (brief.trim().length < 5) {
      setErrorMsg('يرجى كتابة ملخص الطلب (5 أحرف على الأقل).');
      return;
    }

    const summaryText =
      executiveSummary.trim().length >= 5
        ? executiveSummary.trim()
        : `عرض تجاري مخصص لمشروع ${title.trim()} لصالح ${clientName.trim()}.`;

    setSaving(true);
    try {
      const chosenPrice = packages[selectedPackageIndex]?.price ?? packages[0]?.price ?? 0;
      await onSaveProposal(
        {
          ownerUid,
          clientId,
          clientName: clientName.trim(),
          title: title.trim(),
          industry: industry.trim() || 'الأعمال والخدمات',
          currency,
          status: initialProposal?.status || 'draft',
          brief: brief.trim(),
          executiveSummary: summaryText,
          scopeItems,
          timelineWeeks,
          packages,
          selectedPackageIndex,
          roiAssumptions,
          dealValue: chosenPrice,
          termsNote,
        },
        initialProposal?.id,
        openOfferAfter
      );
      if (!openOfferAfter) {
        setSuccessMsg('تم حفظ العرض في مساحة العمل بنجاح.');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'تعذر حفظ العرض.');
    } finally {
      setSaving(false);
    }
  };

  const updatePackageField = (idx: number, patch: Partial<PricingPackage>) => {
    setPackages((prev) =>
      prev.map((pkg, i) => {
        if (i !== idx) {
          return patch.recommended ? { ...pkg, recommended: false } : pkg;
        }
        return { ...pkg, ...patch };
      })
    );
  };

  const updateScopeField = (idx: number, patch: Partial<ScopeItem>) => {
    setScopeItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };

  return (
    <div className="space-y-6">
      {/* Inline Beginner Coaching Banner */}
      <div className="bg-[#14151B] border border-[#D4A853]/25 rounded-xl px-5 py-3.5 flex items-start gap-3 text-xs text-[#D8D5CD]">
        <Lightbulb className="w-4 h-4 text-[#D4A853] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-[#E5BE72]">كيف تستخدم هذه الشاشة؟ </span>
          اختر قطاعاً جاهزاً أو اكتب احتياج العميل في اليمين، ثم اضغط «توليد العرض الذكي». بعد ذلك راجع الباقات الثلاث في اليسار واحفظ العرض لمعاينته كوثيقة عميل جاهزة للطباعة.
        </div>
      </div>

      {isLocked && initialProposal && (
        <div className="bg-[#111216] border border-amber-500/30 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-amber-200">
            هذا العرض مغلق بحالة نهائية لحماية سجل العقد. لتعديله، أنشئ نسخة مسودة جديدة منه.
          </div>
          <button
            type="button"
            onClick={() => onCloneProposal(initialProposal)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-[#1B1D25] hover:bg-[#232631] text-[#F5F3EE] border border-[#F5EEE0]/10 rounded-lg transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>نسخ كعرض جديد قابل للتعديل</span>
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 flex items-center gap-2.5 text-xs text-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-[#34D399]/10 border border-[#34D399]/30 rounded-xl px-4 py-3 flex items-center gap-2.5 text-xs text-[#A7F3D0]">
          <Check className="w-4 h-4 shrink-0 text-[#34D399]" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Right/Start Column: Brief & AI Generator */}
        <div className="xl:col-span-5 bg-[#111216] border border-[#F5EEE0]/[0.08] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#F5EEE0]/[0.07]">
            <h2 className="font-display font-semibold text-base text-[#F5F3EE]">
              1. معطيات العميل وطلب العرض
            </h2>
            <span className="text-[11px] text-[#D4A853]">توليد ذكي</span>
          </div>

          <div className="space-y-2">
            <label htmlFor="preset-selector" className="block text-xs font-medium text-[#D8D5CD]">
              تعبئة سريعة من قوالب القطاعات عالية العائد
            </label>
            <select
              id="preset-selector"
              defaultValue=""
              disabled={isLocked}
              onChange={(e) => {
                if (e.target.value) handleApplyPreset(e.target.value);
              }}
              className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.09] focus:border-[#D4A853]/60 focus:outline-none rounded-xl px-3 py-2.5 text-xs text-[#F5F3EE]"
            >
              <option value="" disabled>
                اختر قطاعاً جاهزاً للاختبار السريع...
              </option>
              {TARGET_SECTOR_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.sectorLabel} — {formatMoney(preset.budgetHint, currency)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="client-select" className="block text-xs font-medium text-[#D8D5CD]">
                العميل المحفوظ
              </label>
              <select
                id="client-select"
                value={clientId}
                disabled={isLocked}
                onChange={(e) => handleSelectClient(e.target.value)}
                className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.09] focus:border-[#D4A853]/60 focus:outline-none rounded-xl px-3 py-2 text-xs text-[#F5F3EE]"
              >
                <option value="standalone">عميل جديد (إدخال مباشر)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="client-name-input" className="block text-xs font-medium text-[#D8D5CD]">
                اسم الجهة / العميل
              </label>
              <input
                id="client-name-input"
                type="text"
                disabled={isLocked}
                maxLength={LIMITS.MAX_COMPANY_NAME}
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="مثال: شركة الرواد التجارية"
                className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.09] focus:border-[#D4A853]/60 focus:outline-none rounded-xl px-3 py-2 text-xs text-[#F5F3EE] placeholder:text-[#6E6C66]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="proposal-title" className="block text-xs font-medium text-[#D8D5CD]">
              عنوان المشروع / العرض التجاري
            </label>
            <input
              id="proposal-title"
              type="text"
              disabled={isLocked}
              maxLength={LIMITS.MAX_TITLE}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: منصة أتمتة المبيعات وتجربة العملاء"
              className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.09] focus:border-[#D4A853]/60 focus:outline-none rounded-xl px-3 py-2 text-xs text-[#F5F3EE] placeholder:text-[#6E6C66]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="proposal-industry" className="block text-xs font-medium text-[#D8D5CD]">
                القطاع
              </label>
              <input
                id="proposal-industry"
                type="text"
                disabled={isLocked}
                maxLength={LIMITS.MAX_INDUSTRY}
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.09] focus:border-[#D4A853]/60 focus:outline-none rounded-xl px-3 py-2 text-xs text-[#F5F3EE]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="proposal-currency" className="block text-xs font-medium text-[#D8D5CD]">
                العملة
              </label>
              <select
                id="proposal-currency"
                disabled={isLocked}
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.09] focus:border-[#D4A853]/60 focus:outline-none rounded-xl px-3 py-2 text-xs font-mono-num text-[#F5F3EE]"
              >
                <option value="SAR">SAR</option>
                <option value="AED">AED</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="proposal-budget" className="block text-xs font-medium text-[#D8D5CD]">
                الميزانية المستهدفة
              </label>
              <input
                id="proposal-budget"
                type="number"
                disabled={isLocked}
                min={0}
                max={LIMITS.MAX_PRICE}
                value={budgetHint}
                onChange={(e) => setBudgetHint(Number(e.target.value) || 0)}
                className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.09] focus:border-[#D4A853]/60 focus:outline-none rounded-xl px-3 py-2 text-xs font-mono-num text-[#F5F3EE]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="proposal-brief" className="block text-xs font-medium text-[#D8D5CD]">
              وصف طلب العميل (ملخص الاجتماع أو رسالة الواتساب)
            </label>
            <textarea
              id="proposal-brief"
              rows={5}
              disabled={isLocked}
              maxLength={LIMITS.MAX_BRIEF}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="اكتب احتياج العميل والمشاكل التي يعاني منها والنتيجة التي يتوقعها..."
              className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.09] focus:border-[#D4A853]/60 focus:outline-none rounded-xl px-3 py-2.5 text-xs text-[#F5F3EE] placeholder:text-[#6E6C66] leading-relaxed"
            />
            <div className="text-[11px] text-[#9A9891]">
              نصيحة: اذكر التحدي الحالي للعميل (مثل بطء الإنجاز أو فقدان العملاء) ليصيغ النظام عرضاً مقنعاً.
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={generating || isLocked}
              onClick={handleGenerateWithAI}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#D4A853] hover:bg-[#E5BE72] disabled:opacity-50 text-[#08080A] rounded-xl transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>{generating ? 'جارٍ هندسة العرض والباقات...' : 'توليد العرض الذكي بالذكاء الاصطناعي'}</span>
            </button>

            <button
              type="button"
              disabled={auditing}
              onClick={handleAuditDeal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#171920] hover:bg-[#20232D] disabled:opacity-50 text-[#F5F3EE] border border-[#F5EEE0]/10 rounded-xl transition-colors whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4 text-[#D4A853]" />
              <span>{auditing ? 'جارٍ الفحص...' : 'تشخيص فرصة الفوز'}</span>
            </button>
          </div>

          {auditResult && (
            <div className="pt-4 border-t border-[#F5EEE0]/[0.07] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#F5F3EE]">
                  تقييم احتمالية القبول التقديرية
                </span>
                <span className="text-sm font-bold font-mono-num text-[#34D399]">
                  {auditResult.estimatedWinRate}%
                </span>
              </div>
              <p className="text-xs text-[#D8D5CD] leading-relaxed">{auditResult.verdictHeadline}</p>
              <div className="space-y-2 text-xs">
                <div className="font-medium text-[#34D399]">نقاط القوة:</div>
                <ul className="space-y-1 text-[#D8D5CD] list-disc list-inside">
                  {auditResult.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
                <div className="font-medium text-[#E5BE72] pt-1">مخاطر السعر أو النطاق:</div>
                <ul className="space-y-1 text-[#D8D5CD] list-disc list-inside">
                  {auditResult.risks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
                <div className="font-medium text-[#F5F3EE] pt-1">تعديلات لرفع القبول:</div>
                <ul className="space-y-1 text-[#D8D5CD] list-disc list-inside">
                  {auditResult.actionableBoosts.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Left/Main Column: Editable Structured Proposal */}
        <div className="xl:col-span-7 bg-[#111216] border border-[#F5EEE0]/[0.08] rounded-2xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#F5EEE0]/[0.07]">
            <h2 className="font-display font-semibold text-base text-[#F5F3EE]">
              2. هيكلة العرض والباقات الثلاث
            </h2>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={saving || isLocked}
                onClick={() => handleSave(false)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#171920] hover:bg-[#20232D] disabled:opacity-50 text-[#F5F3EE] border border-[#F5EEE0]/10 rounded-xl transition-colors whitespace-nowrap"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'جارٍ الحفظ...' : 'حفظ المسودة'}</span>
              </button>
              <button
                type="button"
                disabled={saving || isLocked}
                onClick={() => handleSave(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#D4A853] hover:bg-[#E5BE72] disabled:opacity-50 text-[#08080A] rounded-xl transition-colors whitespace-nowrap"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>حفظ ومعاينة عرض العميل</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="exec-summary" className="block text-xs font-medium text-[#D8D5CD]">
              الملخص التنفيذي وفهم التحدي
            </label>
            <textarea
              id="exec-summary"
              rows={3}
              disabled={isLocked}
              maxLength={LIMITS.MAX_SUMMARY}
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              placeholder="صياغة تنفيذية تربط مشكلة العميل بالنتيجة المالية والتشغيلية..."
              className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.09] focus:border-[#D4A853]/60 focus:outline-none rounded-xl px-3 py-2.5 text-xs text-[#F5F3EE] leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-[#F5EEE0]/[0.07] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#D8D5CD]">
                مراحل التنفيذ والمخرجات ({scopeItems.length}/{LIMITS.MAX_SCOPE_ITEMS})
              </span>
              {!isLocked && scopeItems.length < LIMITS.MAX_SCOPE_ITEMS && (
                <button
                  type="button"
                  onClick={() =>
                    setScopeItems((prev) => [
                      ...prev,
                      { title: 'مرحلة جديدة', deliverable: 'تفصيل المخرج المطلوب', weeks: 1 },
                    ])
                  }
                  className="inline-flex items-center gap-1 text-xs text-[#E5BE72] hover:text-[#F5E6C4]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة مرحلة</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-[#F5EEE0]/[0.06] border border-[#F5EEE0]/[0.07] rounded-xl bg-[#0B0B0E]">
              {scopeItems.map((item, idx) => (
                <div key={idx} className="p-3.5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      disabled={isLocked}
                      maxLength={LIMITS.MAX_SCOPE_TITLE}
                      value={item.title}
                      onChange={(e) => updateScopeField(idx, { title: e.target.value })}
                      placeholder="عنوان المرحلة"
                      className="w-full bg-[#14151A] border border-[#F5EEE0]/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-[#F5F3EE]"
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      disabled={isLocked}
                      maxLength={LIMITS.MAX_SCOPE_DELIVERABLE}
                      value={item.deliverable}
                      onChange={(e) => updateScopeField(idx, { deliverable: e.target.value })}
                      placeholder="المخرج المتفق عليه"
                      className="w-full bg-[#14151A] border border-[#F5EEE0]/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-[#C8C5BD]"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-1.5">
                    <input
                      type="number"
                      disabled={isLocked}
                      min={1}
                      max={LIMITS.MAX_WEEKS}
                      value={item.weeks}
                      onChange={(e) =>
                        updateScopeField(idx, { weeks: Math.max(1, Number(e.target.value) || 1) })
                      }
                      className="w-full bg-[#14151A] border border-[#F5EEE0]/[0.08] rounded-lg px-2 py-1.5 text-xs font-mono-num text-[#F5F3EE]"
                    />
                    {!isLocked && scopeItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setScopeItems((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-1.5 text-[#6E6C66] hover:text-rose-400"
                        title="حذف المرحلة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#F5EEE0]/[0.07] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#D8D5CD]">
                باقات التسعير الثلاث (تثبيت السعر لرفع القبول فوق 30%)
              </span>
              <span className="text-xs font-mono-num text-[#E5BE72]">
                {formatMoney(packages[selectedPackageIndex]?.price || 0, currency)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map((pkg, idx) => {
                const isSelected = selectedPackageIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-xl p-4 border transition-colors space-y-3 ${
                      isSelected
                        ? 'bg-[#171920] border-[#D4A853]/55'
                        : 'bg-[#0B0B0E] border-[#F5EEE0]/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={() => {
                          setSelectedPackageIndex(idx);
                          onCoachTip?.(
                            `تم تحديد «${pkg.name}» كخيار مبدئي للصفقة. تذكّر وضع التوصية على الباقة الوسطى لرفع متوسط العائد.`
                          );
                        }}
                        className={`text-[11px] font-semibold ${
                          isSelected ? 'text-[#E5BE72]' : 'text-[#9A9891] hover:text-[#F5F3EE]'
                        }`}
                      >
                        {isSelected ? 'الباقة المختارة ✓' : 'اعتماد هذه الباقة'}
                      </button>
                      <label className="inline-flex items-center gap-1 text-[11px] text-[#9A9891] cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={isLocked}
                          checked={pkg.recommended}
                          onChange={(e) =>
                            updatePackageField(idx, { recommended: e.target.checked })
                          }
                          className="accent-[#D4A853]"
                        />
                        <span>موصى بها</span>
                      </label>
                    </div>

                    <input
                      type="text"
                      disabled={isLocked}
                      maxLength={LIMITS.MAX_PACKAGE_NAME}
                      value={pkg.name}
                      onChange={(e) => updatePackageField(idx, { name: e.target.value })}
                      className="w-full bg-[#14151A] border border-[#F5EEE0]/[0.08] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#F5F3EE]"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="block text-[10px] text-[#9A9891] mb-1">
                          السعر ({currency})
                        </span>
                        <input
                          type="number"
                          disabled={isLocked}
                          min={0}
                          max={LIMITS.MAX_PRICE}
                          value={pkg.price}
                          onChange={(e) =>
                            updatePackageField(idx, { price: Math.max(0, Number(e.target.value) || 0) })
                          }
                          className="w-full bg-[#14151A] border border-[#F5EEE0]/[0.08] rounded-lg px-2 py-1.5 text-xs font-mono-num text-[#E5BE72]"
                        />
                      </div>
                      <div>
                        <span className="block text-[10px] text-[#9A9891] mb-1">الأسابيع</span>
                        <input
                          type="number"
                          disabled={isLocked}
                          min={1}
                          max={LIMITS.MAX_WEEKS}
                          value={pkg.deliveryWeeks}
                          onChange={(e) =>
                            updatePackageField(idx, {
                              deliveryWeeks: Math.max(1, Number(e.target.value) || 1),
                            })
                          }
                          className="w-full bg-[#14151A] border border-[#F5EEE0]/[0.08] rounded-lg px-2 py-1.5 text-xs font-mono-num text-[#F5F3EE]"
                        />
                      </div>
                    </div>

                    <textarea
                      rows={4}
                      disabled={isLocked}
                      value={pkg.features.join('\n')}
                      onChange={(e) =>
                        updatePackageField(idx, {
                          features: e.target.value
                            .split('\n')
                            .map((line) => line.slice(0, LIMITS.MAX_FEATURE_TEXT))
                            .slice(0, LIMITS.MAX_FEATURES),
                        })
                      }
                      placeholder="ميزة في كل سطر..."
                      className="w-full bg-[#14151A] border border-[#F5EEE0]/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] text-[#D8D5CD] leading-relaxed"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#F5EEE0]/[0.07] grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <span className="block text-xs font-medium text-[#D8D5CD]">
                افتراضات حاسبة العائد المالي للعميل (ROI)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="block text-[10px] text-[#9A9891] mb-1">ساعات موفرة/شهر</span>
                  <input
                    type="number"
                    disabled={isLocked}
                    min={0}
                    max={10000}
                    value={roiAssumptions.monthlyHoursSaved}
                    onChange={(e) =>
                      setRoiAssumptions((r) => ({
                        ...r,
                        monthlyHoursSaved: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                    className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.08] rounded-lg px-2 py-1.5 text-xs font-mono-num text-[#F5F3EE]"
                  />
                </div>
                <div>
                  <span className="block text-[10px] text-[#9A9891] mb-1">تكلفة الساعة</span>
                  <input
                    type="number"
                    disabled={isLocked}
                    min={0}
                    max={50000}
                    value={roiAssumptions.hourlyRate}
                    onChange={(e) =>
                      setRoiAssumptions((r) => ({
                        ...r,
                        hourlyRate: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                    className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.08] rounded-lg px-2 py-1.5 text-xs font-mono-num text-[#F5F3EE]"
                  />
                </div>
                <div>
                  <span className="block text-[10px] text-[#9A9891] mb-1">نمو دخل/شهر</span>
                  <input
                    type="number"
                    disabled={isLocked}
                    min={0}
                    max={LIMITS.MAX_PRICE}
                    value={roiAssumptions.monthlyRevenueLift}
                    onChange={(e) =>
                      setRoiAssumptions((r) => ({
                        ...r,
                        monthlyRevenueLift: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                    className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.08] rounded-lg px-2 py-1.5 text-xs font-mono-num text-[#F5F3EE]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="terms-note" className="block text-xs font-medium text-[#D8D5CD]">
                شروط الدفع وضمان التنفيذ
              </label>
              <textarea
                id="terms-note"
                rows={3}
                disabled={isLocked}
                maxLength={LIMITS.MAX_TERMS}
                value={termsNote}
                onChange={(e) => setTermsNote(e.target.value)}
                className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.08] rounded-xl px-3 py-2 text-xs text-[#D8D5CD] leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
