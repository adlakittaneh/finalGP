import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState, type KeyboardEvent, type FC } from "react";

interface OTPDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: (code: string) => void;
  email?: string;
}

const OTPDialog: FC<OTPDialogProps> = ({ open, onClose, onConfirm, email }) => {
  const { t } = useTranslation();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (open) {
      setDigits(Array(6).fill(""));
      setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 0);
    }
  }, [open]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) {
      return;
    }
    const nextValue = value.slice(-1);
    setDigits((prev) => {
      const updated = [...prev];
      updated[index] = nextValue;
      return updated;
    });

    if (nextValue && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace") {
      if (digits[index]) {
        setDigits((prev) => {
          const updated = [...prev];
          updated[index] = "";
          return updated;
        });
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const isComplete = digits.every((digit) => digit !== "");
  const currentCode = digits.join("");

  const handleConfirm = () => {
    if (!isComplete) {
      return;
    }
    onConfirm?.(currentCode);
  };

  return (
    <Dialog open={open} onOpenChange={(state) => !state && onClose()}>
      <DialogContent className="max-w-sm w-full rounded-[32px] border border-white/60 bg-white/90 backdrop-blur-3xl text-center shadow-[0_25px_55px_rgba(15,23,42,0.35)]">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-semibold text-slate-900">
            {t("login.otpTitle")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {email
              ? t("login.otpSubtitleWithEmail", { email })
              : t("login.otpSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 flex justify-center gap-3">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              maxLength={1}
              inputMode="numeric"
              autoComplete="one-time-code"
              value={digit}
              onChange={(event) => handleChange(event.target.value, index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className="h-14 w-12 rounded-2xl border border-slate-300 bg-white/80 text-center text-2xl font-semibold text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          ))}
        </div>

        <DialogFooter className="flex flex-col gap-3 pt-5 sm:flex-row sm:justify-center">
          <Button variant="outline" className="w-full sm:w-auto" onClick={onClose}>
            {t("login.otpCancel")}
          </Button>
          <Button className="w-full sm:w-auto" disabled={!isComplete} onClick={handleConfirm}>
            {t("login.otpConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OTPDialog;

