import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const EMPTY = "__empty__";

// App-wide dropdown: replaces native <select> so choices open in a styled list on every device.
// `options` is a list of values, or of { value, label }.
export default function SelectField({ value, onChange, options, ariaLabel, className = "", style }) {
  return (
    <Select value={value === "" ? EMPTY : String(value)} onValueChange={(v) => onChange(v === EMPTY ? "" : v)}>
      <SelectTrigger aria-label={ariaLabel} className={`h-auto w-full min-w-0 gap-1 shadow-none ${className}`} style={style}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="z-[300] max-h-72">
        {options.map((o) => {
          const opt = typeof o === "object" ? o : { value: o, label: o };
          const v = opt.value === "" ? EMPTY : String(opt.value);
          return <SelectItem key={v} value={v} className="min-h-10">{opt.label}</SelectItem>;
        })}
      </SelectContent>
    </Select>
  );
}