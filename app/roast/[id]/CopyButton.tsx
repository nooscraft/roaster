'use client';

import { useState } from 'react';

export function CopyButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <button
      className={`roast-view-btn copy-btn ${copied ? 'copy-btn--success' : ''}`}
      onClick={handleCopy}
    >
      {copied ? (
        '✓ COPIED'
      ) : (
        '📋 COPY LINK'
      )}
    </button>
  );
}
