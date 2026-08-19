import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const monthNames = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const fa = (value: number) => new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(value);
const formatter = new Intl.DateTimeFormat("en-US-u-ca-persian", { year: "numeric", month: "numeric", day: "numeric" });
const displayFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

type JalaliDate = { year: number; month: number; day: number };

function jalaliParts(date: Date): JalaliDate {
  const parts = formatter.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { year: read("year"), month: read("month"), day: read("day") };
}

function toGregorianIso(year: number, month: number, day: number, hour: number, minute: number) {
  const cursor = new Date(Date.UTC(year + 621, 1, 15));
  for (let index = 0; index < 430; index += 1) {
    const value = new Date(cursor.getTime() + index * 86400000);
    const part = jalaliParts(value);
    if (part.year === year && part.month === month && part.day === day) {
      return new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate(), hour, minute).toISOString();
    }
  }
  return "";
}

function monthLength(year: number, month: number) {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return toGregorianIso(year, 12, 30, 0, 0) ? 30 : 29;
}

function firstDayOffset(year: number, month: number) {
  const iso = toGregorianIso(year, month, 1, 0, 0);
  return iso ? (new Date(iso).getDay() + 1) % 7 : 0;
}

export function PersianDateTimeInput({ value, onChange, ariaLabel }: { value: string; onChange: (value: string) => void; ariaLabel: string }) {
  const root = useRef<HTMLDivElement>(null);
  const selectedDate = value ? new Date(value) : null;
  const initial = jalaliParts(selectedDate ?? new Date());
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ year: initial.year, month: initial.month });
  const [hour, setHour] = useState(selectedDate?.getHours() ?? 12);
  const [minute, setMinute] = useState(selectedDate?.getMinutes() ?? 0);
  const selected = selectedDate ? jalaliParts(selectedDate) : null;
  const today = jalaliParts(new Date());

  useEffect(() => {
    const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const cells = useMemo(() => {
    const offset = firstDayOffset(view.year, view.month);
    return [...Array.from({ length: offset }, () => null), ...Array.from({ length: monthLength(view.year, view.month) }, (_, index) => index + 1)];
  }, [view]);
  const moveMonth = (amount: number) => setView((current) => {
    const raw = current.month + amount;
    if (raw < 1) return { year: current.year - 1, month: 12 };
    if (raw > 12) return { year: current.year + 1, month: 1 };
    return { ...current, month: raw };
  });
  const chooseDay = (day: number) => onChange(toGregorianIso(view.year, view.month, day, hour, minute));
  const updateTime = (nextHour: number, nextMinute: number) => {
    setHour(nextHour); setMinute(nextMinute);
    if (selected) onChange(toGregorianIso(selected.year, selected.month, selected.day, nextHour, nextMinute));
  };
  const chooseToday = () => {
    const now = new Date(); const part = jalaliParts(now);
    setView({ year: part.year, month: part.month }); setHour(now.getHours()); setMinute(now.getMinutes());
    onChange(toGregorianIso(part.year, part.month, part.day, now.getHours(), now.getMinutes()));
  };

  return <div className="cp-calendar" ref={root}>
    <button type="button" className={`cp-calendar__trigger ${open ? "active" : ""}`} onClick={() => setOpen((current) => !current)} aria-label={ariaLabel} aria-expanded={open}>
      <CalendarDays /><span className={value ? "" : "placeholder"}>{value ? displayFormatter.format(new Date(value)) : "انتخاب تاریخ و ساعت"}</span><ChevronLeft />
    </button>
    {open && <div className="cp-calendar__popover">
      <header><button type="button" onClick={() => moveMonth(1)} aria-label="ماه بعد"><ChevronRight /></button><strong>{monthNames[view.month - 1]} <b>{fa(view.year)}</b></strong><button type="button" onClick={() => moveMonth(-1)} aria-label="ماه قبل"><ChevronLeft /></button></header>
      <div className="cp-calendar__week">{weekDays.map((day) => <span key={day}>{day}</span>)}</div>
      <div className="cp-calendar__days">{cells.map((day, index) => day === null ? <span key={`empty-${index}`} /> : <button type="button" key={day} onClick={() => chooseDay(day)} className={`${selected?.year === view.year && selected.month === view.month && selected.day === day ? "selected" : ""} ${today.year === view.year && today.month === view.month && today.day === day ? "today" : ""}`}>{fa(day)}</button>)}</div>
      <div className="cp-calendar__time"><Clock3 /><span>ساعت</span><select value={hour} onChange={(event) => updateTime(Number(event.target.value), minute)}>{Array.from({ length: 24 }, (_, index) => index).map((item) => <option value={item} key={item}>{fa(item).padStart(2, "۰")}</option>)}</select><b>:</b><select value={minute} onChange={(event) => updateTime(hour, Number(event.target.value))}>{[0, 15, 30, 45].map((item) => <option value={item} key={item}>{fa(item).padStart(2, "۰")}</option>)}</select></div>
      <footer><button type="button" className="cp-calendar__today" onClick={chooseToday}>امروز</button><button type="button" className="cp-calendar__confirm" disabled={!value} onClick={() => setOpen(false)}><Check /> تأیید تاریخ</button></footer>
    </div>}
  </div>;
}
