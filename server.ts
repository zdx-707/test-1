import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('مفتاح Gemini API غير مضبوط في إعدادات الخادم (Secrets).');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function callWithRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient = msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('429');
      if (!isTransient || attempt === maxAttempts) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, attempt * 1500));
    }
  }
  throw lastErr;
}

function formatApiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('503') || raw.includes('UNAVAILABLE')) {
    return {
      status: 503,
      message: 'خادم الذكاء الاصطناعي يواجه ضغطاً مؤقتاً حالياً (503). يرجى المحاولة مرة أخرى بعد لحظات.',
    };
  }
  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message: 'تم الوصول للحد المؤقت من طلبات الذكاء الاصطناعي. يرجى الانتظار قليلاً ثم إعادة المحاولة.',
    };
  }
  if (raw.includes('API_KEY_INVALID') || raw.includes('PERMISSION_DENIED')) {
    return {
      status: 403,
      message: 'يرجى التحقق من صلاحية مفتاح Gemini API في لوحة الإعدادات (Settings > Secrets).',
    };
  }
  return { status: 500, message: raw || 'حدث خطأ غير متوقع في الخادم.' };
}

function getCurrencyLabel(currency: string): string {
  switch (currency) {
    case 'SAR':
      return 'ريال سعودي (SAR)';
    case 'AED':
      return 'درهم إماراتي (AED)';
    default:
      return 'دولار أمريكي (USD)';
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
    res.json({
      ok: true,
      model: 'gemini-4-hydrogen',
      aiConfigured: hasKey,
    });
  });

  // 1. Generate complete 3-tier AI commercial proposal
  app.post('/api/proposals/generate', async (req: Request, res: Response) => {
    try {
      const { projectTitle, clientName, industry, currency, budgetHint, brief, companyName } = req.body ?? {};

      if (typeof projectTitle !== 'string' || projectTitle.trim().length < 2) {
        res.status(400).json({ error: 'يرجى إدخال عنوان واضح للمشروع.' });
        return;
      }
      if (typeof brief !== 'string' || brief.trim().length < 10) {
        res.status(400).json({ error: 'يرجى كتابة وصف كافٍ لطلب العميل (10 أحرف على الأقل).' });
        return;
      }

      const safeCurrency = currency === 'AED' || currency === 'USD' ? currency : 'SAR';
      const safeClient = typeof clientName === 'string' && clientName.trim() ? clientName.trim() : 'العميل';
      const safeIndustry = typeof industry === 'string' && industry.trim() ? industry.trim() : 'الخدمات والأعمال';
      const safeAgency = typeof companyName === 'string' && companyName.trim() ? companyName.trim() : 'سَند الأعمال';
      const safeBudget = Number(budgetHint) > 0 ? Number(budgetHint) : safeCurrency === 'USD' ? 8000 : 30000;

      const ai = getAiClient();

      const prompt = `أنت مدير مبيعات واستراتيجي تسعير B2B محترف في السوق العربي والخليجي.
مطلوب إعداد عرض تجاري تنفيذي عالي الإقناع يحقق معدل قبول يتجاوز 30% باستخدام استراتيجية تثبيت السعر (Price Anchoring) عبر 3 باقات واضحة.

بيانات الطلب:
- الجهة المقدمة للعرض: ${safeAgency}
- العميل المستهدف: ${safeClient}
- القطاع: ${safeIndustry}
- عنوان المشروع: ${projectTitle.trim()}
- العملة المطلوبة: ${getCurrencyLabel(safeCurrency)}
- الميزانية الاسترشادية: ${safeBudget} ${safeCurrency}
- ملخص متطلبات العميل:
${brief.trim()}

التعليمات الصارمة:
1. اكتب جميع النصوص باللغة العربية الفصحى التنفيذية الواضحة الخالية من الحشو.
2. أنشئ من 4 إلى 6 بنود واضحة في نطاق العمل (scopeItems) مع مدة كل بند بالأسابيع.
3. أنشئ 3 باقات تسعير بالضبط (basic, pro, enterprise):
   - الباقة الأولى (basic): تغطي الأساسيات بسعر أقل بنحو 25-35% من الميزانية الاسترشادية.
   - الباقة الثانية (pro): الباقة الاحترافية الموصى بها (recommended: true) بسعر متوازن مع الميزانية الاسترشادية وأعلى قيمة مقابل السعر.
   - الباقة الثالثة (enterprise): باقة شاملة متكاملة بسعر أعلى بنحو 60-90% لترسيخ قيمة الباقة الوسطى.
4. قدّر معطيات حاسبة العائد على الاستثمار (roiAssumptions) بشكل واقعي ومقنع بالعملة المختارة لتبرير السعر مالياً.
5. أضف شروط دفع وضمان تنفيذ واضحة في termsNote.`;

      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: {
                type: Type.STRING,
                description: 'ملخص تنفيذي مقنع يربط تحديات العميل بالنتيجة التجارية المتوقعة.',
              },
              timelineWeeks: {
                type: Type.INTEGER,
                description: 'إجمالي مدة التنفيذ التقديرية بالأسابيع.',
              },
              scopeItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    deliverable: { type: Type.STRING },
                    weeks: { type: Type.INTEGER },
                  },
                  required: ['title', 'deliverable', 'weeks'],
                },
              },
              packages: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    tier: { type: Type.STRING, description: 'basic or pro or enterprise' },
                    name: { type: Type.STRING },
                    price: { type: Type.NUMBER },
                    deliveryWeeks: { type: Type.INTEGER },
                    recommended: { type: Type.BOOLEAN },
                    features: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['tier', 'name', 'price', 'deliveryWeeks', 'recommended', 'features'],
                },
              },
              roiAssumptions: {
                type: Type.OBJECT,
                properties: {
                  monthlyHoursSaved: { type: Type.NUMBER },
                  hourlyRate: { type: Type.NUMBER },
                  monthlyRevenueLift: { type: Type.NUMBER },
                },
                required: ['monthlyHoursSaved', 'hourlyRate', 'monthlyRevenueLift'],
              },
              termsNote: {
                type: Type.STRING,
                description: 'شروط الدفع والتسليم والضمان.',
              },
            },
            required: [
              'executiveSummary',
              'timelineWeeks',
              'scopeItems',
              'packages',
              'roiAssumptions',
              'termsNote',
            ],
          },
        },
        })
      );

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new Error('لم يُرجع الذكاء الاصطناعي محتوى صالحاً.');
      }
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (error) {
      console.error('Error generating proposal:', error);
      const { status, message } = formatApiError(error);
      res.status(status).json({ error: message });
    }
  });

  // 2. AI Deal Audit & Win-Probability Booster
  app.post('/api/proposals/deal-audit', async (req: Request, res: Response) => {
    try {
      const { title, industry, currency, packages, selectedPackageIndex, roiAssumptions, brief } = req.body ?? {};
      if (typeof title !== 'string' || !Array.isArray(packages) || packages.length === 0) {
        res.status(400).json({ error: 'بيانات العرض غير مكتملة لإجراء التدقيق.' });
        return;
      }

      const ai = getAiClient();
      const prompt = `بصفتك مستشار إغلاق صفقات B2B، راجع العرض التالي وقدّم تشخيصاً عملياً لرفع احتمالية قبول العميل فوق 30%:
- عنوان العرض: ${title}
- القطاع: ${industry || 'عام'}
- العملة: ${currency || 'SAR'}
- الباقات: ${JSON.stringify(packages)}
- الباقة المختارة رقم: ${Number(selectedPackageIndex) || 0}
- فرضيات العائد: ${JSON.stringify(roiAssumptions || {})}
- ملخص الطلب: ${String(brief || '').slice(0, 1200)}

أعد تقييماً دقيقاً يشمل: تقدير نسبة القبول الحالية (0-100)، أهم 3 نقاط قوة، أهم 3 مخاطر أو ثغرات سعرية، و3 تعديلات عملية لرفع القبول وقيمة الصفقة.`;

      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              estimatedWinRate: { type: Type.INTEGER },
              verdictHeadline: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              risks: { type: Type.ARRAY, items: { type: Type.STRING } },
              actionableBoosts: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['estimatedWinRate', 'verdictHeadline', 'strengths', 'risks', 'actionableBoosts'],
          },
        },
        })
      );

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new Error('تعذر استلام تحليل الصفقة.');
      }
      res.json(JSON.parse(rawText));
    } catch (error) {
      console.error('Error auditing deal:', error);
      const { status, message } = formatApiError(error);
      res.status(status).json({ error: message });
    }
  });

  // 3. AI Objection Handler & WhatsApp/Email Follow-up Generator
  app.post('/api/proposals/objection-reply', async (req: Request, res: Response) => {
    try {
      const { proposalTitle, clientName, currency, dealValue, objectionText, channel, companyName } = req.body ?? {};
      if (typeof objectionText !== 'string' || objectionText.trim().length < 3) {
        res.status(400).json({ error: 'يرجى كتابة اعتراض العميل أو هدف رسالة المتابعة.' });
        return;
      }

      const ai = getAiClient();
      const channelAr = channel === 'email' ? 'بريد إلكتروني رسمي' : 'رسالة واتساب تنفيذية مختصرة';

      const prompt = `أنت خبير مبيعات B2B. صغ رسالة رد احترافية باللغة العربية تحافظ على هيبة السعر وتدفع العميل للموافقة بدون تخفيض عشوائي.
- الجهة المرسلة: ${companyName || 'سَند الأعمال'}
- العميل: ${clientName || 'العميل'}
- المشروع: ${proposalTitle || 'المشروع'}
- قيمة الصفقة: ${dealValue || 0} ${currency || 'SAR'}
- القناة المطلوبة: ${channelAr}
- الاعتراض أو الموقف: ${objectionText.trim()}

أعد:
1. strategyName: اسم التكتيك التفاوضي المستخدم.
2. subject: عنوان الرسالة أو الملخص.
3. message: نص الرسالة الجاهز للإرسال فوراً.
4. alternativeOffer: خيار بديل ذكي (مثل تقسيم الدفعات أو تعديل النطاق بدلاً من حرق السعر).`;

      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              strategyName: { type: Type.STRING },
              subject: { type: Type.STRING },
              message: { type: Type.STRING },
              alternativeOffer: { type: Type.STRING },
            },
            required: ['strategyName', 'subject', 'message', 'alternativeOffer'],
          },
        },
        })
      );

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new Error('تعذر توليد الرد التفاوضي.');
      }
      res.json(JSON.parse(rawText));
    } catch (error) {
      console.error('Error generating objection reply:', error);
      const { status, message } = formatApiError(error);
      res.status(status).json({ error: message });
    }
  });

  // 4. Smart Interactive Onboarding & Usage Guide Assistant
  app.post('/api/assistant/guide', async (req: Request, res: Response) => {
    try {
      const { question, currentSection } = req.body ?? {};
      if (typeof question !== 'string' || question.trim().length < 2) {
        res.status(400).json({ error: 'يرجى كتابة سؤالك للمساعد الذكي.' });
        return;
      }

      const ai = getAiClient();
      const prompt = `أنت المساعد الذكي داخل منصة "سَند الأعمال (Sanad Deals)" لإعداد العروض التجارية والتسعير الذكي وإغلاق صفقات B2B.
المستخدم يتواجد حالياً في شاشة: ${String(currentSection || 'pipeline')}.

سؤال المستخدم:
${question.trim()}

أجب بإيجاز عملي وبنقاط مرقمة واضحة باللغة العربية، واشرح له الخطوة العملية التالية داخل التطبيق لرفع فرصة قبول عرضه فوق 30%.`;

      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                proTip: { type: Type.STRING },
              },
              required: ['headline', 'steps', 'proTip'],
            },
          },
        })
      );

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new Error('لم يرد المساعد الذكي بمحتوى صالح.');
      }
      res.json(JSON.parse(rawText));
    } catch (error) {
      console.error('Error in assistant guide:', error);
      const { status, message } = formatApiError(error);
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sanad Deals server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
