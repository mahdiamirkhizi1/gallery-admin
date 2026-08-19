import { ArrowLeft, ArrowRight, Check, Save, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ProductStepper } from "./components/ProductStepper";
import { ProductSummary } from "./components/ProductSummary";
import { StepBasicInfo } from "./components/StepBasicInfo";
import { StepDetails } from "./components/StepDetails";
import { StepInventory } from "./components/StepInventory";
import { StepPlans } from "./components/StepPlans";
import { StepReview } from "./components/StepReview";
import { ProductLabelPicker } from "../components/ProductLabelPicker";
import { useProductFormStore } from "./product-form.store";
import { createProduct } from "./product-form.api";
import { toast } from "@/stores/toast.store";
import {
  validateProductDraft,
  type ProductFieldErrors,
} from "../product-validation";

export function CreateProductPage() {
  const navigate = useNavigate();
  const { step, draft, setStep, patch, reset } = useProductFormStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ProductFieldErrors>({});
  const validate = () => {
    const errors = validateProductDraft(draft);
    setFieldErrors(errors);
    return errors;
  };
  const firstErrorStep = (errors: ProductFieldErrors) =>
    errors.title
      ? 1
      : errors.carat || errors.subTypeId
        ? 2
        : Object.keys(errors).some((key) => key.startsWith("variants."))
          ? 3
          : step;
  const next = () => {
    setError("");
    const errors = validate();
    const relevant =
      step === 1
        ? errors.title
        : step === 2
          ? errors.carat || errors.subTypeId
          : step === 3
            ? Object.keys(errors).some((key) => key.startsWith("variants."))
            : false;
    if (relevant) return;
    setStep(Math.min(5, step + 1));
  };
  const submit = async (status: "DRAFT" | "PUBLISHED" = "PUBLISHED") => {
    setError("");
    const errors = validate();
    if (Object.keys(errors).length) {
      setStep(firstErrorStep(errors));
      setError("لطفاً خطاهای مشخص‌شده در فرم را اصلاح کنید.");
      return;
    }
    setSubmitting(true);
    try {
      await createProduct(draft, status);
      toast.success(status === "DRAFT" ? "پیش‌نویس ذخیره شد" : "محصول ایجاد شد", status === "DRAFT" ? "محصول در فهرست پیش‌نویس‌ها قرار گرفت." : `محصول «${draft.title}» با موفقیت منتشر شد.`);
      reset();
      navigate("/products", { replace: true });
    } catch (reason) {
      const message = axios.isAxiosError(reason)
        ? reason.response?.data?.message
        : undefined;
      setError(
        message ||
          "ثبت محصول ناموفق بود. اطلاعات فرم و اتصال بک‌اند را بررسی کنید.",
      );
      toast.error("ثبت محصول ناموفق بود", message || "اطلاعات فرم و اتصال به سرور را بررسی کنید.");
    } finally {
      setSubmitting(false);
    }
  };
  const content = [
    <><StepBasicInfo draft={draft} patch={patch} errors={fieldErrors} /><ProductLabelPicker selected={draft.labelIds} onChange={(labelIds) => patch({ labelIds })} metal={draft.metal} category={draft.category} /></>,
    <StepDetails draft={draft} patch={patch} errors={fieldErrors} />,
    <StepInventory draft={draft} patch={patch} errors={fieldErrors} />,
    <StepPlans draft={draft} patch={patch} />,
    <StepReview draft={draft} />,
  ][step - 1];
  return (
    <div className="create-product-page">
      <div className="create-header">
        <div>
          <div className="breadcrumb">
            <Link to="/products">محصولات</Link>
            <span>‹</span>
            <span>افزودن محصول</span>
          </div>
          <h2>افزودن محصول جدید</h2>
          <p>اطلاعات و شرایط فروش محصول را تکمیل کنید.</p>
        </div>
        <div className="create-header__actions">
          <button
            className="button button--secondary"
            onClick={() => navigate("/products")}
          >
            <X />
            انصراف
          </button>
          <button
            className="button button--secondary"
            onClick={() => submit("DRAFT")}
            disabled={submitting}
          >
            <Save />
            ذخیره پیش‌نویس
          </button>
          {step === 5 && (
            <button
              className="button button--primary"
              onClick={() => submit("PUBLISHED")}
              disabled={submitting}
            >
              <Check />
              {submitting ? "در حال ذخیره..." : "ذخیره و انتشار"}
            </button>
          )}
        </div>
      </div>
      <ProductStepper step={step} onChange={setStep} />
      <div className="create-layout">
        <ProductSummary draft={draft} />
        <main className="create-form">
          {content}
          {error && <p className="wizard-error form-global-error">{error}</p>}
          <div className="wizard-actions">
            {step > 1 ? (
              <button
                className="button button--secondary"
                onClick={() => setStep(step - 1)}
              >
                <ArrowRight />
                مرحله قبل
              </button>
            ) : (
              <span />
            )}
            {step < 5 ? (
              <button className="button button--primary" onClick={next}>
                مرحله بعد
                <ArrowLeft />
              </button>
            ) : (
              <button
                className="button button--primary"
                onClick={() => submit("PUBLISHED")}
                disabled={submitting}
              >
                <Check />
                {submitting ? "در حال انتشار..." : "ذخیره و انتشار محصول"}
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
