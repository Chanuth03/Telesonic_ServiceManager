import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  Navigation,
  MapPin,
  Gauge,
  CheckCircle2,
  FileText,
  AlertCircle,
  ShieldCheck,
  Bell,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  Radio,
  Check,
  Zap,
  ExternalLink,
} from "lucide-react";
import {
  getMobileJobById,
  updateMobileJobTravel,
  subscribeMobileJobs,
  type MobileJob,
  type TravelDetails,
} from "@/lib/mobile-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/mobile/jobs/$jobId/travel")({
  head: ({ params }) => ({
    meta: [
      { title: `Travel & Check-in (O1-SCR-MOB-04) — Job ${params.jobId}` },
      {
        name: "description",
        content:
          "Technician GPS check-in, odometer readings, en-route notifications, and site arrival status.",
      },
    ],
  }),
  component: MobileTravelCheckInScreen,
});

function isLegacyMockGps(coordStr?: string): boolean {
  if (!coordStr) return true;
  // Filter out the old hardcoded mock coordinate 6.9821° N, 79.9312° E
  return coordStr.startsWith("6.98") && coordStr.includes("79.93");
}

function formatLatLng(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(6)}° ${lngDir}`;
}

function MobileTravelCheckInScreen() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState<MobileJob | undefined>(() => getMobileJobById(jobId));

  // Sync state from job
  const [travelStatus, setTravelStatus] = useState<"Not Started" | "Traveling" | "Arrived">(
    job?.travel?.status || "Not Started",
  );

  const [startOdometer, setStartOdometer] = useState<number | undefined>(
    job?.travel?.startOdometer,
  );
  const [endOdometer, setEndOdometer] = useState<number | undefined>(
    job?.travel?.endOdometer,
  );
  const [travelStartTime, setTravelStartTime] = useState<string>(
    job?.travel?.travelStartTime || "",
  );
  const [arrivalTime, setArrivalTime] = useState<string>(job?.travel?.arrivalTime || "");

  const initialGps =
    job?.travel?.gpsCoordinates && !isLegacyMockGps(job.travel.gpsCoordinates)
      ? job.travel.gpsCoordinates
      : undefined;

  const [gpsCoordinates, setGpsCoordinates] = useState<string | undefined>(initialGps);
  const [gpsAccuracy, setGpsAccuracy] = useState<string | undefined>(
    initialGps ? job?.travel?.gpsAccuracy : undefined,
  );
  const [rawLatLng, setRawLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null);
  const [isAcquiringGps, setIsAcquiringGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [customerNotified, setCustomerNotified] = useState<boolean>(
    job?.travel?.customerNotified || false,
  );
  const [customerNotifiedAt, setCustomerNotifiedAt] = useState<string | undefined>(
    job?.travel?.customerNotifiedAt,
  );
  const [trafficCondition, setTrafficCondition] = useState<string>(
    job?.travel?.trafficCondition || "Normal Traffic",
  );
  const [travelNotes, setTravelNotes] = useState<string>(job?.travel?.travelNotes || "");

  const [feedback, setFeedback] = useState<string | null>(null);
  const [simulatedBanner, setSimulatedBanner] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const idempotencyKey =
    job?.travel?.idempotencyKey ||
    `IDEMP-TRV-${(job?.id || "001").replace(/[^A-Z0-9]/gi, "")}-987123`;

  // Reverse geocode coordinates when online so technician can see the exact detected street/place name
  const reverseGeocodeLocation = useCallback(async (lat: number, lng: number) => {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.display_name) {
          setDetectedAddress(String(data.display_name));
        }
      }
    } catch {
      // Offline or reverse geocode unavailable — coordinates still work 100%
    }
  }, []);

  // Acquire 100% real device location using navigator.geolocation
  const acquireRealDeviceGPS = useCallback(
    (showToast: boolean = true): Promise<{ coords: string; acc: string } | null> => {
      return new Promise((resolve) => {
        if (typeof window === "undefined" || !("geolocation" in navigator)) {
          const msg = "Geolocation is not supported by this browser/device.";
          setGpsError(msg);
          resolve(null);
          return;
        }

        setIsAcquiringGps(true);
        setGpsError(null);

        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }

        const handleSuccess = (position: GeolocationPosition) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracyMeters = Math.max(1, Math.round(position.coords.accuracy || 5));

          const coords = formatLatLng(lat, lng);
          const acc = `±${accuracyMeters}m`;

          setRawLatLng({ lat, lng });
          setGpsCoordinates(coords);
          setGpsAccuracy(acc);
          setIsAcquiringGps(false);
          setGpsError(null);

          updateMobileJobTravel(jobId, {
            gpsCoordinates: coords,
            gpsAccuracy: acc,
          });

          void reverseGeocodeLocation(lat, lng);

          if (showToast) {
            setFeedback(`Live Device GPS Locked: ${coords} (${acc})`);
            setTimeout(() => setFeedback(null), 4000);
          }

          resolve({ coords, acc });
        };

        const handleError = (err: GeolocationPositionError) => {
          setIsAcquiringGps(false);
          let errMsg = "Unable to retrieve your location.";
          if (err.code === err.PERMISSION_DENIED) {
            errMsg =
              "Location permission denied. Please allow Location access in your browser/device settings.";
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            errMsg = "Location information is unavailable. Please turn on device GPS / Location.";
          } else if (err.code === err.TIMEOUT) {
            errMsg = "GPS lock timed out. Please move to an area with clear signal and retry.";
          }
          setGpsError(errMsg);
          resolve(null);
        };

        // First try high-accuracy hardware GPS with 0 cache (fresh reading)
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          (highAccErr) => {
            // If high accuracy times out (e.g. indoor desktop), fallback to network/Wi-Fi geolocation
            if (
              highAccErr.code === highAccErr.TIMEOUT ||
              highAccErr.code === highAccErr.POSITION_UNAVAILABLE
            ) {
              navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 0,
              });
            } else {
              handleError(highAccErr);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 12000,
            maximumAge: 0,
          },
        );
      });
    },
    [jobId, reverseGeocodeLocation],
  );

  // Subscribe to store updates
  useEffect(() => {
    const current = getMobileJobById(jobId);
    setJob(current);
    if (current?.travel) {
      setTravelStatus(current.travel.status || "Not Started");
      setStartOdometer(current.travel.startOdometer);
      setEndOdometer(current.travel.endOdometer);
      if (current.travel.travelStartTime) setTravelStartTime(current.travel.travelStartTime);
      if (current.travel.arrivalTime) setArrivalTime(current.travel.arrivalTime);
      if (current.travel.gpsCoordinates && !isLegacyMockGps(current.travel.gpsCoordinates)) {
        setGpsCoordinates(current.travel.gpsCoordinates);
        if (current.travel.gpsAccuracy) setGpsAccuracy(current.travel.gpsAccuracy);
      }
      if (current.travel.customerNotified) setCustomerNotified(current.travel.customerNotified);
      if (current.travel.customerNotifiedAt)
        setCustomerNotifiedAt(current.travel.customerNotifiedAt);
      if (current.travel.trafficCondition) setTrafficCondition(current.travel.trafficCondition);
      if (current.travel.travelNotes !== undefined) setTravelNotes(current.travel.travelNotes);
    }

    return subscribeMobileJobs(() => {
      const updated = getMobileJobById(jobId);
      setJob(updated);
      if (updated?.travel) {
        setTravelStatus(updated.travel.status || "Not Started");
      }
    });
  }, [jobId]);

  // Automatically acquire real device GPS on mount
  useEffect(() => {
    void acquireRealDeviceGPS(false);
    return () => {
      if (
        watchIdRef.current !== null &&
        typeof navigator !== "undefined" &&
        "geolocation" in navigator
      ) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [acquireRealDeviceGPS]);

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

  const distanceTraveled =
    startOdometer !== undefined && endOdometer !== undefined
      ? Math.max(0, endOdometer - startOdometer)
      : 0;
  const isOdometerInvalid =
    startOdometer !== undefined && endOdometer !== undefined && endOdometer < startOdometer;

  // Handler: Start Travel
  const handleStartTravel = () => {
    const nowStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setTravelStatus("Traveling");
    setTravelStartTime(nowStr);

    const update: Partial<TravelDetails> = {
      status: "Traveling",
      startOdometer,
      travelStartTime: nowStr,
      trafficCondition,
      travelNotes,
      idempotencyKey,
    };

    updateMobileJobTravel(job.id, update);
    setFeedback(`Travel started at ${nowStr}. Status set to 'En Route'.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  // Handler: GPS Capture Button
  const handleRecordGPS = () => {
    void acquireRealDeviceGPS(true);
  };

  // Handler: Site Check-in
  const handleSiteArrival = async () => {
    const nowStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Always acquire fresh real GPS on site arrival check-in
    const freshGps = await acquireRealDeviceGPS(false);
    const currentGps = freshGps?.coords || gpsCoordinates;
    const currentAcc = freshGps?.acc || gpsAccuracy;

    setTravelStatus("Arrived");
    setArrivalTime(nowStr);

    updateMobileJobTravel(job.id, {
      status: "Arrived",
      startOdometer,
      endOdometer,
      arrivalTime: nowStr,
      gpsCoordinates: currentGps,
      gpsAccuracy: currentAcc,
      trafficCondition,
      travelNotes,
      idempotencyKey,
    });

    setFeedback(`Site arrival checked in at ${nowStr}. Job status updated to 'In Progress'.`);
  };

  const handleCompleteAndReturn = async () => {
    if (travelStatus !== "Arrived") {
      await handleSiteArrival();
    } else {
      updateMobileJobTravel(job.id, {
        status: "Arrived",
        startOdometer,
        endOdometer,
        arrivalTime: arrivalTime || new Date().toLocaleTimeString(),
        gpsCoordinates,
        gpsAccuracy,
        trafficCondition,
        travelNotes,
        idempotencyKey,
      });
    }
    navigate({ to: "/mobile/jobs/$jobId", params: { jobId: job.id } });
  };

  const trafficOptions = ["Normal Traffic", "Heavy Traffic", "Weather Delay", "Site Access Delay"];

  return (
    <div className="space-y-3.5 max-w-full overflow-hidden pb-6">
      {/* Top Bar with Back Navigation & Job Ref */}
      <div className="flex items-center justify-between gap-2 border-b pb-2">
        <Link
          to="/mobile/jobs/$jobId"
          params={{ jobId: job.id }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-card border px-2.5 py-1.5 rounded-lg shadow-2xs transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Job</span>
        </Link>
        <div className="text-right">
          <span className="font-mono text-xs font-bold text-primary bg-primary-soft px-2 py-0.5 rounded border border-primary/20">
            {job.id}
          </span>
        </div>
      </div>

      {/* Main Job Context Header Card */}
      <div className="card-surface p-3.5 space-y-3 shadow-xs">
        <div className="flex items-start justify-between gap-2 pb-2.5">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground shrink-0 font-bold text-xs shadow-2xs">
                <Navigation size={15} />
              </span>
              <h1 className="text-sm font-bold text-foreground leading-tight truncate">
                Travel & Check-in
              </h1>
            </div>
            <p className="text-xs font-semibold text-foreground pt-1">{job.customerName}</p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <MapPin size={12} className="text-primary shrink-0" />
              <span>{job.siteAddress || `${job.town}, Sri Lanka`}</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                travelStatus === "Arrived"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : travelStatus === "Traveling"
                    ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300"
                    : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {travelStatus === "Arrived"
                ? "✓ Arrived on Site"
                : travelStatus === "Traveling"
                  ? "🚗 En Route"
                  : "Not Started"}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded border">
              Window: {job.scheduledWindow || job.window}
            </span>
          </div>
        </div>
      </div>

      {/* Feedback & Simulation Alerts */}
      {feedback && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 text-xs border border-emerald-300 animate-in fade-in">
          <ShieldCheck size={16} className="shrink-0 text-emerald-600" />
          <span className="font-medium">{feedback}</span>
        </div>
      )}

      {simulatedBanner && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200 text-xs border border-blue-300 animate-in fade-in">
          <Bell size={16} className="shrink-0 text-blue-600 mt-0.5" />
          <span>{simulatedBanner}</span>
        </div>
      )}

      {/* Workflow Section 1: Travel Departure & Departure Odometer */}
      <div className="card-surface p-3.5 space-y-3 border">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded bg-primary-soft text-primary font-bold text-xs">
              1
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wide text-foreground">
              Departure & Travel En Route
            </h2>
          </div>
          {travelStartTime && (
            <span className="text-[11px] font-mono font-bold text-primary bg-primary-soft px-2 py-0.5 rounded border border-primary/20">
              {travelStartTime}
            </span>
          )}
        </div>

        <div className="space-y-2.5">
          {travelStatus === "Not Started" ? (
            <Button
              className="w-full text-xs font-bold h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
              onClick={handleStartTravel}
            >
              <Navigation size={15} className="mr-2" />
              Start Travel / Departure
            </Button>
          ) : (
            <div className="flex items-center justify-between text-xs bg-muted/50 p-2.5 rounded-lg border">
              <span className="text-muted-foreground font-medium">Departure Clock:</span>
              <span className="font-mono font-bold text-foreground">{travelStartTime}</span>
            </div>
          )}

          {/* Start Odometer Field */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Gauge size={13} className="text-primary" />
                Start Odometer Reading (KM)
              </span>
              <span className="text-[10px] text-muted-foreground">Vehicle Log</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={startOdometer ?? ""}
                placeholder="Enter start KM..."
                onChange={(e) => {
                  const val = e.target.value === "" ? undefined : Number(e.target.value);
                  setStartOdometer(val);
                  updateMobileJobTravel(job.id, { startOdometer: val });
                }}
                className="input-field py-2 px-3 text-xs font-mono font-bold w-full pr-12"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-muted-foreground">
                KM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Section 2: Site Arrival & GPS Sensor Check-In */}
      <div className="card-surface p-3.5 space-y-3 border">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded bg-primary-soft text-primary font-bold text-xs">
              2
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wide text-foreground">
              Site Arrival & GPS Check-In
            </h2>
          </div>
          {arrivalTime && (
            <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200">
              {arrivalTime}
            </span>
          )}
        </div>

        <div className="space-y-2.5">
          {/* Arrival / End Odometer & Calculated Distance */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Arrival Odometer
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={endOdometer ?? ""}
                  placeholder="Enter arrival KM..."
                  onChange={(e) => {
                    const val = e.target.value === "" ? undefined : Number(e.target.value);
                    setEndOdometer(val);
                    updateMobileJobTravel(job.id, { endOdometer: val });
                  }}
                  className="input-field py-1.5 px-2.5 text-xs font-mono font-bold w-full pr-10"
                />
                <span className="absolute right-2.5 top-2 text-[11px] font-bold text-muted-foreground">
                  KM
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Calculated Distance
              </label>
              <div className="bg-muted/60 py-1.5 px-2.5 rounded border font-mono text-xs font-bold text-primary flex items-center justify-between h-[34px]">
                <span>{distanceTraveled} KM</span>
                <span className="text-[10px] text-muted-foreground font-normal">Trip Log</span>
              </div>
            </div>
          </div>

          {isOdometerInvalid && (
            <div className="flex items-center gap-1.5 text-[11px] text-destructive bg-destructive-soft p-2 rounded border border-destructive/30">
              <AlertTriangle size={14} className="shrink-0" />
              <span>Arrival odometer cannot be lower than start odometer.</span>
            </div>
          )}

          {/* GPS Location Capture Box */}
          <div className="bg-muted/40 p-3 rounded-lg border space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <MapPin size={14} className="text-primary" />
                Live Device GPS Sensor
              </span>
              <span className="text-[10px] font-mono bg-card px-1.5 py-0.5 rounded border text-muted-foreground">
                Accuracy: {gpsAccuracy || (isAcquiringGps ? "Locating..." : "Pending")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-card p-2 rounded border font-mono text-xs font-bold text-foreground truncate">
                {isAcquiringGps
                  ? "Acquiring real device GPS..."
                  : gpsCoordinates || "Click Acquire GPS"}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isAcquiringGps}
                className="h-8 text-[11px] shrink-0 bg-card font-semibold"
                onClick={handleRecordGPS}
              >
                <RefreshCw
                  size={12}
                  className={`mr-1 text-primary ${isAcquiringGps ? "animate-spin" : ""}`}
                />
                {isAcquiringGps ? "Locating..." : gpsCoordinates ? "Refresh GPS" : "Acquire GPS"}
              </Button>
            </div>

            {detectedAddress && (
              <div className="text-[11px] text-muted-foreground bg-card/80 p-2 rounded border border-border/50 leading-snug">
                <strong className="text-foreground">Detected Location:</strong> {detectedAddress}
              </div>
            )}

            {rawLatLng && (
              <div className="flex items-center justify-between">
                <a
                  href={`https://www.google.com/maps?q=${rawLatLng.lat},${rawLatLng.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                >
                  <ExternalLink size={12} />
                  <span>Verify Current Location on Google Maps</span>
                </a>
              </div>
            )}

            {gpsError && (
              <div className="flex items-center gap-1.5 text-[11px] text-destructive bg-destructive-soft p-2 rounded border border-destructive/30">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{gpsError}</span>
              </div>
            )}

            {gpsCoordinates && !gpsError && (
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 p-1.5 rounded border border-emerald-200">
                <Check size={12} className="text-emerald-600 shrink-0" />
                <span>Live Hardware Geolocation Locked ({gpsAccuracy || "High Accuracy"})</span>
              </div>
            )}
          </div>

          {/* Site Arrival Confirm Button */}
          {travelStatus !== "Arrived" ? (
            <Button
              className="w-full text-xs font-bold h-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              disabled={isOdometerInvalid || isAcquiringGps}
              onClick={() => void handleSiteArrival()}
            >
              <CheckCircle2 size={16} className="mr-2" />
              Confirm Site Arrival & Check-In
            </Button>
          ) : (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-xs text-emerald-900 dark:text-emerald-100 space-y-2">
              <div className="flex items-center justify-between font-bold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Site Arrival Confirmed</span>
                </div>
                <span className="text-[10px] bg-card px-2 py-0.5 rounded border text-foreground">
                  In Progress
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Arrival: <strong className="text-foreground">{arrivalTime || "Logged"}</strong> ·
                GPS: <strong className="text-foreground">{gpsCoordinates || "Captured"}</strong>
              </p>
              <div className="pt-0.5 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setTravelStatus("Traveling");
                    setFeedback("Re-enabled check-in controls for updates.");
                  }}
                >
                  <RotateCcw size={12} className="mr-1" />
                  Edit / Re-check-in
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Section 3: Traffic Conditions & Travel Notes */}
      <div className="card-surface p-3.5 space-y-3 border">
        <div className="flex items-center gap-2 border-b pb-2">
          <span className="grid h-6 w-6 place-items-center rounded bg-primary-soft text-primary font-bold text-xs">
            3
          </span>
          <h2 className="text-xs font-bold uppercase tracking-wide text-foreground">
            Traffic Conditions & Route Notes
          </h2>
        </div>

        {/* Traffic Condition Chips */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <Radio size={13} className="text-primary" />
            Road / Traffic Condition
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {trafficOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setTrafficCondition(opt);
                  updateMobileJobTravel(job.id, { trafficCondition: opt });
                }}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium border text-left transition-colors flex items-center justify-between ${
                  trafficCondition === opt
                    ? "bg-primary text-primary-foreground border-primary font-bold"
                    : "bg-card text-foreground hover:bg-muted border-border"
                }`}
              >
                <span>{opt}</span>
                {trafficCondition === opt && <Check size={12} />}
              </button>
            ))}
          </div>
        </div>

        {/* Travel Notes Text Area */}
        <div className="space-y-1 pt-1">
          <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <FileText size={13} className="text-primary" />
            Route & Site Access Notes
          </label>
          <textarea
            value={travelNotes}
            onChange={(e) => {
              const val = e.target.value;
              setTravelNotes(val);
              updateMobileJobTravel(job.id, { travelNotes: val });
            }}
            placeholder="e.g. Heavy traffic along Kandy Road due to road maintenance; site gate pass obtained."
            className="input-field text-xs min-h-[60px] py-2 px-3 w-full"
          />
        </div>
      </div>

      {/* Main Action Button */}
      <div className="pt-1">
        <Button
          className="w-full text-xs font-bold h-11 bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
          onClick={() => void handleCompleteAndReturn()}
        >
          <Zap size={15} className="mr-2" />
          COMPLETE CHECK-IN & START JOB
        </Button>
      </div>
    </div>
  );
}
