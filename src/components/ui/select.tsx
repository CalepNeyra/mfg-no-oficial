"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import type { ComponentProps } from "react";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ children, ...props }: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger className="mfg-select-trigger" {...props}>
      {children}
      <SelectPrimitive.Icon asChild><ChevronDown size={17} aria-hidden="true" /></SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ children, ...props }: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content className="mfg-select-menu" position="popper" sideOffset={6}
        align="start" collisionPadding={12} {...props}>
        <SelectPrimitive.ScrollUpButton className="mfg-select-scroll">
          <ChevronUp size={16} aria-hidden="true" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="mfg-select-options">{children}</SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="mfg-select-scroll">
          <ChevronDown size={16} aria-hidden="true" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ children, description, ...props }: ComponentProps<typeof SelectPrimitive.Item> & {
  description?: string;
}) {
  return (
    <SelectPrimitive.Item className="mfg-select-option" {...props}>
      <div className="mfg-select-option-text">
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        {description && <span className="mfg-select-description">{description}</span>}
      </div>
      <SelectPrimitive.ItemIndicator asChild><Check size={17} aria-hidden="true" /></SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
