/**
 * Shape of the data collected from the applicant.
 * Field order matches the columns expected in the Google Sheet
 * (Timestamp is generated server-side by Apps Script, not sent from the client).
 */
export interface ApplicationFormData {
  firstName: string;
  lastName: string;
  studentId: string;
  email: string;
  phone: string;
}

/** Per-field validation error messages, keyed by field name. */
export type FormErrors = Partial<Record<keyof ApplicationFormData, string>>;

/** Lifecycle states for the submission flow, driving loading/success/error UI. */
export type SubmissionStatus = "idle" | "submitting" | "success" | "error";

/** Normalized response returned by the submitApplication() API helper. */
export interface SubmitApplicationResult {
  success: boolean;
  message: string;
}
