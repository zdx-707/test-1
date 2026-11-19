export type CurrencyCode = 'SAR' | 'AED' | 'USD';

export type ProposalStatus = 'draft' | 'sent' | 'negotiating' | 'accepted' | 'rejected';

export type PackageTier = 'basic' | 'pro' | 'enterprise';

export type FollowupChannel = 'whatsapp' | 'email' | 'objection';

export type NavSection = 'pipeline' | 'studio' | 'offer' | 'clients' | 'objections';

// Synchronized validation constants matching firebase-blueprint.json & firestore.rules
export const LIMITS = {
  ID_PATTERN: /^[a-zA-Z0-9_\-]+$/,
  MAX_ID: 128,
  MAX_DISPLAY_NAME: 120,
  MAX_EMAIL: 200,
  MAX_COMPANY_NAME: 140,
  MAX_TAGLINE: 200,
  MAX_INDUSTRY: 80,
  MAX_PHONE: 40,
  MAX_NOTES: 1000,
  MAX_TITLE: 180,
  MAX_BRIEF: 4000,
  MAX_SUMMARY: 3000,
  MAX_TERMS: 1500,
  MAX_SCOPE_ITEMS: 12,
  MAX_SCOPE_TITLE: 140,
  MAX_SCOPE_DELIVERABLE: 500,
  MAX_PACKAGES: 3,
  MAX_PACKAGE_NAME: 100,
  MAX_FEATURES: 10,
  MAX_FEATURE_TEXT: 200,
  MAX_WEEKS: 104,
  MAX_PRICE: 100_000_000,
  MAX_FOLLOWUP_SUBJECT: 200,
  MAX_FOLLOWUP_MESSAGE: 4000,
  MAX_OBJECTION_SUMMARY: 400,
} as const;

export interface ScopeItem {
  title: string;
  deliverable: string;
  weeks: number;
}

export interface PricingPackage {
  tier: PackageTier;
  name: string;
  price: number;
  deliveryWeeks: number;
  features: string[];
  recommended: boolean;
}

