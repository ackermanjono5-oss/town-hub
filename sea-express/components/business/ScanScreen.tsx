'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, Camera, Keyboard } from 'lucide-react';
import { approveRedemption } from '@/lib/business/queries';
import { ApproveRedemptionError, type ApproveRedemptionResponse } from '@/lib/business/types';

type ScreenState = 'scanning' | 'checking' | 'preview' | 'confirming' | 'success' | 'error';

export default function ScanScreen() {
  const [state, setState] = useState<ScreenState>('scanning');
  const [manualCode, setManualCode] = useState('');
  const [cameraSupported, setCameraSupported] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ApproveRedemptionResponse | null>(null);
  const [message, setMessage] = useState('');
  const [pendingToken, setPendingToken] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const scanLockRef = useRef(false);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const handleDetectedToken = useCallback(
    async (token: string) => {
      if (scanLockRef.current) return;
      scanLockRef.current = true;
      stopCamera();
      setPendingToken(token);
      setState('checking');
      try {
        const result = await approveRedemption(token, true);
        if (result.result === 'VALID') {
          setPreview(result);
          setState('preview');
        } else {
          setMessage(result.message);
          setState('error');
        }
      } catch (err) {
        setMessage(err instanceof ApproveRedemptionError ? err.message : 'Something went wrong. Please try again.');
        setState('error');
      }
    },
    [stopCamera]
  );

  // Live camera scanning via the browser's native BarcodeDetector API —
  // no scanning library dependency. Falls back to manual entry below on
  // browsers that don't support it (notably iOS Safari as of writing).
  useEffect(() => {
    if (state !== 'scanning') return;
    if (!('BarcodeDetector' in window)) {
      setCameraSupported(false);
      return;
    }

    let cancelled = false;
    setCameraSupported(true);
    setCameraError(null);

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // @ts-expect-error BarcodeDetector isn't in lib.dom.d.ts yet
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });

        async function tick() {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0) {
              handleDetectedToken(codes[0].rawValue);
              return;
            }
          } catch {
            // Detection hiccup on this frame — keep trying.
          }
          rafRef.current = requestAnimationFrame(tick);
        }
        tick();
      } catch {
        if (!cancelled) setCameraError('Camera access is unavailable — enter the code manually below.');
      }
    }

    start();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [state, handleDetectedToken, stopCamera]);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleDetectedToken(manualCode.trim());
  }

  async function handleConfirm() {
    setState('confirming');
    try {
      const result = await approveRedemption(pendingToken, false);
      if (result.result === 'VALID') {
        setPreview(result);
        setState('success');
      } else {
        setMessage(result.message);
        setState('error');
      }
    } catch (err) {
      setMessage(err instanceof ApproveRedemptionError ? err.message : 'Something went wrong. Please try again.');
      setState('error');
    }
  }

  function reset() {
    scanLockRef.current = false;
    setManualCode('');
    setPreview(null);
    setMessage('');
    setPendingToken('');
    setState('scanning');
  }

  if (state === 'preview' && preview) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 rounded-xl border border-border bg-background text-center">
        <p className="text-sm text-muted-foreground">Confirm redemption</p>
        <p className="text-xl font-bold">{preview.offerTitle}</p>
        {preview.customerName && <p className="text-muted-foreground">{preview.customerName}</p>}
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={reset}
            className="flex-1 px-4 py-3 rounded-md border border-border hover:bg-secondary transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            Approve
          </button>
        </div>
      </div>
    );
  }

  if (state === 'confirming') {
    return <p className="text-sm text-muted-foreground text-center py-12">Approving…</p>;
  }

  if (state === 'success' && preview) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-background text-center">
        <CheckCircle2 className="w-12 h-12 text-primary" aria-hidden="true" />
        <p className="text-lg font-semibold">Redeemed</p>
        <p className="text-muted-foreground">
          {preview.offerTitle}
          {preview.customerName ? ` — ${preview.customerName}` : ''}
        </p>
        <button
          onClick={reset}
          className="mt-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          Scan Next
        </button>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-background text-center">
        <XCircle className="w-12 h-12 text-danger" aria-hidden="true" />
        <p className="text-muted-foreground">{message}</p>
        <button
          onClick={reset}
          className="mt-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (state === 'checking') {
    return <p className="text-sm text-muted-foreground text-center py-12">Checking code…</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Scan a Reward</h1>

      {cameraSupported ? (
        <div className="relative rounded-xl overflow-hidden border border-border bg-black aspect-square">
          <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Camera className="w-4 h-4" aria-hidden="true" />
          Camera scanning isn&rsquo;t supported on this browser — enter the code below.
        </p>
      )}
      {cameraError && <p className="text-sm text-danger">{cameraError}</p>}

      <form onSubmit={handleManualSubmit} className="space-y-2">
        <label htmlFor="manual-code" className="flex items-center gap-2 text-sm font-medium">
          <Keyboard className="w-4 h-4" aria-hidden="true" />
          Enter code manually
        </label>
        <div className="flex gap-2">
          <input
            id="manual-code"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Paste or type the code"
            className="flex-1 px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            Check
          </button>
        </div>
      </form>
    </div>
  );
}
