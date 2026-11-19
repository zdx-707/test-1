import { User } from 'firebase/auth';
import {
  BarChart3,
  Briefcase,
  Compass,
  FileCheck2,
  LogIn,
  LogOut,
  MessageSquareQuote,
  Sparkles,
  Users,
} from 'lucide-react';
import { CurrencyCode, NavSection } from '../types';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onOpenOnboarding: () => void;
  user: User | null;
  authLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  companyName: string;
  onUpdateCompanyName: (name: string) => void;
  defaultCurrency: CurrencyCode;
  onUpdateCurrency: (currency: CurrencyCode) => void;
}

const NAV_ITEMS: { id: NavSection; label: string; hint: string; icon: typeof BarChart3 }[] = [
  { id: 'pipeline', label: 'لوحة الصفقات', hint: 'الفرص ومؤشر +30%', icon: BarChart3 },
  { id: 'studio', label: 'استوديو العروض', hint: 'بناء وتسعير ذكي', icon: Sparkles },
  { id: 'offer', label: 'معاينة العرض و ROI', hint: 'واجهة العميل والطباعة', icon: FileCheck2 },
  { id: 'clients', label: 'قاعدة العملاء', hint: 'صناع القرار', icon: Users },
  { id: 'objections', label: 'الاعتراضات والمتابعة', hint: 'ردود الإغلاق', icon: MessageSquareQuote },
];

export function Sidebar({
  activeSection,
  onSelectSection,
  onOpenOnboarding,
  user,
  authLoading,
  onSignIn,
  onSignOut,
  companyName,
  onUpdateCompanyName,
  defaultCurrency,
  onUpdateCurrency,
}: SidebarProps) {
  return (
    <aside className="no-print w-full lg:w-[264px] shrink-0 bg-[#0D0E12] border-b lg:border-b-0 lg:border-l border-[#F5EEE0]/[0.08] flex flex-col justify-between">
      <div className="p-5 space-y-6">
        {/* Bespoke Brand Signature */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#F5EEE0]/[0.07]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#D4A853]/12 border border-[#D4A853]/35 flex items-center justify-center text-[#E5BE72] shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-base text-[#F5F3EE] truncate">
                سَند الأعمال
              </div>
              <div className="text-[11px] text-[#9A9891] truncate">هندسة الصفقات والتسعير</div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-right transition-colors whitespace-nowrap shrink-0 border ${
                  isActive
                    ? 'bg-[#171920] text-[#F5F3EE] border-[#D4A853]/40'
                    : 'text-[#9A9891] hover:text-[#F5F3EE] hover:bg-white/[0.03] border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#D4A853]' : 'text-[#6E6C66] group-hover:text-[#D4A853]'
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium leading-tight">{item.label}</div>
                  <div className="hidden lg:block text-[11px] text-[#6E6C66] mt-0.5">
                    {item.hint}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Interactive Walkthrough Launcher */}
        <button
          type="button"
          onClick={onOpenOnboarding}
          className="hidden lg:flex w-full items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#14151A] hover:bg-[#191B22] border border-[#D4A853]/25 text-xs text-[#E5BE72] transition-colors"
        >
          <span className="inline-flex items-center gap-2 font-medium">
            <Compass className="w-4 h-4" />
            <span>جولة الشرح خطوة بخطوة</span>
          </span>
          <span className="text-[10px] font-mono-num text-[#9A9891]">5 نقاط</span>
        </button>

        {/* Workspace Settings */}
        <div className="hidden lg:block pt-4 border-t border-[#F5EEE0]/[0.07] space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="workspace-company-name"
              className="block text-xs font-medium text-[#9A9891]"
            >
              اسم منشأتك في العروض
            </label>
            <input
              id="workspace-company-name"
              type="text"
              value={companyName}
              maxLength={120}
              onChange={(e) => onUpdateCompanyName(e.target.value)}
              placeholder="مثال: استوديو آفاق الرقمي"
              className="w-full bg-[#14151A] border border-[#F5EEE0]/[0.08] focus:border-[#D4A853]/60 focus:outline-none rounded-lg px-3 py-2 text-xs text-[#F5F3EE] placeholder:text-[#6E6C66]"
            />
          </div>

          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-[#9A9891]">العملة الافتراضية</span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#14151A] border border-[#F5EEE0]/[0.08] rounded-lg">
              {(['SAR', 'AED', 'USD'] as CurrencyCode[]).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => onUpdateCurrency(curr)}
                  className={`py-1.5 text-xs font-mono-num rounded-md transition-colors whitespace-nowrap ${
                    defaultCurrency === curr
                      ? 'bg-[#D4A853] text-[#08080A] font-semibold'
                      : 'text-[#9A9891] hover:text-[#F5F3EE]'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Footer */}
      <div className="p-5 border-t border-[#F5EEE0]/[0.07]">
        {authLoading ? (
          <div className="h-10 rounded-lg bg-white/[0.04] animate-pulse" />
        ) : user ? (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#F5F3EE] truncate">
                {user.displayName || 'حساب موثّق'}
              </div>
              <div className="text-[11px] text-[#9A9891] truncate font-mono-num">
                {user.email}
              </div>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              title="تسجيل الخروج"
              className="p-2 rounded-lg text-[#9A9891] hover:text-rose-300 hover:bg-rose-500/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <p className="text-[11px] text-[#9A9891] leading-relaxed">
              وضع التجربة الفورية نشط. سجّل الدخول لحفظ صفقاتك سحابياً.
            </p>
            <button
              type="button"
              onClick={onSignIn}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-medium bg-[#171920] hover:bg-[#1E212B] text-[#F5F3EE] border border-[#D4A853]/30 rounded-lg transition-colors whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 text-[#D4A853]" />
              <span>تسجيل الدخول عبر Google</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
