import { useCallback, useState } from "react";

type PortraitProps = {
  name: string;
  primarySrc: string;
  secondarySrc: string;
  priority?: boolean;
  className?: string;
  onSelect?: () => void;
  ariaExpanded?: boolean;
  ariaControls?: string;
};

const Portrait = ({
  name,
  primarySrc,
  secondarySrc,
  priority,
  className,
  onSelect,
  ariaExpanded,
  ariaControls,
}: PortraitProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const showAlt = useCallback(() => setIsHovered(true), []);
  const hideAlt = useCallback(() => setIsHovered(false), []);
  const toggleAlt = useCallback(() => setIsHovered((current) => !current), []);

  const handleClick = useCallback(() => {
    toggleAlt();
    if (onSelect) {
      onSelect();
    }
  }, [onSelect, toggleAlt]);

  const loading = priority ? "eager" : "lazy";

  return (
    <button
      type="button"
      className={`portrait ${className ?? ""}`.trim()}
      aria-label={`Portrait de ${name}`}
      onMouseEnter={showAlt}
      onMouseLeave={hideAlt}
      onFocus={showAlt}
      onBlur={hideAlt}
      onClick={handleClick}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
    >
      <img
        src={primarySrc}
        alt={`Portrait de ${name}`}
        className="portrait-img primary"
        style={{ opacity: isHovered ? 0 : 1 }}
        draggable={false}
        loading={loading}
        decoding="async"
      />
      <img
        src={secondarySrc}
        alt=""
        className="portrait-img secondary"
        style={{ opacity: isHovered ? 1 : 0 }}
        aria-hidden="true"
        draggable={false}
        loading={loading}
        decoding="async"
      />
    </button>
  );
};

export default Portrait;
