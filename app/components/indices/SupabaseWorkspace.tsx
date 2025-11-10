import { signOut, useSession } from "next-auth/react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  SupabaseArticleDetail,
  SupabaseCategorySummary,
} from "../../../types/supabase";
import SupabaseRichTextEditor from "./SupabaseRichTextEditor";

const toLocalDateTimeInput = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const fromLocalDateTime = (value: string): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

type SupabaseFormState = {
  title: string;
  slug: string;
  authorName: string;
  status: boolean;
  authoredDate: string;
  publishedAt: string;
  preview: string;
  excerpt: string;
  headerImagePath: string;
  bodyMarkdown: string;
  bodyJson: string;
  bodyHtml: string;
  categoryIds: string[];
  relatedArticleIds: string[];
};

const detailToForm = (detail: SupabaseArticleDetail): SupabaseFormState => ({
  title: detail.title ?? "",
  slug: detail.slug ?? "",
  authorName: detail.authorName ?? "",
  status: detail.status,
  authoredDate: detail.authoredDate ?? "",
  publishedAt: toLocalDateTimeInput(detail.publishedAt ?? null),
  preview: detail.preview ?? "",
  excerpt: detail.excerpt ?? "",
  headerImagePath: detail.headerImagePath ?? "",
  bodyMarkdown: detail.bodyMarkdown ?? "",
  bodyJson: detail.bodyJson ?? "",
  bodyHtml: detail.bodyHtml ?? "",
  categoryIds: detail.categories.map((category) => category.id),
  relatedArticleIds: detail.relatedArticles.map((relation) => relation.relatedId),
});

type StatusTone = "idle" | "loading" | "saving" | "saved" | "dirty" | "error";

export type SupabaseWorkspaceVariant = "writer" | "admin" | "master";

type SupabaseWorkspaceProps = {
  categories: SupabaseCategorySummary[];
  error?: string | null;
  variant?: SupabaseWorkspaceVariant;
};

