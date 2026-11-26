"use client";

import type { ComponentPropsWithRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export type MFGOption = {
  value: string;
  label: string;
  description?: string;
  group?: string;
  keywords?: readonly string[];
};

export type MFGSelectProps = Pick<ComponentPropsWithRef<"button">,
  "id" | "aria-invalid" | "aria-describedby" | "disabled" | "onBlur" | "ref"> & {
  value: string;
  options: readonly MFGOption[];
  placeholder: string;
  required?: boolean;
  onValueChange: (value: string) => void;
};

export function MFGSelect({ value, options, placeholder, required, disabled, onValueChange, ...trigger }: MFGSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled} required={required}>
      <SelectTrigger {...trigger}><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {options.map(({ value, label, description }) => (
          <SelectItem key={value} value={value} textValue={label} description={description}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
