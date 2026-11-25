import { Download, Printer, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { MFGSelect, type MFGOption } from "../mfg-select";

export function StandingsSelect({ id, options, value, onChange, label }: {
  id: string; options: readonly MFGOption[]; value: string; onChange: (value: string) => void; label: string;
}) {
  return <div className="stand-filter">
    <label htmlFor={id}>{label}</label>
    <MFGSelect id={id} options={options} value={value} onValueChange={onChange} placeholder={label} />
  </div>;
}

export function DriverSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const t = useTranslations("championship");
  return <div className="stand-filter">
    <label htmlFor="stand-search">{t("search")}</label>
    <div className="stand-search"><Search size={16} aria-hidden="true" />
      <input id="stand-search" type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={t("searchHint")} />
    </div>
  </div>;
}

function escapeCsv(value: string) {
  const text = /^[=+\-@\t\r\n＝＋－＠]/u.test(value) ? "'" + value : value;
  return '"' + text.replaceAll('"', '""') + '"';
}

export function StandingsExports({ filename }: { filename: string }) {
  const t = useTranslations("championship");

  function downloadCsv() {
    const table = document.querySelector<HTMLTableElement>(".stand-tabpanel table[data-csv]");
    const rows = table?.rows ?? [];
    const contents = Array.from(rows, (row) => Array.from(row.cells, (cell) => escapeCsv(cell.innerText.trim().replace(/\s+/g, " "))).join(",")).join("\r\n");
    if (!contents) return;
    const url = URL.createObjectURL(new Blob(["\uFEFF", contents], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename + ".csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className="stand-export stand-no-print">
    <button type="button" onClick={downloadCsv}><Download size={16} aria-hidden="true" />{t("csv")}</button>
    <button type="button" onClick={() => window.print()}><Printer size={16} aria-hidden="true" />{t("pdf")}</button>
  </div>;
}
