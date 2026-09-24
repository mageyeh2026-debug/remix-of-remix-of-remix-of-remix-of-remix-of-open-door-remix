import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  MonitorPlay,
  Play,
  Video,
  Wrench,
  X,
} from "lucide-react";

import { hideBrokenImage } from "@/lib/utils";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { PlayerModal } from "@/components/PlayerModal";
import { SocialProfiles, socialProfiles } from "@/components/SocialLinks";
import { useSiteContent } from "@/hooks/useSiteContent";
import { DEFAULT_SHARE_IMAGE, SITE_URL } from "@/lib/seo";

import contactBackground from "@/assets/hassan-mageye-coming-soon.avif";
import hassanOnSet from "@/assets/hassan-mageye-on-set.jpg.asset.json";
import awardsBackground from "@/assets/awards-cinematic-background.jpg";
import awardsTrophy from "@/assets/awards-golden-trophy.png";
import cinemaStatuette from "@/assets/awards-cinema-statuette.png";
import serviceLocations from "@/assets/service-locations.jpg";
import serviceLocalCrew from "@/assets/service-local-crew.jpg";
import servicePermits from "@/assets/service-permits.jpg";
import serviceProductionSupport from "@/assets/service-production-support.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hassan Mageye | Film Director, Writer & Producer" },
      {
        name: "description",
        content:
          "Official site of Hassan Mageye, Ugandan/American film director, writer and producer. Watch his films, see upcoming projects, photos and press.",
      },
      {
        name: "keywords",
        content:
          "Hassan Mageye, Mageye films, Ugandan film director, African cinema, Tinka's Story, Kimote, The Silence We Flee, The Modern Road, John Bullock",
      },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:site_name", content: "Hassan Mageye" },
      { property: "og:title", content: "Hassan Mageye | Film Director, Writer & Producer" },
      {
        property: "og:description",
        content: "African stories, cultural identity and character-driven drama.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: DEFAULT_SHARE_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Hassan Mageye | Film Director, Writer & Producer" },
      { name: "twitter:description", content: "African stories, cultural identity and character-driven drama." },
      { name: "twitter:image", content: DEFAULT_SHARE_IMAGE },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Person",
              "@id": `${SITE_URL}/#hassan-mageye`,
              name: "Hassan Mageye",
              jobTitle: ["Film Director", "Writer", "Producer"],
              nationality: "Ugandan/American",
              url: SITE_URL,
              sameAs: socialProfiles.map((p) => p.href),
            },
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: SITE_URL,
              name: "Hassan Mageye",
              publisher: { "@id": `${SITE_URL}/#hassan-mageye` },
            },
          ],
        }),
      },
    ],
  }),
  component: Index,
});


const iconMap: Record<string, typeof Play> = {
  Building2,
  Video,
  MonitorPlay,
  Play,
  Clapperboard,
  Wrench,
};

const serviceImages: Record<string, string> = {
  locations: serviceLocations,
  crew: serviceLocalCrew,
  permits: servicePermits,
  support: serviceProductionSupport,
};

const awardMilestones = [
  { year: "2013", festival: "Pearl International Film Festival", film: "King’s Virgin", recognition: "Best Supporting Actor", result: "Award" },
  { year: "2015", festival: "Uganda Film Festival", film: "The Tailor", recognition: "Best Director", result: "Nomination" },
  { year: "2016", festival: "Uganda Film Festival", film: "Invisible Cuffs", recognition: "Best Actor in Film", result: "Award" },
  { year: "2017", festival: "Uganda Film Festival", film: "Devil’s Chest", recognition: "Best Director · Best Feature Film", result: "Winner" },
  { year: "2022", festival: "Africa Movie Academy Awards", film: "Tinka’s Story", recognition: "Best Visual Effects", result: "Nomination" },
  { year: "2022", festival: "Africa Magic Viewers’ Choice Awards", film: "Tinka’s Story", recognition: "Best Sound Editor", result: "Nomination" },
  { year: "2025", festival: "Uganda Film Festival", film: "Kimote", recognition: "Best Director · Best Screenplay", result: "Nominations" },
];


