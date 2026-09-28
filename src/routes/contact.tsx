import { createFileRoute } from "@tanstack/react-router";
import { BriefcaseBusiness, Mail, Phone } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { SocialProfiles } from "@/components/SocialLinks";
import { useSiteContent } from "@/hooks/useSiteContent";
import { DEFAULT_SHARE_IMAGE, SITE_URL } from "@/lib/seo";
import contactBackground from "@/assets/hassan-mageye-coming-soon.avif";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Hassan Mageye | Film Projects & Collaborations" },
      {
        name: "description",
        content:
          "Get in touch with Hassan Mageye to plan a film, brand video, event coverage or documentary.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Contact Hassan Mageye | Film Projects & Collaborations" },
      {
        property: "og:description",
        content: "Have a story to tell? Let’s create something that matters.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/contact` },
      { property: "og:image", content: DEFAULT_SHARE_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: DEFAULT_SHARE_IMAGE },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/contact` }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { content } = useSiteContent();
  const c = content.contact;
  const phone = c.phone || "+256 782 673592";
  const details = [
    { icon: Phone, label: "Phone", value: phone, href: `tel:${phone.replace(/\s/g, "")}` },
    { icon: Mail, label: "Email", value: c.email, href: `mailto:${c.email}` },
  ];

  return (
    <main>
      <SiteHeader />

      <section
        className="contact-section"
        id="contact"
        style={{ "--contact-bg": `url(${contactBackground})` } as React.CSSProperties}
      >
        <BriefcaseBusiness size={28} strokeWidth={1.3} aria-hidden="true" />
        <p className="eyebrow">{c.eyebrow}</p>
        <h1>{c.title}</h1>
        <a className="button button-light-on-dark" href={`mailto:${c.email}`}>Send an email</a>
      </section>

      <section className="contact-details-section" aria-labelledby="contact-details-title">
        <p className="eyebrow">Get in touch</p>
        <h2 id="contact-details-title">Contact details</h2>
        <div className="contact-details-grid">
          {details.map(({ icon: Icon, label, value, href }) => (
            <article className="contact-card" key={label}>
              <div className="contact-card-icon">
                <Icon size={24} strokeWidth={1.3} aria-hidden="true" />
              </div>
              <div className="contact-card-body">
                <span className="contact-card-label">{label}</span>
                {href ? <a href={href}>{value}</a> : <span>{value}</span>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <SocialProfiles />

      <SiteFooter />
    </main>
  );
}
