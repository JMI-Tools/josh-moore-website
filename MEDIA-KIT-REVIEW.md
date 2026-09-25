# Immersive revision v2, September 22, 2026

This section supersedes the v1 implementation and validation notes below.

The entry is now full viewport, with Experience my story and Go straight to the press kit choices. The story uses a sticky full-screen canvas sequence, floating chapter captions, eight chapter jumps, and an ivory handoff to the press kit. No video player or play button is rendered. The giant JM cutout composition was replaced with Josh's supplied current outdoor portrait, with its setting intact.

Reference implementations inspected: local Terra Acquirer at port 4175 and AWPropertiesMI.com. Source media remains the approved 62.5-second draft. Desktop uses 500 WebP frames at 1440 width; mobile uses 864 width. Frames load after entry, prioritize the current scroll position, and use a bounded decoded-image cache. Reduced motion uses representative chapter frames.

Corrected Creative Campus, Project Pat from Three 6 Mafia, independently marketed/branded/managed Japan tour, and Addison North About link at https://addisonnorth.org/about/. Startup and setback are distinct beats: software startup, first major development client, signed huge six-figure backend, then client collapse. Full bio and written story match.

V2 verification: TypeScript and production build passed; browser QA verified no sequence requests on direct bypass, no video player, focus handoff, About link, startup before setback, forward/reverse frame movement, finale handoff, and no overflow at widths 320/390/768/1440. Evidence: D:/Content/Personal Brand/Media Kit/Website Review/verification-v2.json and v2 screenshots. No paid media generation or public deployment performed.

---
# Story and press kit draft

Prepared September 22, 2026. Local review only. No deployment, push, or public-site update performed.

## Preview and source

- Local preview: http://127.0.0.1:5193/media-kit
- Page: client/src/pages/MediaKit.tsx
- Styling: client/src/pages/media-kit.css
- Editable story chapters, biographies, press links, and conversation topics: client/src/content/media-kit.ts
- Shared route and search metadata: shared/seo-routes.ts
- Homepage entry and site navigation added in Home.tsx and Header.tsx.
- Original site portrait and JM logo reused. Navy #0A1E32, blue #4D92D0, and Inter follow existing site source. Ivory supports the film's final transition.
- Separate visual identity guide remains unavailable. The current vault says it still needs retrieving; Josh was asked for its location. Do not claim this draft was checked against that missing guide.

## Experience

The entry opens a scroll-controlled film with seven story chapters. There is a normal playback option, chapter navigation, direct access to the press kit, a written story, and a paused playback default for reduced-motion users. Playback ends by moving to the portrait and press kit. The film loads only after entry.

The 62.5-second web encode is 18,759,392 bytes, 1280-pixel width, H.264, silent, with fast-start metadata and half-second keyframes. Source film is the approved first motion draft at D:/Content/Personal Brand/Media Kit/Production/media-kit-motion-draft-v1.mp4. Existing generation continuity limitations remain those of that draft.

## Editorial sources

- First-person story, XXL full page, touring, Six-Figure Creative Campus Award: Josh's explicit account in this task, supported by the current Brand Core where applicable. No claim of membership in the XXL Freshman class. No implication the six-figure award equals net worth or annual profit.
- Award title: https://bestofbestreview.com/awards/josh-moore-best-seller-finance-strategist-in-west-michigan-of-2026
- AP News placement: https://apnews.com/press-release/marketersmedia/press-release-91808d2e0ba298e1da0f73e196add742
  Exact URL supplied by Josh; tracking parameter removed. AP blocked automated content retrieval. Listed as a MarketersMEDIA press release, not AP editorial coverage.
- StreetInsider distributed release: linked in content/media-kit.ts, inspected during research.
- CEO Times: https://ceotimes.com/josh-moore-builds-opportunity-through-resourcefulness/ . Listed as a brand profile.
- Addison North board role and curriculum work: supported by award announcement and release. Organization link from award source: https://addisonnorth.org . Direct site retrieval was unavailable during research.
- Media contact supplied earlier by Josh: J.Moore@itsjoshmoore.com. No phone included.

## Validation

- TypeScript check passes.
- Vite production build, server bundle, route metadata prerender, and sitemap generation pass. Existing optional analytics environment warnings and large-bundle warning remain.
- Desktop and mobile visual checks at 1440 and 390 pixels; no horizontal overflow at 320, 390, 768, or 1440 pixels.
- Forward/reverse video seeking, chapter jumps, normal playback, actual ended-event handoff, and skip focus tested.
- Reduced-motion mode starts paused without scroll playback.
- Short/full bio toggle, clipboard contents, downloaded full biography, and original PNG portrait download tested. Downloaded portrait hash matches source.
- Print export generated and print styling visually inspected. All supplied press and contact links are present; this is not a guarantee of availability on third-party sites.
- Evidence: D:/Content/Personal Brand/Media Kit/Website Review/verification.json and screenshots in that directory.

## Local runtime

Authoritative source is this isolated D: worktree on codex/media-kit-experience, based on codex/fix-brand-images (6f364da). Existing working changes in the original repository were left alone. Before any eventual publication, reconcile this branch with the then-current production branch.

Dependencies and a mirrored build workspace are on C:/Users/S.A.G.E/.sage/tools/josh-moore-site-deps. The D: filesystem does not support a node_modules junction, so source files are copied into that C: runtime for local compilation. Its dist junction writes build output back to this worktree on D:. The pnpm lockfile was installed unchanged using pnpm 10.4.1. After edits here, sync the corresponding files to the runtime before preview/build.

The running Vite preview uses port 5193. To restart, run Node with node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5193 --strictPort from the C: runtime, using a hidden process. Keep outputs and logs on D:.

Music assets update: Josh supplied and approved XXL cover and full-page advertisement photographs, now shown together. Added Viberate artist profile with attributed paraphrase and EDP interview with supplied date and description metadata. Recording not reviewed; no recording-specific quotes used. All XXL copy explicitly calls this an advertisement. Browser checks passed links, both images, and mobile overflow.
