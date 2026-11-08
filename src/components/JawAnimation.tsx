import { useReducedMotion } from '../hooks.js';

export default function AvatarAnimation({ running }: { running: boolean }) {
  const reduced = useReducedMotion();

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <img src={`${import.meta.env.BASE_URL}desk.png`} alt="Eric's information desk" style={{ width: '100%', height: 'auto', display: 'block' }} />
      {running && !reduced && (
        <span aria-hidden style={{ position: 'absolute', bottom: '8%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '300ms' }} />
        </span>
      )}
    </div>
  );
}
