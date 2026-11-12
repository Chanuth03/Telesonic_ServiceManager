import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type BarcodeDetectorInstance = {
  detect: (source: CanvasImageSource) => Promise<{ rawValue?: string }[]>;
};

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorInstance;

function getBarcodeDetector(): BarcodeDetectorConstructor | null {
  const candidate = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
  return candidate ?? null;
}

export function BarcodeScanner({
  title,
  closeLabel,
  manualLabel,
  onDetected,
  onClose,
}: {
  title: string;
  closeLabel: string;
  manualLabel: string;
  onDetected: (code: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;
  const [manualCode, setManualCode] = useState("");
  const [message, setMessage] = useState("Point the camera at the barcode.");

  useEffect(() => {
    let stopped = false;
    let timer = 0;

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMessage("This browser has no camera. Type the barcode instead.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (stopped) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        const Detector = getBarcodeDetector();
        if (!Detector) {
          setMessage("Live decoding is not available on this browser. Type the code you see.");
          return;
        }
        let detector: BarcodeDetectorInstance;
        try {
          detector = new Detector({
            formats: ["qr_code", "code_128", "code_39", "ean_13", "ean_8", "upc_a", "upc_e"],
          });
        } catch {
          setMessage("Live decoding is not available on this browser. Type the code you see.");
          return;
        }
        const scan = async () => {
          if (stopped || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            const value = codes[0]?.rawValue?.trim();
            if (value) {
              onDetectedRef.current(value);
              return;
            }
          } catch {
            // A single frame can fail while the camera is still starting.
          }
          timer = window.setTimeout(() => void scan(), 350);
        };
        timer = window.setTimeout(() => void scan(), 400);
      } catch {
        setMessage("Camera permission was blocked. Type the barcode instead.");
      }
    };

    void start();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-foreground/50 p-3">
      <div className="card-surface w-full max-w-md space-y-3 p-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold">{title}</h2>
          <button type="button" className="text-xs text-muted-foreground" onClick={onClose}>
            {closeLabel}
          </button>
        </div>
        <video ref={videoRef} className="h-52 w-full rounded-lg bg-black object-cover" muted playsInline />
        <p className="text-[11px] text-muted-foreground">{message}</p>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const code = manualCode.trim();
            if (code) onDetected(code);
          }}
        >
          <input
            value={manualCode}
            onChange={(event) => setManualCode(event.target.value)}
            placeholder={manualLabel}
            className="input-field py-1.5 text-xs"
            aria-label={manualLabel}
          />
          <Button type="submit" size="sm" className="text-xs">
            OK
          </Button>
        </form>
      </div>
    </div>
  );
}
