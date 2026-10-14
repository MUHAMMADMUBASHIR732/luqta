import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, Copy, Mail, MessageCircle, PackageCheck, Phone } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api.js";
import { celebrate } from "../lib/confetti.js";
import { isAccessError, messageOf } from "../lib/errors.js";
import { digitsOnly } from "../lib/format.js";
import { useClaim, useItem } from "../hooks/useData.js";
import { useAuth } from "../context/AuthContext.jsx";
import AnimatedCheck from "../components/AnimatedCheck.jsx";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import Page from "../components/Page.jsx";
import { ErrorState, ListSkeleton } from "../components/states.jsx";

function CopyRow({ icon: Icon, label, value }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy. Select and copy it by hand.");
    }
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-sand p-4">
      <Icon className="h-6 w-6 shrink-0 text-brand" strokeWidth={1.75} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted">{label}</p>
        <p className="break-all text-lg font-bold text-ink">{value}</p>
      </div>
      <Button variant="outline" size="sm" icon={copied ? Check : Copy} onClick={copy} aria-label={`Copy ${label}`}>
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

/** Contact details load only here, and only when the claim is accepted. */
export default function Handover() {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: claim, error, refresh } = useClaim(claimId, { interval: 6000 });
  const [contact, setContact] = useState(null);
  const [contactError, setContactError] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [celebrated, setCelebrated] = useState(false);

  const isFinder = claim && user && claim.finderId === user.id;
  const myItemId = claim ? (claim.finderId === user?.id ? claim.foundItemId : claim.lostItemId) : null;
  const { data: myItem, refresh: refreshItem } = useItem(myItemId, { interval: 6000, enabled: claim?.status === "accepted" });
  const returned = myItem?.status === "returned";

  useEffect(() => {
    if (error && isAccessError(error)) navigate("/forbidden", { replace: true });
  }, [error, navigate]);

  useEffect(() => {
    if (claim?.status !== "accepted" || contact) return;
    api.getContact({ claimId }).then(setContact).catch(setContactError);
  }, [claim?.status, claimId, contact]);

  if (!claim) return <Page title="Handover">{error && !isAccessError(error) ? <ErrorState error={error} onRetry={refresh} /> : <ListSkeleton count={1} />}</Page>;

  if (claim.status !== "accepted") {
    return (
      <Page title="Handover">
        <ErrorState title="Not ready yet" error={{ userMessage: "Contact details unlock after the finder accepts the answer." }} />
        <div className="mt-6 text-center"><Button to="/my-reports" variant="outline">Back to my reports</Button></div>
      </Page>
    );
  }

  async function markReturned() {
    await api.markReturned({ claimId });
    setCelebrated(true);
    celebrate();
    refresh();
    refreshItem();
  }

  const phone = contact?.phone;
  const email = contact?.email;
  const done = celebrated || returned;

  return (
    <Page title="Handover">
      <div className="flex flex-col items-center text-center">
        <AnimatedCheck />
        <h1 className="mt-4 text-3xl font-bold text-ink sm:text-4xl">{done ? "Returned. Thank you!" : "It's a match!"}</h1>
        <p className="mt-2 max-w-md text-muted">
          {done ? "This report is closed. You made someone's day." : isFinder ? "Here's how to reach the owner. Meet somewhere public and bring the item." : "Here's how to reach the finder. Meet somewhere public to collect your item."}
        </p>
      </div>

      <Card padding="lg" className="mt-8 space-y-4">
        <h2 className="text-lg font-bold text-ink">{isFinder ? "Owner's contact" : "Finder's contact"}</h2>
        {contactError ? (
          <ErrorState error={contactError} onRetry={() => { setContactError(null); api.getContact({ claimId }).then(setContact).catch(setContactError); }} />
        ) : !contact ? (
          <ListSkeleton count={1} />
        ) : (
          <>
            {phone && <CopyRow icon={Phone} label="Phone" value={phone} />}
            {email && <CopyRow icon={Mail} label="Email" value={email} />}
            {!phone && !email && <p className="text-muted">They haven't shared contact details yet. Check again soon.</p>}
            <div className="flex flex-col gap-3 sm:flex-row">
              {phone && <Button className="flex-1" href={`tel:${phone.replace(/\s/g, "")}`} icon={Phone}>Call</Button>}
              {phone && <Button className="flex-1" variant="outline" href={`https://wa.me/${digitsOnly(phone)}`} target="_blank" rel="noreferrer" icon={MessageCircle}>WhatsApp</Button>}
              {email && <Button className="flex-1" variant="outline" href={`mailto:${email}`} icon={Mail}>Email</Button>}
            </div>
          </>
        )}
      </Card>

      {isFinder && !done && (
        <div className="mt-6 rounded-3xl bg-ink p-6 text-cream">
          <p className="text-lg font-bold">Handed it over?</p>
          <p className="mt-1 text-cream/75">Once the owner has their item, mark it as returned to close both reports.</p>
          <Button className="mt-4 w-full sm:w-auto" variant="accent" icon={PackageCheck} onClick={() => setConfirm(true)}>
            Mark as returned
          </Button>
        </div>
      )}
      {!isFinder && !done && <p className="mt-6 text-center text-sm text-muted">The finder will mark the item as returned once you have it.</p>}
      {done && <div className="mt-6 text-center"><Button to="/my-reports">Back to my reports</Button></div>}

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Mark as returned?"
        description="Only do this once the owner has their item. It closes both reports."
        confirmLabel="Yes, it's returned"
        onConfirm={markReturned}
      />
    </Page>
  );
}
