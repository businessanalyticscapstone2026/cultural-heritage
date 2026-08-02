import { MapPin, Phone, Mail, Clock, Globe, MessageCircle } from "lucide-react"
import { SITE_CONTACT } from "@/lib/constants"

const socialIcons: Record<string, typeof Globe> = {
  Facebook: Globe,
  Instagram: MessageCircle,
}

export function FooterContact() {
  return (
    <div>
      <h3 className="text-display text-sm text-ink">Contact</h3>
      <ul className="mt-4 flex flex-col gap-3">
        <li>
          <a
            href={SITE_CONTACT.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2.5 text-sm text-ink-soft transition-colors hover:text-accent"
          >
            <MapPin size={15} className="mt-0.5 shrink-0 text-ink-soft/60" strokeWidth={1.5} />
            <span>{SITE_CONTACT.address}</span>
          </a>
        </li>
        <li>
          <a
            href={`tel:${SITE_CONTACT.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-2.5 text-sm text-ink-soft transition-colors hover:text-accent"
          >
            <Phone size={15} className="shrink-0 text-ink-soft/60" strokeWidth={1.5} />
            <span>{SITE_CONTACT.phone}</span>
          </a>
        </li>
        <li>
          <a
            href={`mailto:${SITE_CONTACT.email}`}
            className="flex items-center gap-2.5 text-sm text-ink-soft transition-colors hover:text-accent"
          >
            <Mail size={15} className="shrink-0 text-ink-soft/60" strokeWidth={1.5} />
            <span>{SITE_CONTACT.email}</span>
          </a>
        </li>
        <li className="flex items-center gap-2.5 text-sm text-ink-soft">
          <Clock size={15} className="shrink-0 text-ink-soft/60" strokeWidth={1.5} />
          <span>{SITE_CONTACT.officeHours}</span>
        </li>
      </ul>
      <div className="mt-5 flex gap-3">
        {SITE_CONTACT.socials.map((social) => {
          const Icon = socialIcons[social.label] ?? Globe
          return (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 text-ink-soft transition-all hover:border-accent hover:bg-accent/10 hover:text-accent"
            >
              <Icon size={15} strokeWidth={1.5} />
            </a>
          )
        })}
      </div>
    </div>
  )
}
