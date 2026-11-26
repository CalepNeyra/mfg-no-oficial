"use client";

import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { Check, ChevronDown, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { MFGSelectProps } from "./mfg-select";

function normalize(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function MFGCombobox({
  value, options, placeholder, onValueChange, allowCustom = false, searchLabel, menuClassName, menuNote, ...trigger
}: MFGSelectProps & { allowCustom?: boolean; searchLabel?: string; menuClassName?: string; menuNote?: string }) {
  const { required, ...triggerProps } = trigger;
  const t = useTranslations("select");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const active = options.find((option) => option.value === value);
  const words = normalize(search).split(/\s+/);
  const visible = options.filter(({ label, description, keywords = [] }) => {
    const haystack = normalize([label, description, ...keywords].join(" "));
    return words.every((word) => haystack.includes(word));
  });
  const groups = new Map<string | undefined, typeof visible>();
  for (const option of visible) {
    const group = groups.get(option.group);
    if (group) group.push(option);
    else groups.set(option.group, [option]);
  }
  const searchText = searchLabel ?? t("search");
  const custom = search.trim();
  const offerCustom = allowCustom && custom && !visible.some(({ label }) => normalize(label) === normalize(custom));

  function changeOpen(next: boolean) {
    setOpen(next);
    setSearch(next && value && !active ? value : "");
  }

  function select(next: string) {
    onValueChange(next);
    changeOpen(false);
  }

  return (
    <Popover.Root open={open} onOpenChange={changeOpen}>
      <Popover.Trigger asChild>
        <button {...triggerProps} className="mfg-select-trigger" type="button"
          data-placeholder={!value || undefined} data-required={required || undefined}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              changeOpen(true);
            }
          }}>
          <span>{active?.label ?? (value || placeholder)}</span>
          <ChevronDown size={17} aria-hidden="true" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className={["mfg-select-menu mfg-combobox-menu", menuClassName].filter(Boolean).join(" ")}
          align="start" sideOffset={6} collisionPadding={12} aria-label={searchText}>
          <Command shouldFilter={false} label={searchText}>
            <div className="mfg-select-search" onChange={(event) => event.stopPropagation()}>
              <Search size={16} aria-hidden="true" />
              <Command.Input value={search} onValueChange={setSearch} placeholder={searchText} />
            </div>
            {menuNote && <p className="mfg-select-menu-note">{menuNote}</p>}
            <Command.List className="mfg-select-options">
              {Array.from(groups, ([group, entries]) => {
                const items = entries.map((option) => (
                  <Command.Item key={option.value} value={option.value} className="mfg-select-option"
                    data-checked={value === option.value} aria-current={value === option.value || undefined}
                    onSelect={() => select(option.value)}>
                    <span className="mfg-select-option-text">{option.label}
                      {option.description && <small className="mfg-select-description">{option.description}</small>}
                    </span>
                    {value === option.value && <Check size={17} aria-hidden="true" />}
                  </Command.Item>
                ));
                return group ? <Command.Group key={group} heading={group}>{items}</Command.Group> : items;
              })}
              {offerCustom && (
                <Command.Item value={custom} className="mfg-select-option" data-checked={value === custom}
                  onSelect={() => select(custom)}>
                  <span className="mfg-select-option-text">{t("useCustom", { value: custom })}</span>
                  {value === custom && <Check size={17} aria-hidden="true" />}
                </Command.Item>
              )}
              <Command.Empty className="mfg-select-empty">{t("noResults")}</Command.Empty>
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
