import { CATEGORIES, CATEGORY_LABELS, MIN_LOST_DESCRIPTION, emptyToUndefined } from "../lib/schemas.js";
import Field, { Input, Select, Textarea } from "./Field.jsx";

/**
 * Category, color, brand and description for both report forms.
 * Empty values become undefined, never "". Pass react-hook-form's `register` and `errors`.
 */
export default function DetailsFields({ register, errors = {}, descriptionLength = 0, noPhotoLost = false }) {
  return (
    <div className="space-y-5">
      <Field
        label={noPhotoLost ? "Category (needed without a photo)" : "Category"}
        optional={!noPhotoLost}
        error={errors.category?.message}
      >
        <Select {...register("category", { setValueAs: emptyToUndefined })}>
          <option value="">{noPhotoLost ? "Choose a category" : "Not sure"}</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Color" optional error={errors.color?.message}>
          <Input {...register("color", { setValueAs: emptyToUndefined })} placeholder="Black" autoComplete="off" />
        </Field>
        <Field label="Brand" optional error={errors.brand?.message}>
          <Input {...register("brand", { setValueAs: emptyToUndefined })} placeholder="Nike" autoComplete="off" />
        </Field>
      </div>

      <Field
        label="Description"
        error={errors.description?.message}
        hint={
          noPhotoLost
            ? `Mention color, brand, stickers, scratches, keychains. ${Math.min(descriptionLength, MIN_LOST_DESCRIPTION)}/${MIN_LOST_DESCRIPTION} characters minimum.`
            : "Mention color, brand, stickers, scratches, keychains."
        }
      >
        <Textarea {...register("description")} placeholder="Black backpack with a red keychain on the zip…" />
      </Field>
    </div>
  );
}
