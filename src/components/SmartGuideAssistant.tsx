import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  HelpCircle,
  Lightbulb,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { NavSection } from '../types';

export interface GuideStep {
  id: NavSection;
  stepNumber: string;
  title: string;
  summary: string;
  points: string[];
  actionLabel: string;
}

export const ONBOARDING_STEPS: GuideStep[] = [
  {
    id: 'pipeline',
    stepNumber: '01',
    title: 'لوحة الصفقات ومؤشر الـ 30% قبول',
    summary:
      'هذه هي غرفة القيادة اليومية؛ تتابع منها قيمة العروض المفتوحة والإيرادات المعتمدة ومعدل نجاحك في إغلاق الصفقات.',
    points: [
      'شريط الأداء العلوي يحسب تلقائياً نسبة القبول الفعلية ويقارنها بالهدف التجاري (30%+).',
      'الرسم البياني يوضح توزيع صفقاتك بين المسودات والتفاوض والصفقات المقبولة.',
      'يمكنك تغيير حالة أي صفقة مباشرة من الجدول أو الانتقال لمعاينة العميل بضغطة واحدة.',
    ],
    actionLabel: 'استعراض لوحة الصفقات',
  },
  {
    id: 'studio',
    stepNumber: '02',
    title: 'استوديو إعداد العرض الذكي',
    summary:
      'بدلاً من قضاء 5 ساعات في كتابة عرض من الصفر، حوّل طلب العميل إلى عرض تنفيذي كامل خلال ثوانٍ.',
    points: [
      'ابدأ باختيار أحد قوالب القطاعات الخمسة الجاهزة أو اكتب ملخص طلب العميل.',
      'اضغط «توليد العرض الذكي» ليتم بناء الملخص التنفيذي ومراحل العمل و3 باقات تسعير تلقائياً.',
      'استخدم «تشخيص فرصة الفوز» لاكتشاف أي ثغرة في السعر قبل إرسال العرض للعميل.',
    ],
    actionLabel: 'جرّب الاستوديو الآن',
  },
  {
    id: 'offer',
    stepNumber: '03',
    title: 'معاينة العميل وحاسبة العائد (ROI)',
    summary:
      'السر وراء تجاوز 30% قبول هو منح العميل 3 باقات واضحة مع إثبات مالي لعائده السنوي.',
    points: [
      'تثبيت السعر عبر 3 باقات يجعل العميل يختار «أي باقة تناسبه» بدلاً من رفض العرض.',
      'حرّك منزلقات حاسبة العائد مع العميل لتُريه بالأرقام كم شهراً يحتاج لاسترداد قيمة المشروع.',
      'استخدم زر «طباعة / تصدير PDF» لإخراج وثيقة تنفيذية فاخرة وجاهزة للتوقيع.',
    ],
    actionLabel: 'افتح معاينة العرض و ROI',
  },
  {
    id: 'clients',
    stepNumber: '04',
    title: 'قاعدة العملاء وصناع القرار',
    summary:
      'احفظ بيانات الشركات والمسؤولين وملاحظات التفاوض لكل عميل في ملف دائم.',
    points: [
      'أضف اسم الشركة، صانع القرار، البريد، والجوال لتتبع إجمالي قيمة العروض المرتبطة به.',
      'اضغط «عرض جديد» بجانب أي عميل لفتح الاستوديو معبأً ببياناته فوراً.',
    ],
    actionLabel: 'انتقل لقاعدة العملاء',
  },
  {
    id: 'objections',
    stepNumber: '05',
    title: 'مختبر الرد على الاعتراضات والمتابعة',
    summary:
      'إذا طلب العميل خصماً أو أجّل القرار، لا تخفض سعرك عشوائياً — صُغ رداً يحافظ على القيمة.',
    points: [
      'اختر العرض واختر الاعتراض الشائع (مثل: «السعر مرتفع» أو «المنافس أرخص»).',
      'يولّد النظام رسالة واتساب أو بريد إلكتروني مقنعة مع خيار بديل لتقسيم الدفعات أو تعديل النطاق.',
      'يُحفظ كل رد في سجل المتابعات الخاص بالصفقة للرجوع إليه لاحقاً.',
    ],
    actionLabel: 'جرّب مختبر الاعتراضات',
  },
];

const SCREEN_GUIDES: Record<
  NavSection,
  { title: string; points: string[]; bestPractice: string }
