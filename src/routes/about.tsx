import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { AWARD_RECOGNITION } from "@/lib/site-content";
import { DEFAULT_SHARE_IMAGE, SITE_URL } from "@/lib/seo";
import hassanImage from "@/assets/hassan-mageye.png";
import hassanDesktopImage from "@/assets/director-hero-2.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Hassan Mageye | Ugandan/American Film Director" },
      {
        name: "description",
        content:
          "Meet Hassan Mageye, a Ugandan/American writer, director and producer telling African stories and character-driven drama.",
      },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:title", content: "About Hassan Mageye | Ugandan/American Film Director" },
      {
        property: "og:description",
        content: "The story, the approach and the awards behind the films.",
      },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: `${SITE_URL}/about` },
      { property: "og:image", content: DEFAULT_SHARE_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: DEFAULT_SHARE_IMAGE },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main>
      <SiteHeader />

      <section className="about-section" id="about">
        <div className="about-image">
          <img className="about-img-desktop" src={hassanDesktopImage} alt="Hassan Mageye, writer, director and producer" />
          <img className="about-img-mobile" src={hassanImage} alt="Hassan Mageye, writer, director and producer" width={1400} height={950} />
        </div>
        <div className="about-copy">
          <p className="eyebrow">Hi, I’m Hassan</p>
          <h1>Ugandan/American writer, director and producer.</h1>
          <p>
            Hassan Mageye is a Ugandan/American writer, director and producer whose filmmaking career
            spans more than a decade. He studied Mass Communication at Makerere University and moved
            from an early interest in journalism toward filmmaking.
          </p>
          <p>
            His work has focused on African stories, cultural identity, social themes and
            character-driven drama. Hassan currently resides in California.
          </p>
          <div className="about-actions">
            <Link className="button button-dark" to="/films">Watch the films</Link>
            <Link className="button button-light" to="/contact">Contact</Link>
          </div>
        </div>
      </section>

      <section className="awards-section" id="awards" aria-labelledby="awards-title">
        <p className="eyebrow">Recognition</p>
        <h2 id="awards-title">Selected recognition</h2>
        <p className="awards-text">{AWARD_RECOGNITION}</p>
      </section>

      <SiteFooter />
    </main>
  );
}
