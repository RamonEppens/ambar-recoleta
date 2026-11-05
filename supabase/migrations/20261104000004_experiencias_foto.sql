-- =============================================================================
-- Foto de cada experiencia.
-- Guarda el nombre de una de las fotos del sitio (src/data/fotos.ts), no la imagen:
-- las fotos se optimizan en el build con next/image. Si el nombre no existe,
-- el sitio usa una foto por defecto.
-- =============================================================================

alter table experiencias add column foto text;

update experiencias set foto = 'tragosDeLaCasa' where slug = 'ronda-de-la-casa';
update experiencias set foto = 'mesaCena' where slug = 'cena-para-dos';
update experiencias set foto = 'djSetLiving' where slug = 'la-noche-entera';