> = {
  pipeline: {
    title: 'دليل شاشة لوحة الصفقات',
    points: [
      'راجع الصفقات التي في مرحلة «قيد التفاوض» أولاً لأنها الأقرب للإغلاق.',
      'استخدم أزرار التصفية العلوية لعزل العروض المرسلة ومتابعتها خلال 48 ساعة.',
      'بعد إغلاق الصفقة كـ «مقبول»، تُقفل بنودها لحماية السجل؛ ويمكنك نسخها لإنشاء عرض جديد.',
    ],
    bestPractice: 'متابعة العرض خلال 48 ساعة من الإرسال ترفع فرص القبول بأكثر من الضعف.',
  },
  studio: {
    title: 'دليل استوديو العروض الذكي',
    points: [
      'أدخل هدف العميل الحقيقي في حقل «وصف طلب العميل» (مثلاً: تقليل الوقت أو زيادة المبيعات).',
      'اجعل الباقة الوسطى (الاحترافية) هي الموصى بها بحيث تعطي أفضل قيمة مقابل السعر.',
      'اضغط «تشخيص فرصة الفوز» قبل الحفظ للتأكد من عدم وجود فجوة تسعيرية.',
    ],
    bestPractice: 'تسمية الباقات بناءً على النتيجة (إطلاق سريع / نمو متكامل / منظومة شاملة) تقنع أصحاب القرار أسرع.',
  },
  offer: {
    title: 'دليل معاينة العرض وحاسبة ROI',
    points: [
      'اعرض هذه الشاشة أثناء اجتماعك المباشر مع العميل أو صدّرها بصيغة PDF.',
      'اختبر تعديل منزلقات الساعات الموفرة وزيادة الإيراد أمام العميل لإثبات فترة الاسترداد.',
      'غيّر الباقة المختارة لتتحدث قيمة الصفقة في النظام تلقائياً.',
    ],
    bestPractice: 'عندما يرى العميل أن فترة الاسترداد أقل من 4 أشهر، يتوقف عن الجدال حول السعر.',
  },
  clients: {
    title: 'دليل إدارة قاعدة العملاء',
    points: [
      'سجّل تفضيلات صانع القرار في حقل الملاحظات (مثل: يفضل الدفع على دفعتين أو التدريب الميداني).',
      'تابع إجمالي قيمة الفرص لكل عميل لتحديد أهم حساباتك الاستراتيجية.',
    ],
    bestPractice: 'تخصيص العرض بملاحظات الاجتماع الأول يجعل العميل يشعر أن الحل بُني له وحده.',
  },
  objections: {
    title: 'دليل مختبر الرد على الاعتراضات',
    points: [
      'اختر قناة التواصل المناسبة: واتساب للمتابعة السريعة، والبريد الإلكتروني للمدراء التنفيذيين.',
      'استفد من «الخيار البديل بدون حرق السعر» لتقليل النطاق بدلاً من تقديم خصم مجاني.',
    ],
    bestPractice: 'إذا خفضت السعر بدون مقابل يشعر العميل أن السعر الأول كان مبالغاً فيه؛ بدّل الدفعات أو النطاق بدلاً من ذلك.',
  },
};

interface AssistantAnswer {
  headline: string;
  steps: string[];
  proTip: string;
}

interface SmartGuideAssistantProps {
  activeSection: NavSection;
  onboardingOpen: boolean;
  onCloseOnboarding: () => void;
  onNavigateAndPractice: (section: NavSection) => void;
  assistantOpen: boolean;
  onToggleAssistant: (open: boolean) => void;
  activeTip: string | null;
  onDismissTip: () => void;
  tipsEnabled: boolean;
  onToggleTips: () => void;
}

