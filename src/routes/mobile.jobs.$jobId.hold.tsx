import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  PauseCircle,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  ShieldAlert,
} from "lucide-react";
import {
  getMobileJobById,
  submitJobHoldRequest,
  type MobileJob,
  type HoldRequestRecord,
} from "@/lib/mobile-data";
import { Button } from "@/components/ui/button";
import { useMobileI18n } from "@/lib/mobile-i18n";

type HoldReason = HoldRequestRecord["reason"];

export const Route = createFileRoute("/mobile/jobs/$jobId/hold")({
  head: ({ params }) => ({
    meta: [
      { title: `Hold Request (O1-SCR-MOB-13) — Job ${params.jobId}` },
      {
        name: "description",
        content: "Submit job hold request for spare parts, site access or supervisor escalation.",
      },
    ],
  }),
  component: MobileHoldRequestScreen,
});

function MobileHoldRequestScreen() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<MobileJob | undefined>(() => getMobileJobById(jobId));

  const [reason, setReason] = useState<HoldReason>("Awaiting Spare Parts");
  const [notes, setNotes] = useState(
    "Compressor capacitor 45uF not available in van stock. Ordered from central warehouse.",
  );
  const [resumeDate, setResumeDate] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const { t } = useMobileI18n();

  useEffect(() => {
    setJob(getMobileJobById(jobId));
  }, [jobId]);

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

  const handleSubmitHold = () => {
    if (!notes.trim()) {
      setFeedback("Please enter detailed notes explaining the hold reason.");
      return;
    }
    if (!resumeDate) {
      setFeedback("Enter the expected resume date before sending this to the coordinator.");
      return;
    }

    const timeStr = new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" });
    const resume = new Date(`${resumeDate}T00:00:00`);
    const delayHours = Number.isNaN(resume.getTime())
      ? 24
      : Math.max(1, Math.round((resume.getTime() - Date.now()) / 36e5));
    const newHold: HoldRequestRecord = {
      id: `HR-${Date.now().toString().slice(-4)}`,
      reason,
      notes,
      estimatedDelayHours: delayHours,
      expectedResumeDate: resumeDate,
      requestedAt: timeStr,
      status: "Pending Review",
    };

    submitJobHoldRequest(job.id, newHold);
    setJob(getMobileJobById(job.id));
    setFeedback(t("holdWaiting"));

    setTimeout(() => {
      navigate({ to: "/mobile/jobs/$jobId", params: { jobId: job.id } });
    }, 1200);
  };

  const holdRequests = job.holdRequests || [];

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
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-warning-soft text-warning">
            <PauseCircle size={18} />
          </span>
          <div>
            <h1 className="text-sm font-bold">Request Job Hold</h1>
          </div>
        </div>

        {feedback && (
          <div className="p-2.5 rounded-lg bg-primary-soft text-primary text-xs border border-primary/20 flex items-center gap-2">
            <CheckCircle size={15} />
            <span>{feedback}</span>
          </div>
        )}

        {/* Hold Form */}
        <div className="space-y-2.5 text-xs">
          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground mb-1">
              Primary Hold Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as HoldReason)}
              className="input-field py-1.5 text-xs"
            >
              <option value="Awaiting Spare Parts">Awaiting Spare Parts / Central Inventory</option>
              <option value="Customer Site Access Unavailable">
                Customer Site Access Unavailable / Premises Closed
              </option>
              <option value="Technical Escalation Required">
                Technical Escalation Required / Senior Engineer Needed
              </option>
              <option value="Safety Hazard On Site">Safety Hazard On Site / Power Outage</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground mb-1">
              {t("expectedResume")} *
            </label>
            <input
              type="date"
              value={resumeDate}
              onChange={(e) => setResumeDate(e.target.value)}
              className="input-field py-1.5 text-xs font-mono w-44 font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground mb-1">
              Detailed Explanation & Notes *
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Provide exact details why the job cannot proceed today..."
              className="input-field text-xs py-2"
            />
          </div>

          <Button
            className="w-full text-xs font-bold h-10 bg-warning text-warning-foreground hover:bg-warning/90"
            onClick={handleSubmitHold}
          >
            <PauseCircle size={15} className="mr-1.5" />
            {t("submitHold")}
          </Button>
        </div>

        {/* Existing Hold History */}
        {holdRequests.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <span className="font-bold text-xs text-foreground block">Previous Hold History</span>
            <div className="space-y-2">
              {holdRequests.map((hr) => (
                <div key={hr.id} className="p-2.5 rounded-lg border bg-muted/40 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-warning">{hr.reason}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {hr.requestedAt}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{hr.notes}</p>
                  <p className="text-[10px] font-semibold text-foreground">
                    {hr.status}
                    {hr.expectedResumeDate ? ` · resume ${hr.expectedResumeDate}` : ""}
                    {hr.reviewedBy ? ` · ${hr.reviewedBy}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
