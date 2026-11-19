import { ClientRecord, ProposalRecord } from '../types';

export interface IndustryPreset {
  id: string;
  sectorLabel: string;
  targetCompanyExample: string;
  projectTitle: string;
  budgetHint: number;
  brief: string;
}

// 5 High-Ticket B2B Target Sectors ready for 1-click proposal testing & pitching
export const TARGET_SECTOR_PRESETS: IndustryPreset[] = [
  {
    id: 'retail-ecommerce',
    sectorLabel: 'التجزئة والتجارة الإلكترونية',
    targetCompanyExample: 'سلاسل المتاجر والعلامات التجارية (مثل: متاجر العطور والتمور والأزياء)',
    projectTitle: 'إعادة بناء متجر التجارة الإلكترونية وأتمتة رفع معدل التحويل',
    budgetHint: 45000,
    brief:
      'نرغب في تطوير تجربة شراء سريعة متعددة المستودعات، ربط بوابات الدفع والشحن المحلية، بناء مسار استعادة السلات المتروكة، ولوحة متابعة مبيعات يومية لرفع متوسط قيمة الطلب بنسبة 25%.',
  },
  {
    id: 'real-estate',
    sectorLabel: 'التطوير والوساطة العقارية',
    targetCompanyExample: 'شركات التطوير العقاري ومكاتب إدارة الأملاك',
    projectTitle: 'منصة حجز الوحدات العقارية وتأهيل العملاء المحتملين آلياً',
    budgetHint: 65000,
    brief:
      'لدينا مشاريع سكنية وتجارية جديدة ونحتاج بوابة عرض تفاعلية للوحدات مع خطط الدفع، نظام فرز وتوزيع العملاء على فريق المبيعات، وتقارير أداء أسبوعية للإدارة.',
  },
  {
    id: 'medical-clinics',
    sectorLabel: 'العيادات والمجمعات الطبية',
    targetCompanyExample: 'المراكز الطبية التخصصية وعيادات التجميل والأسنان',
    projectTitle: 'نظام إدارة رحلة المريض وتقليل فجوة المواعيد الملغاة',
    budgetHint: 38000,
    brief:
      'نعاني من ارتفاع نسبة تغيب المراجعين وتشتت الحجوزات بين الواتساب والاتصال. نريد نظام حجز موحد، تذكيرات آلية قبل الموعد، وعرض باقات المتابعة السنوية.',
  },
  {
    id: 'logistics-contracting',
    sectorLabel: 'المقاولات والخدمات اللوجستية',
    targetCompanyExample: 'شركات التشغيل والصيانة والمقاولات الهندسية',
    projectTitle: 'بوابة تسعير المناقصات وتتبع عقود الصيانة الدورية',
    budgetHint: 75000,
    brief:
      'نحتاج رقمنة دورة إعداد كراسات الأسعار للمشاريع، تتبع هوامش الربح لكل عقد صيانة، وإصدار تقارير الإنجاز الشهرية للعملاء المؤسسيين بشكل آلي.',
  },
  {
    id: 'b2b-saas-agencies',
    sectorLabel: 'وكالات التسويق والشركات التقنية',
    targetCompanyExample: 'وكالات النمو الرقمي ومكاتب الاستشارات الإدارية',
    projectTitle: 'منظومة أتمتة المبيعات وبناء عروض القيمة للعملاء المؤسسيين',
    budgetHint: 32000,
    brief:
      'نخسر وقتاً طويلاً في تجهيز العروض الفنية والمالية يدوياً. نريد توحيد قوالب العروض في 3 باقات واضحة مع حاسبة عائد استثمار ترفع نسبة قبول العقود.',
  },
];

export const SANDBOX_CLIENTS: ClientRecord[] = [
  {
    id: 'demo-client-1',
    ownerUid: 'demo',
    companyName: 'مجموعة المدار للتطوير العقاري',
    contactName: 'خالد السبيعي',
    industry: 'التطوير العقاري',
    email: 'k.alsubaie@almadar-re.sa',
    phone: '+966 55 412 8890',
    notes: 'يفضل الباقات التي تتضمن تدريباً لفريق المبيعات وضمان دعم 90 يوماً.',
  },
  {
    id: 'demo-client-2',
    ownerUid: 'demo',
    companyName: 'عيادات أفق التخصصية',
    contactName: 'د. سارة العتيبي',
    industry: 'الرعاية الصحية',
    email: 'sara@ofoqclinics.sa',
    phone: '+966 50 931 4401',
    notes: 'تهتم بعائد تقليل غياب المراجعين وسرعة التنفيذ خلال 6 أسابيع.',
  },
];

