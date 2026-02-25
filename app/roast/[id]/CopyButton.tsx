'use client';

export function CopyButton() {
  return (
    <button
      className="roast-view-btn"
      onClick={() => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied!');
      }}
    >
      📋 COPY LINK
    </button>
  );
}
