"use client";

import { FormEvent, useState } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Modal from "./ui/Modal";
import Alert from "./ui/Alert";
import { submitApplication } from "@/lib/api";
import { validateField, validateForm, isFormValid } from "@/lib/validation";
import { ApplicationFormData, FormErrors, SubmissionStatus } from "@/lib/types";

const INITIAL_DATA: ApplicationFormData = {
  firstName: "",
  lastName: "",
  studentId: "",
  academicYear: "",
  email: "",
  phone: "",
};

const FIELD_CONFIG: {
  name: keyof ApplicationFormData;
  label: string;
  placeholder: string;
  type: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
}[] = [
  { name: "firstName", label: "First Name", placeholder: "Alex", type: "text" },
  { name: "lastName", label: "Last Name", placeholder: "Rivera", type: "text" },
  {
    name: "studentId",
    label: "Student ID",
    placeholder: "202312345",
    type: "text",
    inputMode: "numeric",
  },
  {
    name: "email",
    label: "Email (bumail.net)",
    placeholder: "alex.rivera@bumail.net",
    type: "email",
    inputMode: "email",
  },
  {
    name: "phone",
    label: "Phone Number",
    placeholder: "0812345678",
    type: "tel",
    inputMode: "tel",
  },
];

export default function ApplicationForm() {
  const [formData, setFormData] = useState<ApplicationFormData>(INITIAL_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (field: keyof ApplicationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear the error for this field as soon as the user edits it.
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof ApplicationFormData) => {
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (!isFormValid(validationErrors)) {
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    const result = await submitApplication(formData);

    if (result.success) {
      setStatus("success");
      setShowSuccessModal(true);
      setFormData(INITIAL_DATA);
      setErrors({});
    } else {
      setStatus("error");
      setErrorMessage(result.message);
    }
  };

  const isSubmitting = status === "submitting";

  return (
    <section id="apply" className="relative bg-canvas px-6 py-24 md:py-32">
      <div className="mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-smoke">
            Applications Open
          </p>
          <h2 className="font-display text-4xl uppercase text-ink md:text-5xl">
            สมัครเทคนิค
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-smoke md:text-base">
            Tell us who you are. It only takes a minute, and every field
            below is required.
          </p>
        </div>

        {/* Glassmorphism card */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-[2rem] border border-line bg-white/10 backdrop-blur-xl p-6 shadow-card sm:p-10"
        >
          <div className="mb-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 shadow-sm shadow-slate-950/30">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-smoke">ส่งใบสมัคร</p>
                <h3 className="mt-3 text-3xl font-display text-ink">กรอกข้อมูล แล้วส่งให้ทีม TECHNIC</h3>
              </div>
              <div className="inline-flex items-center gap-3 rounded-3xl border border-reel/30 bg-reel/10 px-4 py-3 text-sm font-medium text-reel">
                <span>✔</span>
                ข้อมูลปลอดภัย &amp; เร็ว
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-smoke">
              ข้อมูลจะส่งตรงถึงทีมงาน TECHNIC BUDC และเราจะติดต่อกลับตามอีเมลของคุณ.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {FIELD_CONFIG.map((field) => (
              <Input
                key={field.name}
                name={field.name}
                label={field.label}
                placeholder={field.placeholder}
                type={field.type}
                inputMode={field.inputMode}
                value={formData[field.name]}
                error={errors[field.name]}
                disabled={isSubmitting}
                onChange={(e) => handleChange(field.name, e.target.value)}
                onBlur={() => handleBlur(field.name)}
                autoComplete="off"
              />
            ))}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="academicYear"
                className="text-xs font-semibold uppercase tracking-wider text-smoke"
              >
                ชั้นปี <span className="text-reel">*</span>
              </label>
              <select
                id="academicYear"
                name="academicYear"
                value={formData.academicYear}
                onChange={(e) => handleChange("academicYear", e.target.value)}
                onBlur={() => handleBlur("academicYear")}
                disabled={isSubmitting}
                aria-invalid={!!errors.academicYear}
                aria-describedby={errors.academicYear ? "academicYear-error" : undefined}
                className={`w-full rounded-xl border bg-white/10 backdrop-blur-sm px-4 py-3.5 text-ink transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-reel focus:border-reel ${errors.academicYear ? "border-red-500" : "border-line"}`}
              >
                <option value="">เลือกชั้นปี</option>
                <option value="ปี 1">ปี 1</option>
                <option value="ปี 2">ปี 2</option>
                <option value="ปี 3">ปี 3</option>
                <option value="ปี 4">ปี 4</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
              {errors.academicYear && (
                <p id="academicYear-error" className="text-xs font-medium text-red-500">
                  {errors.academicYear}
                </p>
              )}
            </div>
          </div>

          {status === "error" && (
            <div className="mt-6">
              <Alert message={errorMessage} onDismiss={() => setStatus("idle")} />
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="mt-8 w-full"
          >
            ส่งใบสมัคร
          </Button>
        </form>
      </div>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Application Sent"
      >
        Thanks for applying — we&apos;ve received your details and our team
        will be in touch soon.
      </Modal>
    </section>
  );
}