export function SmartGuideAssistant({
  activeSection,
  onboardingOpen,
  onCloseOnboarding,
  onNavigateAndPractice,
  assistantOpen,
  onToggleAssistant,
  activeTip,
  onDismissTip,
  tipsEnabled,
  onToggleTips,
}: SmartGuideAssistantProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<AssistantAnswer | null>(null);
  const [askError, setAskError] = useState<string | null>(null);

  const currentStep = ONBOARDING_STEPS[stepIdx];
  const screenGuide = SCREEN_GUIDES[activeSection];

  const handleAskAssistant = async (customQ?: string) => {
    const q = (customQ ?? question).trim();
    if (q.length < 2) return;
    setAskError(null);
    setAsking(true);
    try {
      const res = await fetch('/api/assistant/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, currentSection: activeSection }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'تعذر الحصول على إجابة المساعد.');
      }
      setAnswer(data as AssistantAnswer);
      if (!customQ) setQuestion('');
    } catch (err) {
      setAskError(err instanceof Error ? err.message : 'تعذر الاتصال بالمساعد الذكي.');
    } finally {
      setAsking(false);
    }
  };

  return (
    <>
      {/* 1. First-Time Welcome & Step-by-Step Interactive Walkthrough Modal */}
      {onboardingOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="جولة المرشد الذكي"
          className="no-print fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="max-w-2xl w-full bg-[#111216] border border-[#D4A853]/30 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#F5EEE0]/[0.08] flex items-center justify-between gap-4 bg-[#15161B]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#D4A853]/15 border border-[#D4A853]/40 flex items-center justify-center text-[#E5BE72]">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base text-[#F5F3EE]">
                    مرحباً بك في سَند الأعمال — المرشد الذكي نقطة بنقطة
                  </h2>
                  <p className="text-xs text-[#9A9891]">
                    دليل تفاعلي سريع يعلّمك استخدام المنصة كاملة في أقل من دقيقة
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseOnboarding}
                aria-label="إغلاق الدليل"
                className="p-2 rounded-lg text-[#9A9891] hover:text-[#F5F3EE] hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="px-6 pt-5 flex items-center gap-2">
              {ONBOARDING_STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStepIdx(idx)}
                  className={`flex-1 h-1.5 rounded-full transition-colors ${
                    idx <= stepIdx ? 'bg-[#D4A853]' : 'bg-white/[0.08]'
                  }`}
                  aria-label={`الخطوة ${s.stepNumber}`}
                />
              ))}
            </div>

            {/* Step Content */}
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <div className="text-xs font-mono-num text-[#D4A853]">
                  الخطوة {currentStep.stepNumber} من 0{ONBOARDING_STEPS.length}
                </div>
                <h3 className="font-display font-bold text-xl text-[#F5F3EE]">
                  {currentStep.title}
                </h3>
                <p className="text-sm text-[#C8C5BD] leading-relaxed">{currentStep.summary}</p>
              </div>

              <div className="bg-[#0B0B0E] border border-[#F5EEE0]/[0.07] rounded-xl p-4 space-y-2.5">
                {currentStep.points.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#E5E2DA] leading-relaxed">
                    <span className="font-mono-num text-[#D4A853] font-semibold mt-0.5">
                      {i + 1}.
                    </span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              {/* Footer Controls */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={stepIdx === 0}
                    onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#171920] hover:bg-[#1F222C] disabled:opacity-40 text-[#F5F3EE] border border-[#F5EEE0]/[0.08] rounded-lg transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>السابق</span>
                  </button>

                  {stepIdx < ONBOARDING_STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setStepIdx((i) => i + 1)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#D4A853] hover:bg-[#E5BE72] text-[#08080A] rounded-lg transition-colors"
                    >
                      <span>النقطة التالية</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onCloseOnboarding}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#D4A853] hover:bg-[#E5BE72] text-[#08080A] rounded-lg transition-colors"
                    >
                      <span>أنهيت الشرح — ابدأ العمل</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onNavigateAndPractice(currentStep.id);
                    onCloseOnboarding();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#E5BE72] hover:text-[#F5E6C4] border border-[#D4A853]/30 hover:border-[#D4A853]/60 rounded-lg transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{currentStep.actionLabel}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Live Contextual Coaching Tip Toast (appears when new user performs actions) */}
      {tipsEnabled && activeTip && !onboardingOpen && (
        <div className="no-print fixed bottom-20 left-6 z-40 max-w-sm bg-[#15161B] border border-[#D4A853]/35 rounded-xl p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#E5BE72]">
              <Lightbulb className="w-4 h-4 shrink-0" />
              <span>نصيحة الاستخدام الفورية</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleTips}
                className="text-[11px] text-[#9A9891] hover:text-[#F5F3EE]"
              >
                إيقاف النصائح
              </button>
              <button
                type="button"
                onClick={onDismissTip}
                aria-label="إغلاق النصيحة"
                className="text-[#9A9891] hover:text-[#F5F3EE]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-xs text-[#E5E2DA] leading-relaxed">{activeTip}</p>
        </div>
      )}

      {/* 3. Persistent Dockable Smart Assistant Drawer */}
      {assistantOpen && (
        <div
          role="complementary"
          aria-label="مساعد سَند الذكي"
          className="no-print fixed bottom-20 left-6 z-40 w-[min(410px,calc(100vw-2rem))] max-h-[75vh] bg-[#111216] border border-[#D4A853]/35 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[#F5EEE0]/[0.08] bg-[#15161B] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#D4A853]" />
              <span className="font-display font-bold text-sm text-[#F5F3EE]">
                مساعد سَند الذكي
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleTips}
                className="text-[11px] text-[#9A9891] hover:text-[#E5BE72] transition-colors"
              >
                {tipsEnabled ? 'إخفاء النصائح' : 'تفعيل النصائح'}
              </button>
              <button
                type="button"
                onClick={() => onToggleAssistant(false)}
                aria-label="إغلاق المساعد"
                className="p-1.5 text-[#9A9891] hover:text-[#F5F3EE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-5 overflow-y-auto space-y-5 text-xs">
            {/* Contextual Screen Guide */}
            <div className="space-y-2.5">
              <div className="font-display font-semibold text-sm text-[#E5BE72]">
                {screenGuide.title}
              </div>
              <div className="bg-[#0B0B0E] border border-[#F5EEE0]/[0.06] rounded-xl p-3.5 space-y-2">
                {screenGuide.points.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2 text-[#E5E2DA] leading-relaxed">
                    <span className="font-mono-num text-[#D4A853] font-semibold">{i + 1}.</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-[#9A9891] leading-relaxed">
                <span className="text-[#34D399] font-semibold">أفضل ممارسة: </span>
                {screenGuide.bestPractice}
              </div>
            </div>

            {/* Interactive AI Q&A */}
            <div className="pt-4 border-t border-[#F5EEE0]/[0.07] space-y-3">
              <div className="font-semibold text-[#F5F3EE]">اسأل المساعد عن أي خطوة أو صفقة</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'كيف أبدأ أول عرض لي؟',
                  'كيف أقنع عميلاً يطلب خصماً؟',
                  'ما أفضل تسعير لـ 3 باقات؟',
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleAskAssistant(q)}
                    className="text-[11px] bg-[#171920] hover:bg-[#1F222C] text-[#D8D5CD] border border-[#F5EEE0]/[0.08] rounded-lg px-2.5 py-1.5 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {askError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
                  {askError}
                </div>
              )}

              {answer && (
                <div className="bg-[#171920] border border-[#D4A853]/25 rounded-xl p-3.5 space-y-2">
                  <div className="font-semibold text-[#E5BE72]">{answer.headline}</div>
                  <ol className="space-y-1.5 text-[#E5E2DA] leading-relaxed">
                    {answer.steps.map((st, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-mono-num text-[#D4A853]">{idx + 1}.</span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="pt-1 border-t border-[#F5EEE0]/[0.06] text-[11px] text-[#34D399]">
                    {answer.proTip}
                  </div>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskAssistant();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="اكتب سؤالك هنا..."
                  className="flex-1 bg-[#0B0B0E] border border-[#F5EEE0]/[0.1] focus:border-[#D4A853]/60 focus:outline-none rounded-lg px-3 py-2 text-xs text-[#F5F3EE] placeholder:text-[#6E6C66]"
                />
                <button
                  type="submit"
                  disabled={asking}
                  aria-label="إرسال السؤال"
                  className="p-2 rounded-lg bg-[#D4A853] hover:bg-[#E5BE72] disabled:opacity-50 text-[#08080A] transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Floating Smart Assistant Trigger Button */}
      <button
        type="button"
        onClick={() => onToggleAssistant(!assistantOpen)}
        className="no-print fixed bottom-5 left-6 z-40 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#171920] hover:bg-[#1E212B] text-[#E5BE72] border border-[#D4A853]/40 rounded-xl shadow-lg transition-colors whitespace-nowrap"
      >
        <HelpCircle className="w-4 h-4" />
        <span>{assistantOpen ? 'إخفاء المساعد' : 'المساعد الذكي والشرح'}</span>
      </button>
    </>
  );
}
