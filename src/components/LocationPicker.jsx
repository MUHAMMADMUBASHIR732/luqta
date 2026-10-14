import { lazy, Suspense, useState } from "react";
import { LocateFixed, Map as MapIcon, MapPinCheck } from "lucide-react";
import Button from "./Button.jsx";
import Field, { Input } from "./Field.jsx";
import { Skeleton } from "./states.jsx";

const MapPin = lazy(() => import("./MapPin.jsx"));

const hasCoords = (v) => Boolean(v && (v.lat || v.lng));

/**
 * Where it happened. A text field is enough; a map pin and "use my location" are optional extras.
 * Value and onChange use { lat, lng, label }.
 */
export default function LocationPicker({ value, onChange, error }) {
  const [mapOpen, setMapOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState("");
  const current = value || { lat: 0, lng: 0, label: "" };

  function useMyLocation() {
    setNote("");
    if (!navigator.geolocation) {
      setNote("Your browser can't share its location. Type the place instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onChange({ lat: Number(pos.coords.latitude.toFixed(6)), lng: Number(pos.coords.longitude.toFixed(6)), label: current.label || "My current location" });
      },
      () => {
        setLocating(false);
        setNote("We couldn't get your location. Type the place instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="space-y-3">
      <Field label="Place" error={error} hint="A landmark, street or building is enough.">
        <Input
          value={current.label}
          onChange={(e) => onChange({ ...current, label: e.target.value })}
          placeholder="Dolmen Mall, Clifton"
          autoComplete="off"
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" icon={LocateFixed} onClick={useMyLocation} loading={locating}>
          Use my location
        </Button>
        <Button variant="outline" size="sm" icon={MapIcon} onClick={() => setMapOpen((o) => !o)} aria-expanded={mapOpen}>
          {mapOpen ? "Hide map" : "Pin on map"}
        </Button>
      </div>
      {hasCoords(current) && (
        <p className="flex items-center gap-2 text-sm font-medium text-success">
          <MapPinCheck className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          Pin saved with your place
        </p>
      )}
      {note && (
        <p role="status" className="text-sm text-muted">
          {note}
        </p>
      )}
      {mapOpen && (
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <MapPin value={current} onPick={({ lat, lng }) => onChange({ lat, lng, label: current.label || "Pinned location" })} />
        </Suspense>
      )}
    </div>
  );
}
