'use client';

import { useEffect, useState } from 'react';

/**
 * "Good morning" / "Good afternoon" / "Good evening" by South African time.
 * Renders a neutral welcome first, so the static HTML and the first client
 * render agree, then switches once mounted.
 */
export default function Greeting() {
  const [text, setText] = useState('Welcome to Town Hub');

  useEffect(() => {
    const hour = Number(
      new Intl.DateTimeFormat('en-ZA', { hour: 'numeric', hour12: false, timeZone: 'Africa/Johannesburg' }).format(
        new Date()
      )
    );
    setText(hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening');
  }, []);

  return <>{text}</>;
}
