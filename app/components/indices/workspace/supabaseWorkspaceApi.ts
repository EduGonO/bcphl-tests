export const fetchArticleDirectory = async () => {
  const response = await fetch('/api/supabase/articles');
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error ?? 'Impossible de charger les articles.');
  return payload;
};

export const fetchArticleDetail = async (articleId: string) => {
  const response = await fetch(`/api/supabase/articles/${articleId}`);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error ?? 'Impossible de charger l’article.');
  return payload;
};

export const createArticle = async (payload: unknown) => {
  const response = await fetch('/api/supabase/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error ?? 'Création impossible.');
  return data;
};

export const updateArticle = async (articleId: string, payload: unknown) => {
  const response = await fetch(`/api/supabase/articles/${articleId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error ?? 'Impossible d’enregistrer l’article.');
  return data;
};

export const deleteArticle = async (articleId: string) => {
  const response = await fetch(`/api/supabase/articles/${articleId}`, { method: 'DELETE' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error ?? 'Suppression impossible.');
  return payload;
};

export const fetchBios = async () => {
  const response = await fetch('/api/supabase/bios');
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error ?? 'Impossible de charger les bios.');
  return payload;
};

export const updateBio = async (payload: unknown) => {
  const response = await fetch('/api/supabase/bios', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error ?? 'Échec de sauvegarde.');
  return data;
};

export const fetchIntros = async () => {
  const response = await fetch('/api/supabase/intros');
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error ?? 'Impossible de charger les introductions.');
  return payload;
};

export const updateIntro = async (payload: unknown) => {
  const response = await fetch('/api/supabase/intros', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error ?? 'Impossible d’enregistrer l’introduction.');
  return data;
};
