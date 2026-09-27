/**
 * Isotipo de Ámbar, redibujado en vector a partir del logo original.
 * Toma el color del texto que lo rodea (currentColor), así funciona en cualquier modo.
 * Sin `title`, es decorativo: el texto accesible lo pone quien lo usa.
 */
type IsotipoProps = {
  className?: string;
  title?: string;
};

export function Isotipo({ className, title }: IsotipoProps) {
  return (
    <svg
      className={className}
      viewBox="283 150 525 717"
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <path
        fillRule="evenodd"
        d="M303.0 847.0 L421.0 361.0 L672.0 361.0 L682.0 403.0 L538.0 403.0 L543.3 425.0 L687.3 425.0 L697.3 467.0 L553.3 467.0 L558.3 488.0 L702.3 488.0 L712.3 530.0 L568.3 530.0 L573.3 551.0 L717.4 551.0 L727.4 593.0 L583.4 593.0 L588.4 614.0 L732.4 614.0 L742.4 656.0 L598.4 656.0 L603.4 677.0 L747.4 677.0 L757.5 719.0 L613.4 719.0 L618.4 740.0 L762.5 740.0 L772.5 782.0 L628.5 782.0 L634.0 805.0 L778.0 805.0 L788.0 847.0 L565.0 847.0 L553.0 797.0 L367.0 797.0 L355.0 847.0 Z M461 412 L540 746 L379 746 Z M512 170 L607 170 L532 318 L484 318 Z"
      />
    </svg>
  );
}
