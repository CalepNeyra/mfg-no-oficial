import {
  CalendarDays, CarFront, ClipboardList, Flag, Gauge, Info, ListOrdered, Mail, MessageCircleQuestion, Route,
  Newspaper, ScrollText, Trophy, UsersRound,
} from "lucide-react";

export const divisions = {
  "super-series": { media: "super", icon: Trophy },
  "freshman-series": { media: "freshman", icon: Gauge },
} as const;

export const divisionSlugs = ["super-series", "freshman-series"] as const;

export const sections = {
  drivers: { icon: UsersRound },
  circuits: { icon: Route },
  cars: { icon: CarFront },
  calendar: { icon: CalendarDays },
  standings: { icon: ListOrdered },
  results: { icon: Flag },
  "entry-list": { icon: ClipboardList },
  regulations: { icon: ScrollText },
  news: { icon: Newspaper },
} as const;

export const mainSections = ["calendar", "standings", "results", "news"] as const;
export const informationMenu = [
  { href: "/about", label: "front.aboutTitle", icon: Info },
  { href: "/drivers", label: "sections.drivers.title", icon: UsersRound },
  { href: "/circuits", label: "information.circuits", icon: Route },
  { href: "/regulations", label: "sections.regulations.title", icon: ScrollText },
  { href: "/faq", label: "front.info.faq.title", icon: MessageCircleQuestion },
  { href: "/contact", label: "front.info.contact.title", icon: Mail },
] as const;
