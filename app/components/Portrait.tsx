import Image from "next/image";
import { useCallback, useState } from "react";

type PortraitProps = {
  name: string;
  primarySrc: string;
  secondarySrc: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
  onHoverChange?: (isHovered: boolean) => void;
};

const Portrait = ({
  name,
  primarySrc,
  secondarySrc,
  priority,
  sizes,
  className,
  ariaExpanded,
  ariaControls,
  onHoverChange,
}: PortraitProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const showAlt = useCallback(() => {
    setIsHovered(true);
    if (onHoverChange) {
      onHoverChange(true);
    }
  }, [onHoverChange]);

  const hideAlt = useCallback(() => {
    setIsHovered(false);
    if (onHoverChange) {
      onHoverChange(false);
    }
  }, [onHoverChange]);

  const loading = priority ? "eager" : "lazy";
  const resolvedSizes =
    sizes ?? "(min-width: 1024px) 320px, (min-width: 640px) 33vw, 50vw";

  return (
    <button
      type="button"
      className={`portrait ${className ?? ""}`.trim()}
      aria-label={`Portrait de ${name}`}
      onMouseEnter={showAlt}
      onMouseLeave={hideAlt}
      onFocus={showAlt}
      onBlur={hideAlt}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
    >
      <Image
        src={primarySrc}
        alt={`Portrait de ${name}`}
        className="portrait-img primary"
        style={{ opacity: isHovered ? 0 : 1 }}
        draggable={false}
        loading={loading}
        decoding="async"
        fill
        sizes={resolvedSizes}
        priority={priority}
      />
      <Image
        src={secondarySrc}
        alt=""
        className="portrait-img secondary"
        style={{ opacity: isHovered ? 1 : 0 }}
        aria-hidden="true"
        draggable={false}
        loading={loading}
        decoding="async"
        fill
        sizes={resolvedSizes}
        priority={priority}
      />
    </button>
  );
};

export default Portrait;
