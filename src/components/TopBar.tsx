import { Plus } from 'lucide-react';
import { NavSection } from '../types';

interface TopBarProps {
  activeSection: NavSection;
  activeProposalTitle?: string;
  onCreateNewProposal: () => void;
}

const SECTION_LABELS: Record<NavSection, string> = {
  pipeline: 'لوحة الصفقات ومؤشرات القبول',
  studio: 'استوديو إعداد العرض الذكي',
  offer: 'معاينة العرض التنفيذي وحاسبة العائد',
  clients: 'إدارة قاعدة العملاء',
  objections: 'مختبر الرد على الاعتراضات والمتابعة',
};

export function TopBar({
  activeSection,
  activeProposalTitle,
  onCreateNewProposal,
}: TopBarProps) {
  return (
    <header className="no-print h-16 px-6 lg:px-8 border-b border-[#F5EEE0]/[0.08] bg-[#08080A]/90 backdrop-blur-sm flex items-center justify-between gap-8 shrink-0">
      {/* Zone 1 & 2: Breadcrumb context */}
      <div className="flex items-center gap-2.5 min-w-0 text-sm">
        <span className="text-[#9A9891] whitespace-nowrap shrink-0">سَند الأعمال</span>
        <span className="text-[#4F4D47]" aria-hidden="true">
          /
        </span>
        <h1 className="font-display font-semibold text-[#F5F3EE] truncate">
          {SECTION_LABELS[activeSection]}
        </h1>
        {activeProposalTitle && (activeSection === 'studio' || activeSection === 'offer') && (
          <>
            <span className="hidden sm:inline text-[#4F4D47]" aria-hidden="true">
              ·
            </span>
            <span className="hidden sm:inline text-xs text-[#9A9891] truncate max-w-[260px]">
              {activeProposalTitle}
            </span>
          </>
        )}
      </div>

      {/* Zone 3: Single primary action in brushed gold */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onCreateNewProposal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#D4A853] hover:bg-[#E5BE72] text-[#08080A] rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء عرض جديد</span>
        </button>
      </div>
    </header>
  );
}
