import { useState } from 'react';
import { Building2, Lightbulb, Plus, Sparkles, Trash2 } from 'lucide-react';
import { ClientRecord, CurrencyCode, LIMITS, ProposalRecord, formatMoney } from '../types';

interface ClientsViewProps {
  clients: ClientRecord[];
  proposals: ProposalRecord[];
  defaultCurrency: CurrencyCode;
  ownerUid: string;
  onSaveClient: (
    payload: Omit<ClientRecord, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => Promise<void>;
  onDeleteClient: (client: ClientRecord) => Promise<void>;
  onStartProposalForClient: (client: ClientRecord) => void;
}

export function ClientsView({
  clients,
  proposals,
  defaultCurrency,
  ownerUid,
  onSaveClient,
  onDeleteClient,
  onStartProposalForClient,
}: ClientsViewProps) {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [industry, setIndustry] = useState('التطوير العقاري');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!companyName.trim() || !contactName.trim()) {
      setErrorMsg('يرجى إدخال اسم الشركة واسم المسؤول.');
      return;
    }

    setSaving(true);
    try {
      await onSaveClient({
        ownerUid,
        companyName: companyName.trim().slice(0, LIMITS.MAX_COMPANY_NAME),
        contactName: contactName.trim().slice(0, LIMITS.MAX_DISPLAY_NAME),
        industry: industry.trim().slice(0, LIMITS.MAX_INDUSTRY) || 'الأعمال',
        email: email.trim().slice(0, LIMITS.MAX_EMAIL),
        phone: phone.trim().slice(0, LIMITS.MAX_PHONE),
        notes: notes.trim().slice(0, LIMITS.MAX_NOTES),
      });
      setCompanyName('');
      setContactName('');
      setEmail('');
      setPhone('');
      setNotes('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'تعذر حفظ بيانات العميل.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#14151B] border border-[#D4A853]/25 rounded-xl px-5 py-3.5 flex items-start gap-3 text-xs text-[#D8D5CD]">
        <Lightbulb className="w-4 h-4 text-[#D4A853] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-[#E5BE72]">نصيحة قاعدة العملاء: </span>
          أضف تفضيلات صانع القرار (مثل الميزانية أو شروط الدفع المفضلة) ليتم ربط كل عروضه المستقبلية ومتابعة إجمالي عوائده من مكان واحد.
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-4 bg-[#111216] border border-[#F5EEE0]/[0.08] rounded-2xl p-6 space-y-4"
        >
          <div className="pb-3 border-b border-[#F5EEE0]/[0.07]">
            <h2 className="font-display font-semibold text-base text-[#F5F3EE]">
              إضافة عميل جديد
            </h2>
          </div>

          {errorMsg && (
            <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="cli-company" className="block text-xs font-medium text-[#D8D5CD]">
              اسم الشركة / المؤسسة
            </label>
            <input
              id="cli-company"
              type="text"
              required
              maxLength={LIMITS.MAX_COMPANY_NAME}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="مثال: شركة آل سعيدان للعقارات"
              className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.09] focus:border-[#D4A853]/60 focus:outline-none rounded-xl px-3 py-2 text-xs text-[#F5F3EE]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="cli-contact" className="block text-xs font-medium text-[#D8D5CD]">
              اسم صانع القرار
            </label>
            <input
              id="cli-contact"
              type="text"
              required
              maxLength={LIMITS.MAX_DISPLAY_NAME}
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="مثال: مدير المبيعات والتطوير"
              className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.09] focus:border-[#D4A853]/60 focus:outline-none rounded-xl px-3 py-2 text-xs text-[#F5F3EE]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="cli-industry" className="block text-xs font-medium text-[#D8D5CD]">
              القطاع
            </label>
            <input
              id="cli-industry"
              type="text"
              maxLength={LIMITS.MAX_INDUSTRY}
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.09] focus:border-[#D4A853]/60 focus:outline-none rounded-xl px-3 py-2 text-xs text-[#F5F3EE]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="cli-email" className="block text-xs font-medium text-[#D8D5CD]">
                البريد الإلكتروني
              </label>
              <input
                id="cli-email"
                type="email"
                maxLength={LIMITS.MAX_EMAIL}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.09] rounded-xl px-3 py-2 text-xs font-mono-num text-[#F5F3EE]"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cli-phone" className="block text-xs font-medium text-[#D8D5CD]">
                رقم الجوال
              </label>
              <input
                id="cli-phone"
                type="text"
                maxLength={LIMITS.MAX_PHONE}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.09] rounded-xl px-3 py-2 text-xs font-mono-num text-[#F5F3EE]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="cli-notes" className="block text-xs font-medium text-[#D8D5CD]">
              ملاحظات التفاوض والتفضيلات
            </label>
            <textarea
              id="cli-notes"
              rows={3}
              maxLength={LIMITS.MAX_NOTES}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#0B0B0E] border border-[#F5EEE0]/[0.09] rounded-xl px-3 py-2 text-xs text-[#F5F3EE]"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#D4A853] hover:bg-[#E5BE72] disabled:opacity-50 text-[#08080A] rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{saving ? 'جارٍ الإضافة...' : 'حفظ العميل'}</span>
          </button>
        </form>

        <div className="xl:col-span-8 bg-[#111216] border border-[#F5EEE0]/[0.08] rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-[#F5EEE0]/[0.07] flex items-center justify-between">
            <h2 className="font-display font-semibold text-base text-[#F5F3EE]">
              دليل العملاء ({clients.length})
            </h2>
            <span className="text-xs text-[#9A9891]">مرتبط بسجل العروض</span>
          </div>

          {clients.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-2">
              <Building2 className="w-8 h-8 text-[#4F4D47] mx-auto" />
              <div className="text-sm font-medium text-[#F5F3EE]">لا يوجد عملاء مسجلون بعد</div>
              <p className="text-xs text-[#9A9891]">
                أضف عميلك الأول من النموذج الجانبي لربط العروض وحساب القيمة الإجمالية لكل عميل.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F5EEE0]/[0.06]">
              {clients.map((client) => {
                const linked = proposals.filter(
                  (p) => p.clientId === client.id || p.clientName === client.companyName
                );
                const totalVal = linked.reduce((s, p) => s + (Number(p.dealValue) || 0), 0);

                return (
                  <div
                    key={client.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-[#F5F3EE]">
                          {client.companyName}
                        </span>
                        <span className="text-[#4F4D47]" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-xs text-[#9A9891]">{client.industry}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#9A9891]">
                        <span>{client.contactName}</span>
                        {client.email && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-num">{client.email}</span>
                          </>
                        )}
                        {client.phone && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-num">{client.phone}</span>
                          </>
                        )}
                      </div>
                      {client.notes && (
                        <p className="text-xs text-[#6E6C66] pt-1 line-clamp-2">{client.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-left pl-2">
                        <div className="text-xs font-mono-num text-[#E5BE72]">
                          {formatMoney(totalVal, defaultCurrency)}
                        </div>
                        <div className="text-[11px] text-[#9A9891] font-mono-num">
                          {linked.length} عروض
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onStartProposalForClient(client)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#D4A853]/15 hover:bg-[#D4A853]/25 text-[#E5BE72] border border-[#D4A853]/35 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>عرض جديد</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteClient(client)}
                        title="حذف العميل"
                        className="p-2 rounded-lg text-[#9A9891] hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
