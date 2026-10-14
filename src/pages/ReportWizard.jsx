import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api.js";
import { messageOf } from "../lib/errors.js";
import { toLocalInputValue } from "../lib/format.js";
import { DUR, EASE } from "../lib/motion.js";
import { foundSchema, lostDetailsIssues, lostSchema } from "../lib/schemas.js";
import Button from "../components/Button.jsx";
import DetailsFields from "../components/DetailsFields.jsx";
import Field, { Input } from "../components/Field.jsx";
import LocationPicker from "../components/LocationPicker.jsx";
import Page from "../components/Page.jsx";
import PhotoUploader from "../components/PhotoUploader.jsx";
import StepProgress from "../components/StepProgress.jsx";

const STEPS = ["Photo", "Details", "Where and when"];

const COPY = {
  found: { title: "I found something", lead: "Add a clear photo. We'll look for the owner.", submit: "Send report" },
  lost: { title: "I lost something", lead: "A photo helps, but you can describe it instead.", submit: "Send report" },
};

/** Shared 3-step form. `type` is "found" (photo required) or "lost" (photo optional). */
export default function ReportWizard({ type }) {
  const navigate = useNavigate();
  const isFound = type === "found";
  const copy = COPY[type];
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const {
    register, control, handleSubmit, trigger, watch, setError, clearErrors, formState: { errors },
  } = useForm({
    resolver: zodResolver(isFound ? foundSchema : lostSchema),
    mode: "onTouched",
    defaultValues: {
      photo: null, category: undefined, color: undefined, brand: undefined, description: "",
      location: { lat: 0, lng: 0, label: "" }, dateTime: new Date(),
    },
  });

  const photo = watch("photo");
  const description = watch("description") || "";
  const noPhotoLost = !isFound && !photo;

  function go(next) {
    setDir(next > step ? 1 : -1);
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function next() {
    if (step === 0) {
      if (isFound) {
        const ok = await trigger("photo");
        if (!ok) return;
      }
      return go(1);
    }
    if (step === 1) {
      const ok = await trigger(["description", "category", "color", "brand"]);
      let issues = {};
      if (!isFound) issues = lostDetailsIssues({ photo, category: watch("category"), description });
      Object.entries(issues).forEach(([field, message]) => setError(field, { type: "custom", message }));
      if (!ok || Object.keys(issues).length) return;
      clearErrors();
      return go(2);
    }
  }

  const submit = handleSubmit(
    async (v) => {
      setSubmitting(true);
      try {
        const { id } = await api.createReport({
          type,
          file: v.photo || null,
          declared: { category: v.category, color: v.color, brand: v.brand },
          location: v.location,
          dateTime: v.dateTime,
          description: v.description,
        });
        navigate(`/analyzing/${id}`, { replace: true });
      } catch (e) {
        toast.error(messageOf(e));
        setSubmitting(false);
      }
    },
    (errs) => {
      // Send people to the step that has the problem.
      if (errs.photo) go(0);
      else if (errs.description || errs.category) go(1);
    }
  );

  const last = step === STEPS.length - 1;

  return (
    <Page title={copy.title}>
      <h1 className="text-3xl font-bold text-ink sm:text-4xl">{copy.title}</h1>
      <p className="mb-8 mt-1.5 text-muted">{copy.lead}</p>
      <StepProgress steps={STEPS} current={step} />

      <form onSubmit={submit} noValidate>
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -28 }}
            transition={{ duration: DUR.ui, ease: EASE }}
          >
            {step === 0 && (
              <Controller
                name="photo"
                control={control}
                render={({ field }) => <PhotoUploader value={field.value} onChange={field.onChange} required={isFound} error={errors.photo?.message} />}
              />
            )}
            {step === 1 && (
              <div className="rounded-3xl border border-line/80 bg-white p-5 shadow-soft sm:p-6">
                {noPhotoLost && (
                  <p className="mb-5 rounded-xl bg-ember/15 px-4 py-3 text-sm font-medium text-ink">
                    No photo, no problem. Tell us the category and describe it well so we can match it by description.
                  </p>
                )}
                <DetailsFields register={register} errors={errors} descriptionLength={description.trim().length} noPhotoLost={noPhotoLost} />
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6 rounded-3xl border border-line/80 bg-white p-5 shadow-soft sm:p-6">
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => <LocationPicker value={field.value} onChange={field.onChange} error={errors.location?.label?.message || errors.location?.message} />}
                />
                <Controller
                  name="dateTime"
                  control={control}
                  render={({ field }) => (
                    <Field label={isFound ? "When did you find it?" : "When did you lose it?"} error={errors.dateTime?.message}>
                      <Input
                        type="datetime-local"
                        max={toLocalInputValue(new Date())}
                        value={toLocalInputValue(field.value)}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </Field>
                  )}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur sm:static sm:z-auto sm:mt-8 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <div className="mx-auto flex max-w-[720px] gap-3">
            {step > 0 && (
              <Button variant="outline" icon={ArrowLeft} onClick={() => go(step - 1)} disabled={submitting}>
                Back
              </Button>
            )}
            {last ? (
              <Button type="submit" className="flex-1" icon={Send} loading={submitting}>
                {copy.submit}
              </Button>
            ) : (
              <Button className="flex-1" iconEnd={ArrowRight} onClick={next}>
                {step === 0 && !isFound && !photo ? "Skip photo and continue" : "Continue"}
              </Button>
            )}
          </div>
        </div>
        <div className="h-20 sm:hidden" aria-hidden="true" />
      </form>
    </Page>
  );
}
