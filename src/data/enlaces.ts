/** Enlaces externos de Ámbar. utm_source=web permite que Ámbar vea en Meitre cuántas reservas trae la web. */
export const enlaces = {
  reservas:
    "https://ambar-recoleta.meitre.com/?utm_source=web&utm_medium=referral",
  instagram: "https://www.instagram.com/ambar.recoleta/",
  colonia: "https://coloniaradio.com/",
  mapa: "https://www.google.com/maps/search/?api=1&query=Junín+1725,+Recoleta,+Buenos+Aires",
} as const;

/**
 * WhatsApp de Ámbar para eventos privados (confirmado por Ámbar por Instagram).
 * Formato internacional sin espacios ni símbolos: 54 (Argentina) + 9 (celular) + 11 (CABA) + número.
 */
export const telefonoEventos = {
  visible: "11 2335-6470",
  internacional: "5491123356470",
} as const;

/** Link que abre WhatsApp con el mensaje ya escrito. */
export function linkWhatsApp(mensaje: string) {
  return `https://wa.me/${telefonoEventos.internacional}?text=${encodeURIComponent(mensaje)}`;
}
