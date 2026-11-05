-- =============================================================================
-- Ámbar Recoleta · Semilla: datos iniciales
-- Carta y horarios transcriptos de las historias de Instagram de Ámbar.
-- Las experiencias son CONTENIDO DE DEMO del TP: Ámbar no las vende hoy.
-- =============================================================================

-- Cartas, secciones y platos
insert into cartas (id, titulo_es, titulo_en, orden) values ('cena', 'Carta de cena', 'Dinner menu', 1);
insert into cartas (id, titulo_es, titulo_en, orden) values ('aperitivo', 'Carta aperitiva', 'Aperitivo menu', 0);
insert into cartas (id, titulo_es, titulo_en, orden) values ('tragos', 'Tragos', 'Drinks', 2);

with s as (
  insert into secciones (carta_id, slug, titulo_es, titulo_en, orden)
  values ('cena', 'chicos', 'Chicos', 'Small', 0)
  returning id
)
insert into platos (seccion_id, slug, nombre, descripcion_es, descripcion_en, precio, orden)
select s.id, v.* from s, (values
  ('garlic-bread', 'Panera de Garlic Bread', 'Pan estilo focaccia extra húmeda con ajo.', 'Extra-moist focaccia-style bread with garlic.', 8000, 0),
  ('chipa-frito', 'Chipá Frito', 'Un clásico. 8 unidades. Con miel de gochujang.', 'A classic. 8 pieces. With gochujang honey.', 15000, 1),
  ('cabutia-horneada', 'Cabutia Horneada', 'Ricota casera, aderezada con salsa hoisin y manteca noisette.', 'House-made ricotta, dressed with hoisin sauce and brown butter.', 19000, 2),
  ('tataki-pescado', 'Tataki de Pescado', 'Lomo de atún rojo, lima, aceite de oliva Bendito.', 'Bluefin tuna loin, lime, Bendito olive oil.', 24000, 3),
  ('papas-fritas', 'Papas Fritas', '3 cocciones, sazonadas con 5 especias.', 'Triple-cooked, seasoned with five spices.', 14000, 4),
  ('pate-pato', 'Paté de Pato', 'Con palmeritas y conserva de caqui.', 'With palmiers and persimmon preserve.', 16000, 5),
  ('ostras-patagonia', 'Ostras de la Patagonia', 'Gastrique de uvas, echalotes, salsa picante Szechuan, oliva Bendito y cilantro. 3 unidades.', 'Grape gastrique, shallots, Szechuan hot sauce, Bendito olive oil and cilantro. 3 pieces.', 9000, 6)
) as v(slug, nombre, descripcion_es, descripcion_en, precio, orden);

with s as (
  insert into secciones (carta_id, slug, titulo_es, titulo_en, orden)
  values ('cena', 'medianos', 'Medianos', 'Medium', 1)
  returning id
)
insert into platos (seccion_id, slug, nombre, descripcion_es, descripcion_en, precio, orden)
select s.id, v.* from s, (values
  ('tartar-ciervo', 'Tartar de Ciervo', 'Ciervo de las pampas. Yema de huevo, papitas fritas.', 'Pampas venison. Egg yolk, crisps.', 29000, 0),
  ('repollitos-bruselas', 'Repollitos de Bruselas', 'Horneados y caramelizados con salsa blanca, almendras y chilli oil.', 'Roasted and caramelized, with white sauce, almonds and chilli oil.', 14000, 1),
  ('tartin-echalote', 'Tartín de Echalote', 'Echalotes caramelizados, masa hojaldre de manteca, lactonesa.', 'Caramelized shallots, butter puff pastry, milk mayonnaise.', 15000, 2)
) as v(slug, nombre, descripcion_es, descripcion_en, precio, orden);

with s as (
  insert into secciones (carta_id, slug, titulo_es, titulo_en, orden)
  values ('cena', 'grandes', 'Grandes', 'Large', 2)
  returning id
)
insert into platos (seccion_id, slug, nombre, descripcion_es, descripcion_en, precio, orden)
select s.id, v.* from s, (values
  ('magret-pato', 'Magret de Pato', 'Pechuga de pato con risotto de quinoa. Sale bien jugosa.', 'Duck breast with quinoa risotto. Served nice and juicy.', 38000, 0),
  ('bife-poivre', 'Bife al Poivre', 'Colita de cuadril. Sal y pimienta francesas. Papas fritas.', 'Tri-tip. French salt and pepper. Fries.', 37000, 1),
  ('lomo-wellington', 'Lomo Wellington', 'Hojaldre casero, demi-glace, duxelle, dip de mostaza francesa. Con brócoli horneado. Para compartir.', 'House-made puff pastry, demi-glace, duxelles, French mustard dip. With roasted broccoli. To share.', 69000, 2)
) as v(slug, nombre, descripcion_es, descripcion_en, precio, orden);

