import { useCallback, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { ClientOfferView } from './components/ClientOfferView';
import { ClientsView } from './components/ClientsView';
import { ObjectionFollowUpView } from './components/ObjectionFollowUpView';
import { PipelineView } from './components/PipelineView';
import { ProposalStudio } from './components/ProposalStudio';
import { Sidebar } from './components/Sidebar';
import { SmartGuideAssistant } from './components/SmartGuideAssistant';
import { TopBar } from './components/TopBar';
import { SANDBOX_CLIENTS, SANDBOX_PROPOSALS } from './data/presets';
import {
  OperationType,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  testConnection,
} from './firebase';
import {
  ClientRecord,
  CurrencyCode,
  FollowupRecord,
  LIMITS,
  NavSection,
  ProposalRecord,
  ProposalStatus,
  sanitizeProposalPayload,
} from './types';

function makeSafeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getTimestampMillis(val: unknown): number {
  if (
    val &&
    typeof val === 'object' &&
    'toMillis' in val &&
    typeof (val as { toMillis: () => number }).toMillis === 'function'
  ) {
    return (val as { toMillis: () => number }).toMillis();
  }
  return 0;
}

const SECTION_COACH_TIPS: Record<NavSection, string> = {
  pipeline: 'ابدأ بمراجعة الصفقات قيد التفاوض أو اضغط «إنشاء عرض جديد» لبناء عرضك الأول خلال دقيقة.',
  studio: 'اختر قطاعاً جاهزاً أو ألصق طلب العميل، ثم اضغط «توليد العرض الذكي» لصناعة 3 باقات تسعير مقنعة.',
  offer: 'حرّك منزلقات حاسبة العائد مع العميل لإثبات فترة الاسترداد، ثم صدّر العرض بصيغة PDF.',
  clients: 'احفظ معلومات صانع القرار وتفضيلاته لتخصيص العروض القادمة بضغطة زر.',
  objections: 'لا تخفض السعر مجاناً؛ استخدم المختبر لصياغة رد يثبت القيمة أو يقسم الدفعات.',
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [asyncError, setAsyncError] = useState<Error | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<NavSection>('pipeline');
  const [companyName, setCompanyName] = useState('سَند الأعمال للاستشارات الرقمية');
  const [brandTagline, setBrandTagline] = useState('هندسة الحلول التجارية عالية العائد');
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>('SAR');

  const [clients, setClients] = useState<ClientRecord[]>(SANDBOX_CLIENTS);
  const [proposals, setProposals] = useState<ProposalRecord[]>(SANDBOX_PROPOSALS);
  const [sandboxFollowups, setSandboxFollowups] = useState<Record<string, FollowupRecord[]>>({});

  const [editingProposal, setEditingProposal] = useState<ProposalRecord | null>(null);
  const [previewProposalId, setPreviewProposalId] = useState<string | null>(SANDBOX_PROPOSALS[0].id);
  const [studioKey, setStudioKey] = useState(0);

  // Interactive Onboarding & Contextual Coaching State
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sanad_onboarding_v2') !== 'done';
    } catch {
      return true;
    }
  });
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [tipsEnabled, setTipsEnabled] = useState(true);
  const [activeTip, setActiveTip] = useState<string | null>(SECTION_COACH_TIPS.pipeline);

  if (asyncError) {
    throw asyncError;
  }

  const triggerCoachTip = useCallback((tip: string) => {
    setActiveTip(tip);
  }, []);

  const handleSelectSection = useCallback((section: NavSection) => {
    setActiveSection(section);
    setActiveTip(SECTION_COACH_TIPS[section]);
  }, []);

  const handleCloseOnboarding = useCallback(() => {
    setOnboardingOpen(false);
    try {
      localStorage.setItem('sanad_onboarding_v2', 'done');
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    testConnection();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);

      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            const safeDisplay = (currentUser.displayName || 'مستخدم سَند').slice(
              0,
              LIMITS.MAX_DISPLAY_NAME
            );
            const safeEmail = (currentUser.email || 'user@example.com').slice(0, LIMITS.MAX_EMAIL);
            await setDoc(userRef, {
              uid: currentUser.uid,
              displayName: safeDisplay,
              email: safeEmail,
              companyName: 'سَند الأعمال',
              brandTagline: 'شريك التنفيذ والنمو الرقمي',
              defaultCurrency: 'SAR',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } else {
            const profile = snap.data();
            if (typeof profile.companyName === 'string' && profile.companyName) {
              setCompanyName(profile.companyName);
            }
            if (typeof profile.brandTagline === 'string') {
              setBrandTagline(profile.brandTagline);
            }
            if (
              profile.defaultCurrency === 'SAR' ||
              profile.defaultCurrency === 'AED' ||
              profile.defaultCurrency === 'USD'
            ) {
              setDefaultCurrency(profile.defaultCurrency);
            }
          }
        } catch (err) {
          try {
            handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
          } catch (structured) {
            setAsyncError(structured instanceof Error ? structured : new Error(String(structured)));
          }
        }
      } else {
        setClients(SANDBOX_CLIENTS);
        setProposals(SANDBOX_PROPOSALS);
        setEditingProposal(null);
        setPreviewProposalId(SANDBOX_PROPOSALS[0]?.id || null);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady || !user) return;
    setDataLoading(true);

    const clientsQuery = query(collection(db, 'clients'), where('ownerUid', '==', user.uid));
    const proposalsQuery = query(collection(db, 'proposals'), where('ownerUid', '==', user.uid));

    const unsubClients = onSnapshot(
      clientsQuery,
      (snapshot) => {
        const list: ClientRecord[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ClientRecord, 'id'>),
        }));
        list.sort((a, b) => getTimestampMillis(b.updatedAt) - getTimestampMillis(a.updatedAt));
        setClients(list);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'clients');
        } catch (structured) {
          setAsyncError(structured instanceof Error ? structured : new Error(String(structured)));
        }
      }
    );

    const unsubProposals = onSnapshot(
      proposalsQuery,
      (snapshot) => {
        const list: ProposalRecord[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ProposalRecord, 'id'>),
        }));
        list.sort((a, b) => getTimestampMillis(b.updatedAt) - getTimestampMillis(a.updatedAt));
        setProposals(list);
        setDataLoading(false);
        setPreviewProposalId((prev) => {
          if (prev && list.some((p) => p.id === prev)) return prev;
          return list[0]?.id || null;
        });
      },
      (err) => {
        setDataLoading(false);
        try {
          handleFirestoreError(err, OperationType.LIST, 'proposals');
        } catch (structured) {
          setAsyncError(structured instanceof Error ? structured : new Error(String(structured)));
        }
      }
    );

    return () => {
      unsubClients();
      unsubProposals();
    };
  }, [authReady, user]);

  const handleSignIn = async () => {
    setBannerError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      triggerCoachTip('تم تسجيل الدخول بنجاح! أصبحت جميع عروضك وعملاؤك محفوظين سحابياً بأمان.');
    } catch (err) {
      setBannerError(
        err instanceof Error ? `تعذر تسجيل الدخول: ${err.message}` : 'تعذر تسجيل الدخول عبر Google.'
      );
    }
  };

  const handleSignOut = async () => {
    setBannerError(null);
    await signOut(auth);
  };

  const syncUserProfilePatch = async (patch: { companyName?: string; defaultCurrency?: CurrencyCode }) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...patch,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleUpdateCompanyName = (val: string) => {
    const trimmed = val.slice(0, LIMITS.MAX_COMPANY_NAME);
    setCompanyName(trimmed);
    if (user && trimmed.trim().length > 0) {
      syncUserProfilePatch({ companyName: trimmed.trim() }).catch(() => {});
    }
  };

  const handleUpdateCurrency = (curr: CurrencyCode) => {
    setDefaultCurrency(curr);
    if (user) {
      syncUserProfilePatch({ defaultCurrency: curr }).catch(() => {});
    }
  };

  const handleSaveProposal = async (
    rawDraft: Omit<ProposalRecord, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string,
    openOfferAfter = false
  ) => {
    const sanitized = sanitizeProposalPayload({
      ...rawDraft,
      ownerUid: user?.uid || 'demo',
    });

    const validClientId =
      user && sanitized.clientId !== 'standalone' && !clients.some((c) => c.id === sanitized.clientId)
        ? 'standalone'
        : sanitized.clientId;
    const finalPayload = { ...sanitized, clientId: validClientId };

    if (!user) {
      const id = existingId || makeSafeId('demo_prop');
      const record: ProposalRecord = { id, ...finalPayload };
      setProposals((prev) =>
        existingId ? prev.map((p) => (p.id === existingId ? record : p)) : [record, ...prev]
      );
      setEditingProposal(record);
      setPreviewProposalId(id);
      if (openOfferAfter) {
        handleSelectSection('offer');
      } else {
        triggerCoachTip('تم حفظ المسودة! اضغط «حفظ ومعاينة عرض العميل» لاستعراضها أمام العميل.');
      }
      return;
    }

    if (existingId) {
      const { ownerUid: _omitOwner, ...editableFields } = finalPayload;
      const path = `proposals/${existingId}`;
      try {
        await updateDoc(doc(db, 'proposals', existingId), {
          ...editableFields,
          updatedAt: serverTimestamp(),
        });
        setPreviewProposalId(existingId);
        if (openOfferAfter) {
          handleSelectSection('offer');
        } else {
          triggerCoachTip('تم تحديث العرض في السحابة بنجاح.');
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      const newId = makeSafeId('prop');
      const path = `proposals/${newId}`;
      try {
        await setDoc(doc(db, 'proposals', newId), {
          ...finalPayload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setEditingProposal({ id: newId, ...finalPayload });
        setPreviewProposalId(newId);
        if (openOfferAfter) {
          handleSelectSection('offer');
        } else {
          triggerCoachTip('تم حفظ العرض الجديد بنجاح!');
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }
  };

  const handleChangeProposalStatus = async (
    proposal: ProposalRecord,
    newStatus: ProposalStatus
  ) => {
    if (proposal.status === 'accepted' || proposal.status === 'rejected') return;

    if (!user) {
      setProposals((prev) =>
        prev.map((p) => (p.id === proposal.id ? { ...p, status: newStatus } : p))
      );
      if (newStatus === 'accepted') {
        triggerCoachTip('مبارك إغلاق الصفقة! ارتفع معدل القبول الفعلي في لوحة الصفقات الآن.');
      }
      return;
    }

    const path = `proposals/${proposal.id}`;
    try {
      await updateDoc(doc(db, 'proposals', proposal.id), {
        status: newStatus,
        selectedPackageIndex: proposal.selectedPackageIndex,
        dealValue: proposal.dealValue,
        updatedAt: serverTimestamp(),
      });
      if (newStatus === 'accepted') {
        triggerCoachTip('مبارك إغلاق الصفقة! تم قفل بنود العرض وتحديث إجمالي الإيرادات المقبولة.');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleSelectPackage = async (proposal: ProposalRecord, pkgIndex: number) => {
    if (proposal.status === 'accepted' || proposal.status === 'rejected') return;
    const chosenPrice = proposal.packages[pkgIndex]?.price ?? proposal.dealValue;

    if (!user) {
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposal.id
            ? { ...p, selectedPackageIndex: pkgIndex, dealValue: chosenPrice }
            : p
        )
      );
      triggerCoachTip('لاحظ كيف تتحدث حاسبة العائد وفترة الاسترداد تلقائياً مع الباقة التي اخترتها.');
      return;
    }

    const path = `proposals/${proposal.id}`;
    try {
      await updateDoc(doc(db, 'proposals', proposal.id), {
        status: proposal.status,
        selectedPackageIndex: pkgIndex,
        dealValue: chosenPrice,
        updatedAt: serverTimestamp(),
      });
      triggerCoachTip('تم اعتماد الباقة المختارة وتحديث قيمة الصفقة وحاسبة العائد.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleCloneProposal = (proposal: ProposalRecord) => {
    const cloned: ProposalRecord = {
      ...proposal,
      id: '',
      status: 'draft',
      title: `${proposal.title} (نسخة محدثة)`,
    };
    setEditingProposal(cloned);
    setStudioKey((k) => k + 1);
    handleSelectSection('studio');
  };

  const handleDeleteProposal = async (proposal: ProposalRecord) => {
    if (!user) {
      setProposals((prev) => prev.filter((p) => p.id !== proposal.id));
      if (previewProposalId === proposal.id) setPreviewProposalId(null);
      return;
    }
    const path = `proposals/${proposal.id}`;
    try {
      await deleteDoc(doc(db, 'proposals', proposal.id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleSaveClient = async (
    payload: Omit<ClientRecord, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    if (!user) {
      const id = existingId || makeSafeId('demo_cli');
      const rec: ClientRecord = { id, ...payload, ownerUid: 'demo' };
      setClients((prev) =>
        existingId ? prev.map((c) => (c.id === existingId ? rec : c)) : [rec, ...prev]
      );
      triggerCoachTip(`تمت إضافة ${payload.companyName}. اضغط «عرض جديد» بجانب العميل لإعداد عرض مخصص له فوراً.`);
      return;
    }

    const clientId = existingId || makeSafeId('cli');
    const path = `clients/${clientId}`;
    try {
      await setDoc(doc(db, 'clients', clientId), {
        ...payload,
        ownerUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      triggerCoachTip(`تم حفظ ${payload.companyName} في قاعدة العملاء السحابية.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const handleDeleteClient = async (client: ClientRecord) => {
    if (!user) {
      setClients((prev) => prev.filter((c) => c.id !== client.id));
      return;
    }
    const path = `clients/${client.id}`;
    try {
      await deleteDoc(doc(db, 'clients', client.id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleLoadFollowups = useCallback(
    async (proposalId: string): Promise<FollowupRecord[]> => {
      if (!user) {
        return sandboxFollowups[proposalId] || [];
      }
      const path = `proposals/${proposalId}/followups`;
      try {
        const q = query(
          collection(db, 'proposals', proposalId, 'followups'),
          where('ownerUid', '==', user.uid)
        );
        const snap = await getDocs(q);
        const list: FollowupRecord[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FollowupRecord, 'id'>),
        }));
        list.sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));
        return list;
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, path);
      }
    },
    [user, sandboxFollowups]
  );

  const handleSaveFollowup = useCallback(
    async (proposalId: string, item: Omit<FollowupRecord, 'id' | 'createdAt'>) => {
      if (!user) {
        const rec: FollowupRecord = { id: makeSafeId('demo_fu'), ...item, ownerUid: 'demo' };
        setSandboxFollowups((prev) => ({
          ...prev,
          [proposalId]: [rec, ...(prev[proposalId] || [])],
        }));
        return;
      }
      const fuId = makeSafeId('fu');
      const path = `proposals/${proposalId}/followups/${fuId}`;
      try {
        await setDoc(doc(db, 'proposals', proposalId, 'followups', fuId), {
          ...item,
          ownerUid: user.uid,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    },
    [user]
  );

  const activePreviewProposal =
    proposals.find((p) => p.id === previewProposalId) || proposals[0] || null;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#08080A] surface-ambient text-[#F5F3EE] flex flex-col lg:flex-row"
    >
      <Sidebar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        onOpenOnboarding={() => setOnboardingOpen(true)}
        user={user}
        authLoading={!authReady}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        companyName={companyName}
        onUpdateCompanyName={handleUpdateCompanyName}
        defaultCurrency={defaultCurrency}
        onUpdateCurrency={handleUpdateCurrency}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          activeSection={activeSection}
          activeProposalTitle={
            activeSection === 'studio'
              ? editingProposal?.title
              : activePreviewProposal?.title
          }
          onCreateNewProposal={() => {
            setEditingProposal(null);
            setStudioKey((k) => k + 1);
            handleSelectSection('studio');
          }}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-[1360px] w-full mx-auto space-y-6 pb-24">
          {bannerError && (
            <div className="no-print bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 text-xs text-rose-200 flex items-center justify-between gap-4">
              <span>{bannerError}</span>
              <button
                type="button"
                onClick={() => setBannerError(null)}
                className="text-rose-300 hover:text-rose-100 underline shrink-0"
              >
                إغلاق
              </button>
            </div>
          )}

          {activeSection === 'pipeline' && (
            <PipelineView
              proposals={proposals}
              loading={dataLoading}
              defaultCurrency={defaultCurrency}
              isDemoMode={!user}
              onCreateNew={() => {
                setEditingProposal(null);
                setStudioKey((k) => k + 1);
                handleSelectSection('studio');
              }}
              onOpenOnboarding={() => setOnboardingOpen(true)}
              onEditProposal={(p) => {
                setEditingProposal(p);
                setStudioKey((k) => k + 1);
                handleSelectSection('studio');
              }}
              onPreviewOffer={(p) => {
                setPreviewProposalId(p.id);
                handleSelectSection('offer');
              }}
              onChangeStatus={handleChangeProposalStatus}
              onCloneProposal={handleCloneProposal}
              onDeleteProposal={handleDeleteProposal}
            />
          )}

          {activeSection === 'studio' && (
            <ProposalStudio
              key={studioKey}
              initialProposal={editingProposal}
              clients={clients}
              companyName={companyName}
              defaultCurrency={defaultCurrency}
              ownerUid={user?.uid || 'demo'}
              onSaveProposal={handleSaveProposal}
              onCloneProposal={handleCloneProposal}
              onCoachTip={triggerCoachTip}
            />
          )}

          {activeSection === 'offer' && (
            <ClientOfferView
              proposal={activePreviewProposal}
              companyName={companyName}
              brandTagline={brandTagline}
              onEditProposal={(p) => {
                setEditingProposal(p);
                setStudioKey((k) => k + 1);
                handleSelectSection('studio');
              }}
              onSelectPackage={handleSelectPackage}
              onChangeStatus={handleChangeProposalStatus}
              onCoachTip={triggerCoachTip}
            />
          )}

          {activeSection === 'clients' && (
            <ClientsView
              clients={clients}
              proposals={proposals}
              defaultCurrency={defaultCurrency}
              ownerUid={user?.uid || 'demo'}
              onSaveClient={handleSaveClient}
              onDeleteClient={handleDeleteClient}
              onStartProposalForClient={(client) => {
                setEditingProposal({
                  id: '',
                  ownerUid: user?.uid || 'demo',
                  clientId: client.id,
                  clientName: client.companyName,
                  title: '',
                  industry: client.industry,
                  currency: defaultCurrency,
                  status: 'draft',
                  brief: '',
                  executiveSummary: '',
                  scopeItems: [
                    {
                      title: 'التحليل وتصميم الحل',
                      deliverable: 'تحديد المخرجات وخارطة التنفيذ',
                      weeks: 2,
                    },
                  ],
                  timelineWeeks: 6,
                  packages: SANDBOX_PROPOSALS[0].packages,
                  selectedPackageIndex: 1,
                  roiAssumptions: SANDBOX_PROPOSALS[0].roiAssumptions,
                  dealValue: SANDBOX_PROPOSALS[0].packages[1].price,
                  termsNote: SANDBOX_PROPOSALS[0].termsNote,
                });
                setStudioKey((k) => k + 1);
                handleSelectSection('studio');
              }}
            />
          )}

          {activeSection === 'objections' && (
            <ObjectionFollowUpView
              proposals={proposals}
              activeProposalId={activePreviewProposal?.id}
              companyName={companyName}
              onLoadFollowups={handleLoadFollowups}
              onSaveFollowup={handleSaveFollowup}
              ownerUid={user?.uid || 'demo'}
              onCoachTip={triggerCoachTip}
            />
          )}
        </main>
      </div>

      {/* Automatic First-Visit Onboarding Guide + Dockable Smart Assistant + Live Action Tips */}
      <SmartGuideAssistant
        activeSection={activeSection}
        onboardingOpen={onboardingOpen}
        onCloseOnboarding={handleCloseOnboarding}
        onNavigateAndPractice={handleSelectSection}
        assistantOpen={assistantOpen}
        onToggleAssistant={setAssistantOpen}
        activeTip={activeTip}
        onDismissTip={() => setActiveTip(null)}
        tipsEnabled={tipsEnabled}
        onToggleTips={() => setTipsEnabled((v) => !v)}
      />
    </div>
  );
}
