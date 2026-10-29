import React, { useState, useRef, useEffect, useId } from 'react';

function Tooltip({
  content,
  children,
  delay = 200,
  position = 'bottom',
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, transformOrigin: 'top' });
  const [shiftX, setShiftX] = useState(0); // for arrow centering if tooltip shifted
  const timerRef = useRef(null);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const tooltipId = useId();

  const showTooltip = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    clearTimeout(timerRef.current);
    setIsVisible(false);
  };

  // Compute position relative to viewport and handle flip / screen edge shifting
  useEffect(() => {
    if (!isVisible || !triggerRef.current) return;

    const updatePosition = () => {
      const triggerEl = triggerRef.current;
      const tooltipEl = tooltipRef.current;
      if (!triggerEl || !tooltipEl) return;

      const triggerRect = triggerEl.getBoundingClientRect();
      const tooltipRect = tooltipEl.getBoundingClientRect();
      const margin = 8;
      const padding = 12;

      let top = triggerRect.bottom + margin;
      let left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      let actualOrigin = 'top';

      // Check if it goes beyond bottom of viewport -> flip to top
      if (top + tooltipRect.height > window.innerHeight - padding) {
        top = triggerRect.top - tooltipRect.height - margin;
        actualOrigin = 'bottom';
      }

      // Check horizontal bounds (prevent clipping at screen edges)
      let adjustedLeft = left;
      if (adjustedLeft < padding) {
        adjustedLeft = padding;
      } else if (adjustedLeft + tooltipRect.width > window.innerWidth - padding) {
        adjustedLeft = window.innerWidth - padding - tooltipRect.width;
      }

      const arrowShift = left - adjustedLeft;
      setShiftX(arrowShift);
      setCoords({ top, left: adjustedLeft, transformOrigin: actualOrigin });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible]);

  // Close on Escape key
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        hideTooltip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      tabIndex={0}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      aria-describedby={isVisible ? tooltipId : undefined}
      className={`inline-flex outline-none focus:outline-none ${className}`}
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transformOrigin: coords.transformOrigin === 'top' ? 'center top' : 'center bottom'
          }}
          className="z-50 pointer-events-none max-w-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-200 text-xs shadow-xl backdrop-blur-md transition-all duration-150 animate-tooltipIn"
        >
          {/* Arrow */}
          <div
            style={{
              left: `calc(50% - 4px + ${shiftX}px)`,
              ...(coords.transformOrigin === 'top'
                ? { top: '-5px', borderBottomColor: 'rgba(51, 65, 85, 0.8)' }
                : { bottom: '-5px', borderTopColor: 'rgba(51, 65, 85, 0.8)' })
            }}
            className={`absolute w-0 h-0 border-x-4 border-x-transparent ${
              coords.transformOrigin === 'top' ? 'border-b-4' : 'border-t-4'
            }`}
          />
          <span className="relative z-10 leading-snug block">{content}</span>
        </div>
      )}
    </div>
  );
}

export default Tooltip;
