/**
 * Sets de Colonia Radio grabados en Ámbar, publicados en YouTube.
 * Solo guardamos el id del video: la miniatura y el reproductor salen de YouTube.
 * En E5 esta lista pasa a Supabase, editable desde el panel de admin.
 */
export type SetGrabado = {
  youtubeId: string;
  titulo: string;
  serie?: "Patio Sessions";
};

export const sets: SetGrabado[] = [
  // TODO: completar títulos (DJ y fecha) copiándolos de YouTube.
  { youtubeId: "vKIz0q-vpBc", titulo: "Set en vivo · Colonia Radio" },
  { youtubeId: "uMr_ih3z_K4", titulo: "Set en vivo · Colonia Radio" },
  { youtubeId: "CQhG6M46xGM", titulo: "Set en vivo · Colonia Radio" },
  { youtubeId: "C5dDCYjzuUk", titulo: "Set en vivo · Colonia Radio" },
];
