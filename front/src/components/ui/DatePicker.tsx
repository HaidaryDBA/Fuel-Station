import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import jalaali from "jalaali-js";

export interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}

interface JalaaliDate {
  jy: number;
  jm: number;
  jd: number;
}

const PERSIAN_MONTHS = [
  "حمل",      // Hamal (Aries) - March/April
  "ثور",      // Sawr (Taurus) - April/May
  "جوزا",     // Jawza (Gemini) - May/June
  "سرطان",    // Saratan (Cancer) - June/July
  "اسد",      // Asad (Leo) - July/August
  "سنبله",    // Sonbola (Virgo) - August/September
  "میزان",    // Mizan (Libra) - September/October
  "عقرب",     // Aqrab (Scorpio) - October/November
  "قوس",      // Qaws (Sagittarius) - November/December
  "جدی",      // Jadi (Capricorn) - December/January
  "دلو",      // Dalw (Aquarius) - January/February
  "حوت",      // Hoot (Pisces) - February/March
];

const PERSIAN_DAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

function toJalaali(date: Date): JalaaliDate {
  return jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function getDaysInMonth(jy: number, jm: number): number {
  return jalaali.jalaaliMonthLength(jy, jm);
}

function getFirstDayOfMonth(jy: number, jm: number): number {
  const g = jalaali.toGregorian(jy, jm, 1);
  const date = new Date(g.gy, g.gm - 1, g.gd);
  // Convert Sunday-based (0-6) to Saturday-based (0-6)
  return (date.getDay() + 1) % 7;
}

function formatJalaaliDate(jy: number, jm: number, jd: number): string {
  const padded = (n: number) => n.toString().padStart(2, "0");
  return `${jy}/${padded(jm)}/${padded(jd)}`;
}

function parseJalaaliDate(dateStr: string): JalaaliDate | null {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  const jy = parseInt(parts[0], 10);
  const jm = parseInt(parts[1], 10);
  const jd = parseInt(parts[2], 10);
  if (isNaN(jy) || isNaN(jm) || isNaN(jd)) return null;
  return { jy, jm, jd };
}

export default function DatePicker({
  value,
  onChange,
  label,
  error,
  placeholder = "Select date",
  disabled = false,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState<JalaaliDate>(() => {
    if (value) {
      const parsed = parseJalaaliDate(value);
      if (parsed) return parsed;
    }
    return toJalaali(new Date());
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    setViewDate((prev) => {
      if (prev.jm === 1) {
        return { jy: prev.jy - 1, jm: 12, jd: 1 };
      }
      return { ...prev, jm: prev.jm - 1 };
    });
  };

  const handleNextMonth = () => {
    setViewDate((prev) => {
      if (prev.jm === 12) {
        return { jy: prev.jy + 1, jm: 1, jd: 1 };
      }
      return { ...prev, jm: prev.jm + 1 };
    });
  };

  const handleSelectDay = (day: number) => {
    const dateStr = formatJalaaliDate(viewDate.jy, viewDate.jm, day);
    onChange?.(dateStr);
    setIsOpen(false);
  };

  const isDateDisabled = (day: number): boolean => {
    const dateStr = formatJalaaliDate(viewDate.jy, viewDate.jm, day);
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const isSelectedDay = (day: number): boolean => {
    if (!value) return false;
    const parsed = parseJalaaliDate(value);
    if (!parsed) return false;
    return parsed.jy === viewDate.jy && parsed.jm === viewDate.jm && parsed.jd === day;
  };

  const isToday = (day: number): boolean => {
    const today = toJalaali(new Date());
    return today.jy === viewDate.jy && today.jm === viewDate.jm && today.jd === day;
  };

  const daysInMonth = getDaysInMonth(viewDate.jy, viewDate.jm);
  const firstDay = getFirstDayOfMonth(viewDate.jy, viewDate.jm);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex w-full items-center justify-between rounded-lg border bg-background px-4 py-2.5 text-sm
          transition-all duration-200
          ${error ? "border-error" : "border-border"}
          ${disabled ? "cursor-not-allowed opacity-50" : "hover:border-primary"}
          ${isOpen ? "border-primary ring-2 ring-primary/20" : ""}
        `}
      >
        <span className={value ? "text-text-primary" : "text-muted"}>
          {value || placeholder}
        </span>
        <Calendar className="h-4 w-4 text-muted" />
      </button>

      {error && <p className="mt-1.5 text-sm text-error">{error}</p>}

      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 rounded-xl border border-border bg-card p-4 shadow-lg">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-surface-hover"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="text-center">
              <span className="text-sm font-semibold text-text-primary">
                {PERSIAN_MONTHS[viewDate.jm - 1]} {viewDate.jy}
              </span>
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-surface-hover"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {PERSIAN_DAYS.map((day) => (
              <div
                key={day}
                className="py-1 text-center text-xs font-medium text-text-secondary"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              const isDisabled = isDateDisabled(day);
              const selected = isSelectedDay(day);
              const today = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(day)}
                  className={`
                    h-8 w-8 rounded-lg text-sm font-medium transition-all duration-200
                    ${selected ? "bg-primary text-white" : ""}
                    ${today && !selected ? "border border-primary text-primary" : ""}
                    ${!selected && !today ? "text-text-primary hover:bg-surface-hover" : ""}
                    ${isDisabled ? "cursor-not-allowed text-muted opacity-50" : ""}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Today Button */}
          <div className="mt-3 border-t border-border pt-3">
            <button
              type="button"
              onClick={() => {
                const today = toJalaali(new Date());
                setViewDate(today);
                handleSelectDay(today.jd);
              }}
              className="w-full rounded-lg bg-surface py-2 text-sm font-medium text-primary transition-colors hover:bg-surface-hover"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
