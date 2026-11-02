'use client';

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Loader2, Play, Square } from 'lucide-react';
import PageHero from '@/components/PageHero';
import { Radio as HeroIcon } from 'lucide-react';
import { RADIO_STATIONS, type RadioStation } from '@/lib/garden-route/radio';

type PlayState = 'idle' | 'connecting' | 'playing' | 'error';

/**
 * One shared audio element plays whichever station was tapped last; tapping
 * the playing station again stops it. Streams need an internet connection,
 * unlike the rest of the app.
 */
export default function RadioPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const [state, setState] = useState<PlayState>('idle');

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audio.addEventListener('playing', () => setState('playing'));
    audio.addEventListener('waiting', () => setState('connecting'));
    audio.addEventListener('error', () => setState((s) => (s === 'idle' ? s : 'error')));
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, []);

  function stop() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    setCurrent(null);
    setState('idle');
  }

  function toggle(station: RadioStation) {
    const audio = audioRef.current;
    if (!audio || !station.stream) return;
    if (current === station.id && state !== 'error') {
      stop();
      return;
    }
    setCurrent(station.id);
    setState('connecting');
    audio.src = station.stream;
    audio.play().catch(() => setState('error'));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHero
        title="Local Radio"
        subtitle="Listen live to Garden Route radio stations"
        icon={HeroIcon}
        theme="dusk"
        className="mb-8"
      />

      <div className="grid grid-cols-1 gap-4">
        {RADIO_STATIONS.map((station) => {
          const active = current === station.id;
          return (
            <div
              key={station.id}
              className={`p-5 rounded-2xl border bg-background card-lift ${active ? 'border-primary' : 'border-border'}`}
            >
              <h3 className="font-bold text-xl mb-1">{station.name}</h3>
              <p className="text-sm font-medium text-[#b45309] dark:text-amber-400 mb-3">{station.area}</p>
              <p className="text-muted-foreground mb-4">{station.description}</p>

              <div className="flex flex-wrap items-center gap-3">
                {station.stream ? (
                  <button
                    type="button"
                    onClick={() => toggle(station)}
                    aria-pressed={active && state !== 'error'}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#4338ca] to-[#a855f7] text-white text-sm font-semibold shadow-md active:scale-95 transition"
                  >
                    {active && state === 'connecting' ? (
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    ) : active && state === 'playing' ? (
                      <Square className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Play className="w-4 h-4" aria-hidden="true" />
                    )}
                    {active && state === 'connecting'
                      ? 'Connecting…'
                      : active && state === 'playing'
                        ? 'Stop'
                        : 'Listen live'}
                  </button>
                ) : null}
                <a
                  href={station.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  {station.stream ? 'Website' : 'Listen on their website'}
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>

              {active && state === 'playing' && (
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                  Playing live
                </p>
              )}
              {active && state === 'error' && (
                <p className="mt-3 text-sm text-danger">
                  Couldn&apos;t connect to the stream. Check your internet connection and try again.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
