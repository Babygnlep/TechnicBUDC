import { ApplicationFormData, SubmitApplicationResult } from "./types";

export async function submitApplication(
  data: ApplicationFormData
): Promise<SubmitApplicationResult> {
  try {
    const response = await fetch("/api/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        studentId: data.studentId.trim(),
        academicYear: data.academicYear.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
      }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const message = result?.message ?? `Server error ${response.status}`;
      throw new Error(message);
    }

    if (!result?.success) {
      throw new Error(result.message ?? "Unable to submit application.");
    }

    return {
      success: true,
      message: "Application submitted successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to submit application.",
    };
  }
}