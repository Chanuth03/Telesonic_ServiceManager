import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Camera,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Upload,
  SwitchCamera,
  RotateCcw,
  X,
  Check,
} from "lucide-react";
import {
  getMobileJobById,
  addJobPhoto,
  deleteJobPhoto,
  updateJobPhotoUploadState,
  type MobileJob,
  type JobPhoto,
} from "@/lib/mobile-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/mobile/jobs/$jobId/photos")({
  head: ({ params }) => ({
    meta: [
      { title: `Photos & Evidence (O1-SCR-MOB-08) — Job ${params.jobId}` },
      {
        name: "description",
        content: "Capture site photos, fault evidence, before/after work proof and parts photos.",
      },
    ],
  }),
  component: MobilePhotosScreen,
});

const MAX_IMAGE_DIMENSION = 1280;
const JPEG_QUALITY = 0.72;

/** Downscale + compress an image source so it stays small enough for offline (Dexie) storage. */
function canvasToCompressedDataUrl(
  source: CanvasImageSource,
  width: number,
  height: number,
): string {
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available on this device.");
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

function fileToCompressedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        resolve(canvasToCompressedDataUrl(img, img.naturalWidth, img.naturalHeight));
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read the captured image."));
    };
    img.src = url;
  });
}

function MobilePhotosScreen() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<MobileJob | undefined>(() => getMobileJobById(jobId));

  const [category, setCategory] = useState<JobPhoto["category"]>("Before Work");
  const [caption, setCaption] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Camera state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fallbackInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setJob(getMobileJobById(jobId));
  }, [jobId]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(
    async (facing: "environment" | "user") => {
      stopCamera();
      setCameraError(null);
      setCameraStarting(true);

      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setCameraStarting(false);
        setCameraError(
          "Live camera is not available here (requires HTTPS or a supported browser). Use the system camera instead.",
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        const name = err instanceof DOMException ? err.name : "";
        if (name === "NotAllowedError" || name === "SecurityError") {
          setCameraError(
            "Camera permission denied. Allow Camera access in your browser/device settings and try again.",
          );
        } else if (name === "NotFoundError" || name === "OverconstrainedError") {
          setCameraError("No camera was found on this device.");
        } else if (name === "NotReadableError") {
          setCameraError("The camera is being used by another app. Close it and try again.");
        } else {
          setCameraError("Unable to start the camera.");
        }
      } finally {
        setCameraStarting(false);
      }
    },
    [stopCamera],
  );

  // Stop the camera whenever the screen unmounts
  useEffect(() => stopCamera, [stopCamera]);

  // Attach the stream once the <video> element mounts (it only exists while the modal is open)
  useEffect(() => {
    if (cameraOpen && !capturedDataUrl && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play().catch(() => {});
    }
  }, [cameraOpen, capturedDataUrl]);

  if (!job) {
    return (
      <div className="p-4 text-center space-y-3">
        <AlertCircle size={32} className="mx-auto text-destructive" />
        <p className="text-sm font-bold">Job {jobId} Not Found</p>
        <Link to="/mobile/jobs" className="text-xs text-primary underline">
          Return to Job List
        </Link>
      </div>
    );
  }

  const openCamera = () => {
    setCapturedDataUrl(null);
    setCameraOpen(true);
    void startCamera(facingMode);
  };

  const closeCamera = () => {
    stopCamera();
    setCameraOpen(false);
    setCapturedDataUrl(null);
    setCameraError(null);
  };

  const handleSwitchCamera = () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    void startCamera(next);
  };

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError("Camera is not ready yet. Please wait a moment and try again.");
      return;
    }
    try {
      const dataUrl = canvasToCompressedDataUrl(video, video.videoWidth, video.videoHeight);
      setCapturedDataUrl(dataUrl);
      stopCamera();
    } catch {
      setCameraError("Failed to capture the photo. Please try again.");
    }
  };

  const handleRetake = () => {
    setCapturedDataUrl(null);
    void startCamera(facingMode);
  };

  const savePhoto = (dataUrl: string) => {
    const newPhoto: JobPhoto = {
      id: `P-${Date.now()}`,
      category,
      dataUrl,
      caption: caption.trim() || category,
      capturedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const uploadState = navigator.onLine ? "uploading" : "pending";
    addJobPhoto(job.id, { ...newPhoto, uploadState });
    if (navigator.onLine) {
      window.setTimeout(() => {
        updateJobPhotoUploadState(job.id, newPhoto.id, "uploaded");
        setJob(getMobileJobById(job.id));
      }, 700);
    }
    setJob(getMobileJobById(job.id));
    setFeedback(`Photo attached to work order (${category}).`);
    setCaption("");
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleUsePhoto = () => {
    if (!capturedDataUrl) return;
    savePhoto(capturedDataUrl);
    closeCamera();
  };

  // Fallback: native camera app (works when live getUserMedia isn't available)
  const handleFallbackFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      savePhoto(dataUrl);
      closeCamera();
    } catch {
      setCameraError("Could not process the captured photo. Please try again.");
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    deleteJobPhoto(job.id, photoId);
    setJob(getMobileJobById(job.id));
    setFeedback("Photo removed.");
    setTimeout(() => setFeedback(null), 3000);
  };

  const photos = job.photos || [];

  return (
    <div className="space-y-3.5 max-w-full overflow-hidden pb-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b pb-2">
        <Link
          to="/mobile/jobs/$jobId"
          params={{ jobId: job.id }}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground bg-card border px-2.5 py-1.5 rounded-lg shadow-2xs"
        >
          <ArrowLeft size={14} />
          <span>Back to Job</span>
        </Link>
        <div className="text-right">
          <span className="font-mono text-xs font-bold text-primary">{job.id}</span>
        </div>
      </div>

      <div className="card-surface p-4 space-y-3">
        <div className="flex items-center gap-2 border-b pb-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary">
            <Camera size={18} />
          </span>
          <div>
            <h1 className="text-sm font-bold">Site Photos & Evidence</h1>
          </div>
        </div>

        {feedback && (
          <div className="p-2.5 rounded-lg bg-primary-soft text-primary text-xs border border-primary/20 flex items-center gap-2">
            <CheckCircle size={15} />
            <span>{feedback}</span>
          </div>
        )}

        {/* Capture Panel */}
        <div className="p-3 rounded-lg border bg-muted/40 space-y-2.5 text-xs">
          <h3 className="font-bold text-foreground flex items-center gap-1.5 border-b pb-1.5">
            <Upload size={14} className="text-primary" />
            <span>Capture New Photo</span>
          </h3>

          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground mb-1">
              Photo Stage Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as JobPhoto["category"])}
              className="input-field py-1 text-xs"
            >
              <option value="Before Work">Before Work (Initial Site Condition)</option>
              <option value="Fault / Damage">Fault / Damage Evidence</option>
              <option value="Parts Replaced">Parts Replaced / Installed</option>
              <option value="After Work / Clean Site">After Work / Site Clean</option>
              <option value="Serial Plate">Serial Plate</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground mb-1">
              Photo Description / Notes
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Loose wiring terminal on ODU circuit..."
              className="input-field py-1.5 text-xs"
            />
          </div>

          <Button size="sm" className="w-full text-xs font-bold bg-primary" onClick={openCamera}>
            <Camera size={14} className="mr-1.5" />
            Attach Photo to Job
          </Button>
        </div>

        {/* Gallery Display */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between border-b pb-1.5 text-xs">
            <span className="font-bold text-foreground">Attached Photos ({photos.length})</span>
            <span className="text-[11px] font-mono text-muted-foreground">Field Evidence</span>
          </div>

          {photos.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground space-y-1">
              <ImageIcon size={24} className="mx-auto text-muted-foreground/50" />
              <p className="font-semibold text-foreground">No photos attached</p>
              <p className="text-[11px]">Attach site photos before completing work order.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="p-2 rounded-lg border bg-card space-y-1.5 shadow-2xs relative group"
                >
                  <div className="aspect-video w-full rounded overflow-hidden bg-muted">
                    <img
                      src={photo.dataUrl}
                      alt={photo.caption}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-1 text-[10px]">
                    <div className="min-w-0">
                      <span className="font-bold text-primary block truncate">
                        {photo.category}
                      </span>
                      <p className="text-muted-foreground truncate">{photo.caption}</p>
                      <p className="text-muted-foreground/70 font-mono">{photo.capturedAt}</p>
                      <p className="font-semibold text-foreground">
                        {photo.uploadState || "uploaded"}
                      </p>
                      {(photo.uploadState === "pending" || photo.uploadState === "failed") && (
                        <button
                          type="button"
                          className="font-semibold text-primary"
                          onClick={() => {
                            if (!navigator.onLine) {
                              updateJobPhotoUploadState(job.id, photo.id, "failed");
                            } else {
                              updateJobPhotoUploadState(job.id, photo.id, "uploading");
                              window.setTimeout(() => {
                                updateJobPhotoUploadState(job.id, photo.id, "uploaded");
                                setJob(getMobileJobById(job.id));
                              }, 700);
                            }
                            setJob(getMobileJobById(job.id));
                          }}
                        >
                          Retry upload
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-1 text-muted-foreground hover:text-destructive rounded shrink-0"
                      title="Delete photo"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          className="w-full text-xs font-bold h-9 mt-2"
          onClick={() => navigate({ to: "/mobile/jobs/$jobId", params: { jobId: job.id } })}
        >
          Return to Job Detail
        </Button>
      </div>

      {/* Hidden native camera input (fallback) */}
      <input
        ref={fallbackInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => void handleFallbackFile(e)}
      />

      {/* Live Camera Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex items-center justify-between px-3 py-2.5 text-white">
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">Capture Site Photo</p>
              <p className="text-[10px] text-white/70 truncate">Category: {category}</p>
            </div>
            <button
              type="button"
              onClick={closeCamera}
              className="p-2 rounded-full bg-white/15 hover:bg-white/25"
              title="Close camera"
            >
              <X size={18} />
            </button>
          </div>

          <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden">
            {capturedDataUrl ? (
              <img
                src={capturedDataUrl}
                alt="Captured preview"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="max-h-full max-w-full object-contain"
              />
            )}

            {cameraStarting && !capturedDataUrl && (
              <div className="absolute inset-0 grid place-items-center text-xs text-white/80">
                Starting camera...
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-x-3 top-3 flex items-start gap-2 rounded-lg bg-destructive/90 p-2.5 text-[11px] text-white">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>

          <div className="px-4 py-4 space-y-3">
            {capturedDataUrl ? (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 text-xs font-bold bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
                  onClick={handleRetake}
                >
                  <RotateCcw size={15} className="mr-1.5" />
                  Retake
                </Button>
                <Button
                  type="button"
                  className="h-11 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleUsePhoto}
                >
                  <Check size={15} className="mr-1.5" />
                  Use Photo
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSwitchCamera}
                    className="p-3 rounded-full bg-white/15 text-white hover:bg-white/25"
                    title="Switch camera"
                  >
                    <SwitchCamera size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={handleCapture}
                    disabled={cameraStarting || !!cameraError}
                    className="h-16 w-16 rounded-full border-4 border-white bg-white/90 hover:bg-white disabled:opacity-40 active:scale-95 transition"
                    title="Capture photo"
                  />

                  <span className="w-11" />
                </div>

                {cameraError && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 text-xs font-bold bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white"
                    onClick={() => fallbackInputRef.current?.click()}
                  >
                    <Camera size={14} className="mr-1.5" />
                    Open Device Camera App Instead
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
