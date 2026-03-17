export type {
  SupabaseWorkspaceEditorMode,
  SupabaseWorkspaceVariant,
} from "./workspace/supabaseWorkspaceTypes";

import { signOut, useSession } from "next-auth/react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  SupabaseArticleDetail,
  SupabaseBioEntry,
  SupabaseCategorySummary,
  SupabaseIntroEntry,
} from "../../../types/supabase";
import RichTextEditor from "./workspace/editor/RichTextEditor";
import SupabaseWorkspaceStyles from "./workspace/SupabaseWorkspaceStyles";
import WorkspaceHeader from "./workspace/WorkspaceHeader";
import WorkspaceStatusBadge from "./workspace/WorkspaceStatusBadge";
import type {
  BioFormState,
  DirectoryArticle,
  StatusTone,
  SupabaseFormState,
  SupabaseWorkspaceProps,
  WorkspaceMode,
} from "./workspace/supabaseWorkspaceTypes";
import { bioToForm, detailToForm, formatDateTime, fromLocalDateTime, toLocalDateTimeInput, toPreviewText } from "./workspace/supabaseWorkspaceUtils";

const SupabaseWorkspace: React.FC<SupabaseWorkspaceProps> = ({
  categories,
  bios = [],
  error,
  variant = "admin",
  editorMode = "tiptap",
}) => {
  const [supabaseCategories, setSupabaseCategories] = useState(categories);
  const [panelError, setPanelError] = useState<string | null>(error ?? null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    categories[0]?.id ?? null
  );
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [articleDetail, setArticleDetail] = useState<SupabaseArticleDetail | null>(null);
  const [formState, setFormState] = useState<SupabaseFormState | null>(null);
  const [status, setStatus] = useState<StatusTone>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const dirtyRef = useRef(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<WorkspaceMode>("articles");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [createDraft, setCreateDraft] = useState({
    title: "",
    slug: "",
    authorName: "",
    status: false,
    categoryIds: [] as string[],
  });
  const [createStatus, setCreateStatus] = useState<"idle" | "creating">("idle");
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "deleting">("idle");
  const [bioEntries, setBioEntries] = useState<SupabaseBioEntry[]>(bios);
  const [selectedBioId, setSelectedBioId] = useState<string | null>(bios[0]?.id ?? null);
  const [bioFormState, setBioFormState] = useState<BioFormState | null>(
    bios[0] ? bioToForm(bios[0]) : null
  );
  const [bioStatus, setBioStatus] = useState<string | null>(null);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [introEntries, setIntroEntries] = useState<SupabaseIntroEntry[]>([]);
  const [introStatus, setIntroStatus] = useState<StatusTone>("idle");
  const [introStatusMessage, setIntroStatusMessage] = useState<string | null>(null);
  const [introError, setIntroError] = useState<string | null>(null);
  const [selectedIntroId, setSelectedIntroId] = useState<string | null>(null);
  const [introBody, setIntroBody] = useState<{ markdown: string; html: string }>(
    { markdown: "", html: "" }
  );
  const introDirtyRef = useRef(false);

  const { data: session, status: sessionStatus } = useSession();
  const sessionEmail = session?.user?.email ?? "";
  const canShowSession = sessionStatus === "authenticated";

  const workspaceVariant = variant;
  const showAdvanced = workspaceVariant !== "writer";
  const isAdmin = workspaceVariant === "admin";

  useEffect(() => {
    setSupabaseCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (error) {
      setPanelError(error);
    }
  }, [error]);

  useEffect(() => {
    setBioEntries(bios);
    setSelectedBioId((current) => {
      if (current && bios.some((entry) => entry.id === current)) return current;
      return bios[0]?.id ?? null;
    });
  }, [bios]);

  const selectedBio = useMemo(
    () => bioEntries.find((entry) => entry.id === selectedBioId) ?? null,
    [bioEntries, selectedBioId]
  );

  useEffect(() => {
    if (!selectedBio) {
      setBioFormState(null);
      return;
    }
    setBioFormState(bioToForm(selectedBio));
  }, [selectedBio]);

  useEffect(() => {
    if (!supabaseCategories.length) {
      setSelectedCategoryId(null);
      setSelectedArticleId(null);
      setArticleDetail(null);
      setFormState(null);
      dirtyRef.current = false;
      return;
    }

    if (
      !selectedCategoryId ||
      !supabaseCategories.some((category) => category.id === selectedCategoryId)
    ) {
      setSelectedCategoryId(supabaseCategories[0].id);
    }

    if (selectedArticleId) {
      const exists = supabaseCategories.some((category) =>
        category.articles.some((article) => article.id === selectedArticleId)
      );
      if (!exists) {
        setSelectedArticleId(null);
        setArticleDetail(null);
        setFormState(null);
        dirtyRef.current = false;
      }
    }
  }, [supabaseCategories, selectedCategoryId, selectedArticleId]);

  const fetchIntroEntries = useCallback(async () => {
    if (!isAdmin) return;
    setIntroStatus("loading");
    setIntroStatusMessage("Chargement\u2026");
    introDirtyRef.current = false;
    try {
      const response = await fetch("/api/supabase/intros");
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Impossible de charger les introductions.");
      }
      setIntroEntries(payload.entries ?? []);
      setIntroError(null);
      setIntroStatus("idle");
      setIntroStatusMessage(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setIntroError(message);
      setIntroStatus("error");
      setIntroStatusMessage(message);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchIntroEntries().catch(() => {
      /* handled in fetchIntroEntries */
    });
  }, [fetchIntroEntries, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    if (!introEntries.length) {
      setSelectedIntroId(null);
      setIntroBody({ markdown: "", html: "" });
      introDirtyRef.current = false;
      return;
    }

    if (!selectedIntroId || !introEntries.some((entry) => entry.id === selectedIntroId)) {
      const nextIntro = introEntries[0];
      setSelectedIntroId(nextIntro.id);
      setIntroBody({
        markdown: nextIntro.bodyMarkdown,
        html: nextIntro.bodyHtml ?? "",
      });
      introDirtyRef.current = false;
      setIntroStatus("idle");
      setIntroStatusMessage(null);
    }
  }, [introEntries, isAdmin, selectedIntroId]);

  const directoryArticles = useMemo<DirectoryArticle[]>(() => {
    const map = new Map<string, DirectoryArticle>();
    supabaseCategories.forEach((category) => {
      category.articles.forEach((article) => {
        const entry = map.get(article.id);
        const categoryInfo = {
          id: category.id,
          name: category.name,
          color: category.color,
        };
        if (entry) {
          if (!entry.categories.some((existing) => existing.id === category.id)) {
            entry.categories.push(categoryInfo);
          }
          return;
        }

        map.set(article.id, {
          id: article.id,
          title: article.title,
          slug: article.slug,
          author: article.author,
          status: article.status,
          publishedAt: article.publishedAt,
          updatedAt: article.updatedAt ?? null,
          categories: [categoryInfo],
          primaryCategoryId: category.id ?? null,
        });
      });
    });

    return Array.from(map.values()).map((article) => ({
      ...article,
      categories: article.categories
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" })),
    }));
  }, [supabaseCategories]);

  const sortedArticles = useMemo(
    () =>
      directoryArticles
        .slice()
        .sort((a, b) => {
          const aUpdated = a.updatedAt ? Date.parse(a.updatedAt) : 0;
          const bUpdated = b.updatedAt ? Date.parse(b.updatedAt) : 0;
          if (aUpdated !== bUpdated) {
            return bUpdated - aUpdated;
          }
          const aPublished = a.publishedAt ? Date.parse(a.publishedAt) : 0;
          const bPublished = b.publishedAt ? Date.parse(b.publishedAt) : 0;
          if (aPublished !== bPublished) {
            return bPublished - aPublished;
          }
          return a.title.localeCompare(b.title, "fr", { sensitivity: "base" });
        }),
    [directoryArticles]
  );

  const articleCount = sortedArticles.length;

  const digest = useMemo(() => {
    if (status === "loading") {
      return { tone: "loading" as StatusTone, label: "Chargement\u2026" };
    }
    if (status === "saving") {
      return { tone: "saving" as StatusTone, label: "Enregistrement\u2026" };
    }
    if (status === "error") {
      return { tone: "error" as StatusTone, label: statusMessage ?? "Erreur" };
    }
    if (status === "saved") {
      return { tone: "saved" as StatusTone, label: statusMessage ?? "Enregistr\u00e9" };
    }
    if (dirtyRef.current) {
      return { tone: "dirty" as StatusTone, label: "Modifications non enregistr\u00e9es" };
    }
    return { tone: "idle" as StatusTone, label: statusMessage ?? "Stable" };
  }, [status, statusMessage]);

  const introDigest = useMemo(() => {
    if (introStatus === "loading") {
      return { tone: "loading" as StatusTone, label: "Chargement\u2026" };
    }
    if (introStatus === "saving") {
      return { tone: "saving" as StatusTone, label: "Enregistrement\u2026" };
    }
    if (introStatus === "error") {
      return { tone: "error" as StatusTone, label: introStatusMessage ?? "Erreur" };
    }
    if (introStatus === "saved") {
      return { tone: "saved" as StatusTone, label: introStatusMessage ?? "Enregistr\u00e9" };
    }
    if (introDirtyRef.current) {
      return { tone: "dirty" as StatusTone, label: "Modifications non enregistr\u00e9es" };
    }
    return { tone: "idle" as StatusTone, label: introStatusMessage ?? "Stable" };
  }, [introStatus, introStatusMessage]);

  const confirmDiscard = useCallback(() => {
    if (!dirtyRef.current) return true;
    return window.confirm("Des modifications non enregistr\u00e9es seront perdues. Continuer ?");
  }, []);

  const confirmIntroDiscard = useCallback(() => {
    if (!introDirtyRef.current) return true;
    return window.confirm(
      "Des modifications non enregistr\u00e9es seront perdues. Continuer ?"
    );
  }, []);

  const fetchArticle = useCallback(async (articleId: string) => {
    setStatus("loading");
    setStatusMessage("Chargement\u2026");
    dirtyRef.current = false;
    try {
      const response = await fetch(`/api/supabase/articles/${articleId}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Impossible de charger l'article.");
      }
      setArticleDetail(payload.article);
      setFormState(detailToForm(payload.article));
      dirtyRef.current = false;
      setStatus("idle");
      setStatusMessage(null);
    } catch (err) {
      setStatus("error");
      setStatusMessage(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }, []);

  useEffect(() => {
    if (selectedArticleId) {
      return;
    }

    if (isAdmin) {
      const firstArticle = sortedArticles[0];
      if (!firstArticle) {
        return;
      }
      setSelectedCategoryId((current) => {
        const target = firstArticle.primaryCategoryId ?? null;
        return current === target ? current : target;
      });
      setSelectedArticleId(firstArticle.id);
      fetchArticle(firstArticle.id).catch(() => {
        /* handled in fetchArticle */
      });
      return;
    }

    if (!selectedCategoryId) {
      return;
    }

    const activeCategory = supabaseCategories.find(
      (category) => category.id === selectedCategoryId
    );

    if (!activeCategory || !activeCategory.articles.length) {
      return;
    }

    const firstArticleId = activeCategory.articles[0].id;
    setSelectedArticleId(firstArticleId);
    fetchArticle(firstArticleId).catch(() => {
      /* handled in fetchArticle */
    });
  }, [
    fetchArticle,
    isAdmin,
    selectedArticleId,
    selectedCategoryId,
    sortedArticles,
    supabaseCategories,
  ]);

  const refreshCategories = useCallback(
    async (focusArticleId?: string) => {
      setIsRefreshing(true);
      try {
        const response = await fetch("/api/supabase/articles");
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? "Impossible de charger les articles.");
        }
        setSupabaseCategories(payload.categories);
        setPanelError(null);
        if (focusArticleId) {
          const containing = payload.categories.find((category: SupabaseCategorySummary) =>
            category.articles.some((article) => article.id === focusArticleId)
          );
          if (containing) {
            setSelectedCategoryId(containing.id);
            setSelectedArticleId(focusArticleId);
            await fetchArticle(focusArticleId);
          }
        }
      } catch (err) {
        setPanelError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsRefreshing(false);
      }
    },
    [fetchArticle]
  );

  const handleSelectArticle = useCallback(
    async (articleId: string, categoryId?: string | null) => {
      if (!confirmDiscard()) {
        return;
      }
      setSelectedCategoryId(categoryId ?? null);
      setSelectedArticleId(articleId);
      await fetchArticle(articleId);
    },
    [confirmDiscard, fetchArticle]
  );

  const updateForm = useCallback(
    (key: keyof SupabaseFormState, value: SupabaseFormState[keyof SupabaseFormState]) => {
      setFormState((current) => {
        if (!current) return current;
        return { ...current, [key]: value } as SupabaseFormState;
      });
      dirtyRef.current = true;
      if (status === "saved" || status === "error") {
        setStatus("idle");
        setStatusMessage(null);
      }
    },
    [status]
  );

  const handleCategoryToggle = useCallback(
    (categoryId: string) => {
      setFormState((current) => {
        if (!current) return current;
        const hasCategory = current.categoryIds.includes(categoryId);
        const categoryIds = hasCategory
          ? current.categoryIds.filter((id) => id !== categoryId)
          : [...current.categoryIds, categoryId];
        dirtyRef.current = true;
        if (status === "saved" || status === "error") {
          setStatus("idle");
          setStatusMessage(null);
        }
        return { ...current, categoryIds };
      });
    },
    [status]
  );

  const handleRelatedChange = useCallback(
    (values: string[]) => {
      updateForm("relatedArticleIds", values.filter((id) => id !== selectedArticleId));
    },
    [selectedArticleId, updateForm]
  );

  const handleRichTextChange = useCallback(
    (markdown: string, html: string, json?: any) => {
      setFormState((current) => {
        if (!current) return current;
        return {
          ...current,
          bodyMarkdown: markdown,
          bodyHtml: html,
          bodyJson: json ? JSON.stringify(json).replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))) : current.bodyJson,
        };
      });
      dirtyRef.current = true;
      if (status === "saved" || status === "error") {
        setStatus("idle");
        setStatusMessage(null);
      }
    },
    [status]
  );

  const handleSave = useCallback(async () => {
    if (!formState || !selectedArticleId) return;
    setStatus("saving");
    setStatusMessage("Enregistrement en cours\u2026");
    try {
      const payload = {
        title: formState.title.trim(),
        slug: formState.slug.trim(),
        authorName: formState.authorName.trim() || null,
        status: formState.status,
        authoredDate: formState.authoredDate.trim() || null,
        publishedAt: formState.publishedAt ? fromLocalDateTime(formState.publishedAt) : null,
        preview: formState.preview.trim() || null,
        excerpt: formState.excerpt.trim() || null,
        headerImagePath: formState.headerImagePath.trim() || null,
        bodyMarkdown: formState.bodyMarkdown,
        bodyJson: formState.bodyJson.trim() || null,
        bodyHtml: formState.bodyHtml.trim() || null,
        categoryIds: Array.from(new Set(formState.categoryIds)),
        relatedArticleIds: Array.from(new Set(formState.relatedArticleIds)).filter(
          (id) => id !== selectedArticleId
        ),
      };

      const response = await fetch(`/api/supabase/articles/${selectedArticleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Impossible d'enregistrer l'article.");
      }

      setSupabaseCategories(data.categories);
      setArticleDetail(data.article);
      setFormState(detailToForm(data.article));
      dirtyRef.current = false;
      setStatus("saved");
      setStatusMessage("Modifications enregistr\u00e9es");
      setSelectedArticleId(data.article.id);
      const articleCategories = data.article.categories;
      if (articleCategories.length) {
        setSelectedCategoryId((current) => {
          if (current && articleCategories.some((category: any) => category.id === current)) {
            return current;
          }
          return articleCategories[0].id;
        });
      }
      setTimeout(() => {
        setStatus("idle");
        setStatusMessage(null);
      }, 1500);
    } catch (err) {
      setStatus("error");
      setStatusMessage(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }, [formState, selectedArticleId]);

  const handleCreate = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setCreateError(null);
      if (!createDraft.slug.trim()) {
        setCreateError("Un slug est requis.");
        return;
      }
      setCreateStatus("creating");
      try {
        const payload = {
          title: createDraft.title.trim() || "Sans titre",
          slug: createDraft.slug.trim(),
          authorName: createDraft.authorName.trim() || null,
          status: createDraft.status,
          authoredDate: null,
          publishedAt: null,
          preview: null,
          excerpt: null,
          headerImagePath: null,
          bodyMarkdown: "",
          bodyJson: null,
          bodyHtml: null,
          categoryIds: createDraft.categoryIds,
          relatedArticleIds: [],
        };

        const response = await fetch("/api/supabase/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error ?? "Cr\u00e9ation impossible.");
        }

        setSupabaseCategories(data.categories);
        setCreateStatus("idle");
        setCreateOpen(false);
        setCreateDraft({ title: "", slug: "", authorName: "", status: false, categoryIds: [] });
        dirtyRef.current = false;
        await fetchArticle(data.article.id);
        setSelectedArticleId(data.article.id);
        if (data.article.categories.length) {
          setSelectedCategoryId(data.article.categories[0].id);
        }
      } catch (err) {
        setCreateStatus("idle");
        setCreateError(err instanceof Error ? err.message : "Erreur inconnue");
      }
    },
    [createDraft, fetchArticle]
  );

  const handleDelete = useCallback(async () => {
    if (!selectedArticleId) return;
    if (!window.confirm("Supprimer d\u00e9finitivement cet article ?")) {
      return;
    }
    setDeleteStatus("deleting");
    try {
      const response = await fetch(`/api/supabase/articles/${selectedArticleId}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error ?? "Suppression impossible.");
      }

      setDeleteStatus("idle");
      setSelectedArticleId(null);
      setArticleDetail(null);
      setFormState(null);
      dirtyRef.current = false;
      await refreshCategories();
    } catch (err) {
      setDeleteStatus("idle");
      setStatus("error");
      setStatusMessage(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }, [refreshCategories, selectedArticleId]);

  const refreshBios = useCallback(async () => {
    try {
      const response = await fetch("/api/supabase/bios");
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Impossible de charger les bios.");
      }
      const entries = payload.entries ?? [];
      setBioEntries(entries);
      setSelectedBioId((current) => {
        if (current && entries.some((entry: SupabaseBioEntry) => entry.id === current)) {
          return current;
        }
        return entries[0]?.id ?? null;
      });
      setBioStatus(null);
    } catch (err) {
      setBioStatus(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }, []);

  const handleSaveBio = useCallback(async () => {
    if (!bioFormState) return;
    const rank = Number(bioFormState.rank);
    if (!Number.isFinite(rank)) {
      setBioStatus("Le rang doit \u00eatre num\u00e9rique.");
      return;
    }

    setIsSavingBio(true);
    setBioStatus(null);

    try {
      const response = await fetch("/api/supabase/bios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bioFormState.id,
          slug: bioFormState.slug,
          name: bioFormState.name,
          role: bioFormState.role,
          rank,
          portraitBase: bioFormState.portraitBase,
          bio: bioFormState.bioText
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "\u00c9chec de sauvegarde.");
      }

      const entries = payload.entries ?? [];
      setBioEntries(entries);
      setSelectedBioId(bioFormState.id);
      setBioStatus("Bio sauvegard\u00e9e.");
    } catch (err) {
      setBioStatus(err instanceof Error ? err.message : "\u00c9chec de sauvegarde.");
    } finally {
      setIsSavingBio(false);
    }
  }, [bioFormState]);

  const relatedOptions = useMemo(
    () =>
      sortedArticles
        .filter((article) => article.id !== selectedArticleId)
        .map((article) => ({
          id: article.id,
          title: article.title,
          categoryName: article.categories[0]?.name ?? "Sans cat\u00e9gorie",
        })),
    [sortedArticles, selectedArticleId]
  );

  const selectedIntro = useMemo(
    () => introEntries.find((entry) => entry.id === selectedIntroId) ?? null,
    [introEntries, selectedIntroId]
  );

  useEffect(() => {
    if (!selectedIntro) return;
    setIntroBody({
      markdown: selectedIntro.bodyMarkdown,
      html: selectedIntro.bodyHtml ?? "",
    });
    introDirtyRef.current = false;
    if (introStatus === "error") {
      setIntroStatus("idle");
      setIntroStatusMessage(null);
    }
  }, [introStatus, selectedIntro]);

  const handleIntroSelect = useCallback(
    (entryId: string) => {
      if (!confirmIntroDiscard()) return;
      setSelectedIntroId(entryId);
    },
    [confirmIntroDiscard]
  );

  const handleIntroChange = useCallback(
    (markdown: string, html: string) => {
      setIntroBody({ markdown, html });
      introDirtyRef.current = true;
      if (introStatus === "saved" || introStatus === "error") {
        setIntroStatus("idle");
        setIntroStatusMessage(null);
      }
    },
    [introStatus]
  );

  const handleIntroSave = useCallback(async () => {
    if (!selectedIntro) return;
    setIntroStatus("saving");
    setIntroStatusMessage("Enregistrement\u2026");
    try {
      const response = await fetch("/api/supabase/intros", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: selectedIntro.id,
          bodyMarkdown: introBody.markdown,
          bodyHtml: introBody.html,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Impossible d'enregistrer l'introduction.");
      }
      setIntroEntries(payload.entries ?? []);
      introDirtyRef.current = false;
      setIntroStatus("saved");
      setIntroStatusMessage("Introduction enregistr\u00e9e");
      setTimeout(() => {
        setIntroStatus("idle");
        setIntroStatusMessage(null);
      }, 1500);
    } catch (err) {
      setIntroStatus("error");
      setIntroStatusMessage(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }, [introBody.html, introBody.markdown, selectedIntro]);

  return (
    <section className={`supabase-panel supabase-panel--${workspaceVariant}`}>
      <WorkspaceHeader
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
        articleCount={articleCount}
        biosCount={bios.length}
        canShowSession={canShowSession}
        sessionEmail={sessionEmail}
        isRefreshing={isRefreshing}
        onRefresh={() => refreshCategories(selectedArticleId ?? undefined)}
        createOpen={createOpen}
        onToggleCreate={() => {
          setCreateOpen((open) => {
            const nextOpen = !open;
            if (!open) {
              setCreateDraft((draft) => ({
                ...draft,
                categoryIds: selectedCategoryId ? [selectedCategoryId] : [],
              }));
            }
            return nextOpen;
          });
          setCreateError(null);
        }}
      />

      {isAdmin && (
        <section className="supabase-intros">
          <header className="supabase-intros__header">
            <div>
              <p className="supabase-intros__title">Textes d'introduction</p>
              <p className="supabase-intros__subtitle">
                Mise \u00e0 jour des pages R\u00e9flexion, Cr\u00e9ation et IRL.
              </p>
            </div>
            <div className="supabase-intros__actions">
              <button
                type="button"
                className="supabase-button supabase-button--ghost"
                onClick={() => fetchIntroEntries()}
              >
                Actualiser
              </button>
              <WorkspaceStatusBadge tone={introDigest.tone} label={introDigest.label} />
            </div>
          </header>

          {introError && <div className="supabase-panel__error">{introError}</div>}

          <div className="supabase-intros__body">
            <div className="supabase-intros__list">
              {introEntries.map((entry) => {
                const isActive = entry.id === selectedIntroId;
                const readableTitle = entry.title.replace(/^Intro-/, "");
                return (
                  <button
                    key={entry.id}
                    type="button"
                    className={
                      isActive
                        ? "supabase-intro-card supabase-intro-card--active"
                        : "supabase-intro-card"
                    }
                    onClick={() => handleIntroSelect(entry.id)}
                  >
                    <span className="supabase-intro-card__title">{readableTitle}</span>
                    <span className="supabase-intro-card__slug">{entry.slug}</span>
                    <span className="supabase-intro-card__meta">
                      Mise \u00e0 jour {formatDateTime(entry.updatedAt)}
                    </span>
                  </button>
                );
              })}
              {!introEntries.length && (
                <p className="supabase-intros__empty">Aucune introduction trouv\u00e9e.</p>
              )}
            </div>

            <div className="supabase-intros__editor">
              {selectedIntro ? (
                <>
                  <div className="supabase-editor__richtext-header">
                    <span>Contenu d'introduction</span>
                    <WorkspaceStatusBadge tone={introDigest.tone} label={introDigest.label} />
                  </div>
                  <RichTextEditor
                    key={selectedIntro.id}
                    value={introBody.markdown}
                    htmlValue={introBody.html}
                    onChange={handleIntroChange}
                    placeholder="\u00c9crivez l'introduction\u2026"
                    imageUploadSlug={selectedIntro.slug}
                    mode={editorMode}
                  />
                  <div className="supabase-intros__actions">
                    <button
                      type="button"
                      className="supabase-button supabase-button--primary"
                      onClick={handleIntroSave}
                      disabled={introStatus === "saving"}
                    >
                      {introStatus === "saving" ? "Enregistrement\u2026" : "Enregistrer"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="supabase-workspace__empty">
                  Chargement des introductions\u2026
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {panelError && <div className="supabase-panel__error">{panelError}</div>}

      {currentMode === "articles" && createOpen && (
        <form className="supabase-create" onSubmit={handleCreate}>
          <div className="supabase-create__row">
            <label>
              <span>Titre</span>
              <input
                value={createDraft.title}
                onChange={(event) =>
                  setCreateDraft((draft) => ({ ...draft, title: event.target.value }))
                }
                placeholder="Titre de l'article"
              />
            </label>
            <label>
              <span>Adresse</span>
              <input
                value={createDraft.slug}
                onChange={(event) =>
                  setCreateDraft((draft) => ({ ...draft, slug: event.target.value }))
                }
                placeholder="slug-unique"
                required
              />
            </label>
            <label>
              <span>Auteur\u00b7rice</span>
              <input
                value={createDraft.authorName}
                onChange={(event) =>
                  setCreateDraft((draft) => ({ ...draft, authorName: event.target.value }))
                }
                placeholder="Nom de l'auteur\u00b7rice"
              />
            </label>
            <label className="supabase-create__status">
              <input
                type="checkbox"
                checked={createDraft.status}
                onChange={(event) =>
                  setCreateDraft((draft) => ({ ...draft, status: event.target.checked }))
                }
              />
              <span>Publier imm\u00e9diatement</span>
            </label>
          </div>

          <fieldset className="supabase-create__categories">
            <legend>Cat\u00e9gories</legend>
            <div className="supabase-create__categories-grid">
              {supabaseCategories.map((category) => {
                const checked = createDraft.categoryIds.includes(category.id);
                return (
                  <label key={category.id} className={checked ? "active" : undefined}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        setCreateDraft((draft) => {
                          const has = draft.categoryIds.includes(category.id);
                          if (event.target.checked && !has) {
                            return {
                              ...draft,
                              categoryIds: [...draft.categoryIds, category.id],
                            };
                          }
                          if (!event.target.checked && has) {
                            return {
                              ...draft,
                              categoryIds: draft.categoryIds.filter((id) => id !== category.id),
                            };
                          }
                          return draft;
                        });
                      }}
                    />
                    <span>{category.name}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {createError && <p className="supabase-create__error">{createError}</p>}

          <button
            type="submit"
            className="supabase-button supabase-button--primary"
            disabled={createStatus === "creating"}
          >
            {createStatus === "creating" ? "Cr\u00e9ation\u2026" : "Cr\u00e9er l'article"}
          </button>
        </form>
      )}

      {currentMode === "articles" ? (
      <div
        className={
          isAdmin
            ? "supabase-workspace supabase-workspace--admin"
            : "supabase-workspace"
        }
      >
        {isAdmin ? (
          <div className="supabase-workspace__table">
            <div className="supabase-table__scroll">
              <table className="supabase-table">
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Cat\u00e9gories</th>
                    <th>Statut</th>
                    <th>Mis \u00e0 jour</th>
                    <th>Publi\u00e9</th>
                    <th>Auteur\u00b7rice</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedArticles.length ? (
                    sortedArticles.map((article) => {
                      const isActive = selectedArticleId === article.id;
                      return (
                        <tr
                          key={article.id}
                          className={
                            isActive
                              ? "supabase-table__row supabase-table__row--active"
                              : "supabase-table__row"
                          }
                          onClick={() => handleSelectArticle(article.id, article.primaryCategoryId)}
                          onKeyDown={(event) => {
                            if (
                              event.key === "Enter" ||
                              event.key === " " ||
                              event.key === "Spacebar"
                            ) {
                              event.preventDefault();
                              handleSelectArticle(article.id, article.primaryCategoryId);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-pressed={isActive}
                        >
                          <td>
                            <div className="supabase-table__title">{article.title}</div>
                            <div className="supabase-table__slug">{article.slug}</div>
                          </td>
                          <td>
                            <div className="supabase-table__categories">
                              {article.categories.length ? (
                                article.categories.map((category) => (
                                  <span key={category.id} className="supabase-table__category">
                                    {category.name}
                                  </span>
                                ))
                              ) : (
                                <span className="supabase-table__category supabase-table__category--empty">
                                  Aucune
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span
                              className={
                                article.status
                                  ? "supabase-table__status supabase-table__status--published"
                                  : "supabase-table__status supabase-table__status--draft"
                              }
                            >
                              {article.status ? "Publi\u00e9" : "Brouillon"}
                            </span>
                          </td>
                          <td>{formatDateTime(article.updatedAt)}</td>
                          <td>{formatDateTime(article.publishedAt)}</td>
                          <td>
                            {article.author ? (
                              <span className="supabase-table__author">{article.author}</span>
                            ) : (
                              <span className="supabase-table__muted">\u2014</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr className="supabase-table__empty">
                      <td colSpan={6}>Aucun article disponible.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <aside className="supabase-workspace__sidebar">
            {supabaseCategories.map((category) => (
              <section key={category.id} className="supabase-category">
                <header className="supabase-category__header">
                  <span
                    className="supabase-category__dot"
                    style={{ backgroundColor: category.color || "#999" }}
                  />
                  <span>{category.name}</span>
                </header>
                <ul className="supabase-category__list">
                  {category.articles.map((article) => {
                    const isActive = selectedArticleId === article.id;
                    return (
                      <li key={article.id}>
                        <button
                          type="button"
                          className={
                            isActive
                              ? "supabase-entry supabase-entry--active"
                              : "supabase-entry"
                          }
                          onClick={() => handleSelectArticle(article.id, category.id)}
                        >
                          <span
                            className={
                              article.status
                                ? "supabase-entry__dot supabase-entry__dot--published"
                                : "supabase-entry__dot supabase-entry__dot--draft"
                            }
                            aria-hidden
                          />
                          <span className="supabase-entry__title">{article.title}</span>
                          <span className="supabase-entry__preview">{toPreviewText(article)}</span>
                        </button>
                      </li>
                    );
                  })}
                  {!category.articles.length && (
                    <li className="supabase-category__empty">Aucun article</li>
                  )}
                </ul>
              </section>
            ))}
          </aside>
        )}

        <div className="supabase-workspace__editor">
          {selectedArticleId && formState ? (
            <>
              <div className="supabase-editor__content">
                <section className="supabase-editor__top">
                  <label className="supabase-editor__field supabase-editor__field--title">
                    <span>Titre</span>
                    <input
                      value={formState.title}
                      onChange={(event) => updateForm("title", event.target.value)}
                      placeholder="Titre de l'article"
                    />
                  </label>
                  <div className="supabase-editor__details-grid supabase-editor__details-grid--identity">
                    <label className="supabase-editor__field">
                      <span>Auteur\u00b7rice</span>
                      <input
                        value={formState.authorName}
                        onChange={(event) => updateForm("authorName", event.target.value)}
                        placeholder="Nom de l'auteur\u00b7rice"
                      />
                    </label>
                    <label className="supabase-editor__field">
                      <span>Adresse</span>
                      <input
                        value={formState.slug}
                        onChange={(event) => updateForm("slug", event.target.value)}
                        placeholder="exemple-d'article"
                      />
                    </label>
                  </div>

                  <div className="supabase-editor__details-grid supabase-editor__details-grid--taxonomy">
                    <fieldset className="supabase-editor__field supabase-editor__field--categories">
                      <legend>Cat\u00e9gories</legend>
                      <div className="supabase-editor__categories">
                        {supabaseCategories.map((category) => {
                          const checked = formState.categoryIds.includes(category.id);
                          return (
                            <label key={category.id} className={checked ? "active" : undefined}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleCategoryToggle(category.id)}
                              />
                              <span>{category.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                    <label className="supabase-editor__field supabase-editor__field--checkbox supabase-editor__field--status">
                      <input
                        type="checkbox"
                        checked={formState.status}
                        onChange={(event) => updateForm("status", event.target.checked)}
                      />
                      <span>Article publi\u00e9</span>
                    </label>
                  </div>

                  <div className="supabase-editor__details-grid supabase-editor__details-grid--dates">
                    <label className="supabase-editor__field supabase-editor__field--compact">
                      <span>Date \u00e9ditoriale</span>
                      <input
                        type="date"
                        value={formState.authoredDate}
                        onChange={(event) => updateForm("authoredDate", event.target.value)}
                      />
                    </label>
                    <label className="supabase-editor__field supabase-editor__field--compact">
                      <span>Publication</span>
                      <input
                        type="datetime-local"
                        value={formState.publishedAt}
                        onChange={(event) => updateForm("publishedAt", event.target.value)}
                      />
                    </label>
                  </div>

                  <div className="supabase-editor__details-grid supabase-editor__details-grid--wide">
                    <label className="supabase-editor__field supabase-editor__field--excerpt">
                      <span>Extrait affiché sur la catégorie</span>
                      <textarea
                        rows={3}
                        value={formState.excerpt}
                        onChange={(event) => updateForm("excerpt", event.target.value)}
                      />
                    </label>
                  </div>

                  <div className="supabase-editor__stack">
                    <label className="supabase-editor__field supabase-editor__field--compact">
                      <span>Image d’en-tête</span>
                      <input
                        value={formState.headerImagePath}
                        onChange={(event) => updateForm("headerImagePath", event.target.value)}
                        placeholder="storage/articles/image.jpg"
                      />
                    </label>

                    <label className="supabase-editor__field supabase-editor__field--related supabase-editor__field--compact">
                      <span>Articles liés</span>
                      <select
                        multiple
                        value={formState.relatedArticleIds}
                        onChange={(event) =>
                          handleRelatedChange(
                            Array.from(event.target.selectedOptions).map((option) => option.value)
                          )
                        }
                      >
                        {relatedOptions.map((article) => (
                          <option key={article.id} value={article.id}>
                            {article.title} · {article.categoryName}
                          </option>
                        ))}
                      </select>
                    </label>

                    {articleDetail?.media?.length ? (
                      <div className="supabase-editor__media">
                        <h4>Médias liés</h4>
                        <ul>
                          {articleDetail.media.map((media) => (
                            <li key={media.id}>
                              <code>{media.storagePath}</code>
                              {media.caption && <span>{media.caption}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>

                  {showAdvanced && (
                    <details className="supabase-editor__advanced">
                      <summary>Afficher les champs bruts</summary>
                      <label className="supabase-editor__field">
                        <span>Contenu Markdown</span>
                        <textarea
                          className="supabase-editor__textarea"
                          value={formState.bodyMarkdown}
                          onChange={(event) => updateForm("bodyMarkdown", event.target.value)}
                        />
                      </label>

                      <label className="supabase-editor__field">
                        <span>Contenu HTML</span>
                        <textarea
                          className="supabase-editor__textarea"
                          value={formState.bodyHtml}
                          onChange={(event) => updateForm("bodyHtml", event.target.value)}
                        />
                      </label>

                      <label className="supabase-editor__field">
                        <span>Contenu JSON (TipTap / Rich text)</span>
                        <textarea
                          className="supabase-editor__textarea"
                          value={formState.bodyJson}
                          onChange={(event) => updateForm("bodyJson", event.target.value)}
                          placeholder='{ "type": "doc" }'
                        />
                      </label>
                    </details>
                  )}

                  {articleDetail && (
                    <div className="supabase-editor__meta">
                      <span>Créé le {new Date(articleDetail.createdAt).toLocaleString("fr-FR")}</span>
                      <span>Mis à jour le {new Date(articleDetail.updatedAt).toLocaleString("fr-FR")}</span>
                    </div>
                  )}
                </section>

                <section className="supabase-editor__canvas">
                  <div className="supabase-editor__richtext-header">
                    <span>Contenu de l'article</span>
                    <span
                      className={`supabase-editor__status supabase-editor__status--${digest.tone}`}
                    >
                      {digest.label}
                    </span>
                  </div>
                  <RichTextEditor
                    key={articleDetail?.id ?? "new"}
                    value={formState.bodyMarkdown}
                    htmlValue={formState.bodyHtml}
                    onChange={handleRichTextChange}
                    placeholder="\u00c9crivez votre article\u2026"
                    imageUploadSlug={formState.slug}
                    mode={editorMode}
                  />
                </section>

                <footer className="supabase-editor__footer">
                  <button
                    type="button"
                    className="supabase-button supabase-button--primary"
                    onClick={handleSave}
                    disabled={status === "saving"}
                  >
                    {status === "saving" ? "Enregistrement\u2026" : "Enregistrer"}
                  </button>
                  <button
                    type="button"
                    className="supabase-button supabase-button--danger"
                    onClick={handleDelete}
                    disabled={deleteStatus === "deleting"}
                  >
                    {deleteStatus === "deleting" ? "Suppression\u2026" : "Supprimer"}
                  </button>
                </footer>
              </div>
            </>
          ) : (
            <div className="supabase-workspace__empty">
              S\u00e9lectionnez un article pour commencer.
            </div>
          )}
        </div>
      </div>

      ) : (
        <div className="supabase-workspace">
          <aside className="supabase-workspace__sidebar">
            <section className="supabase-category">
              <header className="supabase-category__header">
                <span className="supabase-category__dot" style={{ backgroundColor: "#6f74d7" }} />
                <span>Bios</span>
              </header>
              <ul className="supabase-category__list">
                {bioEntries.map((entry) => {
                  const isActive = selectedBioId === entry.id;
                  return (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className={isActive ? "supabase-entry supabase-entry--active" : "supabase-entry"}
                        onClick={() => {
                          setSelectedBioId(entry.id);
                          setBioStatus(null);
                        }}
                      >
                        <span className="supabase-entry__title">{entry.name}</span>
                        <span className="supabase-entry__preview">
                          {(entry.bio || []).join(" ").replace(/\s+/g, " ").trim() || "Bio indisponible"}
                        </span>
                      </button>
                    </li>
                  );
                })}
                {!bioEntries.length && (
                  <li className="supabase-category__empty">Aucune bio</li>
                )}
              </ul>
            </section>
          </aside>

          <div className="supabase-workspace__editor">
            {bioFormState ? (
              <div className="supabase-editor__content">
                <section className="supabase-editor__top">
                  <div className="supabase-editor__details-grid supabase-editor__details-grid--compact">
                    <label className="supabase-editor__field supabase-editor__field--compact">
                      <span>Nom</span>
                      <input
                        value={bioFormState.name}
                        onChange={(event) =>
                          setBioFormState((current) =>
                            current ? { ...current, name: event.target.value } : current
                          )
                        }
                      />
                    </label>
                    <label className="supabase-editor__field supabase-editor__field--compact">
                      <span>Slug</span>
                      <input
                        value={bioFormState.slug}
                        onChange={(event) =>
                          setBioFormState((current) =>
                            current ? { ...current, slug: event.target.value } : current
                          )
                        }
                      />
                    </label>
                    <label className="supabase-editor__field supabase-editor__field--compact">
                      <span>R\u00f4le</span>
                      <input
                        value={bioFormState.role}
                        onChange={(event) =>
                          setBioFormState((current) =>
                            current ? { ...current, role: event.target.value } : current
                          )
                        }
                      />
                    </label>
                    <label className="supabase-editor__field supabase-editor__field--compact supabase-editor__field--rank">
                      <span>Rang</span>
                      <input
                        value={bioFormState.rank}
                        onChange={(event) =>
                          setBioFormState((current) =>
                            current ? { ...current, rank: event.target.value } : current
                          )
                        }
                      />
                    </label>
                    <label className="supabase-editor__field supabase-editor__field--compact">
                      <span>Portrait base</span>
                      <input
                        value={bioFormState.portraitBase}
                        onChange={(event) =>
                          setBioFormState((current) =>
                            current ? { ...current, portraitBase: event.target.value } : current
                          )
                        }
                      />
                    </label>
                  </div>

                  <label className="supabase-editor__field supabase-editor__field--bio-main">
                    <span>Bio</span>
                    <textarea
                      rows={14}
                      value={bioFormState.bioText}
                      onChange={(event) =>
                        setBioFormState((current) =>
                          current ? { ...current, bioText: event.target.value } : current
                        )
                      }
                    />
                  </label>
                </section>

                <footer className="supabase-editor__footer">
                  {bioStatus && <span className="supabase-editor__status">{bioStatus}</span>}
                  <button
                    type="button"
                    className="supabase-button supabase-button--ghost"
                    onClick={refreshBios}
                  >
                    Actualiser
                  </button>
                  <button
                    type="button"
                    className="supabase-button supabase-button--primary"
                    onClick={handleSaveBio}
                    disabled={isSavingBio}
                  >
                    {isSavingBio ? "Enregistrement\u2026" : "Enregistrer"}
                  </button>
                </footer>
              </div>
            ) : (
              <div className="supabase-workspace__empty">S\u00e9lectionnez une bio pour commencer.</div>
            )}
          </div>
        </div>
      )}

      <SupabaseWorkspaceStyles />
    </section>
  );
};

export default SupabaseWorkspace;
