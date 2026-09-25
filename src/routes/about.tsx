import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { DEFAULT_SHARE_IMAGE, SITE_URL } from "@/lib/seo";
import hassanOnSet from "@/assets/hassan-mageye-on-set.jpg.asset.json";

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
    links: [
      { rel: "canonical", href: `${SITE_URL}/about` },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main>
      <SiteHeader />

      <section className="about-section" id="about">
        <div className="about-image">
          <img src={hassanOnSet.url} alt="Hassan Mageye on a film set" width={1080} height={1620} />
        </div>
        <div className="about-copy">
          <p className="about-name">About</p>
          <h1 className="about-title">HASSAN MAGEYE</h1>
          <p className="about-role">Ugandan/American writer, director and producer.</p>
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

      <SiteFooter />
    </main>
  );
}
