import React from 'react';

export interface DNABadgeProps {
  status: 'verified' | 'compromised' | 'unverified';
  hash?: string;
}

export const DNABadge: React.FC<DNABadgeProps> = ({ status, hash }) => {
  const shortHash = hash ? hash.substring(0, 8) : '';
  return (
    <div className={`dna-badge dna-badge-${status}`}>
      {/* Logic only, KOmabi will style */}
      <span>{status.toUpperCase()}</span>
      {shortHash && <span>{shortHash}</span>}
    </div>
  );
};
