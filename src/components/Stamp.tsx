// Carimbo de passaporte: marca as cidades e as etapas concluídas.

type StampState = "done" | "current" | "open" | "locked";

const STYLES: Record<StampState, string> = {
  done: "border-ok text-ok bg-ok-soft",
  current: "border-transparent bg-sun-500 text-ink shadow-[0_0_0_6px_var(--color-sun-100)]",
  open: "border-brand-300 text-brand-500 bg-white",
  locked: "border-[#cdc3b2] text-[#8a8270] bg-sand",
};

export function Stamp({
  code,
  state = "open",
  size = 48,
  tilt = true,
  className = "",
}: {
  code: string;
  state?: StampState;
  size?: number;
  tilt?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`stamp shrink-0 ${STYLES[state]} ${state === "current" ? "border-solid" : ""} ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(11, Math.round(size * 0.3)),
        transform: tilt && state === "done" ? "rotate(-10deg)" : undefined,
      }}
      aria-hidden="true"
    >
      {code}
    </span>
  );
}