function ProjectCard({
  project,
  slug,
  index,
  activeIndex,
  onActivate,
  onTrailer,
}: {
  project: { image: string; name: string; type: string };
  slug: string;
  index: number;
  activeIndex: number | null;
  onActivate: (index: number) => void;
  onTrailer: (slug: string) => void;
}) {
  const active = activeIndex === index;
  return (
    <Link
      className={`project-card${active ? " is-active" : ""}`}
      to="/films/$slug"
      params={{ slug }}
      onClick={(e) => {
        if (
          typeof window !== "undefined" &&
          (window.matchMedia("(hover: none)").matches ||
            window.matchMedia("(max-width: 720px)").matches) &&
          !active
        ) {
          e.preventDefault();
          onActivate(index);
        }
      }}
    >
      <span className="project-thumb">
        <img
          src={project.image}
          alt={`${project.name} — ${project.type}`}
          width={900}
          height={506}
          loading={index < 4 ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={index < 4 ? "high" : "low"}
          onError={hideBrokenImage}
        />
        <span className="project-overlay">
          <span className="project-actions">
            <span
              className="film-btn film-btn-primary"
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/watch/${slug}?kind=film`;
              }}
            >
              <Play size={13} /> Watch now
            </span>
            <span
              className="film-btn film-btn-ghost"
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTrailer(slug);
              }}
            >
              <Play size={13} /> Trailer
            </span>
          </span>
        </span>
      </span>
      <span className="project-label">
        <strong>{project.name}</strong>
      </span>
    </Link>
  );
}

function Index() {
  const { content } = useSiteContent();
  const projectRailRef = useRef<HTMLDivElement>(null);
  const upcomingRailRef = useRef<HTMLDivElement>(null);
  const pressRailRef = useRef<HTMLDivElement>(null);
  const [activeFilm, setActiveFilm] = useState<number | null>(null);
  const [trailerSlug, setTrailerSlug] = useState<string | null>(null);
  const [galleryOpenIndex, setGalleryOpenIndex] = useState<number | null>(null);

  const films = content.films;
  const projects = films.map((film) => ({
    image: film.image,
    name: film.name,
    type: film.genre,
    slug: film.slug,
  }));
  const galleryPreview = content.gallery.items.slice(0, 8);
  const activeGalleryPhoto = galleryOpenIndex === null ? null : galleryPreview[galleryOpenIndex];
  const trailerFilm = films.find((f) => f.slug === trailerSlug);

  const closeGalleryPhoto = useCallback(() => setGalleryOpenIndex(null), []);
  const stepGalleryPhoto = useCallback(
    (direction: -1 | 1) =>
      setGalleryOpenIndex((current) =>
        current === null || !galleryPreview.length
          ? current
          : (current + direction + galleryPreview.length) % galleryPreview.length,
      ),
    [galleryPreview.length],
  );

  const scrollRail = (rail: HTMLDivElement | null, direction: -1 | 1) => {
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth, behavior: "smooth" });
  };

  const scrollProjects = (direction: -1 | 1) => scrollRail(projectRailRef.current, direction);

  // The rail must always start at the first uploaded film. Scroll snapping can
  // pull it sideways when films load in, so pin it back to the start.
  useEffect(() => {
    projectRailRef.current?.scrollTo({ left: 0 });
  }, [films.length]);

  useEffect(() => {
    if (galleryOpenIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeGalleryPhoto();
      if (event.key === "ArrowRight") stepGalleryPhoto(1);
      if (event.key === "ArrowLeft") stepGalleryPhoto(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [galleryOpenIndex, closeGalleryPhoto, stepGalleryPhoto]);

  return (

    <main id="home">
      <SiteHeader />

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-image" aria-hidden="true">
          <img
            src={content.hero.image}
            alt="Hassan Mageye, writer, director and producer"
            width={1400}
            height={950}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <div className="hero-copy">
          <p className="eyebrow hero-name">{content.hero.eyebrow}</p>
          <h1 id="hero-title">{content.hero.title}</h1>
          <p className="hero-intro">{content.hero.intro1}</p>
          <p className="hero-intro">{content.hero.intro2}</p>
          <div className="hero-actions">
            <Link className="button button-dark" to="/films">{content.hero.primaryLabel}</Link>
            <Link className="button button-light" to="/about">{content.hero.secondaryLabel}</Link>
            <Link className="button button-light" to="/contact">{content.hero.tertiaryLabel}</Link>
          </div>
        </div>
      </section>


      <section className="portfolio-section" id="portfolio">
        <h2 className="portfolio-title">{content.moviesHeading}</h2>
        <div className="project-carousel">
          <button className="carousel-arrow carousel-arrow-left" type="button" aria-label="Previous films" onClick={() => scrollProjects(-1)}>
            <ChevronLeft size={24} />
          </button>
          <div className="project-grid" id="portfolio-grid" ref={projectRailRef}>
            {projects.map((project, index) => (
              <ProjectCard
                key={`${project.slug}-${index}`}
                project={project}
                slug={project.slug}
                index={index}
                activeIndex={activeFilm}
                onActivate={setActiveFilm}
                onTrailer={setTrailerSlug}
              />
            ))}
            <Link className="more-card" to="/films" aria-label="See all films">
                <span className="more-thumb" aria-hidden="true">
                  <Play size={22} />
                </span>
                <span className="project-label">
                  <strong>More films</strong>
                </span>
            </Link>
          </div>
          <button className="carousel-arrow carousel-arrow-right" type="button" aria-label="Next films" onClick={() => scrollProjects(1)}>
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      <section className="upcoming-section" id="upcoming" aria-labelledby="upcoming-title">
        <div className="upcoming-heading">
          <p className="eyebrow"><span>{content.upcomingHeading.eyebrow}</span></p>
          <h2 id="upcoming-title">{content.upcomingHeading.title}</h2>
          <p className="upcoming-tagline">New stories. Bigger impact.</p>
        </div>
        <div className="upcoming-carousel">
          <button className="carousel-arrow carousel-arrow-left rail-arrow" type="button" aria-label="Previous upcoming projects" onClick={() => scrollRail(upcomingRailRef.current, -1)}>
            <ChevronLeft size={20} />
          </button>
          <div className="upcoming-grid" ref={upcomingRailRef}>
            {content.upcoming.map((project, index) => (
              <article className="upcoming-card" key={project.slug}>
                <Link
                  className="upcoming-thumb"
                  to="/films/$slug"
                  params={{ slug: project.slug }}
                  aria-label={`${project.name} — read the story and support this film`}
                >
                  <img
                    src={project.image}
                    alt={`${project.name} — upcoming film still`}
                    width={1200}
                    height={675}
                    loading={index < 4 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={index < 4 ? "high" : "low"}
                    onError={hideBrokenImage}
                  />
                  <span className="upcoming-status">{project.status ?? "Coming soon"}</span>
                </Link>
                <div className="upcoming-copy">
                  <h3>
                    <Link to="/films/$slug" params={{ slug: project.slug }}>{project.name}</Link>
                  </h3>
                </div>
              </article>
            ))}
          </div>
          <button className="carousel-arrow carousel-arrow-right rail-arrow" type="button" aria-label="Next upcoming projects" onClick={() => scrollRail(upcomingRailRef.current, 1)}>
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      <section className="services-section services-intro-section" id="services">
        <div className="services-intro">
          <h2 id="services-title">{content.services.title}</h2>
          <p className="services-lede">{content.services.lede}</p>
          <a className="button button-dark" href="#contact">{content.services.buttonLabel}</a>
        </div>
      </section>

      <section className="services-section services-cards-section">
        <div className="services">
          {content.services.items.map((item) => {
            const Icon = iconMap[item.icon] ?? Play;
            return (
              <article className="service" key={item.id}>
                {serviceImages[item.id] ? (
                  <img
                    className="service-image"
                    src={serviceImages[item.id]}
                    alt={`${item.title} for film production`}
                    width={1200}
                    height={800}
                    loading="lazy"
                    decoding="async"
                  />
                ) : <Icon aria-hidden="true" size={30} strokeWidth={1.35} />}
                <div className="service-copy">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="gallery-section" id="gallery" aria-labelledby="gallery-title">
        <p className="eyebrow">{content.gallery.eyebrow}</p>
        <h2 id="gallery-title">{content.gallery.title}</h2>
        <p className="awards-text">{content.gallery.description}</p>
        <div className="home-photo-strip home-photo-strip-portrait">
          {galleryPreview.map((photo, index) => (
            <img
              key={photo.id}
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              onError={hideBrokenImage}
              role="button"
              tabIndex={0}
              aria-label={`Enlarge ${photo.title}`}
              onClick={() => setGalleryOpenIndex(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setGalleryOpenIndex(index);
                }
              }}
            />
          ))}
        </div>
        <Link className="button button-dark" to="/gallery">{content.gallery.buttonLabel}</Link>
      </section>

      {activeGalleryPhoto ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={activeGalleryPhoto.title ?? "Gallery picture"} onClick={closeGalleryPhoto}>
          <button className="lightbox-close" type="button" aria-label="Close" onClick={closeGalleryPhoto}>
            <X size={22} />
          </button>
          <button
            className="lightbox-nav lightbox-prev"
            type="button"
            aria-label="Previous picture"
            onClick={(event) => {
              event.stopPropagation();
              stepGalleryPhoto(-1);
            }}
          >
            <ChevronLeft size={28} />
          </button>
          <figure className="lightbox-figure" onClick={(event) => event.stopPropagation()}>
            <div className="lightbox-image-wrap">
              <img src={activeGalleryPhoto.src} alt={activeGalleryPhoto.alt} decoding="async" onError={hideBrokenImage} />
            </div>
            <figcaption>
              {activeGalleryPhoto.title}
              <span className="lightbox-count">{(galleryOpenIndex ?? 0) + 1} / {galleryPreview.length}</span>
            </figcaption>
          </figure>
          <button
            className="lightbox-nav lightbox-next"
            type="button"
            aria-label="Next picture"
            onClick={(event) => {
              event.stopPropagation();
              stepGalleryPhoto(1);
            }}
          >
            <ChevronRight size={28} />
          </button>
        </div>
      ) : null}

      <section className="awards-section" id="media" aria-labelledby="media-title">
        <h2 id="media-title">{content.media.title}</h2>
        <p className="awards-text">{content.media.description}</p>
        <div className="press-carousel">
          <button
            className="carousel-arrow carousel-arrow-left press-arrow-left"
            type="button"
            aria-label="Previous press items"
            onClick={() => scrollRail(pressRailRef.current, -1)}
          >
            <ChevronLeft size={24} />
          </button>
          <div className="press-rail" ref={pressRailRef}>
            {content.media.items.map((card) => {
              const body = (
                <>
                  <img src={card.src} alt={card.alt} loading="lazy" decoding="async" fetchPriority="low" onError={hideBrokenImage} />
                  <span className="media-card-overlay">
                    <span className="media-card-meta">{card.meta}</span>
                    <strong className="media-card-title">{card.title}</strong>
                  </span>
                </>
              );
              return card.link ? (
                <a
                  className="media-card media-card-link"
                  key={card.id}
                  href={card.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {body}
                </a>
              ) : (
                <article className="media-card" key={card.id}>{body}</article>
              );
            })}
          </div>
          <button
            className="carousel-arrow carousel-arrow-right press-arrow-right"
            type="button"
            aria-label="Next press items"
            onClick={() => scrollRail(pressRailRef.current, 1)}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      <section
        className="recognition-showcase"
        aria-labelledby="recognition-title"
        style={{ "--recognition-bg": `url(${awardsBackground})` } as React.CSSProperties}
      >
        <header className="recognition-hero">
          <img
            className="recognition-portrait"
            src={hassanOnSet.url}
            alt="Hassan Mageye on a film set"
            width={900}
            height={1200}
            loading="lazy"
            decoding="async"
          />
          <div className="recognition-heading">
            <p>Hassan Mageye</p>
            <h2 id="recognition-title">
              Awards, Nominations &amp;
              <strong>International Recognition</strong>
            </h2>
            <span>Writer <i /> Director <i /> Producer <i /> Actor</span>
            <blockquote>“Stories have the power to change the world.” <cite>— Hassan Mageye</cite></blockquote>
          </div>
          <img
            className="recognition-trophy recognition-trophy-main"
            src={awardsTrophy}
            alt="Golden international film award trophy"
            width={768}
            height={1024}
            loading="lazy"
            decoding="async"
          />
        </header>

        <div className="recognition-grid">
          <article className="recognition-feature recognition-feature-winner">
            <time>2017</time>
            <img src={cinemaStatuette} alt="Golden cinema award statuette" width={768} height={1024} loading="lazy" decoding="async" />
            <p>Uganda Film Festival</p>
            <h3>Devil’s Chest</h3>
            <div><strong>Best Director</strong><strong>Best Feature Film</strong></div>
            <b>Winner</b>
          </article>

          {awardMilestones.filter((award) => award.year !== "2017").map((award, index) => (
            <article className={`recognition-card${index === 4 ? " recognition-card-dark" : ""}`} key={`${award.year}-${award.festival}`}>
              <div className="recognition-card-top">
                <img src={index % 2 ? awardsTrophy : cinemaStatuette} alt="Golden film award" width={768} height={1024} loading="lazy" decoding="async" />
                <time>{award.year}</time>
              </div>
              <p>{award.festival}</p>
              <h3>{award.film}</h3>
              <strong>{award.recognition}</strong>
              <span>{award.result}</span>
            </article>
          ))}

          <article className="recognition-wide recognition-silicon">
            <time>2025</time>
            <p>Silicon Valley African Film Festival · USA</p>
            <h3>Kimote</h3>
            <strong>Official Selection</strong>
          </article>
          <article className="recognition-wide recognition-academy">
            <img src={cinemaStatuette} alt="Golden cinema award statuette" width={768} height={1024} loading="lazy" decoding="async" />
            <div>
              <time>2025</time>
              <p>The Academy Awards</p>
              <h3>Kimote</h3>
              <strong>Uganda’s Official Submission for the 98th Academy Awards</strong>
            </div>
          </article>
          <article className="recognition-wide recognition-amaa">
            <time>2026</time>
            <p>Africa Movie Academy Awards · Nigeria</p>
            <h3>Kimote</h3>
            <strong>Best Indigenous Language Film · East Africa — Nomination</strong>
          </article>
          <article className="recognition-wide recognition-quote">
            <img src={awardsTrophy} alt="Golden international film award trophy" width={768} height={1024} loading="lazy" decoding="async" />
            <p>Great stories<br />travel far…</p>
          </article>
        </div>

        <aside className="recognition-additional">
          <img src={cinemaStatuette} alt="Golden cinema award" width={768} height={1024} loading="lazy" decoding="async" />
          <div>
            <h3>Additional Achievements</h3>
            <p>Devil’s Chest also received recognition for cinematography, sound, editing and post-production at the 2017 Uganda Film Festival.</p>
          </div>
          <ul aria-label="Recognition key">
            <li>Winner</li><li>Nomination</li><li>Official Selection</li><li>Official Submission</li>
          </ul>
        </aside>

        <footer className="recognition-signoff">
          <strong>Hassan Mageye</strong>
          <span>Real Stories <i /> Global Impact</span>
        </footer>
      </section>


      <section
        className="contact-section"
        id="contact"
        style={{ "--contact-bg": `url(${contactBackground})` } as React.CSSProperties}
      >
        <BriefcaseBusiness size={28} strokeWidth={1.3} aria-hidden="true" />
        <p className="eyebrow">{content.contact.eyebrow}</p>
        <h2>{content.contact.title}</h2>
        <p className="contact-lede">{content.contact.lede}</p>
        <a className="button button-light-on-dark" href={`mailto:${content.contact.email}`}>
          {content.contact.buttonLabel}
        </a>
      </section>

      <SocialProfiles />


      <PlayerModal
        slug={trailerSlug}
        title={trailerFilm?.name}
        poster={trailerFilm?.image}
        onClose={() => setTrailerSlug(null)}
      />


      <SiteFooter />
    </main>
  );
}
