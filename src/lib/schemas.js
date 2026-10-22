import { z } from "zod";

// Same list the backend uses in its vision and text prompts.
export const CATEGORIES = [
  "bag", "backpack", "laptop", "phone", "wallet", "keys",
  "id_card", "bottle", "clothing", "umbrella", "earphones", "other",
];

export const CATEGORY_LABELS = {
  bag: "Bag",
  backpack: "Backpack",
  laptop: "Laptop",
  phone: "Phone",
  wallet: "Wallet",
  keys: "Keys",
  id_card: "ID card",
  bottle: "Bottle",
  clothing: "Clothing",
  umbrella: "Umbrella",
  earphones: "Earphones",
  other: "Other",
};

export const categoryLabel = (category) => CATEGORY_LABELS[category] || "Item";

// Empty form values are sent as undefined, never as "".
export const emptyToUndefined = (value) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }
  return value ?? undefined;
};

export const MIN_LOST_DESCRIPTION = 20;

const common = {
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    label: z.string().trim().min(1, "Tell us where it happened"),
  }),
  dateTime: z.date({ message: "Choose when it happened" }),
  description: z.string().trim().min(1, "Add a short description"),
  category: z.enum(CATEGORIES).optional(), // an empty select must map to undefined
  color: z.string().trim().optional(),
  brand: z.string().trim().optional(),
};

// FOUND: photo is required.
export const foundSchema = z.object({
  ...common,
  photo: z.instanceof(File, { message: "Add a photo of the item you found" }),
});

// LOST: photo is optional. Without one, category and a fuller description are required.
export const lostSchema = z
  .object({
    ...common,
    photo: z.instanceof(File).nullish(),
  })
  .superRefine((v, ctx) => {
    if (v.photo) return;
    if (!v.category) {
      ctx.addIssue({ code: "custom", path: ["category"], message: "Choose a category" });
    }
    if (v.description.length < MIN_LOST_DESCRIPTION) {
      ctx.addIssue({
        code: "custom",
        path: ["description"],
        message: `No photo? Describe the item in at least ${MIN_LOST_DESCRIPTION} characters (color, brand, marks)`,
      });
    }
  });

// Same rule as the superRefine above, usable per wizard step before the whole form is valid.
export function lostDetailsIssues({ photo, category, description }) {
  const issues = {};
  if (photo) return issues;
  if (!category) issues.category = "Choose a category";
  if ((description || "").trim().length < MIN_LOST_DESCRIPTION) {
    issues.description = `No photo? Describe the item in at least ${MIN_LOST_DESCRIPTION} characters (color, brand, marks)`;
  }
  return issues;
}

// ---------- password rules for creating an account (sign-in does not enforce these) ----------
export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  { id: "letter", label: "A letter", test: (v) => /[A-Za-z]/.test(v) },
  { id: "number", label: "A number", test: (v) => /\d/.test(v) },
  { id: "special", label: "A special character (like ! @ # $ %)", test: (v) => /[^A-Za-z0-9\s]/.test(v) },
];

export const passwordProblems = (value = "") => PASSWORD_RULES.filter((r) => !r.test(value));