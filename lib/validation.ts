import { ApplicationFormData, FormErrors } from "./types";

// bumail.net-specific email pattern
const BUMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@bumail\.net$/;

// Phone: digits only, optionally with +, spaces, dashes, or parentheses stripped first
const PHONE_DIGITS_REGEX = /^[0-9]{9,15}$/;

// Student ID: numbers only
const STUDENT_ID_REGEX = /^[0-9]+$/;

/**
 * Validates a single field and returns an error message, or undefined if valid.
 * Kept separate per-field so the form can validate on blur as well as on submit.
 */
export function validateField(
  field: keyof ApplicationFormData,
  value: string
): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return "This field is required.";
  }

  switch (field) {
    case "firstName":
    case "lastName":
      if (trimmed.length < 2) {
        return "Must be at least 2 characters.";
      }
      return undefined;

    case "studentId":
      if (!STUDENT_ID_REGEX.test(trimmed)) {
        return "Student ID must contain numbers only.";
      }
      return undefined;

    case "email":
      if (!BUMAIL_REGEX.test(trimmed)) {
        return "Please enter a valid bumail.net address (e.g. name@bumail.net).";
      }
      return undefined;

    case "phone": {
      const digitsOnly = trimmed.replace(/[\s\-()+]/g, "");
      if (!PHONE_DIGITS_REGEX.test(digitsOnly)) {
        return "Enter a valid phone number (digits only, 9-15 digits).";
      }
      return undefined;
    }

    default:
      return undefined;
  }
}

/** Validates the full form object and returns a map of field -> error message. */
export function validateForm(data: ApplicationFormData): FormErrors {
  const errors: FormErrors = {};

  (Object.keys(data) as (keyof ApplicationFormData)[]).forEach((field) => {
    const error = validateField(field, data[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
}

/** True if the error map has no entries. */
export function isFormValid(errors: FormErrors): boolean {
  return Object.keys(errors).length === 0;
}
