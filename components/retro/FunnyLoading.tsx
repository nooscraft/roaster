import { Coffee } from 'pixelarticons/react/Coffee';

interface FunnyLoadingProps {
  text?: string;
}

export function FunnyLoading({ text = 'LOADING...' }: FunnyLoadingProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <Coffee
        width={16}
        height={16}
        style={{
          color: '#c0392b',
        }}
        aria-hidden="true"
      />
      <span className="pixel-font inline-flex items-center" style={{ fontSize: '10px', color: '#666' }}>
        {text.replace(/\.+$/, '')}
        <span className="blink" style={{ animationDelay: '0ms' }}>.</span>
        <span className="blink" style={{ animationDelay: '200ms' }}>.</span>
        <span className="blink" style={{ animationDelay: '400ms' }}>.</span>
      </span>
    </div>
  );
}
