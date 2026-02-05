import './AcronymTooltip.css';

export function AcronymTooltip({ acronym, fullText, children }) {
  return (
    <span className="acronym-tooltip-wrapper">
      {children || acronym}
      <span className="info-icon" title={fullText}>
        ℹ️
      </span>
      <span className="tooltip-text">{fullText}</span>
    </span>
  );
}