export interface RoiAssumptions {
  monthlyHoursSaved: number;
  hourlyRate: number;
  monthlyRevenueLift: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  companyName: string;
  brandTagline: string;
  defaultCurrency: CurrencyCode;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ClientRecord {
  id: string;
  ownerUid: string;
  companyName: string;
  contactName: string;
  industry: string;
  email: string;
  phone: string;
  notes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ProposalRecord {
  id: string;
  ownerUid: string;
  clientId: string;
  clientName: string;
  title: string;
  industry: string;
  currency: CurrencyCode;
  status: ProposalStatus;
  brief: string;
  executiveSummary: string;
  scopeItems: ScopeItem[];
  timelineWeeks: number;
  packages: PricingPackage[];
  selectedPackageIndex: number;
  roiAssumptions: RoiAssumptions;
  dealValue: number;
  termsNote: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface FollowupRecord {
  id: string;
  ownerUid: string;
  channel: FollowupChannel;
  objectionSummary: string;
  subject: string;
  message: string;
  createdAt?: unknown;
}

export interface DealAuditResult {
  estimatedWinRate: number;
  verdictHeadline: string;
  strengths: string[];
  risks: string[];
  actionableBoosts: string[];
}

export interface ObjectionReplyResult {
  strategyName: string;
  subject: string;
  message: string;
  alternativeOffer: string;
}

export function formatMoney(amount: number, currency: CurrencyCode): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  const formatted = new Intl.NumberFormat('en-US').format(safe);
  return `${formatted} ${currency}`;
}

export function getStatusLabel(status: ProposalStatus): string {
  switch (status) {
    case 'draft':
      return 'مسودة';
    case 'sent':
      return 'مرسل';
    case 'negotiating':
      return 'قيد التفاوض';
    case 'accepted':
      return 'مقبول';
    case 'rejected':
      return 'مرفوض';
  }
}

export function sanitizeProposalPayload(p: Omit<ProposalRecord, 'id' | 'createdAt' | 'updatedAt'>) {
  const scopeItems = p.scopeItems.slice(0, LIMITS.MAX_SCOPE_ITEMS).map((item) => ({
    title: item.title.trim().slice(0, LIMITS.MAX_SCOPE_TITLE) || 'بند تنفيذ',
    deliverable: item.deliverable.trim().slice(0, LIMITS.MAX_SCOPE_DELIVERABLE) || 'تسليم المخرج المعتمد',
    weeks: Math.max(1, Math.min(LIMITS.MAX_WEEKS, Math.round(Number(item.weeks) || 1))),
  }));

  const packages = p.packages.slice(0, LIMITS.MAX_PACKAGES).map((pkg, idx) => {
    const tier: PackageTier =
      pkg.tier === 'basic' || pkg.tier === 'pro' || pkg.tier === 'enterprise'
        ? pkg.tier
        : idx === 0
          ? 'basic'
          : idx === 1
            ? 'pro'
            : 'enterprise';
    const features = pkg.features
      .map((f) => f.trim().slice(0, LIMITS.MAX_FEATURE_TEXT))
      .filter(Boolean)
      .slice(0, LIMITS.MAX_FEATURES);

    return {
      tier,
      name: pkg.name.trim().slice(0, LIMITS.MAX_PACKAGE_NAME) || `الباقة ${idx + 1}`,
      price: Math.max(0, Math.min(LIMITS.MAX_PRICE, Math.round(Number(pkg.price) || 0))),
      deliveryWeeks: Math.max(1, Math.min(LIMITS.MAX_WEEKS, Math.round(Number(pkg.deliveryWeeks) || 2))),
      features: features.length > 0 ? features : ['تسليم المشروع حسب النطاق المعتمد'],
      recommended: Boolean(pkg.recommended),
    };
  });

  const safePkgIndex = Math.max(0, Math.min(packages.length - 1, Math.round(Number(p.selectedPackageIndex) || 0)));
  const computedDealValue = packages[safePkgIndex]?.price ?? Math.max(0, Number(p.dealValue) || 0);

  return {
    ownerUid: p.ownerUid,
    clientId: LIMITS.ID_PATTERN.test(p.clientId) ? p.clientId : 'standalone',
    clientName: p.clientName.trim().slice(0, LIMITS.MAX_COMPANY_NAME) || 'عميل جديد',
    title: p.title.trim().slice(0, LIMITS.MAX_TITLE) || 'عرض مشروع تجاري',
    industry: p.industry.trim().slice(0, LIMITS.MAX_INDUSTRY) || 'الأعمال والخدمات',
    currency: p.currency,
    status: p.status,
    brief: p.brief.trim().slice(0, LIMITS.MAX_BRIEF) || 'وصف متطلبات المشروع',
    executiveSummary: p.executiveSummary.trim().slice(0, LIMITS.MAX_SUMMARY) || 'ملخص تنفيذي للمشروع',
    scopeItems: scopeItems.length > 0 ? scopeItems : [{ title: 'التأسيس والتسليم', deliverable: 'تنفيذ المتطلبات الأساسية', weeks: 2 }],
    timelineWeeks: Math.max(1, Math.min(LIMITS.MAX_WEEKS, Math.round(Number(p.timelineWeeks) || 4))),
    packages,
    selectedPackageIndex: safePkgIndex,
    roiAssumptions: {
      monthlyHoursSaved: Math.max(0, Math.min(10000, Number(p.roiAssumptions.monthlyHoursSaved) || 0)),
      hourlyRate: Math.max(0, Math.min(50000, Number(p.roiAssumptions.hourlyRate) || 0)),
      monthlyRevenueLift: Math.max(0, Math.min(LIMITS.MAX_PRICE, Number(p.roiAssumptions.monthlyRevenueLift) || 0)),
    },
    dealValue: Math.max(0, Math.min(LIMITS.MAX_PRICE, computedDealValue)),
    termsNote: p.termsNote.trim().slice(0, LIMITS.MAX_TERMS),
  };
}
