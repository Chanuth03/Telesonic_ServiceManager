import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  PenTool,
  CheckCircle,
  AlertCircle,
  Star,
  FileCheck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  getMobileJobById,
  completeMobileJob,
  getLocalTodayDateString,
  type MobileJob,
} from "@/lib/mobile-data";
import { Button } from "@/components/ui/button";
import { useMobileI18n } from "@/lib/mobile-i18n";
import { downloadServiceReport } from "@/lib/service-report-pdf";

export const Route = createFileRoute("/mobile/jobs/$jobId/completion")({
  head: ({ params }) => ({
    meta: [
      { title: `Signature & Completion (O1-SCR-MOB-09) — Job ${params.jobId}` },
      {
        name: "description",
        content: "Customer digital sign-off, rating feedback, completion slip and job closure.",
      },
    ],
  }),
  component: MobileCompletionScreen,
});

function MobileCompletionScreen() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<MobileJob | undefined>(() => getMobileJobById(jobId));

  const [signerName, setSignerName] = useState(job?.completion?.signerName || "Dharmadasa Perera");
  const [signerRole, setSignerRole] = useState(
    job?.completion?.signerRole || "Site Supervisor / Engineer",
  );
  const [rating, setRating] = useState(job?.completion?.ratingStars || 5);
  const [comments, setComments] = useState(
    job?.completion?.feedbackComments || "Job completed satisfactorily. All test runs passed.",
  );
  const [isSigned, setIsSigned] = useState(
    !!job?.completion?.signatureDataUrl || !!job?.completion?.completedAt,
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [refusedToSign, setRefusedToSign] = useState(!!job?.completion?.refusedToSign);
  const [refusalReason, setRefusalReason] = useState(job?.completion?.refusalReason || "");
  const [partialCompletion, setPartialCompletion] = useState(!!job?.completion?.partialCompletion);
  const [partialReason, setPartialReason] = useState(job?.completion?.partialReason || "");
  const [warrantyTriggered, setWarrantyTriggered] = useState(!!job?.completion?.warrantyTriggered);
  const { t } = useMobileI18n();

  // Canvas Signature state & ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    setJob(getMobileJobById(jobId));
  }, [jobId]);

  // Set up crisp canvas backing store resolution on mount & resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width) || 320;
      const h = Math.round(rect.height) || 128;

      if (canvas.width === w * 2 && canvas.height === h * 2) return;

      // Preserve previous drawing if resizing
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      const hadContent = canvas.width > 0 && canvas.height > 0;
      if (tempCtx && hadContent) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      canvas.width = w * 2;
      canvas.height = h * 2;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (hadContent && tempCanvas.width > 0 && tempCanvas.height > 0) {
          ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
        }
      }
    };

    setupCanvas();
    window.addEventListener("resize", setupCanvas);
    return () => window.removeEventListener("resize", setupCanvas);
  }, [job?.id]);

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

  // Pre-completion checklist items
  const isTravelDone = job.travel?.status === "Arrived";
  const hasPartsLogged = (job.parts?.length || 0) > 0;
  const hasLabourLogged = (job.labourLogs?.length || 0) > 0;
  const hasPhotos = (job.photos?.length || 0) > 0;

  // Accurately map touch/mouse coordinate from viewport to canvas pixel buffer
  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // safe ignore in environments that do not support pointer capture
    }

    setIsDrawing(true);
    setIsSigned(true);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#1e3a8a"; // Executive deep ink blue
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const pt = getCanvasPoint(e);
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    // Draw immediate dot in case user just taps
    ctx.lineTo(pt.x + 0.1, pt.y + 0.1);
    ctx.stroke();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pt = getCanvasPoint(e);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      // safe ignore
    }
    setIsDrawing(false);
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
      }
    }
    setIsSigned(false);
  };

  const handleSimulateAutoSign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1e3a8a";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const w = canvas.width;
    const h = canvas.height;

    // Realistic cursive signature simulation
    ctx.beginPath();
    ctx.moveTo(w * 0.12, h * 0.65);
    ctx.bezierCurveTo(w * 0.2, h * 0.15, w * 0.32, h * 0.1, w * 0.36, h * 0.7);
    ctx.bezierCurveTo(w * 0.42, h * 0.28, w * 0.5, h * 0.22, w * 0.56, h * 0.62);
    ctx.bezierCurveTo(w * 0.62, h * 0.38, w * 0.7, h * 0.35, w * 0.76, h * 0.55);
    ctx.quadraticCurveTo(w * 0.83, h * 0.7, w * 0.9, h * 0.42);
    ctx.stroke();

    // Bottom flourish
    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.82);
    ctx.quadraticCurveTo(w * 0.52, h * 0.75, w * 0.88, h * 0.82);
    ctx.stroke();

    setIsSigned(true);
  };

  const handleSubmitCompletion = () => {
    if (!signerName.trim()) {
      setFeedback("Please enter the name of the customer or site representative signing.");
      return;
    }

    if (refusedToSign) {
      if (!refusalReason.trim()) {
        setFeedback("Enter why the customer refused to sign.");
        return;
      }
    } else if (!isSigned) {
      setFeedback("Please ask the customer to sign in the signature pad before submitting.");
      return;
    }
    if (partialCompletion && !partialReason.trim()) {
      setFeedback("Enter what is still outstanding for this partial completion.");
      return;
    }

    const canvas = canvasRef.current;
    let signatureDataUrl: string | undefined = undefined;
    if (!refusedToSign && canvas && isSigned) {
      signatureDataUrl = canvas.toDataURL("image/png");
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const workSlipNo = `WS-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    completeMobileJob(job.id, {
      signerName,
      signerRole,
      signatureDataUrl,
      ratingStars: rating,
      feedbackComments: comments,
      completedAt: `${getLocalTodayDateString()} ${timeStr}`,
      workSlipNumber: workSlipNo,
      refusedToSign,
      refusalReason: refusedToSign ? refusalReason.trim() : undefined,
      partialCompletion,
      partialReason: partialCompletion ? partialReason.trim() : undefined,
      warrantyTriggered,
    });

    setJob(getMobileJobById(job.id));
    setFeedback(`Work order ${job.id} completed! Digital slip ${workSlipNo} issued.`);
  };

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
          <p className="text-[10px] font-mono text-muted-foreground">O1-SCR-MOB-09</p>
        </div>
      </div>

      <div className="card-surface p-4 space-y-3">
        <div className="flex items-center gap-2 border-b pb-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary">
            <PenTool size={18} />
          </span>
          <div>
            <h1 className="text-sm font-bold">Signature & Job Completion</h1>
            <p className="text-[11px] text-muted-foreground">
              Work Slip Sign-off & Completion Audit
            </p>
          </div>
        </div>

        {feedback && (
          <div className="p-2.5 rounded-lg bg-primary-soft text-primary text-xs border border-primary/20 flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>{feedback}</span>
          </div>
        )}

        {/* Pre-completion Checklist Audit */}
        <div className="p-3 rounded-lg bg-muted/40 border text-xs space-y-1.5">
          <span className="font-bold text-foreground block border-b pb-1">
            Pre-Completion Workflow Audit
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5">
              <CheckCircle
                size={13}
                className={isTravelDone ? "text-success" : "text-muted-foreground"}
              />
              <span
                className={isTravelDone ? "text-foreground font-semibold" : "text-muted-foreground"}
              >
                Site Travel Logged
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckCircle
                size={13}
                className={hasPartsLogged ? "text-success" : "text-muted-foreground"}
              />
              <span
                className={
                  hasPartsLogged ? "text-foreground font-semibold" : "text-muted-foreground"
                }
              >
                Parts Logged ({job.parts?.length || 0})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckCircle
                size={13}
                className={hasLabourLogged ? "text-success" : "text-muted-foreground"}
              />
              <span
                className={
                  hasLabourLogged ? "text-foreground font-semibold" : "text-muted-foreground"
                }
              >
                Labour Logged ({job.labourLogs?.length || 0})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckCircle
                size={13}
                className={hasPhotos ? "text-success" : "text-muted-foreground"}
              />
              <span
                className={hasPhotos ? "text-foreground font-semibold" : "text-muted-foreground"}
              >
                Photos Attached ({job.photos?.length || 0})
              </span>
            </div>
          </div>
        </div>

        {/* If already completed display receipt */}
        {job.status === "Completed" && job.completion ? (
          <div className="p-4 rounded-xl border bg-success-soft/30 border-success/30 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-success/20 pb-2">
              <div className="flex items-center gap-2 text-success">
                <FileCheck size={18} />
                <span className="font-bold text-sm">Work Completed</span>
              </div>
              <span className="font-mono text-xs font-extrabold text-foreground bg-card px-2 py-0.5 rounded border">
                {job.completion.workSlipNumber}
              </span>
            </div>

            <div className="space-y-1.5 text-muted-foreground">
              <p>
                <strong className="text-foreground">Signed by:</strong> {job.completion.signerName}{" "}
                ({job.completion.signerRole})
              </p>
              <p>
                <strong className="text-foreground">Completed At:</strong>{" "}
                {job.completion.completedAt}
              </p>
              <p>
                <strong className="text-foreground">Customer Rating:</strong>{" "}
                {"⭐".repeat(job.completion.ratingStars)}
              </p>
              <p>
                <strong className="text-foreground">Feedback:</strong> "
                {job.completion.feedbackComments}"
              </p>

              {job.completion.refusedToSign && (
                <p>
                  <strong className="text-foreground">Signature:</strong> refused —{" "}
                  {job.completion.refusalReason}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                className="mt-2 h-9 w-full text-xs"
                onClick={() => downloadServiceReport(job)}
              >
                {t("downloadReport")}
              </Button>

              {job.completion.signatureDataUrl && (
                <div className="pt-2 border-t border-success/20">
                  <span className="text-[10px] font-semibold text-foreground block mb-1">
                    Captured Customer Signature:
                  </span>
                  <div className="bg-white rounded-lg p-2 border border-success/30 inline-block shadow-2xs">
                    <img
                      src={job.completion.signatureDataUrl}
                      alt={`Signature of ${job.completion.signerName}`}
                      className="h-14 max-w-[240px] object-contain rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Signature Input Form */
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">
                  Signer Full Name *
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="e.g. Mr. K. Perera"
                  className="input-field py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={signerRole}
                  onChange={(e) => setSignerRole(e.target.value)}
                  placeholder="e.g. Chief Engineer"
                  className="input-field py-1.5 text-xs"
                />
              </div>
            </div>

            {/* Customer Rating Stars */}
            <div className="space-y-1 text-xs">
              <label className="block text-[10px] font-semibold text-muted-foreground">
                Customer Service Rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      size={20}
                      className={
                        star <= rating ? "fill-warning text-warning" : "text-muted-foreground/40"
                      }
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-foreground ml-2">{rating} / 5 Stars</span>
              </div>
            </div>

            {/* Customer Feedback Comments */}
            <div className="space-y-1 text-xs">
              <label className="block text-[10px] font-semibold text-muted-foreground">
                Customer Remarks & Service Feedback
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Work done satisfactorily..."
                className="input-field text-xs min-h-[50px] py-1.5"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={refusedToSign}
                onChange={(event) => setRefusedToSign(event.target.checked)}
              />
              {t("refusedToSign")}
            </label>
            {refusedToSign ? (
              <textarea
                value={refusalReason}
                onChange={(event) => setRefusalReason(event.target.value)}
                placeholder={t("refusalReason")}
                className="input-field text-xs min-h-[50px] py-1.5"
              />
            ) : null}
            <label className="flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={partialCompletion}
                onChange={(event) => setPartialCompletion(event.target.checked)}
              />
              {t("partial")}
            </label>
            {partialCompletion ? (
              <textarea
                value={partialReason}
                onChange={(event) => setPartialReason(event.target.value)}
                placeholder="What is still outstanding?"
                className="input-field text-xs min-h-[50px] py-1.5"
              />
            ) : null}
            <label className="flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={warrantyTriggered}
                onChange={(event) => setWarrantyTriggered(event.target.checked)}
              />
              {t("warranty")}
            </label>

            {!refusedToSign ? (
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  <PenTool size={13} className="text-primary" />
                  <span>Customer Signature on Screen *</span>
                </label>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={handleSimulateAutoSign}
                    className="text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <Sparkles size={11} />
                    <span>Auto-Sign</span>
                  </button>
                  <span className="text-muted-foreground/40">•</span>
                  <button
                    type="button"
                    onClick={handleClearSignature}
                    className="text-muted-foreground hover:text-destructive transition-colors font-medium flex items-center gap-1"
                  >
                    <RotateCcw size={11} />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-primary/30 rounded-xl p-1 bg-white relative overflow-hidden shadow-xs">
                <canvas
                  ref={canvasRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="w-full h-32 touch-none bg-white rounded-lg cursor-crosshair block select-none"
                  style={{ touchAction: "none" }}
                />
                {!isSigned && (
                  <div className="text-[11px] text-slate-400 absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                    <PenTool size={20} className="mb-1 text-slate-400/60" />
                    <span className="font-medium">Draw signature here with finger or stylus</span>
                    <span className="text-[10px] text-slate-300">
                      or click 'Auto-Sign' for quick test
                    </span>
                  </div>
                )}
                {isSigned && (
                  <div className="absolute bottom-1 right-2 pointer-events-none">
                    <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      ✓ Signature captured
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Touch and drag your finger across the box above to sign.
              </p>
            </div>
            ) : null}

            <Button
              className="w-full text-xs font-bold h-10 bg-success text-success-foreground hover:bg-success/90"
              onClick={handleSubmitCompletion}
            >
              <CheckCircle size={15} className="mr-1.5" />
              Submit Work Completion & Issue Work Slip
            </Button>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full text-xs font-semibold h-9"
          onClick={() => navigate({ to: "/mobile/jobs/$jobId", params: { jobId: job.id } })}
        >
          Return to Job Detail
        </Button>
      </div>
    </div>
  );
}
