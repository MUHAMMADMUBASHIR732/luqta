export const GENERIC_ERROR = "Something went wrong. Please try again.";

/** Text that is safe to show to people. Never render raw error objects. */
export const messageOf = (error) => error?.userMessage || GENERIC_ERROR;

/** True when the backend says the item or claim is not theirs (or does not exist). */
export const isAccessError = (error) =>
  error?.userMessage === "You don't have access to that." || error?.userMessage === "We couldn't find that.";
