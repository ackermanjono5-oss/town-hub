import { Mail, Navigation, Phone } from 'lucide-react';
import { actionHref, actionLabel, type AdAction } from '@/lib/garden-route/sponsored';

const BASE =
  'inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition active:scale-95';

const STYLE: Record<AdAction['kind'], string> = {
  whatsapp: `${BASE} bg-[#25D366] text-[#073b1f] shadow-sm hover:brightness-105`,
  call: `${BASE} bg-primary text-primary-foreground shadow-sm hover:brightness-110`,
  facebook: `${BASE} bg-[#1877F2] text-white shadow-sm hover:brightness-110`,
  email: `${BASE} border border-slate-200 bg-card text-slate-700 hover:bg-slate-100`,
  directions: `${BASE} border border-slate-200 bg-card text-slate-700 hover:bg-slate-100`,
};

/** The buttons an advertiser asked for: WhatsApp, call, Facebook, email or directions. */
export default function AdActions({ actions, className = '' }: { actions: AdAction[]; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {actions.map((action) => {
        const href = actionHref(action);
        const external = href.startsWith('http');
        return (
          <a
            key={`${action.kind}-${href}`}
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className={STYLE[action.kind]}
          >
            <ActionIcon kind={action.kind} />
            <span className="break-all">{actionLabel(action)}</span>
          </a>
        );
      })}
    </div>
  );
}

function ActionIcon({ kind }: { kind: AdAction['kind'] }) {
  if (kind === 'call') return <Phone className="h-4 w-4 flex-none" aria-hidden="true" />;
  if (kind === 'email') return <Mail className="h-4 w-4 flex-none" aria-hidden="true" />;
  if (kind === 'directions') return <Navigation className="h-4 w-4 flex-none" aria-hidden="true" />;
  if (kind === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 flex-none" aria-hidden="true">
        <path
          fill="currentColor"
          d="M13.5 21v-7.5h2.6l.4-3H13.5V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V10.5H7.8v3h2.6V21h3.1Z"
        />
      </svg>
    );
  }
  // WhatsApp.
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 flex-none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a9.9 9.9 0 0 0-8.5 15L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.2-.1-1-.4-2-1.2-.7-.6-1.2-1.4-1.3-1.7-.1-.2 0-.4.1-.5l.4-.4.3-.4v-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.7 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.3Z"
      />
    </svg>
  );
}
