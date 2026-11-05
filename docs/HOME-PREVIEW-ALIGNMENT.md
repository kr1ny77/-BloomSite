# Home-screen preview alignment · 5 November 2026

User reported crooked geometry, labels overlapping the dock and requested the classic red Music icon with a white note.

Root cause: absolute-positioned dock over the content flow, plus viewport-sized type and independent percentage margins. Replaced with one explicit screen grid: status/date/clock/apps/page dots/dock/handle. All sizes now derive from the phone's own container width (cqw). Main app grid and dock each have four equal columns. Phone is straight; Bloom emphasis scales its icon only, leaving label baselines aligned.

Music now uses the original classic red/white vector, in both grid and dock. Runtime: static/images/ios-apps/music-classic.svg. Source: https://commons.wikimedia.org/wiki/File:Apple_Music_icon.svg ; credited Apple Inc., original Apple Music site,2020; Commons PD-textlogo/trademark notice. Source/provenance stored in assets/generated/ios-icons.json. Current official Apple site variant inspected but not selected because the user explicitly requested the red version.

Verification: actual Go site/browser1280×720. Last label bottom386.29px, page dots top405.77px, dots bottom420.34px, dock top423.57px. No overlap; phone rotate=none. Music visibly red with white note in both locations. Go tests/build PASS. Functional JS unchanged; no redundant tests added for this visual-only correction. Proof: home-preview-aligned.png. Final Go8096 running.
