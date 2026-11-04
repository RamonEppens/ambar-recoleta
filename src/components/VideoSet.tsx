"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./VideoSet.module.css";

type VideoSetProps = { youtubeId: string; titulo: string; reproducir: string };

/**
 * Patrón "fachada": primero se muestra solo la miniatura (una imagen liviana).
 * El reproductor de YouTube, que pesa cientos de KB de JavaScript, se carga recién
 * cuando la persona aprieta play. Así la página sigue rápida con varios videos.
 * Usa youtube-nocookie.com: no deja cookies de seguimiento hasta reproducir.
 */
export function VideoSet({ youtubeId, titulo, reproducir }: VideoSetProps) {
  const [activo, setActivo] = useState(false);

  if (activo) {
    return (
      <div className={styles.marco}>
        <iframe
          className={styles.iframe}
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
          title={titulo}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className={styles.marco}
      onClick={() => setActivo(true)}
      aria-label={`${reproducir}: ${titulo}`}
    >
      <Image
        src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
        alt=""
        fill
        sizes="(min-width: 48rem) 45vw, 100vw"
        className={styles.miniatura}
      />
      <span className={styles.play} aria-hidden="true" />
    </button>
  );
}