with s as (
  insert into secciones (carta_id, slug, titulo_es, titulo_en, orden)
  values ('aperitivo', 'aperitivo', 'Para picar', 'To share', 0)
  returning id
)
insert into platos (seccion_id, slug, nombre, descripcion_es, descripcion_en, precio, orden)
select s.id, v.* from s, (values
  ('hamburguesa', 'Hamburguesa', 'Mezcla de ciervo, lomo y pato.', 'Venison, beef tenderloin and duck blend.', 24000, 0),
  ('banh-mi', 'Sandwich estilo Banh Mi', 'Pata y muslo de pato, paté, verduras frescas, baguette.', 'Duck leg and thigh, pâté, fresh vegetables, baguette.', 20000, 1),
  ('chipa-frito-aperitivo', 'Chipá Frito', 'Un clásico. 8 unidades de chipá frito con miel de gochujang.', 'A classic. 8 pieces of fried chipá with gochujang honey.', 15000, 2),
  ('papas-fritas-aperitivo', 'Papas Fritas', 'Papas de 3 cocciones. Sazonadas con 5 especias.', 'Triple-cooked. Seasoned with five spices.', 15000, 3),
  ('pate-pato-aperitivo', 'Paté de Pato', 'Con palmeritas caseras.', 'With house-made palmiers.', 14000, 4),
  ('ostras-crudas', 'Ostras Crudas de la Patagonia', 'Salen por 3 unidades. Gastrique de uva, huacatay.', 'Served by three. Grape gastrique, huacatay.', 9000, 5),
  ('crepe-huacatay', 'Crepe de Huacatay', 'Salsa blanca, relleno de duxelle de hongos.', 'White sauce, filled with mushroom duxelles.', 20000, 6)
) as v(slug, nombre, descripcion_es, descripcion_en, precio, orden);

with s as (
  insert into secciones (carta_id, slug, titulo_es, titulo_en, orden)
  values ('tragos', 'de-la-casa', 'Tragos de la casa', 'House cocktails', 0)
  returning id
)
insert into platos (seccion_id, slug, nombre, descripcion_es, descripcion_en, precio, orden)
select s.id, v.* from s, (values
  ('del-este', 'Del Este', 'Tanqueray, pepino, eucalipto, limón, clara de huevo, togarashi.', 'Tanqueray, cucumber, eucalyptus, lemon, egg white, togarashi.', 12000, 0),
  ('camomila', 'Camomila', 'Chivas XII, manzanilla, jengibre, limón.', 'Chivas XII, chamomile, ginger, lemon.', 12000, 1),
  ('ambrosia', 'Ambrosia', 'Ron, Lillet, orgeat de canela y dátil, limón.', 'Rum, Lillet, cinnamon and date orgeat, lemon.', 12000, 2),
  ('tridente', 'Tridente', 'Jim Beam White, Jerez Fino Lustau, Cynar.', 'Jim Beam White, Lustau Fino sherry, Cynar.', 12000, 3),
  ('fashionista', 'Fashionista', 'Jim Beam White, mandarina, oloroso, Angostura.', 'Jim Beam White, mandarin, oloroso, Angostura.', 12000, 4),
  ('el-ave', 'El Ave', 'Tequila José Cuervo, hibisco y pomelo, lima.', 'José Cuervo tequila, hibiscus and grapefruit, lime.', 12000, 5),
  ('clasicos', 'Clásicos', 'A pedido.', 'On request.', 12000, 6)
) as v(slug, nombre, descripcion_es, descripcion_en, precio, orden);

with s as (
  insert into secciones (carta_id, slug, titulo_es, titulo_en, orden)
  values ('tragos', 'martinis', 'Martinis', 'Martinis', 1)
  returning id
)
insert into platos (seccion_id, slug, nombre, descripcion_es, descripcion_en, precio, orden)
select s.id, v.* from s, (values
  ('martini-de-la-casa', 'De la Casa', 'Tanqueray, agua de alcaparra, Vermut Lustau Dry.', 'Tanqueray, caper brine, Lustau Dry vermouth.', 14000, 0),
  ('dirty', 'Dirty', 'Gin, mucha salmuera, aceitunas, shaken not stirred.', 'Gin, lots of brine, olives, shaken not stirred.', 14000, 1),
  ('espresso-martini', 'Espresso Martini', 'Vodka, espresso, Borghetti.', 'Vodka, espresso, Borghetti.', 14000, 2)
) as v(slug, nombre, descripcion_es, descripcion_en, precio, orden);

