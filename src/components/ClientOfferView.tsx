import { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Check,
  CheckCircle2,
  Copy,
  Edit3,
  Lightbulb,
  Printer,
  Send,
} from 'lucide-react';
import { ProposalRecord, ProposalStatus, formatMoney, getStatusLabel } from '../types';

interface ClientOfferViewProps {
  proposal: ProposalRecord | null;
  companyName: string;
  brandTagline: string;
  onEditProposal: (proposal: ProposalRecord) => void;
  onSelectPackage: (proposal: ProposalRecord, pkgIndex: number) => void;
  onChangeStatus: (proposal: ProposalRecord, status: ProposalStatus) => void;
  onCoachTip?: (tip: string) => void;
}

const COVER_IMAGE_URL = '/src/assets/images/proposal_cover_obsidian_1795126681914.jpg';

export function ClientOfferView({
  proposal,
  companyName,
  brandTagline,
  onEditProposal,
  onSelectPackage,
  onChangeStatus,
  onCoachTip,
}: ClientOfferViewProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const [hoursSaved, setHoursSaved] = useState<number>(
    proposal?.roiAssumptions.monthlyHoursSaved ?? 60
  );
  const [hourlyRate, setHourlyRate] = useState<number>(
    proposal?.roiAssumptions.hourlyRate ?? 180
  );
  const [monthlyLift, setMonthlyLift] = useState<number>(
    proposal?.roiAssumptions.monthlyRevenueLift ?? 25000
  );

  useEffect(() => {
    if (proposal) {
      setHoursSaved(proposal.roiAssumptions.monthlyHoursSaved);
      setHourlyRate(proposal.roiAssumptions.hourlyRate);
      setMonthlyLift(proposal.roiAssumptions.monthlyRevenueLift);
    }
  }, [proposal]);

  const roiCalc = useMemo(() => {
    const selectedPkg =
      proposal?.packages[proposal.selectedPackageIndex] || proposal?.packages[0];
    const investment = Math.max(1, selectedPkg?.price || proposal?.dealValue || 1);
    const monthlySavings = hoursSaved * hourlyRate;
    const totalMonthlyValue = monthlySavings + monthlyLift;
    const annualValue = totalMonthlyValue * 12;
    const netAnnualRoi = annualValue - investment;
    const roiPct = Math.round((netAnnualRoi / investment) * 100);
    const paybackMonths =
      totalMonthlyValue > 0 ? Math.max(0.5, Number((investment / totalMonthlyValue).toFixed(1))) : 0;

    return {
      investment,
      monthlySavings,
      totalMonthlyValue,
      annualValue,
      netAnnualRoi,
      roiPct,
      paybackMonths,
    };
  }, [proposal, hoursSaved, hourlyRate, monthlyLift]);

  if (!proposal) {
    return (
      <div className="bg-[#111216] border border-[#F5EEE0]/[0.08] rounded-2xl py-16 px-6 text-center space-y-3">
        <h2 className="font-display font-semibold text-lg text-[#F5F3EE]">
          لم يتم اختيار عرض للمعاينة بعد
        </h2>
        <p className="text-xs text-[#9A9891]">
          اختر أي عرض من لوحة الصفقات أو أنشئ عرضاً جديداً من الاستوديو لمعاينة نسخة العميل التنفيذية.
        </p>
      </div>
    );
  }

  const isLocked = proposal.status === 'accepted' || proposal.status === 'rejected';

  const handleCopySummary = async () => {
    const pkg = proposal.packages[proposal.selectedPackageIndex] || proposal.packages[0];
    const text = [
      `عرض تجاري: ${proposal.title}`,
      `مقدم من: ${companyName || 'سَند الأعمال'} إلى: ${proposal.clientName}`,
      `الباقة المقترحة: ${pkg?.name || ''} — ${formatMoney(pkg?.price || proposal.dealValue, proposal.currency)}`,
      `مدة التنفيذ: ${pkg?.deliveryWeeks || proposal.timelineWeeks} أسابيع`,
      `العائد السنوي المتوقع للعميل: ${formatMoney(roiCalc.annualValue, proposal.currency)} (استرداد التكلفة خلال ${roiCalc.paybackMonths} شهر)`,
      '',
      proposal.executiveSummary,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCoachTip?.('تم نسخ الملخص التنفيذي؛ يمكنك لصقه الآن في رسالة واتساب أو إيميل سريع للعميل.');
    } catch {
      // ignore if clipboard unavailable
    }
  };

  return (
    <div className="space-y-6 print-full">
      {/* Beginner Inline Tip */}
      <div className="no-print bg-[#14151B] border border-[#D4A853]/25 rounded-xl px-5 py-3.5 flex items-start gap-3 text-xs text-[#D8D5CD]">
        <Lightbulb className="w-4 h-4 text-[#D4A853] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-[#E5BE72]">نصيحة العرض أمام العميل: </span>
          شارك هذه الشاشة في اجتماعك المباشر أو صدّرها PDF، ثم حرّك منزلقات حاسبة العائد مع العميل ليقتنع أن المشروع يسترد تكلفته خلال أشهر قليلة.
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="no-print bg-[#111216] border border-[#F5EEE0]/[0.08] rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#C8C5BD]">
          <span>حالة العرض الحالية:</span>
          <span className="font-semibold text-[#E5BE72]">{getStatusLabel(proposal.status)}</span>
          <span className="text-[#4F4D47]" aria-hidden="true">
            ·
          </span>
          <span className="font-mono-num text-[#F5F3EE]">
            {formatMoney(proposal.dealValue, proposal.currency)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!isLocked && (
            <button
              type="button"
              onClick={() => onEditProposal(proposal)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#171920] hover:bg-[#20232D] text-[#F5F3EE] border border-[#F5EEE0]/10 rounded-lg transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تعديل</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#171920] hover:bg-[#20232D] text-[#F5F3EE] border border-[#F5EEE0]/10 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم نسخ الملخص' : 'نسخ الملخص التنفيذي'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onCoachTip?.('اختر «حفظ بتنسيق PDF» من نافذة الطباعة لإرسال وثيقة فاخرة للعميل.');
              window.print();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#171920] hover:bg-[#20232D] text-[#F5F3EE] border border-[#F5EEE0]/10 rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة / تصدير PDF</span>
          </button>
          {!isLocked && proposal.status === 'draft' && (
            <button
              type="button"
              onClick={() => onChangeStatus(proposal, 'sent')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#D4A853] hover:bg-[#E5BE72] text-[#08080A] rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>اعتماد كـ مرسل</span>
            </button>
          )}
          {!isLocked && (
            <button
              type="button"
              onClick={() => onChangeStatus(proposal, 'accepted')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#34D399] hover:bg-[#4ADE80] text-[#08080A] rounded-lg transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تأكيد قبول العميل</span>
            </button>
          )}
        </div>
      </div>

      {/* Executive Client Offer Document */}
      <article className="bg-[#111216] border border-[#F5EEE0]/[0.08] rounded-2xl overflow-hidden">
        <div className="relative h-52 sm:h-60 w-full overflow-hidden border-b border-[#F5EEE0]/[0.08]">
          {!imgFailed ? (
            <img
              src={COVER_IMAGE_URL}
              alt="غلاف العرض التجاري التنفيذي"
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#08080A] via-[#171512] to-[#111216] flex items-center justify-center">
              <Briefcase className="w-12 h-12 text-[#D4A853]/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111216] via-[#111216]/75 to-black/30" />

          <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-4 text-xs text-[#D8D5CD]">
              <span className="font-semibold text-[#E5BE72]">
                {companyName || 'سَند الأعمال'}
              </span>
              <span className="text-[#D8D5CD]">{brandTagline || 'شريك التنفيذ والنمو الرقمي'}</span>
            </div>

            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#C8C5BD]">
                <span>مُعدّ خصيصاً لـ {proposal.clientName}</span>
                <span aria-hidden="true">·</span>
                <span>{proposal.industry}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num">{proposal.timelineWeeks} أسابيع تنفيذ</span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#F5F3EE] leading-snug">
                {proposal.title}
              </h2>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-10">
          <section className="space-y-3">
            <h3 className="font-display font-semibold text-lg text-[#F5F3EE]">
              01. الملخص التنفيذي والرؤية
            </h3>
            <p className="text-sm text-[#D8D5CD] leading-relaxed max-w-4xl">
              {proposal.executiveSummary}
            </p>
          </section>

          <section className="pt-8 border-t border-[#F5EEE0]/[0.07] space-y-4">
            <h3 className="font-display font-semibold text-lg text-[#F5F3EE]">
              02. نطاق العمل وخارطة التسليم
            </h3>
            <div className="divide-y divide-[#F5EEE0]/[0.06] border border-[#F5EEE0]/[0.08] rounded-xl bg-[#0B0B0E]">
              {proposal.scopeItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-[#F5F3EE]">
                      {String(idx + 1).padStart(2, '0')}. {item.title}
                    </div>
                    <div className="text-xs text-[#9A9891] leading-relaxed">
                      {item.deliverable}
                    </div>
                  </div>
                  <div className="text-xs font-mono-num text-[#E5BE72] whitespace-nowrap shrink-0">
                    {item.weeks} {item.weeks === 1 ? 'أسبوع' : 'أسابيع'}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="pt-8 border-t border-[#F5EEE0]/[0.07] space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display font-semibold text-lg text-[#F5F3EE]">
                03. خيارات الاستثمار والباقات المقترحة
              </h3>
              <span className="text-xs text-[#9A9891]">
                اختر الباقة الأنسب لأهدافكم لمقارنة العائد المالي أدناه
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {proposal.packages.map((pkg, idx) => {
                const isSelected = proposal.selectedPackageIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-xl p-6 border flex flex-col justify-between transition-colors ${
                      isSelected
                        ? 'bg-[#171920] border-[#D4A853]/65'
                        : 'bg-[#0B0B0E] border-[#F5EEE0]/[0.08]'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-[#9A9891] font-mono-num">
                          {pkg.deliveryWeeks} أسابيع
                        </span>
                        {pkg.recommended && (
                          <span className="font-semibold text-[#E5BE72]">الخيار الموصى به</span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-display font-semibold text-base text-[#F5F3EE]">
                          {pkg.name}
                        </h4>
                        <div className="mt-2 text-2xl font-bold font-mono-num text-[#F5F3EE]">
                          {formatMoney(pkg.price, proposal.currency)}
                        </div>
                      </div>

                      <ul className="pt-3 border-t border-[#F5EEE0]/[0.06] space-y-2.5 text-xs text-[#D8D5CD]">
                        {pkg.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-[#D4A853] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => onSelectPackage(proposal, idx)}
                      className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#D4A853] text-[#08080A]'
                          : 'bg-[#171920] hover:bg-[#20232D] text-[#F5F3EE] border border-[#F5EEE0]/10'
                      } disabled:opacity-60`}
                    >
                      {isSelected ? 'الباقة المحددة حالياً' : 'اختيار هذه الباقة'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="pt-8 border-t border-[#F5EEE0]/[0.07] space-y-5">
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-lg text-[#F5F3EE]">
                04. حاسبة العائد المالي وفترة الاسترداد (ROI)
              </h3>
              <p className="text-xs text-[#9A9891]">
                حرّك المؤشرات التالية لمحاكاة الأثر المالي السنوي للمشروع مقارنة بتكلفة الباقة المختارة.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0B0B0E] border border-[#F5EEE0]/[0.08] rounded-xl p-6">
              <div className="lg:col-span-6 space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#D8D5CD]">ساعات العمل الموفرة شهرياً</span>
                    <span className="font-mono-num text-[#E5BE72]">{hoursSaved} ساعة</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={400}
                    step={5}
                    value={hoursSaved}
                    onChange={(e) => setHoursSaved(Number(e.target.value))}
                    className="w-full accent-[#D4A853]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#D8D5CD]">متوسط تكلفة الساعة التشغيلية</span>
                    <span className="font-mono-num text-[#E5BE72]">
                      {formatMoney(hourlyRate, proposal.currency)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={800}
                    step={10}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full accent-[#D4A853]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#D8D5CD]">زيادة المبيعات أو الإيرادات الشهرية المتوقعة</span>
                    <span className="font-mono-num text-[#E5BE72]">
                      {formatMoney(monthlyLift, proposal.currency)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={250000}
                    step={1000}
                    value={monthlyLift}
                    onChange={(e) => setMonthlyLift(Number(e.target.value))}
                    className="w-full accent-[#D4A853]"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 grid grid-cols-2 gap-4 border-t lg:border-t-0 lg:border-r border-[#F5EEE0]/[0.07] pt-5 lg:pt-0 lg:pr-6">
                <div className="space-y-1">
                  <div className="text-xs text-[#9A9891]">القيمة المضافة السنوية</div>
                  <div className="text-xl font-bold font-mono-num text-[#F5F3EE]">
                    {formatMoney(roiCalc.annualValue, proposal.currency)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-[#9A9891]">صافي العائد بعد التكلفة</div>
                  <div
                    className={`text-xl font-bold font-mono-num ${
                      roiCalc.netAnnualRoi >= 0 ? 'text-[#34D399]' : 'text-[#E5BE72]'
                    }`}
                  >
                    {formatMoney(roiCalc.netAnnualRoi, proposal.currency)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-[#9A9891]">نسبة العائد على الاستثمار</div>
                  <div className="text-xl font-bold font-mono-num text-[#34D399]">
                    {roiCalc.roiPct}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-[#9A9891]">فترة استرداد التكلفة</div>
                  <div className="text-xl font-bold font-mono-num text-[#E5BE72]">
                    {roiCalc.paybackMonths > 0 ? `${roiCalc.paybackMonths} شهر` : 'غير محدد'}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {proposal.termsNote && (
            <section className="pt-6 border-t border-[#F5EEE0]/[0.07] space-y-2">
              <h3 className="font-display font-semibold text-sm text-[#F5F3EE]">
                05. شروط الدفع والضمان
              </h3>
              <p className="text-xs text-[#9A9891] leading-relaxed">{proposal.termsNote}</p>
            </section>
          )}
        </div>
      </article>
    </div>
  );
}
