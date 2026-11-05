-- =============================================================================
-- Una experiencia que ya se vendió no se puede borrar.
-- Antes, borrarla dejaba sus ítems de pedido sin referencia (on delete set null)
-- y se perdía qué se había vendido. Ahora la base lo impide (restrict): desde
-- el admin hay que desactivarla, y sigue existiendo para los pedidos viejos.
-- =============================================================================

alter table pedido_items
  drop constraint pedido_items_experiencia_id_fkey,
  add constraint pedido_items_experiencia_id_fkey
    foreign key (experiencia_id) references experiencias (id) on delete restrict;
