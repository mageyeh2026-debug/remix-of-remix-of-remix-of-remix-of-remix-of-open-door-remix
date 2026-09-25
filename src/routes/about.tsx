import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { DEFAULT_SHARE_IMAGE, SITE_URL } from "@/lib/seo";
import hassanOnSet from "@/assets/hassan-mageye-on-set.jpg.asset.json";
import awardLaurel3d from "@/assets/award-laurel-reference-exact.png";

const aboutAwards = [
  { year: "2013", festival: "Pearl International Film Festival", film: "King’s Virgin", recognition: "Best Supporting Actor", result: "Award" },
  { year: "2015", festival: "Uganda Film Festival", film: "The Tailor", recognition: "Best Director", result: "Nomination" },
  { year: "2016", festival: "Uganda Film Festival", film: "Invisible Cuffs", recognition: "Best Actor in Film", result: "Award" },
  { year: "2017", festival: "Uganda Film Festival", film: "Devil’s Chest", recognition: "Best Director · Best Feature Film", result: "Winner" },
  { year: "2022", festival: "Africa Movie Academy Awards", film: "Tinka’s Story", recognition: "Best Visual Effects", result: "Nomination" },
  { year: "2022", festival: "Africa Magic Viewers’ Choice Awards", film: "Tinka’s Story", recognition: "Best Sound Editor", result: "Nomination" },
  { year: "2025", festival: "Uganda Film Festival", film: "Kimote", recognition: "Best Director · Best Screenplay", result: "Nominations" },
  { year: "2025", festival: "Silicon Valley African Film Festival · USA", film: "Kimote", recognition: "Official Selection", result: "Selection" },
];

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

      <section className="about-awards" aria-labelledby="about-awards-title">
        <header className="about-awards-head">
          <p className="about-awards-eyebrow">Recognition</p>
          <h2 id="about-awards-title">Awards &amp; Nominations</h2>
        </header>
        <div className="about-awards-track">
          {(["about-awards-row--a", "about-awards-row--b"] as const).map((rowClass, rowIndex) => (
            <ul className={`about-awards-row ${rowClass}`} key={rowClass} aria-hidden={rowIndex === 1}>
              {aboutAwards.map((award) => (
                <li className="about-award-box" key={`${rowClass}-${award.year}-${award.festival}`}>
                  <img className="about-award-icon" src={awardLaurel3d} alt="" width={1024} height={1024} loading="lazy" decoding="async" />
                  <span className="about-award-year">{award.year}</span>
                  <p className="about-award-festival">{award.festival}</p>
                  <h3 className="about-award-film">{award.film}</h3>
                  <p className="about-award-recognition">{award.recognition}</p>
                  <span className={`about-award-result about-award-result--${award.result.toLowerCase()}`}>{award.result}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
