'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';

export default function ShareLocationButton() {
  const [busy, setBusy] = useState(false);

  function handleClick() {
    if (!navigator.geolocation) {
      window.open('https://wa.me/?text=' + encodeURIComponent('I need help.'), '_blank');
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const text = `I need help. My location: ${url}`;
        window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
        setBusy(false);
      },
      () => {
        window.open('https://wa.me/?text=' + encodeURIComponent('I need help.'), '_blank');
        setBusy(false);
      }
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-accent text-accent-foreground shadow-sm hover:shadow-md hover:brightness-110 disabled:opacity-60 disabled:hover:shadow-sm transition-all duration-200 active:scale-[0.98]"
    >
      <MapPin className="w-5 h-5" aria-hidden="true" />
      {busy ? 'Getting location…' : 'Share Location via WhatsApp'}
    </button>
  );
}
