# Donate button and Google Drive video playback

## Changes
- Give the Donate tile a solid, high-contrast accent color that fits the existing support choices, with clear white text and matching hover/focus states.
- Accept standard Google Drive video share URLs in the existing Full film video and Trailer link fields without changing or migrating saved direct-upload URLs.
- Recognize Google Drive file links on the server, safely extract only the file ID/resource key, and classify them separately from MP4, HLS, and DASH sources.
- Keep existing uploaded/direct videos on the current protected stream proxy and custom player.
- For a paid film or free trailer backed by Google Drive, open Google Drive’s official preview player inside the existing playback surface only after the current access/payment check succeeds.
- Enable embedded-player permissions needed for playback and fullscreen. On mobile, provide a clear full-screen launch control; the browser will enter fullscreen from the viewer’s tap, as required by mobile browsers.
- Show a useful playback message when a Drive file is not shared for viewing, rather than replacing or modifying the saved link.
- Update the admin link field wording so it clearly accepts either a direct video URL or a Google Drive share link.

## Safety
- Do not rewrite, delete, move, or re-upload any existing videos.
- Do not expose direct-upload source URLs; their current signed playback route remains unchanged.
- Treat Drive links as embedded sources only; no Drive files are copied or altered.
- Preserve the existing payment gate before full-film playback.

## Verification
- Confirm the Donate tile is readable on desktop and mobile.
- Confirm an existing direct-upload film and trailer still play with the current controls.
- Confirm supported Drive URL forms resolve to the correct embedded video.
- Confirm a Drive-backed full film remains locked until payment/access succeeds.
- Confirm Drive playback can enter fullscreen from a tap on a mobile-sized screen.
- Confirm invalid/private Drive links show a helpful error and do not affect saved content.
