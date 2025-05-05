export function getItemClassName(iconType: string | null | undefined) {
  if (!iconType) return 'item-not-set';
  return `item-${iconType}`;
}

export function getItemSpanClasses(iconType: string | null | undefined) {
  if (!iconType) return '';
  
  const baseClasses = 'rounded-[1em_0_1em_0] py-[2px] px-[5px]';
  
  switch(iconType) {
    case 'must':
      return `${baseClasses} [background-image:linear-gradient(-100deg,rgba(108,188,250,0.2),rgba(108,188,250,0.5)_95%,rgba(108,188,250,0.1))] dark:[background-image:linear-gradient(-100deg,rgba(59,130,246,0.3),rgba(59,130,246,0.7)_95%,rgba(59,130,246,0.3))]`;
    case 'like':
      return `${baseClasses} [background-image:linear-gradient(-100deg,rgba(135,231,126,0.2),rgba(135,231,126,0.5)_95%,rgba(135,231,126,0.1))] dark:[background-image:linear-gradient(-100deg,rgba(34,197,94,0.3),rgba(34,197,94,0.7)_95%,rgba(34,197,94,0.3))]`;
    case 'maybe':
      return `${baseClasses} [background-image:linear-gradient(-100deg,rgba(227,210,100,0.2),rgba(255,230,107,0.5)_95%,rgba(227,210,100,0.1))] dark:[background-image:linear-gradient(-100deg,rgba(245,158,11,0.3),rgba(245,158,11,0.7)_95%,rgba(245,158,11,0.3))]`;
    case 'prefer-not':
      return `${baseClasses} [background-image:linear-gradient(-100deg,rgba(148,163,184,0.2),rgba(148,163,184,0.5)_95%,rgba(148,163,184,0.1))] dark:[background-image:linear-gradient(-100deg,rgba(100,116,139,0.3),rgba(100,116,139,0.7)_95%,rgba(100,116,139,0.3))]`;
    case 'off-limit':
      return `${baseClasses} [background-image:linear-gradient(-100deg,rgba(197,110,11,0.2),rgba(210,102,102,0.5)_95%,rgba(197,110,11,0.1))] dark:[background-image:linear-gradient(-100deg,rgba(239,68,68,0.3),rgba(239,68,68,0.7)_95%,rgba(239,68,68,0.3))]`;
    default:
      return baseClasses;
  }
} 