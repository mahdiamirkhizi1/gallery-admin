import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";
import "./confirm-modal.css";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "warning" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmModal({ open, title, description, confirmLabel, tone = "warning", loading = false, onConfirm, onClose }: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape" && !loading) onClose(); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open, loading, onClose]);
  if (!open) return null;
  return <div className="confirm-backdrop" role="presentation" onMouseDown={() => !loading && onClose()}>
    <section className={`confirm-modal confirm-modal--${tone}`} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description" onMouseDown={(event) => event.stopPropagation()}>
      <button className="confirm-modal__close" type="button" onClick={onClose} disabled={loading} aria-label="بستن"><X /></button>
      <i className="confirm-modal__icon"><AlertTriangle /></i>
      <div className="confirm-modal__copy"><h3 id="confirm-title">{title}</h3><p id="confirm-description">{description}</p></div>
      <footer><button type="button" className="button button--secondary" onClick={onClose} disabled={loading}>انصراف</button><button type="button" className="button confirm-modal__confirm" onClick={onConfirm} disabled={loading}>{loading ? "در حال انجام..." : confirmLabel}</button></footer>
    </section>
  </div>;
}