const SupabaseWorkspace: React.FC<SupabaseWorkspaceProps> = ({
  categories,
  error,
  variant = "admin",
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

  const { data: session, status: sessionStatus } = useSession();
  const sessionEmail = session?.user?.email ?? "";
  const canShowSession = sessionStatus === "authenticated";

  const workspaceVariant = variant;
  const showAdvanced = workspaceVariant !== "writer";

  useEffect(() => {
    setSupabaseCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (error) {
      setPanelError(error);
    }
  }, [error]);

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

  const allArticles = useMemo(
    () =>
      supabaseCategories.flatMap((category) =>
        category.articles.map((article) => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          categoryName: category.name,
        }))
      ),
    [supabaseCategories]
  );

  const digest = useMemo(() => {
    if (status === "loading") {
      return { tone: "loading" as StatusTone, label: "Chargement…" };
    }
    if (status === "saving") {
      return { tone: "saving" as StatusTone, label: "Enregistrement…" };
    }
    if (status === "error") {
      return { tone: "error" as StatusTone, label: statusMessage ?? "Erreur" };
    }
    if (status === "saved") {
      return { tone: "saved" as StatusTone, label: statusMessage ?? "Enregistré" };
    }
    if (dirtyRef.current) {
      return { tone: "dirty" as StatusTone, label: "Modifications non enregistrées" };
    }
    return { tone: "idle" as StatusTone, label: statusMessage ?? "Stable" };
  }, [status, statusMessage]);

  const confirmDiscard = useCallback(() => {
    if (!dirtyRef.current) return true;
    return window.confirm("Des modifications non enregistrées seront perdues. Continuer ?");
  }, []);

  const fetchArticle = useCallback(async (articleId: string) => {
    setStatus("loading");
    setStatusMessage("Chargement…");
    dirtyRef.current = false;
    try {
      const response = await fetch(`/api/supabase/articles/${articleId}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Impossible de charger l’article.");
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
    if (selectedArticleId || !selectedCategoryId) {
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
  }, [fetchArticle, selectedArticleId, selectedCategoryId, supabaseCategories]);

  const refreshCategories = useCallback(
    async (focusArticleId?: string) => {
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
      }
    },
    [fetchArticle]
  );

  const handleSelectArticle = useCallback(
    async (categoryId: string, articleId: string) => {
      if (!confirmDiscard()) {
        return;
      }
      setSelectedCategoryId(categoryId);
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
    (markdown: string, html: string) => {
      setFormState((current) => {
        if (!current) return current;
        return {
          ...current,
          bodyMarkdown: markdown,
          bodyHtml: html,
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
    setStatusMessage("Enregistrement en cours…");
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
        throw new Error(data?.error ?? "Impossible d’enregistrer l’article.");
      }

      setSupabaseCategories(data.categories);
      setArticleDetail(data.article);
      setFormState(detailToForm(data.article));
      dirtyRef.current = false;
      setStatus("saved");
      setStatusMessage("Modifications enregistrées");
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
          throw new Error(data?.error ?? "Création impossible.");
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
    if (!window.confirm("Supprimer définitivement cet article ?")) {
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

  const relatedOptions = useMemo(
    () => allArticles.filter((article) => article.id !== selectedArticleId),
    [allArticles, selectedArticleId]
  );

  return (
    <section className={`supabase-panel supabase-panel--${workspaceVariant}`}>
      <header className="supabase-panel__header">
        <div className="supabase-panel__intro">
          {canShowSession && (
            <div className="supabase-panel__session">
              <div className="supabase-panel__session-info">
                <span className="supabase-panel__session-label">Connecté·e</span>
                <span className="supabase-panel__session-email">{sessionEmail}</span>
              </div>
              <button
                type="button"
                className="supabase-panel__signout"
                onClick={() => signOut()}
              >
                Déconnexion
              </button>
            </div>
          )}
          <p className="supabase-panel__subtitle">
            {allArticles.length} article{allArticles.length > 1 ? "s" : ""} en ligne
          </p>
        </div>
        <div className="supabase-panel__actions">
          <button
            type="button"
            className="supabase-button supabase-button--ghost"
            onClick={() => refreshCategories(selectedArticleId ?? undefined)}
          >
            Actualiser
          </button>
          <button
            type="button"
            className="supabase-button"
            onClick={() => {
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
          >
            {createOpen ? "Fermer" : "Nouvel article"}
          </button>
        </div>
      </header>

      {panelError && <div className="supabase-panel__error">{panelError}</div>}

      {createOpen && (
        <form className="supabase-create" onSubmit={handleCreate}>
          <div className="supabase-create__row">
            <label>
              <span>Titre</span>
              <input
                value={createDraft.title}
                onChange={(event) =>
                  setCreateDraft((draft) => ({ ...draft, title: event.target.value }))
                }
                placeholder="Titre de l’article"
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
              <span>Auteur·rice</span>
              <input
                value={createDraft.authorName}
                onChange={(event) =>
                  setCreateDraft((draft) => ({ ...draft, authorName: event.target.value }))
                }
                placeholder="Nom de l’auteur·rice"
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
              <span>Publier immédiatement</span>
            </label>
          </div>

          <fieldset className="supabase-create__categories">
            <legend>Catégories</legend>
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
            {createStatus === "creating" ? "Création…" : "Créer l’article"}
          </button>
        </form>
      )}

      <div className="supabase-workspace">
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
                        className={isActive ? "supabase-entry supabase-entry--active" : "supabase-entry"}
                        onClick={() => handleSelectArticle(category.id, article.id)}
                      >
                        <span className="supabase-entry__title">{article.title}</span>
                        <span className="supabase-entry__slug">{article.slug}</span>
                        <span
                          className={
                            article.status
                              ? "supabase-entry__status supabase-entry__status--published"
                              : "supabase-entry__status supabase-entry__status--draft"
                          }
                        >
                          {article.status ? "Publié" : "Brouillon"}
                        </span>
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

        <div className="supabase-workspace__editor">
          {selectedArticleId && formState ? (
            <>
              <div className="supabase-editor__content">
                <section className="supabase-editor__primary">
                  <label className="supabase-editor__field supabase-editor__field--title">
                    <span>Titre</span>
                    <input
                      value={formState.title}
                      onChange={(event) => updateForm("title", event.target.value)}
                      placeholder="Titre de l’article"
                    />
                  </label>
                  <div className="supabase-editor__primary-row">
                    <label className="supabase-editor__field">
                      <span>Auteur·rice</span>
                      <input
                        value={formState.authorName}
                        onChange={(event) => updateForm("authorName", event.target.value)}
                        placeholder="Nom de l’auteur·rice"
                      />
                    </label>
                    <fieldset className="supabase-editor__field supabase-editor__field--categories">
                      <legend>Catégories</legend>
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
                  </div>
                </section>

                <section className="supabase-editor__canvas">
                  <div className="supabase-editor__richtext-header">
                    <span>Contenu de l’article</span>
                    <span
                      className={`supabase-editor__status supabase-editor__status--${digest.tone}`}
                    >
                      {digest.label}
                    </span>
                  </div>
                  <SupabaseRichTextEditor
                    key={articleDetail?.id ?? "new"}
                    value={formState.bodyMarkdown}
                    onChange={handleRichTextChange}
                    placeholder="Écrivez votre article…"
                  />
                </section>

                <section className="supabase-editor__details">
                  <div className="supabase-editor__details-grid">
                    <label className="supabase-editor__field">
                      <span>Adresse</span>
                      <input
                        value={formState.slug}
                        onChange={(event) => updateForm("slug", event.target.value)}
                        placeholder="exemple-d’article"
                      />
                    </label>
                    <label className="supabase-editor__field supabase-editor__field--checkbox">
                      <input
                        type="checkbox"
                        checked={formState.status}
                        onChange={(event) => updateForm("status", event.target.checked)}
                      />
                      <span>Article publié</span>
                    </label>
                    <label className="supabase-editor__field">
                      <span>Date éditoriale</span>
                      <input
                        type="date"
                        value={formState.authoredDate}
                        onChange={(event) => updateForm("authoredDate", event.target.value)}
                      />
                    </label>
                    <label className="supabase-editor__field">
                      <span>Date de publication</span>
                      <input
                        type="datetime-local"
                        value={formState.publishedAt}
                        onChange={(event) => updateForm("publishedAt", event.target.value)}
                      />
                    </label>
                  </div>

                  <div className="supabase-editor__details-grid supabase-editor__details-grid--wide">
                    <label className="supabase-editor__field">
                      <span>Résumé (preview)</span>
                      <textarea
                        value={formState.preview}
                        onChange={(event) => updateForm("preview", event.target.value)}
                      />
                    </label>
                    <label className="supabase-editor__field">
                      <span>Extrait (excerpt)</span>
                      <textarea
                        value={formState.excerpt}
                        onChange={(event) => updateForm("excerpt", event.target.value)}
                      />
                    </label>
                  </div>

                  <div className="supabase-editor__stack">
                    <label className="supabase-editor__field">
                      <span>Image d’en-tête (URL ou chemin de stockage)</span>
                      <input
                        value={formState.headerImagePath}
                        onChange={(event) => updateForm("headerImagePath", event.target.value)}
                        placeholder="storage/articles/image.jpg"
                      />
                    </label>

                    <label className="supabase-editor__field supabase-editor__field--related">
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

                  <footer className="supabase-editor__footer">
                    <button
                      type="button"
                      className="supabase-button supabase-button--primary"
                      onClick={handleSave}
                      disabled={status === "saving"}
                    >
                      {status === "saving" ? "Enregistrement…" : "Enregistrer"}
                    </button>
                    <button
                      type="button"
                      className="supabase-button supabase-button--danger"
                      onClick={handleDelete}
                      disabled={deleteStatus === "deleting"}
                    >
                      {deleteStatus === "deleting" ? "Suppression…" : "Supprimer"}
                    </button>
                  </footer>
                </section>
              </div>
            </>
          ) : (
            <div className="supabase-workspace__empty">
              Sélectionnez un article pour commencer.
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .supabase-panel {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow: hidden;
        }
        .supabase-panel__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          flex-shrink: 0;
        }
        .supabase-panel__intro {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .supabase-panel__session {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 10px 16px;
          border-radius: 18px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.6);
          box-shadow: 0 10px 24px rgba(18, 19, 27, 0.08);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }
        .supabase-panel__session-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .supabase-panel__session-label {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #6b6e76;
        }
        .supabase-panel__session-email {
          font-size: 13px;
          font-weight: 600;
          color: #1c1e24;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        .supabase-panel__signout {
          border: none;
          border-radius: 999px;
          padding: 8px 16px;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          background: #1f2024;
          color: #ffffff;
          cursor: pointer;
        }
        .supabase-panel__signout:hover {
          background: #292a30;
        }
        .supabase-panel__subtitle {
          margin: 0;
          font-size: 13px;
          color: #5a5c62;
        }
        .supabase-panel__actions {
          display: flex;
          gap: 12px;
        }
        .supabase-panel__error {
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(162, 47, 33, 0.08);
          color: #a62f21;
          font-size: 13px;
          flex-shrink: 0;
        }
        .supabase-button {
          border: none;
          border-radius: 999px;
          padding: 10px 18px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          cursor: pointer;
          background: #1f1f22;
          color: #ffffff;
        }
        .supabase-button--ghost {
          background: transparent;
          border: 1px solid rgba(0, 0, 0, 0.12);
          color: #1f1f22;
        }
        .supabase-button--primary {
          background: #2b7a4a;
        }
        .supabase-button--danger {
          background: #a62f21;
        }
        .supabase-create {
          display: flex;
          flex-direction: column;
          gap: 16px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          padding: 16px;
          background: #f9fafb;
          flex-shrink: 0;
        }
        .supabase-create__row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }
        .supabase-create__row label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #71737b;
        }
        .supabase-create__row input[type="text"],
        .supabase-create__row input[type="checkbox"],
        .supabase-create__row input[type="date"],
        .supabase-create__row input[type="datetime-local"],
        .supabase-create__row input[type="time"] {
          font-family: inherit;
        }
        .supabase-create__row input[type="text"],
        .supabase-create__row input[type="date"],
        .supabase-create__row input[type="datetime-local"],
        .supabase-create__row input[type="time"] {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: #ffffff;
          font-size: 13px;
        }
        .supabase-create__status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          letter-spacing: 0;
          text-transform: none;
        }
        .supabase-create__categories {
          margin: 0;
          border: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .supabase-create__categories legend {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #71737b;
        }
        .supabase-create__categories-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .supabase-create__categories-grid label {
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
        }
        .supabase-create__categories-grid label.active {
          border-color: rgba(36, 119, 70, 0.32);
          background: rgba(36, 119, 70, 0.08);
        }
        .supabase-create__error {
          margin: 0;
          color: #a62f21;
          font-size: 12px;
        }
        .supabase-workspace {
          flex: 1;
          min-height: 0;
          display: grid;
          grid-template-columns: 320px minmax(0, 1fr);
          gap: 24px;
        }
        .supabase-workspace__sidebar {
          min-height: 0;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-right: 8px;
        }
        .supabase-category__header {
          display: flex;
          align-items: center;
          gap: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: 10px;
          color: #7a7c82;
        }
        .supabase-category__dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }
        .supabase-category__list {
          list-style: none;
          margin: 8px 0 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .supabase-category__empty {
          font-size: 12px;
          color: #7a7c82;
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px dashed rgba(0, 0, 0, 0.08);
        }
        .supabase-entry {
          width: 100%;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: #ffffff;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .supabase-entry:hover {
          border-color: rgba(0, 0, 0, 0.18);
          box-shadow: 0 8px 20px rgba(17, 17, 23, 0.08);
        }
        .supabase-entry--active {
          border-color: rgba(36, 119, 70, 0.32);
          box-shadow: inset 0 0 0 1px rgba(36, 119, 70, 0.2);
        }
        .supabase-entry__title {
          font-size: 13px;
          font-weight: 600;
          color: #1f2024;
        }
        .supabase-entry__slug {
          font-size: 11px;
          color: #787a80;
        }
        .supabase-entry__status {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #787a80;
        }
        .supabase-entry__status--published {
          color: #2b7a4a;
        }
        .supabase-workspace__editor {
          flex: 1;
          min-height: 0;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 20px;
          padding: 20px;
          background: linear-gradient(140deg, #ffffff 0%, #f4f5fb 100%);
          display: flex;
          flex-direction: column;
          gap: 18px;
          overflow: visible;
        }
        .supabase-workspace__empty {
          margin: auto;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #7a7c82;
          border: 1px dashed rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          padding: 40px 24px;
          background: #fafbff;
        }
        .supabase-editor__status {
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: #f6f7fb;
          color: #4c4f58;
          flex-shrink: 0;
        }
        .supabase-editor__status--dirty {
          border-color: rgba(168, 68, 52, 0.32);
          background: rgba(168, 68, 52, 0.12);
          color: #a64534;
        }
        .supabase-editor__status--loading {
          border-color: rgba(156, 132, 35, 0.32);
          background: rgba(156, 132, 35, 0.12);
          color: #8a7120;
        }
        .supabase-editor__status--saving {
          border-color: rgba(36, 119, 70, 0.32);
          background: rgba(36, 119, 70, 0.12);
          color: #2b7a4a;
        }
        .supabase-editor__status--saved {
          border-color: rgba(36, 119, 70, 0.28);
          background: rgba(36, 119, 70, 0.08);
          color: #2b7a4a;
        }
        .supabase-editor__status--error {
          border-color: rgba(162, 47, 33, 0.32);
          background: rgba(162, 47, 33, 0.12);
          color: #a62f21;
        }
        .supabase-editor__content {
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding-right: 6px;
        }
        .supabase-editor__primary,
        .supabase-editor__canvas,
        .supabase-editor__details {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .supabase-editor__canvas {
          flex: 1;
          min-height: 0;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6), 0 18px 36px rgba(17, 18, 31, 0.06);
        }
        .supabase-editor__primary-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .supabase-editor__field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #6f717a;
          flex: 1 1 200px;
        }
        .supabase-editor__field span,
        .supabase-editor__field legend {
          font-size: inherit;
          letter-spacing: inherit;
          text-transform: inherit;
          color: inherit;
        }
        .supabase-editor__field legend {
          padding: 0;
        }
        .supabase-editor__field input,
        .supabase-editor__field textarea,
        .supabase-editor__field select {
          padding: 11px 14px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: #f9f9fd;
          font-size: 13px;
          color: #1f2024;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .supabase-editor__field input:focus,
        .supabase-editor__field textarea:focus,
        .supabase-editor__field select:focus {
          outline: none;
          border-color: rgba(36, 119, 70, 0.4);
          background: #ffffff;
        }
        .supabase-editor__field--title {
          flex-basis: 100%;
        }
        .supabase-editor__field--title input {
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        .supabase-editor__field--categories {
          border: none;
          padding: 0;
          margin: 0;
          min-width: 260px;
        }
        .supabase-editor__field--categories .supabase-editor__categories {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .supabase-editor__categories label {
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 12px;
          text-transform: none;
          letter-spacing: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .supabase-editor__categories label.active {
          border-color: rgba(36, 119, 70, 0.34);
          background: rgba(36, 119, 70, 0.1);
        }
        .supabase-editor__categories input {
          accent-color: #2b7a4a;
        }
        .supabase-editor__canvas .supabase-editor__richtext-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          padding-bottom: 8px;
        }
        .supabase-editor__richtext-header span:first-of-type {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #2a2c34;
        }
        .supabase-rich-text {
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 14px;
          overflow: hidden;
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #ffffff;
        }
        .supabase-rich-text .ql-toolbar {
          border: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }
        .supabase-rich-text .ql-container {
          border: none;
          font-family: "IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          flex: 1;
          min-height: 0;
        }
        .supabase-rich-text__loading {
          padding: 24px;
          text-align: center;
          font-size: 13px;
          color: #5a5c62;
        }
        .supabase-editor__details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .supabase-editor__details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }
        .supabase-editor__details-grid--wide {
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        }
        .supabase-editor__stack {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .supabase-editor__stack > * {
          margin: 0;
        }
        .supabase-editor__field textarea {
          min-height: 120px;
          resize: vertical;
        }
        .supabase-editor__textarea {
          min-height: 160px;
          font-family: "IBM Plex Mono", "SFMono-Regular", Menlo, monospace;
        }
        .supabase-editor__field--checkbox {
          flex-direction: row;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          text-transform: none;
          letter-spacing: 0.04em;
          color: #2a2c34;
        }
        .supabase-editor__field--checkbox input {
          width: 18px;
          height: 18px;
        }
        .supabase-editor__advanced {
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 14px;
          padding: 14px;
          background: #f9f9fd;
        }
        .supabase-editor__advanced summary {
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .supabase-editor__advanced[open] {
          background: #f3f4fa;
        }
        .supabase-editor__advanced .supabase-editor__field {
          margin-top: 12px;
        }
        .supabase-editor__media h4 {
          margin: 0;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #5a5c62;
        }
        .supabase-editor__media {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .supabase-editor__media ul {
          margin: 4px 0 0;
          padding-left: 16px;
          color: #5a5c62;
          font-size: 12px;
        }
        .supabase-editor__media code {
          background: rgba(0, 0, 0, 0.04);
          padding: 2px 6px;
          border-radius: 6px;
        }
        .supabase-editor__meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 11px;
          color: #7a7c82;
        }
        .supabase-editor__footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 10px;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }
        .supabase-panel--writer .supabase-workspace__editor {
          background: linear-gradient(145deg, #ffffff 0%, #eef0fa 100%);
        }
        .supabase-panel--writer .supabase-editor__field {
          font-size: 9px;
          letter-spacing: 0.18em;
        }
        .supabase-panel--writer .supabase-editor__field--title input {
          font-size: 20px;
        }
        .supabase-panel--writer .supabase-editor__richtext-header span:first-of-type {
          font-size: 13px;
        }
        @media (max-width: 900px) {
          .supabase-editor__primary-row {
            flex-direction: column;
          }
          .supabase-editor__field--categories {
            min-width: 0;
          }
        }
        @media (max-width: 1080px) {
          .supabase-workspace {
            grid-template-columns: minmax(0, 1fr);
            grid-template-rows: minmax(0, 320px) minmax(0, 1fr);
          }
          .supabase-workspace__sidebar {
            max-height: none;
            padding-right: 0;
          }
        }
        @media (max-width: 720px) {
          .supabase-panel__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .supabase-panel__actions {
            flex-wrap: wrap;
          }
          .supabase-create__row {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          }
        }
      `}</style>
    </section>
  );
};

export default SupabaseWorkspace;