export const SANDBOX_PROPOSALS: ProposalRecord[] = [
  {
    id: 'demo-prop-1',
    ownerUid: 'demo',
    clientId: 'demo-client-1',
    clientName: 'مجموعة المدار للتطوير العقاري',
    title: 'منصة حجز الوحدات وتأهيل مشتري العقار',
    industry: 'التطوير العقاري',
    currency: 'SAR',
    status: 'negotiating',
    brief:
      'إطلاق بوابة حجز وحدات لمشروعين سكنيين مع ربط CRM وتوزيع العملاء على 12 مستشار مبيعات.',
    executiveSummary:
      'تواجه مشاريع التطوير العقاري تسرباً في العملاء المحتملين نتيجة بطء الاستجابة وتشتت جداول الوحدات. يهدف هذا المقترح إلى بناء بوابة حجز وتأهيل موحدة ترفع سرعة استجابة فريق المبيعات وتضاعف وضوح حالة الوحدات لحظياً.',
    scopeItems: [
      {
        title: 'هندسة رحلة المشتري وربط CRM',
        deliverable: 'تصميم مسار التأهيل الذكي وربط نماذج التسجيل المباشر بقاعدة بيانات المبيعات.',
        weeks: 2,
      },
      {
        title: 'بوابة استعراض وحجز الوحدات',
        deliverable: 'واجهة تفاعلية لعرض المخططات وحالة كل وحدة وخطة الدفعات المبدئية.',
        weeks: 3,
      },
      {
        title: 'لوحة مؤشرات الإدارة والتدريب',
        deliverable: 'تقارير معدل التحويل لكل مستشار مبيعات مع تدريب عملي للفريق.',
        weeks: 1,
      },
    ],
    timelineWeeks: 6,
    packages: [
      {
        tier: 'basic',
        name: 'الباقة الأساسية — الإطلاق السريع',
        price: 38000,
        deliveryWeeks: 4,
        recommended: false,
        features: [
          'بوابة عرض لمشروع عقاري واحد',
          'نماذج تأهيل العملاء وربط البريد',
          'تقرير أداء أسبوعي بصيغة PDF',
          'دعم فني لمدة 30 يوماً',
        ],
      },
      {
        tier: 'pro',
        name: 'الباقة الاحترافية — النمو المتكامل',
        price: 58000,
        deliveryWeeks: 6,
        recommended: true,
        features: [
          'دعم حتى 3 مشاريع عقارية متزامنة',
          'توزيع آلي للعملاء على مستشاري المبيعات',
          'حاسبة تمويل ودفعات تفاعلية للعميل',
          'تدريب الفريق وضمان دعم 90 يوماً',
        ],
      },
      {
        tier: 'enterprise',
        name: 'الباقة المؤسسية — المنظومة الشاملة',
        price: 92000,
        deliveryWeeks: 8,
        recommended: false,
        features: [
          'مشاريع غير محدودة مع ربط ERP و CRM مخصص',
          'أتمتة متابعة الواتساب ورسائل التذكير',
          'لوحة قياس تنفيذية لإدارة المحفظة',
          'اتفاقية مستوى خدمة SLA لمدة 12 شهراً',
        ],
      },
    ],
    selectedPackageIndex: 1,
    roiAssumptions: {
      monthlyHoursSaved: 95,
      hourlyRate: 180,
      monthlyRevenueLift: 42000,
    },
    dealValue: 58000,
    termsNote: '50% دفعة تعاقد، 30% عند تسليم النسخة التجريبية، 20% عند الإطلاق والاعتماد النهائي.',
  },
  {
    id: 'demo-prop-2',
    ownerUid: 'demo',
    clientId: 'demo-client-2',
    clientName: 'عيادات أفق التخصصية',
    title: 'أتمتة الحجوزات واستبقاء المراجعين',
    industry: 'الرعاية الصحية',
    currency: 'SAR',
    status: 'accepted',
    brief: 'توحيد الحجوزات وتقليل التغيب عن المواعيد في 3 فروع.',
    executiveSummary:
      'تقليل نسبة التغيب عن المواعيد بنسبة 40% عبر تأكيدات ذكية وإعادة جدولة فورية، مما يحرر ساعات الأطباء ويرفع الإيراد الشهري للعيادة دون زيادة الإنفاق الإعلاني.',
    scopeItems: [
      {
        title: 'توحيد قنوات الحجز',
        deliverable: 'ربط الحجز الإلكتروني مع جدول العيادات الثلاث.',
        weeks: 2,
      },
      {
        title: 'محرك التذكير والمتابعة',
        deliverable: 'تذكيرات آلية قبل 24 ساعة و3 ساعات مع خيار إعادة الجدولة.',
        weeks: 2,
      },
    ],
    timelineWeeks: 4,
    packages: [
      {
        tier: 'basic',
        name: 'الباقة الأساسية',
        price: 24000,
        deliveryWeeks: 3,
        recommended: false,
        features: ['فرع واحد', 'تذكيرات أساسية', 'دعم 30 يوماً'],
      },
      {
        tier: 'pro',
        name: 'الباقة الاحترافية',
        price: 36000,
        deliveryWeeks: 4,
        recommended: true,
        features: ['حتى 3 فروع', 'استعادة المواعيد الملغاة', 'لوحة إشغال العيادة', 'دعم 90 يوماً'],
      },
      {
        tier: 'enterprise',
        name: 'الباقة المؤسسية',
        price: 54000,
        deliveryWeeks: 6,
        recommended: false,
        features: ['فروع غير محدودة', 'تكامل ملفات المرضى', 'تقارير تنفيذية شهرية'],
      },
    ],
    selectedPackageIndex: 1,
    roiAssumptions: {
      monthlyHoursSaved: 60,
      hourlyRate: 220,
      monthlyRevenueLift: 28000,
    },
    dealValue: 36000,
    termsNote: 'دفعتان: 60% عند البدء و40% بعد التشغيل الكامل للفروع الثلاثة.',
  },
];
