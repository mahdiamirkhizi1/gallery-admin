import { Gem, LockKeyhole, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "@/features/auth/auth.api";

export function LoginPage() {
  const navigate = useNavigate(); const [loading, setLoading] = useState(false); const [mobile, setMobile] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState("");
  const submit = async (event: FormEvent) => { event.preventDefault(); setLoading(true); setError(""); try { await loginAdmin(mobile, password); navigate("/"); } catch { setError("شماره موبایل، رمز عبور یا سطح دسترسی صحیح نیست."); } finally { setLoading(false); } };
  return <main className="login-page"><section className="login-card"><div className="login-brand"><span><Gem /></span><strong>GOLDINO</strong><p>ورود به پنل مدیریت</p></div><form onSubmit={submit}><label>شماره موبایل<div className="field"><UserRound /><input required inputMode="numeric" value={mobile} onChange={event => setMobile(event.target.value)} placeholder="09123456789" /></div></label><label>رمز عبور<div className="field"><LockKeyhole /><input required type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="رمز عبور" /></div></label>{error && <p className="form-error">{error}</p>}<button className="button button--primary button--block" disabled={loading}>{loading ? "در حال ورود..." : "ورود به پنل"}</button></form><small className="login-note">ورود فقط برای مدیران مجاز فروشگاه امکان‌پذیر است.</small></section></main>;
}
