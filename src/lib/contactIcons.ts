import {
  Award, BadgeCheck, BriefcaseBusiness, Building2, CalendarCheck, CheckCircle2,
  Clock3, Gem, Globe2, Handshake, Headphones, HeartHandshake, Mail, MapPin,
  Megaphone, MessageCircle, PhoneCall, ShieldCheck, Sparkles, TrendingUp, Users,
  type LucideIcon,
} from "lucide-react";

export const CONTACT_ICON_OPTIONS = [
  "PhoneCall", "Users", "BadgeCheck", "ShieldCheck", "HeartHandshake", "Sparkles",
  "Building2", "Headphones", "Megaphone", "Mail", "MapPin", "Clock3",
  "BriefcaseBusiness", "Award", "Gem", "Handshake", "CheckCircle2", "MessageCircle",
  "Globe2", "TrendingUp", "CalendarCheck",
] as const;

const contactIcons: Record<string, LucideIcon> = {
  Award, BadgeCheck, BriefcaseBusiness, Building2, CalendarCheck, CheckCircle2,
  Clock3, Gem, Globe2, Handshake, Headphones, HeartHandshake, Mail, MapPin,
  Megaphone, MessageCircle, PhoneCall, ShieldCheck, Sparkles, TrendingUp, Users,
};

export function getContactIcon(name: string): LucideIcon {
  return contactIcons[name] || CheckCircle2;
}