with s as (
  insert into secciones (carta_id, slug, titulo_es, titulo_en, orden)
  values ('tragos', 'etc', 'Etc', 'Etc', 2)
  returning id
)
insert into platos (seccion_id, slug, nombre, descripcion_es, descripcion_en, precio, orden)
select s.id, v.* from s, (values
  ('vermut', 'Vermut', 'Sale como quieres.', 'However you like it.', 9000, 0),
  ('mocktail', 'Mocktail', 'Consultar.', 'Ask us.', 7000, 1)
) as v(slug, nombre, descripcion_es, descripcion_en, precio, orden);

with s as (
  insert into secciones (carta_id, slug, titulo_es, titulo_en, orden)
  values ('tragos', 'on-tap', 'On Tap', 'On tap', 3)
  returning id
)
insert into platos (seccion_id, slug, nombre, descripcion_es, descripcion_en, precio, orden)
select s.id, v.* from s, (values
  ('german-pils', 'German Pils', 'Dorada y seca.', 'Golden and dry.', 8000, 0),
  ('hazy-ipa', 'Hazy IPA', 'Frutada y suave.', 'Fruity and smooth.', 8000, 1),
  ('amber', 'Amber', 'Caramelo, cuerpo medio.', 'Caramel, medium body.', 8000, 2),
  ('weiss', 'Weiss', 'Notas de banana y clavo. Suave y refrescante.', 'Banana and clove notes. Smooth and refreshing.', 8000, 3)
) as v(slug, nombre, descripcion_es, descripcion_en, precio, orden);

-- Horarios (0 = domingo … 6 = sábado)
insert into horarios (dia, abierto) values (0, false);
insert into horarios (dia, abierto) values (1, false);
insert into horarios (dia, abierto, abre, aperitivo_hasta, cocina_hasta, dj_desde, cierra) values (2, true, '17:00', '20:00', '23:30', null, '01:00');
insert into horarios (dia, abierto, abre, aperitivo_hasta, cocina_hasta, dj_desde, cierra) values (3, true, '17:00', '20:00', '23:30', null, '01:00');
insert into horarios (dia, abierto, abre, aperitivo_hasta, cocina_hasta, dj_desde, cierra) values (4, true, '17:00', '20:00', '23:30', null, '01:00');
insert into horarios (dia, abierto, abre, aperitivo_hasta, cocina_hasta, dj_desde, cierra) values (5, true, '17:00', '20:00', '23:30', '23:00', '02:00');
insert into horarios (dia, abierto, abre, aperitivo_hasta, cocina_hasta, dj_desde, cierra) values (6, true, '14:00', '20:00', '23:30', '23:00', '02:00');

-- Sets de Colonia Radio (completar títulos reales desde el admin)
insert into sets (youtube_id, titulo, serie, orden) values ('vKIz0q-vpBc', 'Set en vivo · Colonia Radio', null, 0);
insert into sets (youtube_id, titulo, serie, orden) values ('uMr_ih3z_K4', 'Set en vivo · Colonia Radio', null, 1);
insert into sets (youtube_id, titulo, serie, orden) values ('CQhG6M46xGM', 'Set en vivo · Colonia Radio', null, 2);
insert into sets (youtube_id, titulo, serie, orden) values ('C5dDCYjzuUk', 'Set en vivo · Colonia Radio', null, 3);

-- Experiencias para regalar (demo). Precios en pesos; cupos = stock.
insert into experiencias (slug, nombre_es, nombre_en, descripcion_es, descripcion_en, precio, cupos, orden) values
  ('ronda-de-la-casa', 'Ronda de la casa', 'House round',
   'Cuatro tragos de la casa para tomar en la barra o en el patio.',
   'Four house cocktails at the bar or on the patio.', 48000, 40, 0),
  ('cena-para-dos', 'Cena para dos', 'Dinner for two',
   'Dos platos medianos, uno grande para compartir y dos tragos de la casa.',
   'Two medium plates, one large plate to share and two house cocktails.', 120000, 20, 1),
  ('la-noche-entera', 'La noche entera', 'The whole night',
   'Cena para dos, una ronda de martinis y mesa hasta que arrancan los DJs.',
   'Dinner for two, a round of martinis and the table until the DJs start.', 180000, 10, 2);
