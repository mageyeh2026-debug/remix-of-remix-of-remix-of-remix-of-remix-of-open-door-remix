# Complete search sitemap

## Goal
Replace the small sitemap with a live, comprehensive sitemap system for Hassan Mageye’s public website. It will help Google, Bing, and other standards-based search engines discover every canonical page and eligible image quickly.

A sitemap cannot guarantee first place, force immediate indexing, create a Wikipedia listing, or control when search engines revisit a site. It can provide the strongest accurate discovery signals the website controls.

## Build
- Turn `/sitemap.xml` into a sitemap index that clearly separates page and image discovery.
- Add a live page sitemap containing Home, Films, Gallery, About, Contact, every uploaded film, and every displayed upcoming project.
- Add image sitemap data for the portrait, film posters, upcoming-project artwork, all uploaded gallery photos, and all Media and news images.
- Give every image a useful title/caption from the saved film, gallery, or news information when one exists.
- Normalize and safely encode film addresses, including apostrophes and other special characters.
- Keep payment, watch, sign-in, admin, and temporary video-stream addresses out of search results.
- Generate the sitemap from the current dashboard content on every request and use a one-hour search hint without inventing modification dates.
- Return a clear error if current dashboard content cannot be read, rather than silently publishing an incomplete sitemap.
- Preserve the existing `robots.txt` access rules and point crawlers to the main sitemap index.

## News coverage
The three Media and news items currently link to external publishers and do not have full article pages on this website. Their images and titles will be indexed through the homepage sitemap entry, while the external article URLs will remain links to their rightful publishers. External URLs cannot validly be placed in this website’s sitemap.

## Verify
- Check the XML structure and response headers for every sitemap.
- Confirm all current film/upcoming entries, all 53 gallery images, and all 3 Media and news images appear.
- Confirm private, payment, and playback addresses are absent.
- Check the sitemap index and child sitemaps in the running website.
