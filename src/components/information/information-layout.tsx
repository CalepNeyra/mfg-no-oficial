import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function InformationHeading({ title, description, icon: Icon }: { title: string; description?: string; icon: LucideIcon }) {
  return <header className="info-heading">
    <div className="shell">
      <div><h1>{title}</h1>{description && <p>{description}</p>}</div>
      <Icon size={42} strokeWidth={1.35} aria-hidden="true" />
    </div>
  </header>;
}

export function InformationLinks({ children }: { children: ReactNode }) {
  return <div className="info-actions">{children}</div>;
}
