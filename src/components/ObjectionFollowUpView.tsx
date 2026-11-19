import { useEffect, useState } from 'react';
import { Check, Copy, Lightbulb, MessageSquareQuote, Sparkles } from 'lucide-react';
import {
  FollowupChannel,
  FollowupRecord,
  ObjectionReplyResult,
  ProposalRecord,
  formatMoney,
} from '../types';

interface ObjectionFollowUpViewProps {
  proposals: ProposalRecord[];
  activeProposalId?: string;
  companyName: string;
  onLoadFollowups: (proposalId: string) => Promise<FollowupRecord[]>;
  onSaveFollowup: (
    proposalId: string,
    item: Omit<FollowupRecord, 'id' | 'createdAt'>
  ) => Promise<void>;
  ownerUid: string;
  onCoachTip?: (tip: string) => void;
}

const COMMON_OBJECTIONS = [
  'الميزانية الحالية لدينا أقل من السعر المعروض، هل يوجد خصم؟',
  'نحتاج تأجيل القرار إلى الشهر القادم لمناقشة الشركاء.',
  'وصلنا عرض منافس بسعر أقل بنسبة 30%.',
  'نريد البدء بجزء بسيط فقط قبل الالتزام بالباقة الكاملة.',
];

export function ObjectionFollowUpView({
  proposals,
  activeProposalId,
  companyName,
  onLoadFollowups,
  onSaveFollowup,
  ownerUid,
  onCoachTip,
}: ObjectionFollowUpViewProps) {
  const [selectedProposalId, setSelectedProposalId] = useState<string>(
    activeProposalId || proposals[0]?.id || ''
  );
  const [channel, setChannel] = useState<FollowupChannel>('whatsapp');
  const [objectionText, setObjectionText] = useState<string>(COMMON_OBJECTIONS[0]);
  const [loadingReply, setLoadingReply] = useState(false);
  const [result, setResult] = useState<ObjectionReplyResult | null>(null);
  const [history, setHistory] = useState<FollowupRecord[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedProposal = proposals.find((p) => p.id === selectedProposalId) || proposals[0];

  useEffect(() => {
    if (!selectedProposalId && proposals[0]?.id) {
      setSelectedProposalId(proposals[0].id);
    }
  }, [proposals, selectedProposalId]);

  useEffect(() => {
    if (!selectedProposal?.id) {
      setHistory([]);
      return;
    }
    let mounted = true;
    onLoadFollowups(selectedProposal.id)
      .then((items) => {
        if (mounted) setHistory(items);
      })
      .catch(() => {
        if (mounted) setHistory([]);
      });
    return () => {
      mounted = false;
    };
  }, [selectedProposal?.id, onLoadFollowups]);

  const handleGenerateReply = async () => {
    setErrorMsg(null);
    if (!selectedProposal) {
      setErrorMsg('يرجى إنشاء عرض واحد على الأقل أولاً.');
      return;
    }
    if (objectionText.trim().length < 3) {
      setErrorMsg('يرجى كتابة اعتراض العميل أو الموقف التفاوضي.');
      return;
    }

    setLoadingReply(true);
    try {
      const res = await fetch('/api/proposals/objection-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalTitle: selectedProposal.title,
          clientName: selectedProposal.clientName,
          currency: selectedProposal.currency,
          dealValue: selectedProposal.dealValue,
          objectionText,
          channel,
          companyName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'تعذر توليد الرد التفاوضي.');
      }
      const reply = data as ObjectionReplyResult;
      setResult(reply);

      await onSaveFollowup(selectedProposal.id, {
        ownerUid,
        channel,
        objectionSummary: objectionText.trim().slice(0, 400),
        subject: reply.subject.slice(0, 200),
        message: reply.message.slice(0, 4000),
      });
      const updated = await onLoadFollowups(selectedProposal.id);
      setHistory(updated);
      onCoachTip?.('تم توليد الرد وحفظه في سجل الصفقة. انسخ الرسالة وأرسلها مع الخيار البديل إذا لزم الأمر.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'حدث خطأ أثناء توليد الرد.');
    } finally {
      setLoadingReply(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#14151B] border border-[#D4A853]/25 rounded-xl px-5 py-3.5 flex items-start gap-3 text-xs text-[#D8D5CD]">
        <Lightbulb className="w-4 h-4 text-[#D4A853] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-[#E5BE72]">قاعدة التفاوض الذهبية: </span>
          عندما يقول العميل «السعر مرتفع»، لا تمنحه خصماً مجانياً يضعف ثقته؛ استخدم هذا المختبر لتقديم رد يركز على العائد أو تقسيم الدفعات.
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-5 bg-[#111216] border border-[#F5EEE0]/[0.08] rounded-2xl p-6 space-y-5">
          <div className="pb-3 border-b border-[#F5EEE0]/[0.07] flex items-center justify-between">
            <h2 className="font-display font-semibold text-base text-[#F5F3EE]">
              مختبر الرد على الاعتراضات
            </h2>
            <MessageSquareQuote className="w-4 h-4 text-[#D4A853]" />
          </div>

          {errorMsg && (
            <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="obj-proposal" className="block text-xs font-medium text-[#D8D5CD]">
              اختر العرض المرتبط
            </label>
            <select
              id="obj-proposal"
              value={selectedProposal?.id || ''}
              onChange={(e) => setSelectedProposalId(e.target.value)}
              className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.09] rounded-xl px-3 py-2 text-xs text-[#F5F3EE]"
            >
              {proposals.length === 0 ? (
                <option value="">لا توجد عروض متاحة</option>
              ) : (
                proposals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} — {p.clientName} ({formatMoney(p.dealValue, p.currency)})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-[#D8D5CD]">قناة الإرسال</span>
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#0B0B0E] border border-[#F5EEE0]/[0.08] rounded-xl">
              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className={`py-2 text-xs font-medium rounded-lg transition-colors ${
                  channel === 'whatsapp'
                    ? 'bg-[#171920] text-[#E5BE72]'
                    : 'text-[#9A9891] hover:text-[#F5F3EE]'
                }`}
              >
                رسالة واتساب تنفيذية
              </button>
              <button
                type="button"
                onClick={() => setChannel('email')}
                className={`py-2 text-xs font-medium rounded-lg transition-colors ${
                  channel === 'email'
                    ? 'bg-[#171920] text-[#E5BE72]'
                    : 'text-[#9A9891] hover:text-[#F5F3EE]'
                }`}
              >
                بريد إلكتروني رسمي
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-medium text-[#D8D5CD]">اعتراضات شائعة</span>
            <div className="flex flex-col gap-1.5">
              {COMMON_OBJECTIONS.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setObjectionText(preset)}
                  className="text-right text-[11px] text-[#C8C5BD] hover:text-[#E5BE72] bg-[#0B0B0E] border border-[#F5EEE0]/[0.07] hover:border-[#D4A853]/35 rounded-xl px-3 py-2 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="obj-text" className="block text-xs font-medium text-[#D8D5CD]">
              نص اعتراض العميل أو الموقف
            </label>
            <textarea
              id="obj-text"
              rows={3}
              maxLength={400}
              value={objectionText}
              onChange={(e) => setObjectionText(e.target.value)}
              className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.09] rounded-xl px-3 py-2 text-xs text-[#F5F3EE] leading-relaxed"
            />
          </div>

          <button
            type="button"
            disabled={loadingReply || !selectedProposal}
            onClick={handleGenerateReply}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#D4A853] hover:bg-[#E5BE72] disabled:opacity-50 text-[#08080A] rounded-xl transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loadingReply ? 'جارٍ صياغة الرد...' : 'توليد وحفظ رد الإغلاق'}</span>
          </button>
        </div>

        <div className="xl:col-span-7 space-y-6">
          {result && (
            <div className="bg-[#111216] border border-[#D4A853]/40 rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F5EEE0]/[0.07]">
                <div>
                  <div className="text-[11px] text-[#E5BE72] font-medium">
                    التكتيك المقترح: {result.strategyName}
                  </div>
                  <h3 className="font-display font-semibold text-base text-[#F5F3EE] mt-0.5">
                    {result.subject}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(result.message)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#171920] hover:bg-[#20232D] text-[#F5F3EE] border border-[#F5EEE0]/10 rounded-lg"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-[#34D399]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copied ? 'تم النسخ' : 'نسخ الرسالة'}</span>
                </button>
              </div>

              <div className="bg-[#0B0B0E] border border-[#F5EEE0]/[0.07] rounded-xl p-4 text-xs text-[#E5E2DA] leading-relaxed whitespace-pre-line">
                {result.message}
              </div>

              <div className="text-xs text-[#D8D5CD] pt-1">
                <span className="font-semibold text-[#E5BE72]">خيار بديل بدون حرق السعر: </span>
                {result.alternativeOffer}
              </div>
            </div>
          )}

          <div className="bg-[#111216] border border-[#F5EEE0]/[0.08] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#F5EEE0]/[0.07] flex items-center justify-between">
              <h3 className="font-display font-semibold text-sm text-[#F5F3EE]">
                سجل المتابعات المحفوظة للعرض ({history.length})
              </h3>
              <span className="text-xs text-[#9A9891]">
                {selectedProposal?.clientName || ''}
              </span>
            </div>

            {history.length === 0 ? (
              <div className="p-10 text-center text-xs text-[#9A9891]">
                لا توجد ردود متابعة محفوظة لهذا العرض بعد. ولّد أول رد ليتم توثيقه هنا.
              </div>
            ) : (
              <div className="divide-y divide-[#F5EEE0]/[0.06]">
                {history.map((item) => (
                  <div key={item.id} className="p-5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#F5F3EE]">{item.subject}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.message)}
                        className="text-[11px] text-[#E5BE72] hover:text-[#F5E6C4]"
                      >
                        نسخ
                      </button>
                    </div>
                    <p className="text-xs text-[#C8C5BD] leading-relaxed whitespace-pre-line">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
