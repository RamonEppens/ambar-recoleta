/**
 * La carta de Ámbar, transcripta de las historias de Instagram (menú de cena,
 * aperitivo y tragos). Es la base del catálogo de E4 y de la tabla de E5.
 *
 * Precios en miles de pesos, como los publica Ámbar. Son de referencia: vienen
 * de historias de distintas fechas y se actualizan desde el panel de admin (E5).
 * Los nombres de los platos no se traducen; las descripciones sí.
 */

type Texto = { es: string; en: string };

export type Plato = {
  id: string;
  nombre: string;
  descripcion: Texto;
  precio: number | null;
};

export type Seccion = { id: string; titulo: Texto; platos: Plato[] };

export type Carta = {
  id: "cena" | "aperitivo" | "tragos";
  titulo: Texto;
  secciones: Seccion[];
};

export const cartas: Carta[] = [
  {
    id: "cena",
    titulo: { es: "Carta de cena", en: "Dinner menu" },
    secciones: [
      {
        id: "chicos",
        titulo: { es: "Chicos", en: "Small" },
        platos: [
          {
            id: "garlic-bread",
            nombre: "Panera de Garlic Bread",
            descripcion: {
              es: "Pan estilo focaccia extra húmeda con ajo.",
              en: "Extra-moist focaccia-style bread with garlic.",
            },
            precio: 8,
          },
          {
            id: "chipa-frito",
            nombre: "Chipá Frito",
            descripcion: {
              es: "Un clásico. 8 unidades. Con miel de gochujang.",
              en: "A classic. 8 pieces. With gochujang honey.",
            },
            precio: 15,
          },
          {
            id: "cabutia-horneada",
            nombre: "Cabutia Horneada",
            descripcion: {
              es: "Ricota casera, aderezada con salsa hoisin y manteca noisette.",
              en: "House-made ricotta, dressed with hoisin sauce and brown butter.",
            },
            precio: 19,
          },
          {
            id: "tataki-pescado",
            nombre: "Tataki de Pescado",
            descripcion: {
              es: "Lomo de atún rojo, lima, aceite de oliva Bendito.",
              en: "Bluefin tuna loin, lime, Bendito olive oil.",
            },
            precio: 24,
          },
          {
            id: "papas-fritas",
            nombre: "Papas Fritas",
            descripcion: {
              es: "3 cocciones, sazonadas con 5 especias.",
              en: "Triple-cooked, seasoned with five spices.",
            },
            precio: 14,
          },
          {
            id: "pate-pato",
            nombre: "Paté de Pato",
            descripcion: {
              es: "Con palmeritas y conserva de caqui.",
              en: "With palmiers and persimmon preserve.",
            },
            precio: 16,
          },
          {
            id: "ostras-patagonia",
            nombre: "Ostras de la Patagonia",
            descripcion: {
              es: "Gastrique de uvas, echalotes, salsa picante Szechuan, oliva Bendito y cilantro. 3 unidades.",
              en: "Grape gastrique, shallots, Szechuan hot sauce, Bendito olive oil and cilantro. 3 pieces.",
            },
            precio: 9,
          },
        ],
      },
      {
        id: "medianos",
        titulo: { es: "Medianos", en: "Medium" },
        platos: [
          {
            id: "tartar-ciervo",
            nombre: "Tartar de Ciervo",
            descripcion: {
              es: "Ciervo de las pampas. Yema de huevo, papitas fritas.",
              en: "Pampas venison. Egg yolk, crisps.",
            },
            precio: 29,
          },
          {
            id: "repollitos-bruselas",
            nombre: "Repollitos de Bruselas",
            descripcion: {
              es: "Horneados y caramelizados con salsa blanca, almendras y chilli oil.",
              en: "Roasted and caramelized, with white sauce, almonds and chilli oil.",
            },
            precio: 14,
          },
          {
            id: "tartin-echalote",
            nombre: "Tartín de Echalote",
            descripcion: {
              es: "Echalotes caramelizados, masa hojaldre de manteca, lactonesa.",
              en: "Caramelized shallots, butter puff pastry, milk mayonnaise.",
            },
            precio: 15,
          },
        ],
      },
      {
        id: "grandes",
        titulo: { es: "Grandes", en: "Large" },
        platos: [
          {
            id: "magret-pato",
            nombre: "Magret de Pato",
            descripcion: {
              es: "Pechuga de pato con risotto de quinoa. Sale bien jugosa.",
              en: "Duck breast with quinoa risotto. Served nice and juicy.",
            },
            precio: 38,
          },
          {
            id: "bife-poivre",
            nombre: "Bife al Poivre",
            descripcion: {
              es: "Colita de cuadril. Sal y pimienta francesas. Papas fritas.",
              en: "Tri-tip. French salt and pepper. Fries.",
            },
            precio: 37,
          },
          {
            id: "lomo-wellington",
            nombre: "Lomo Wellington",
            descripcion: {
              es: "Hojaldre casero, demi-glace, duxelle, dip de mostaza francesa. Con brócoli horneado. Para compartir.",
              en: "House-made puff pastry, demi-glace, duxelles, French mustard dip. With roasted broccoli. To share.",
            },
            precio: 69,
          },
          // Falta "Pollo Deshuesado": en la captura la descripción y el precio están tapados.
        ],
      },
    ],
  },
  {
    id: "aperitivo",
    titulo: { es: "Carta aperitiva", en: "Aperitivo menu" },
    secciones: [
      {
        id: "aperitivo",
        titulo: { es: "Para picar", en: "To share" },
        platos: [
          {
            id: "hamburguesa",
            nombre: "Hamburguesa",
            descripcion: {
              es: "Mezcla de ciervo, lomo y pato.",
              en: "Venison, beef tenderloin and duck blend.",
            },
            precio: 24,
          },
          {
            id: "banh-mi",
            nombre: "Sandwich estilo Banh Mi",
            descripcion: {
              es: "Pata y muslo de pato, paté, verduras frescas, baguette.",
              en: "Duck leg and thigh, pâté, fresh vegetables, baguette.",
            },
            precio: 20,
          },
          {
            id: "chipa-frito-aperitivo",
            nombre: "Chipá Frito",
            descripcion: {
              es: "Un clásico. 8 unidades de chipá frito con miel de gochujang.",
              en: "A classic. 8 pieces of fried chipá with gochujang honey.",
            },
            precio: 15,
          },
          {
            id: "papas-fritas-aperitivo",
            nombre: "Papas Fritas",
            descripcion: {
              es: "Papas de 3 cocciones. Sazonadas con 5 especias.",
              en: "Triple-cooked. Seasoned with five spices.",
            },
            precio: 15,
          },
          {
            id: "pate-pato-aperitivo",
            nombre: "Paté de Pato",
            descripcion: {
              es: "Con palmeritas caseras.",
              en: "With house-made palmiers.",
            },
            precio: 14,
          },
          {
            id: "ostras-crudas",
            nombre: "Ostras Crudas de la Patagonia",
            descripcion: {
              es: "Salen por 3 unidades. Gastrique de uva, huacatay.",
              en: "Served by three. Grape gastrique, huacatay.",
            },
            precio: 9,
          },
          {
            id: "crepe-huacatay",
            nombre: "Crepe de Huacatay",
            descripcion: {
              es: "Salsa blanca, relleno de duxelle de hongos.",
              en: "White sauce, filled with mushroom duxelles.",
            },
            precio: 20,
          },
        ],
      },
    ],
  },
  {
    id: "tragos",
    titulo: { es: "Tragos", en: "Drinks" },
    secciones: [
      {
        id: "de-la-casa",
        titulo: { es: "Tragos de la casa", en: "House cocktails" },
        platos: [
          {
            id: "del-este",
            nombre: "Del Este",
            descripcion: {
              es: "Tanqueray, pepino, eucalipto, limón, clara de huevo, togarashi.",
              en: "Tanqueray, cucumber, eucalyptus, lemon, egg white, togarashi.",
            },
            precio: 12,
          },
          {
            id: "camomila",
            nombre: "Camomila",
            descripcion: {
              es: "Chivas XII, manzanilla, jengibre, limón.",
              en: "Chivas XII, chamomile, ginger, lemon.",
            },
            precio: 12,
          },
          {
            id: "ambrosia",
            nombre: "Ambrosia",
            descripcion: {
              es: "Ron, Lillet, orgeat de canela y dátil, limón.",
              en: "Rum, Lillet, cinnamon and date orgeat, lemon.",
            },
            precio: 12,
          },
          {
            id: "tridente",
            nombre: "Tridente",
            descripcion: {
              es: "Jim Beam White, Jerez Fino Lustau, Cynar.",
              en: "Jim Beam White, Lustau Fino sherry, Cynar.",
            },
            precio: 12,
          },
          {
            id: "fashionista",
            nombre: "Fashionista",
            descripcion: {
              es: "Jim Beam White, mandarina, oloroso, Angostura.",
              en: "Jim Beam White, mandarin, oloroso, Angostura.",
            },
            precio: 12,
          },
          {
            id: "el-ave",
            nombre: "El Ave",
            descripcion: {
              es: "Tequila José Cuervo, hibisco y pomelo, lima.",
              en: "José Cuervo tequila, hibiscus and grapefruit, lime.",
            },
            precio: 12,
          },
          {
            id: "clasicos",
            nombre: "Clásicos",
            descripcion: { es: "A pedido.", en: "On request." },
            precio: 12,
          },
        ],
      },
      {
        id: "martinis",
        titulo: { es: "Martinis", en: "Martinis" },
        platos: [
          {
            id: "martini-de-la-casa",
            nombre: "De la Casa",
            descripcion: {
              es: "Tanqueray, agua de alcaparra, Vermut Lustau Dry.",
              en: "Tanqueray, caper brine, Lustau Dry vermouth.",
            },
            precio: 14,
          },
          {
            id: "dirty",
            nombre: "Dirty",
            descripcion: {
              es: "Gin, mucha salmuera, aceitunas, shaken not stirred.",
              en: "Gin, lots of brine, olives, shaken not stirred.",
            },
            precio: 14,
          },
          {
            id: "espresso-martini",
            nombre: "Espresso Martini",
            descripcion: {
              es: "Vodka, espresso, Borghetti.",
              en: "Vodka, espresso, Borghetti.",
            },
            precio: 14,
          },
        ],
      },
      {
        id: "etc",
        titulo: { es: "Etc", en: "Etc" },
        platos: [
          {
            id: "vermut",
            nombre: "Vermut",
            descripcion: {
              es: "Sale como quieres.",
              en: "However you like it.",
            },
            precio: 9,
          },
          {
            id: "mocktail",
            nombre: "Mocktail",
            descripcion: { es: "Consultar.", en: "Ask us." },
            precio: 7,
          },
        ],
      },
      {
        id: "on-tap",
        titulo: { es: "On Tap", en: "On tap" },
        platos: [
          {
            id: "german-pils",
            nombre: "German Pils",
            descripcion: { es: "Dorada y seca.", en: "Golden and dry." },
            precio: 8,
          },
          {
            id: "hazy-ipa",
            nombre: "Hazy IPA",
            descripcion: { es: "Frutada y suave.", en: "Fruity and smooth." },
            precio: 8,
          },
          {
            id: "amber",
            nombre: "Amber",
            descripcion: {
              es: "Caramelo, cuerpo medio.",
              en: "Caramel, medium body.",
            },
            precio: 8,
          },
          {
            id: "weiss",
            nombre: "Weiss",
            descripcion: {
              es: "Notas de banana y clavo. Suave y refrescante.",
              en: "Banana and clove notes. Smooth and refreshing.",
            },
            precio: 8,
          },
        ],
      },
    ],
  },
];

/** Busca un plato o trago por id en todas las cartas. */
export function buscarPlato(id: string): Plato {
  for (const carta of cartas)
    for (const seccion of carta.secciones) {
      const plato = seccion.platos.find((p) => p.id === id);
      if (plato) return plato;
    }
  throw new Error(`No existe el plato "${id}" en la carta.`);
}
