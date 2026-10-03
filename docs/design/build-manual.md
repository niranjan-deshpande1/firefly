> Source: pasted by the founders on 2026-10-03 as the binding visual design spec for Firefly. Kept verbatim. It was written for Launchology; DESIGN.md says how it maps onto Firefly.

This document is the build authority for every Launchology surface. It incorporates the
binding product requirements, the binding design constitution, and founder Amendment A.
An engineer must not need another design document to implement a covered surface.
Status words in this document are normative:
must means required.
must not means forbidden.
derived means the value was measured or selected by applying the constitution, not
directly quoted from it.
open means implementation must stop at the named boundary until the founders decide.
The supplied visual references were reviewed as non-binding inputs. The dotted lowercase
wordmark is recorded as a logo direction to evaluate, not an approved asset. The profile
and landing mockups support the black, work-forward hierarchy but do not override this
manual. The remaining references reinforce hard borders, isolated expressive moments,
and a hard-cut media grid. No reference authorizes a gradient, light mode, stock asset,
ranking mechanic, or off-token value.
review record
The required five-pass record is retained here so later changes can be audited.
pass
result
1, draft
✅ 16 sections drafted, 248 named-token and state-row values enumerated; no docs/references/ directory was present
2, self-critique
✅ 14 issues found across color, controls, type, depth, motion, content, navigation, accessibility, performance, and handoff
3, revise
✅ 13 issues resolved, 1 direct source conflict deferred to OPEN-NAV-1
4, consistency
✅ 4 orphan or undefined references found and resolved; cross-reference ledger is in section 14
5, final
✅ seven document tests run; 6 pass and the 375px live-sprint case is blocked only by OPEN-NAV-1
pass 2 issue log
section
issue found
disposition
2
pressed accent lacked its own semantic row and contrast evidence
resolved
2, 7
line was too low-contrast to identify editable controls
resolved with existing grey-500 under accessibility precedence
2, 4, 5
white primary outline was indistinguishable from cream
resolved with measured near-black outline
2, 7
checkbox/radio/toggle selection consumed the cream reserved for primary emphasis
resolved with blue mark and border on a raised surface
3, 13
15px editable text could trigger mobile browser zoom
resolved with the existing 16px body value on touch devices
4, 7
modal and drawer scrim was undefined
resolved from black plus the constitution's existing 0.6 overlay alpha
9, 10
rail width animation would reflow layout
resolved with one layout change and transform/opacity label motion
9
mobile live-sprint nav contains a direct 5-versus-6 item conflict
deferred, no silent choice
11
the empty-state catalog omitted connections, discovery query, persisted teams, and sprint sub-surfaces
resolved
13
focus contrast was incorrectly measured against cream instead of the dark surface exposed by the 2px offset
resolved
13
skip link, heading order, multiple-error focus, autofill, and zoom/reflow were not explicit
resolved
13
fixed-nav content reserve and landscape behavior were not explicit
resolved
13
intrinsic media sizing, font swap, lazy loading, and long-list rendering were absent
resolved through the explicit ui-ux-pro-max review
14
the token example introduced an undefined space-2 and used the wrong primary border alias
resolved
1. foundation and non-negotiables
1.1 screen acceptance checklist
A screen ships only when every applicable statement is true.
Anyone can enter. There is no application, approval, acceptance, profile-completeness
score, personal rank, or public person-level value.
Builder work or the builder is the largest content. Sponsor credit and platform
identity remain subordinate.
Video, audio, image, writing, and code or link work all receive first-class,
substantial representations. No medium is rendered as a placeholder.
The contribution graph and activity surfaces are read-only projections of real making.
Empty time remains visible and neutral.
No state is a dead end. It offers accumulated work to explore or a person to meet.
Teams and clusters show real names and faces without simulating crowd, urgency, or
activity.
Sponsor presence is fixed, named credit. There are no ads and no sponsor content
disguised as builder work.
The 375px design is the origin. Every time includes an explicit IANA timezone.
One viewport has one focal element in this order: media, person, action, text.
The product never ranks, rejects, compares, or publicly quantifies people, and never renders a person as a number. Clarified 2026-08-10, source the founder: the prohibition is on RENDERING a person as a number, not on computing one, so a score may decide what appears so long as it is never shown.
The frame follows the Launchology system. Builder-authored work and text are never
restyled, case-transformed, or rewritten to fit the brand.
A surface used to read, work, or inspect evidence is quieter than a surface used to
arrive or act.
1.2 concrete anti-identity tests
All commands are run from the repository root. Any match in shipped interface source is a
defect unless it is inside this document, a test fixture explicitly asserting rejection,
or generated email output covered by the single email-literal exception.
prohibition
enforceable test
gradients
rg -n -e gradient -e linear-gradient -e radial-gradient -e conic-gradient app components returns zero
glow
rg -n -e drop-shadow -e text-shadow -e "filter:.*shadow" -e "box-shadow:.*blue" -e "box-shadow:.*accent" app components returns zero
glass or blur behind
rg -n -e backdrop-filter -e backdrop-blur -e blur-behind app components returns zero
glossy or beveled depth
no inset highlight, bevel, specular layer, or blurred component shadow exists
mesh, particles, moving ground
rg -n -e mesh -e particle -e aurora -e animated-grid app components returns zero; ground never animates
light mode
no theme toggle, prefers-color-scheme, .light, or inverted page ground exists
stock imagery
every photographic asset has a builder source record; no stock provider URL or generic startup illustration exists
podium
returns zero product affordances — command is a two-stage pipe (a shell |, unsafe to inline in this table cell) listed just below the table, amended 2026-07-29, see §16.2
competitive pressure
no countdown used as pressure, prize reveal, scarce badge, or comparison table of people
edtech coercion
no person-level progress bar, certificate, mandatory-looking checklist, or empty-square shaming
crowded feed
no infinite scroll of low-value updates and no notification badges on every destination
people rejection
no swipe, pass, accept, reject, decline, or negative-person-signal object or event
copy violations
system copy has no em dash, en dash, or exclamation mark; product copy is lowercase except proper nouns and eyebrow text
box-shadow has two permitted forms only: the sticker hard offset with zero blur, and the
floating overlay shadow defined in section 4. Neither is a glow.
The podium test's exact command (amended 2026-07-29 — see §16.2):
rg -niP \
  -e '(?<=[<.=_">-])(leaderboard|winner|featured|trophy|medal|streak|rank)s?\b' \
  -e '\b(leaderboard|winner|featured|trophy|medal|streak|rank)s?(?=\s{0,3}[(){}.:=<-]|(?-i:[A-Z]))' \
  -e '(?-i:(?<=[a-z])(Leaderboard|Winner|Featured|Trophy|Medal|Streak|Rank)s?\b)' \
  -e '\btop[-_]?builders?\b' -e '\bview[-_]?counts?\b' -e '\bfollower[-_]?counts?\b' \
  app components \
  | rg -v -e '\bno\b' -e '\bnever\b' -e '\bwithout\b' -e '\bnothing\b'

1.3 precedence
Resolve conflict in this order: philosophy constraints, accessibility, founder
amendments, the more specific rule, then the general rule. If the conflict remains,
record it in section 16 and stop. Do not select a conventional answer silently.
2. color system
2.1 primitive color tokens
Contrast uses WCAG 2.x relative luminance against #000000. HSL and OKLCH values are
measured from the sRGB hex values and rounded only for display. Hex is canonical.
primitive token
hex
HSL
OKLCH
contrast on black
derivation and boundary
primitive-color-black
#000000
0 0% 0%
0 0 0
1.00:1
locked ground
primitive-color-raised
#0E0E0E
0 0% 5.5%
0.1638 0 89.9
1.09:1
first neutral surface step
primitive-color-raised-2
#1A1A1A
0 0% 10.2%
0.2178 0 89.9
1.21:1
highest neutral surface step
primitive-color-line
#262626
0 0% 14.9%
0.2686 0 89.9
1.39:1
visible boundary, never text
primitive-color-white
#FFFFFF
0 0% 100%
1 0 89.9
21.00:1
locked primary text
primitive-color-grey-500
#8A8A8A
0 0% 54.1%
0.6334 0 89.9
6.08:1
secondary text, not body prose
primitive-color-grey-600
#6B6B6B
0 0% 42%
0.5278 0 89.9
3.94:1
disabled or non-essential only
primitive-color-blue-500
#4DA3FF
211 100% 65.1%
0.7047 0.1587 252.4
8.00:1
link, focus, active, selected
primitive-color-blue-600
#4390E0
210.6 71.7% 57.1%
0.6423 0.1424 251.7
6.30:1
pressed accent, derived by the locked 12% darkening
primitive-color-blue-deep
#1B4FD8
223.5 77.8% 47.6%
0.4895 0.2164 264
3.16:1
illustration and hard offset only; never text, border, or interactive fill
primitive-color-green-500
#3FD98A
149.2 67% 54.9%
0.7870 0.1704 156
11.50:1
confirmation and shipped state
primitive-color-red-500
#FF6B6B
0 100% 71%
0.7116 0.1812 22.8
7.57:1
error and destructive text
primitive-color-yellow-500
#FFC24D
39.4 100% 65.1%
0.8492 0.1471 80.4
13.08:1
warning and offline only, not the stall signal
primitive-color-cream-100
#FFFDF0
52 100% 97.1%
0.9921 0.0172 99.6
20.56:1
derived Amendment A default, sampled toward the supplied warm wordmark direction while remaining nearly neutral
primitive-color-cream-200
#F7F0D4
48 68.6% 90%
0.9533 0.0375 95.4
18.37:1
derived Amendment A hover, one visible warm-darkening step
primitive-color-cream-300
#EDE2BC
46.5 57.6% 83.3%
0.9119 0.0513 93.8
16.21:1
derived Amendment A pressed/selected, darkest permitted cream
primitive-color-rust
#C05A28
19.7 65.5% 45.5%
0.5858 0.1451 44.1
4.73:1
Wren illustration only (D-III), the cast figure's back and primary form colour; never text, border, interactive fill, or any UI component token
primitive-color-buff
#E4BE9C
28.3 57.1% 75.3%
0.8262 0.0631 63.6
12.14:1
Wren illustration only (D-III), the underparts, face, and fine detail; never text, border, interactive fill, or any UI component token
primitive-color-rust-deep
#A23C18
15.7 74.2% 36.5%
0.4942 0.1432 38.4
3.20:1
Wren illustration only (D-III), the hard offset and silhouette, mirroring blue-deep's role at semantic-color-offset-sticker; never text, border, or interactive fill
The cream family is reserved for primary buttons and explicitly designated
high-emphasis surfaces. It is never a page background, card default, body text, input
fill, or light theme. The label is primitive-color-raised, producing 18.90:1,
16.89:1, and 14.90:1 on cream 100, 200, and 300 respectively. All clear 7:1.
The primary button offset remains primitive-color-blue-deep. Its hard-edged silhouette
clears the 3:1 non-text boundary against black at 3.16:1. It is a solid 4px translated
copy with zero blur, so it is neither a gradient nor a glow. It is not the control fill
and carries no text or state meaning.
2.2 semantic color tokens
semantic token
primitive
exhaustive permitted use
semantic-color-surface-ground
black
page, rail, bottom bar, email dark ground
semantic-color-surface-raised
raised
cards, list rows, inputs, skeleton blocks
semantic-color-surface-raised-2
raised-2
menus, drawers, modals, hover fill, toast
semantic-color-surface-emphasis
cream-100
primary button and founder-approved high-emphasis surface only
semantic-color-surface-emphasis-hover
cream-200
primary button hover only
semantic-color-surface-emphasis-active
cream-300
primary button active or selected only
semantic-color-surface-scrim
black + opacity-scrim
modal and drawer background isolation only
semantic-color-content-primary
white
headings, body, labels, control text on dark surfaces
semantic-color-content-secondary
grey-500
metadata, captions, timestamps, sponsor credit
semantic-color-content-muted
grey-600
placeholder, hint, disabled, non-essential text
semantic-color-content-on-emphasis
raised
text and icon on cream surfaces only
semantic-color-content-accent
blue-500
links, focus ring, active and selected text or mark
semantic-color-content-accent-active
blue-600
pressed link text only
semantic-color-content-success
green-500
confirmation text plus a literal status label
semantic-color-content-error
red-500
adjacent error text, destructive action text
semantic-color-content-warning
yellow-500
offline or caution text plus a literal status label
semantic-color-border-default
line
dividers and non-essential structural separators
semantic-color-border-control
grey-500
default boundary of inputs, selections, and outlined buttons
semantic-color-border-strong
white
sticker outline and selected high-contrast boundary
semantic-color-border-on-emphasis
raised
primary button's 2px outline against cream
semantic-color-border-focus
blue-500
2px focus ring only
semantic-color-border-error
red-500
erroneous field border plus adjacent error sentence
semantic-color-offset-sticker
blue-deep
hard sticker shadow and illustration silhouette only
semantic-color-surface-illustration
blue-deep
waveform and approved flat illustration fills only
semantic-color-illustration-rust
rust
Wren's back and primary form fill; illustration only
semantic-color-illustration-buff
buff
Wren's underparts, face, and fine detail; illustration only
semantic-color-illustration-rust-deep
rust-deep
Wren's hard offset and silhouette; illustration only
2.3 component color tokens
Each component token exists for one property. The semantic- prefix is omitted in the
reference column only to keep the table readable.
component token family
exact bindings
component-button-primary-*
bg→surface-emphasis; bg-hover→surface-emphasis-hover; bg-active/selected→surface-emphasis-active; text→content-on-emphasis; border→border-on-emphasis; offset→offset-sticker; focus→border-focus; error-border→border-error
component-button-secondary-*
bg→surface-raised-2; bg-hover/active/selected→surface-raised; text→content-primary; border→border-control; focus→border-focus
component-button-ghost-*
bg→transparent; bg-hover/selected→surface-raised-2; text→content-primary; border→transparent; focus→border-focus
component-button-destructive-*
bg→transparent; bg-hover/selected→surface-raised-2; text→content-error; border→transparent; focus→border-focus
component-control-*
bg→surface-raised; bg-hover→surface-raised-2; text→content-primary; placeholder→content-muted; border→border-control; border-focus→border-focus; border-error→border-error; readonly-text→content-secondary
component-selection-*
bg/bg-selected→surface-raised; mark-selected→content-accent; border→border-control; border-selected→border-focus; focus→border-focus
component-chip-*
bg→surface-raised; bg-hover→surface-raised-2; text→content-primary; text-selected→content-accent; border→border-strong; offset→offset-sticker
component-link-*
text→content-accent; text-active→blue-600 primitive through content-accent-active; focus→border-focus; error→content-error
component-feedback-*
success→content-success; error→content-error; warning→content-warning; muted→content-secondary
component-overlay-*
bg→surface-raised-2; scrim→surface-scrim; text→content-primary; border→border-default; focus→border-focus
component-skeleton-*
bg→surface-raised; bg-active→surface-raised-2
component-divider-*
line→border-default; line-selected→content-accent; line-error→content-error
component-waveform-*
bg→surface-illustration; wave→content-primary; transport-bg→surface-ground; transport-text→content-primary; focus→border-focus
Interactive boundaries use border-control, not border-default. The original line
input border was overridden by accessibility precedence because its 1.39:1 contrast on
black cannot identify a control at the required 3:1. This introduces no new color.
2.4 interaction ramps
interaction
surface
text or mark
border
additional cue
default
component default
component default
default or transparent
resting silhouette
hover
one surface step lighter, except cream becomes cream 200
unchanged
unchanged
cursor changes where applicable
focus-visible
unchanged
unchanged
2px blue ring at 2px offset
ring, never color alone
active
cream 300 for primary; raised for neutral controls
accent-active only for links
unchanged
exact press transform
selected
cream 300 only for primary; otherwise default surface
accent text or explicit check mark
strong where applicable
aria-selected or checked mark
loading
final-layout skeleton surface or unchanged control
muted or visually hidden label with accessible busy name
unchanged
aria-busy=true, action unavailable
disabled
unchanged
muted
default
opacity-disabled, cursor-not-allowed, semantic disabled state
read-only
unchanged
secondary
default
readonly or aria-readonly=true, no pointer cue
error
unchanged
primary plus adjacent error text
error
sentence states what happened and what to do
2.5 illustration-only palette
The interim rule has ended by its own first clause. It read "until the first cast asset
locks a dedicated palette", and Wren is that first cast asset. Founder decision D-III
(docs/open-decisions.md, 2026-08-25) locks a dedicated illustration palette of rust, buff, and
rust-deep. This is the interim rule's stated exit condition being met, not an amendment around it.
The complete permitted illustration palette is now six colors: primitive-color-white,
primitive-color-blue-500, and primitive-color-blue-deep, which the interim rule already
permitted and which are unchanged; plus primitive-color-rust, primitive-color-buff, and
primitive-color-rust-deep, added by D-III. Nothing was removed.
The four requirements below are unchanged. They are the procedure the three new colors were
admitted through, not a rule that D-III replaced. Each was satisfied and the evidence is at the
place named:
must be added to the primitive tier and section 2 with HSL, OKLCH, and contrast;
must clear 3:1 against black when it carries form;
must alias only to semantic-color-illustration-*;
must cause CI to fail if referenced by any UI component token.
Requirement 1 is satisfied by the three rows in 2.1. Requirement 2 is satisfied at 4.73:1,
12.14:1, and 3.20:1 respectively, every one computed rather than asserted; rust-deep is the
one that had to be lightened to clear the floor, and its rejected first value is recorded in
docs/loop-44-2026-08-25.md. Requirement 3 is satisfied by the three
semantic-color-illustration-* aliases in 2.2. Requirements 3 and 4 are BOTH enforced by one CI
step, named wren illustration colors may not be referenced by a UI component token. That step
is the authority on which forms it catches and no document restates its coverage, because a second
copy of a check's coverage is what drifts: an earlier draft of this section claimed two forms while
17.1 claimed three, and the step caught three.
This section carried a tension and did not lose it. The interim rule called itself "not an
invitation to invent neon green, pink, or orange values", and one of the three admitted colors is
in that family. D-III records the tension, the founder's ruling on it, and the reasoning, in
full. It is not reproduced here, because the four requirements above are what this section
enforces and the decision is what carries the argument.
Why these three colors and not colors the palette already had is D-III's reasoning and is
recorded there, once. It is deliberately not repeated here.
Crossing the boundary is a design defect, even when the color is accessible.
2.6 permitted contrast matrix
Only listed pairings are permitted. AAA means 7:1 or higher, AA means 4.5:1 or
higher, and UI means the 3:1 non-text or large-text boundary only.
text token
surface token
ratio
result and restriction
content-primary
surface-ground
21.00
AAA
content-primary
surface-raised
19.30
AAA
content-primary
surface-raised-2
17.40
AAA
content-primary
surface-illustration
6.65
AA, waveform controls or large display only
content-secondary
surface-ground
6.08
AA, metadata only
content-secondary
surface-raised
5.59
AA, metadata only
content-secondary
surface-raised-2
5.04
AA, metadata only
content-muted
surface-ground
3.94
UI or non-essential only
content-muted
surface-raised
3.62
UI or non-essential only
content-muted
surface-raised-2
3.27
UI or non-essential only
content-accent
surface-ground
8.00
AAA
content-accent
surface-raised
7.35
AAA
content-accent
surface-raised-2
6.63
AA
content-accent-active
surface-ground
6.30
AA
content-accent-active
surface-raised
5.79
AA
content-accent-active
surface-raised-2
5.22
AA
content-success
surface-ground
11.50
AAA
content-success
surface-raised
10.57
AAA
content-success
surface-raised-2
9.53
AAA
content-error
surface-ground
7.57
AAA
content-error
surface-raised
6.96
AA
content-error
surface-raised-2
6.27
AA
content-warning
surface-ground
13.08
AAA
content-warning
surface-raised
12.02
AAA
content-warning
surface-raised-2
10.84
AAA
content-on-emphasis
surface-emphasis
18.90
AAA
content-on-emphasis
surface-emphasis-hover
16.89
AAA
content-on-emphasis
surface-emphasis-active
14.90
AAA
All unlisted pairings fail by policy even if a numerical test happens to pass. In
particular, white on cream, blue on cream, grey-500 on cream, blue-deep as text, and
grey-600 as body text are forbidden.
2.7 color never list
No background-image may contain color.
blue-deep is never text, an interactive fill, a focus ring, or an interactive border.
Cream is never page ground, body text, neutral card fill, input fill, or light mode.
Red is never the stall signal and never replaces a recovery sentence.
Yellow is never the stall signal; it is reserved for offline and explicit caution.
Success, error, and warning colors always have a text label or icon plus text.
Opacity does not manufacture a new text color. Use the named content token.
Builder media is not colorized to match the interface.
3. typography
3.1 families
token
stack
fixed use
semantic-font-display
"Satoshi", Arial, sans-serif
all headings and names
semantic-font-body
"Space Mono", ui-monospace, "SFMono-Regular", Menlo, monospace
sentences, UI, metadata
semantic-font-accent
"Array", "Satoshi", Arial, sans-serif
marketing-only poster step
semantic-font-nonlatin
ui-monospace, "SFMono-Regular", Menlo, monospace
non-Latin builder-authored content
Satoshi and Array use the repository's Fontshare license. Space Mono uses SIL OFL 1.1.
Font files and licenses remain self-hosted in the repository.
3.2 complete type scale
Desktop values apply at 1024px and above. Tablet uses mobile values.
token
family
weight
mobile px/rem
desktop px/rem
line height
tracking
allowed
forbidden
semantic-type-poster
accent
400
64 / 4rem
120 / 7.5rem
1.05
-0.01em
at most 2 marketing moments, 8 words max
product, repeating heading, under 48px
semantic-type-display-1
display
900
40 / 2.5rem
72 / 4.5rem
1.05
-0.03em
one hero or page name
body, repeated cards
semantic-type-display-2
display
700
30 / 1.875rem
48 / 3rem
1.1
-0.02em
section opener
body
semantic-type-display-3
display
700
22 / 1.375rem
28 / 1.75rem
1.2
-0.01em
card title, project name
paragraph
semantic-type-display-4
display
500
17 / 1.0625rem
18 / 1.125rem
1.3
0
small heading, list group
sentence
semantic-type-body-l
body
400
17 / 1.0625rem
18 / 1.125rem
1.7
0
long descriptions and reading
UI label
semantic-type-body
body
400
15 / 0.9375rem
16 / 1rem
1.6
0
default UI sentence
metadata
semantic-type-body-s
body
400
14 / 0.875rem
14 / 0.875rem
1.5
0
captions, attribution
long body
semantic-type-label
body
400
13 / 0.8125rem
13 / 0.8125rem
1.3
0.06em
field labels, metadata
paragraph
semantic-type-eyebrow
body
700
12 / 0.75rem
12 / 0.75rem
1.2
0.12em
only uppercase system text
sentence or action
semantic-type-button
body
700
15 / 0.9375rem
15 / 0.9375rem
1
0.02em
every action label
paragraph
semantic-type-numeric
body
400
inherit
inherit
inherit
0
dates, counts, durations
person score or rank
Satoshi names things. Space Mono says things. Family, case, and tracking never change
locally. Builder-authored content is never case-transformed.
3.3 Space Mono constraints
Space Mono has 400 and 700 only. If a design asks for 500 or 600, do not synthesize or
substitute it. Resolve hierarchy in this order: size, content-primary versus
content-secondary, 400 versus 700, then the existing tracking token. Italic is reserved
for quotations. Bold italic is not used.
Continuous prose uses body-l, line-height 1.7, and max-inline-size: 55ch. Every body
container uses inline-size: min(100%, 55ch). A stream shell may reach 60ch, but prose
inside it remains 55ch. More than about 400 continuous words must be split into sections;
type must not shrink.
3.4 non-Latin path
All three brand faces are Latin-only. Use the exact CSS fallback stack from
semantic-font-nonlatin; do not apply a brand face to a run known to be unsupported.
Platform resolution is:
platform
first expected system face
required fallback
macOS and iOS
SF Mono through ui-monospace, then SFMono-Regular, then Menlo
generic monospace
Windows
the browser's ui-monospace mapping, commonly Cascadia Mono or Consolas
generic monospace
Android and ChromeOS
the browser's ui-monospace mapping, commonly Roboto Mono or Noto Mono
generic monospace
Linux
distribution ui-monospace mapping
generic monospace
No size-adjust, ascent-override, descent-override, or line-gap-override is applied
to generic system faces because their metrics vary by device. The exact adjustment is
therefore 100% / normal / normal / normal. Layout, not a guessed metric override,
absorbs variation.
At every type step, tests render Japanese, Korean, Simplified Chinese, Traditional
Chinese, Cyrillic, Arabic, Hebrew, and Devanagari. Required invariants:
block height may grow but must not clip;
no fixed text height or single-line truncation on authored prose;
overflow-wrap: anywhere is allowed only for URLs, never normal prose;
controls may wrap labels to 2 lines while preserving a 44px minimum target;
Arabic and Hebrew set dir=auto, preserve visual and DOM order, and mirror only
directional icons;
CJK line breaking uses the browser's language-aware rules and preserves the 55ch cap;
all grids accept 2x string length without horizontal scrolling.
3.5 Array rule
Array Regular appears zero times inside the authenticated product and at most twice
across the entire marketing site: the hero line and one other single moment. It is never
below 48px, never more than 8 words, never a paragraph, and never a repeating page
heading. A proposed third use must delete one existing use first.
4. spatial system
4.1 primitive scales
category
primitive tokens and exact values
space
space-4:4px, space-8:8px, space-12:12px, space-16:16px, space-24:24px, space-32:32px, space-48:48px, space-64:64px, space-96:96px, space-128:128px
radius
radius-0:0, radius-6:6px, radius-12:12px, radius-pill:999px
border
border-0:0, border-1:1px, border-2:2px, border-draw-spot:3px, border-draw-feature:4px, border-draw-full:6px
sticker offset
offset-0:0, offset-chip:2px, offset-button:4px, offset-card:6px, offset-draw-full:8px
rotation
rotate-none:0deg, rotate-card-min:1deg, rotate-card-max:2deg, rotate-draw-max:3deg
opacity
opacity-hidden:0, opacity-disabled:0.48 derived so disabled remains present while the state is also conveyed semantically, opacity-scrim:0.6 derived from the constitution's single overlay shadow alpha, opacity-full:1
Spacing assignments are fixed: 4 icon-to-label and chip internals, 8 tightly related
items and dense row inset, 12 controls, 16 mobile card inset and paragraph gap, 24 desktop
card inset and field stack, 32 component groups, 48 subsections, 64 mobile sections, 96
desktop sections, 128 hero block only.
Radius assignments are fixed: 0 media and reel tiles, 6 inputs/buttons/chips/small
controls, 12 cards/panels/drawers/modals, pill status and transport only. Avatar is the
explicit 1:1 circular-media exception and uses radius-pill.
4.2 breakpoints, containers, and grid
range
columns
side margin
gutter
content width and behavior
0–639px
4
16px
12px
fluid; at 375px usable width is 343px
640–1023px
8
32px
16px
fluid; at 640px usable width is 576px
1024px+
12
container-centered
24px
main content max 1200px
The desktop app shell reserves a 240px rail. A collapsed rail reserves 64px. The main
container remains min(100%, 1200px) inside the remaining viewport.
Dense horizontal rhythm uses 1ch as the base and 2ch as the default column gap.
Directory metadata, community message lists, check-in feeds, and tabular data align
starts to whole ch units. This is derived from the constitution's ch-snap rule and
Space Mono's fixed cell. Dense mode is allowed only on directory browse, community
message lists, and cluster team lists. It reduces vertical inset by one named spacing
step and never type size or 44px targets.
4.3 depth, offset, and rotation
class
surface
outline
hard offset
rotation
flat working surface
ground/raised/raised-2
0 or 1px functional border
0
0
primary button
cream
2px near-black
4px blue-deep
0
chip
raised
2px white
2px blue-deep
0
leading card
raised
2px white
6px blue-deep
alternating -2° to -1° or 1° to 2°
following card
raised
0
0
0
spot drawing
illustration fill
3px
4px
alternating -3° to -1° or 1° to 3°
feature drawing
illustration fill
4px
6px
alternating -3° to -1° or 1° to 3°
full drawing
illustration fill
6px
8px
alternating -3° to -1° or 1° to 3°
The only blurred shadow is
semantic-shadow-overlay: 0 8px 32px rgba(0,0,0,0.6), used on menus, drawers, modals,
and toasts only. Cards, controls, and inputs never use it.
4.4 z-index
Values are consecutive ordinals, not arbitrary jumps, because only relative order
matters.
token
value
layer
primitive-z-base
0
page and content
primitive-z-sticky
1
page-content sticky headers and footers, and lifts within a component
primitive-z-chrome
2
persistent global chrome rendered by the app shell
primitive-z-menu
3
menu and tooltip
primitive-z-drawer
4
drawer and scrim
primitive-z-modal
5
modal and scrim
primitive-z-toast
6
toast live region
primitive-z-critical
7
permission or session-loss notice only
Within one layer, DOM order decides. No component may declare a literal z-index.
Insertion rule — new, added 2026-08-10 by founder decision. This is an addition to §4.4,
not a restatement of anything above it. Until this date §4.4 required values to be
consecutive ordinals and said nothing about what to do when a layer is inserted. It now says:
Inserting a layer shifts every layer above it up by one. No gaps are opened and none are
left behind. This applies to every future insertion, not only to the one that prompted it.
The first application of this rule was the insertion of primitive-z-chrome at 2 on
2026-08-10, which moved menu, drawer, modal, toast, and critical from 2–6 to 3–7.
For OPEN-ZINDEX-1's status, see §16, which is where marker status lives.
Note that the insertion lowered .mobile-sprint-bar relative to the layers above chrome: its
former literal 19 placed it above every layer including toast and critical, and at 2 it now
sits below menu, drawer, modal, toast, and critical. That is the intended ordering —
a focused skip link and a session-loss notice must paint over global chrome — but it is a
change in outcome, not a preservation of one.
primitive-z-sticky and primitive-z-chrome are distinguished by who mounts the element,
not by what it looks like or whether it uses position: sticky. Chrome is rendered by the app
shell and is present on every route; anything a page mounts is content, however fixed or
sticky it is. A lift within a component — an element raised only against its own siblings,
such as an absolutely-positioned input icon — stays on primitive-z-sticky and does not get
a layer of its own, because it cannot collide with chrome.
5. cartoon system
5.1 component decision table
component class
treatment
outline
offset
rotation
press or state behavior
primary button
sticker
2px near-black
4px blue-deep
0
translate 4px into offset; offset becomes 0
secondary/ghost/destructive button
flat outline or text
0 or 1px functional
0
0
translate 2px down; no shadow
leading card
sticker
2px white
6px blue-deep
±1° to ±2°
interactive card translates 2px; offset becomes 4px
following card
flat
0
0
0
surface step only
input, textarea, select
quiet
2px
0
0
focus ring only
chip
spot sticker
2px
2px blue-deep
0
translate 2px; offset becomes 0
toast
sticker
2px white
4px blue-deep
0
enter overshoots once
menu, drawer, modal
quiet floating
0 or 1px functional
0
0
functional enter only
checkbox, radio, toggle
outline construction
2px
0
0
instant mark change
skeleton/loading
quiet
0
0
0
no loop or shimmer
contribution graph
permanently flat
0 or 1px divider
0
0
never animates
5.2 press physics
Pointer and keyboard activation use the same visible active state. On pointerdown, or
while Space/Enter activates a focused button:
use motion-instant, 100ms linear;
transform the primary button by translate(4px, 4px) scaleY(0.96);
collapse its hard offset from 4px 4px 0 to 0 0 0;
on release, return with motion-state, 160ms cubic-bezier(.2,0,0,1);
settle once, with no bounce.
Secondary, ghost, and destructive buttons use translateY(2px) and no scale. Chip active
uses translate(2px, 2px). Reduced motion uses no transform or scale; the active fill or
mark still changes within 100ms opacity timing.
5.3 cartoon-free zones
No figure, device, hard sticker rotation, expressive motion, or comic copy appears on:
directory browse and any repeated surface with more than 20 rows;
project pages and builder work media;
contribution graph;
check-in composer and all check-in evidence;
mentor sessions and notes about a person;
menus, drawers, modals, inputs, skeletons, and loading;
recoveries involving lost work, time, money, permission, or data;
destructive confirmation;
over-limit state;
stall signal;
any surface where another builder's work is the focal element.
The reason is fixed: drawing on work or evidence editorializes it, and levity around loss
or struggle is hostile.
5.4 hand-drawn checkbox tick
Use one open SVG path on the 24px grid:
<path d="M4 12.5 C6.8 15.2 8.3 16.7 10.6 18 C13.1 13.6 16.7 9.1 21 5.5"
      fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round"/>

Do not replace it with a font glyph, geometric polyline, or filled icon.
6. iconography
6.1 set and drawing contract
Use Lucide as the functional base set under its ISC license, rendered with
stroke-width="1.5", viewBox="0 0 24 24", fill="none",
stroke-linecap="round", and stroke-linejoin="round". This choice is derived:
Lucide supplies the PRD's required functional inventory on a 24px grid and can conform to
the locked stroke geometry without a parallel icon language. Do not use Lucide brand
logos or filled variants.
Custom icons are allowed only when Lucide lacks the product concept. They use a 20px
optical keyline inside the 24px viewBox, 2px minimum internal gap, 2px corner radius for
rectilinear forms, rounded terminals, no fill, and no more than 3 independent paths.
Custom work must look functional, not like the cartoon cast.
6.2 inventory
surface
required icons
persistent navigation
home, folders for directory, messages-square for community, library for learn, user-round for you, rocket for live sprint
global and collection
search, sliders-horizontal, x, chevron-down, chevron-left, chevron-right, arrow-left, external-link, link, copy
identity and project
pencil, upload, image, film, music, file-text, code-2, github, globe-2, map-pin, clock-3, eye, eye-off, plus, trash-2
connection and community
user-plus, message-circle, send, users-round, ban, bell-off, reply, paperclip, at-sign
archive and lectures
book-open, play, pause, rotate-ccw, rotate-cw, volume-2, volume-x, maximize-2, captions, check
sprint signup and team
user, user-round-plus, users, split, merge, calendar-days, timer, lock-keyhole, unlock-keyhole
check-ins and progress
notebook-pen, circle-help, circle-check, cloud-off, refresh-cw
workshops, drop, mentors, finale
video, radio, sparkles, hand-helping, presentation, door-open
overlays and status
info, triangle-alert, circle-alert, circle-check, x, menu
eye is for link visibility, not view counts. sparkles labels the named drop event or
AI assistance and is never decorative.
6.3 icon-only boundary, size, and targets
Icon-only controls are permitted only for:
play, pause, skip back 15, skip forward 15, mute, unmute, captions, and fullscreen in
media transport;
icons in persistent navigation when the desktop rail is collapsed. They retain
accessible names and visible tooltips;
mobile persistent navigation still shows text labels and is therefore not icon-only.
Close, delete, edit, filter, share, search, and every other icon must have a visible text
label.
Two render sizes exist: 16px inline with text and inside chips, 24px in navigation and
transport. A 24px icon receives 10px padding on every side for a 44px square target. A
16px icon-only target is not allowed. A 16px icon inside a labeled control uses at least
14px vertical distributed space so the total control height remains 44px. Align the
24px viewBox center to the text line box's optical center; do not apply per-icon pixel
nudges.
Fills, duotone, two-tone, variable stroke, tapered terminals, decorative icons, animated
icons, and iconography used for brand expression are forbidden.
7. component library and state contracts
7.1 state vocabulary
Every table uses these exact columns:
background, text, border, and offset name component or semantic tokens;
transform is the full transform, not an additive suggestion;
opacity references opacity-full or opacity-disabled;
cursor is the CSS cursor;
motion is the named transition used to enter the state.
focus in a border cell means the invariant 2px blue ring at 2px offset in addition to
the component's normal border. adjacent error means an error sentence immediately after
the control and aria-describedby joining the two. Loading never uses an indeterminate
spinner or shimmer.
7.2 button, all four variants
primary
state
background
text
border
offset
transform
opacity
cursor
motion
default
button-primary-bg
button-primary-text
button-primary-border
button-primary-offset
none
full
pointer
none
hover
button-primary-bg-hover
same
same
same
none
full
pointer
motion-state
focus-visible
default
same
default + focus
same
none
full
pointer
motion-state
active
button-primary-bg-active
same
same
0
translate(4px,4px) scaleY(.96)
full
pointer
motion-instant
selected
button-primary-bg-selected
same
same
0
translate(4px,4px)
full
pointer
motion-state
loading
default
same, action-specific present participle
same
same
none
full
wait
motion-state
disabled
default
same
same
same
none
disabled
not-allowed
none
read-only
default
same
same
same
none
disabled
default
none
error
default
same
button-primary-border-error + adjacent error
same
none
full
pointer
motion-state
secondary
state
background
text
border
offset
transform
opacity
cursor
motion
default
button-secondary-bg
button-secondary-text
button-secondary-border
0
none
full
pointer
none
hover
button-secondary-bg-hover
same
same
0
none
full
pointer
motion-state
focus-visible
default
same
default + focus
0
none
full
pointer
motion-state
active
button-secondary-bg-active
same
same
0
translateY(2px)
full
pointer
motion-instant
selected
button-secondary-bg-selected
content-accent
same
0
none
full
pointer
motion-state
loading
default
content-secondary
same
0
none
full
wait
motion-state
disabled
default
content-muted
same
0
none
disabled
not-allowed
none
read-only
default
content-secondary
same
0
none
full
default
none
error
default
same
border-error + adjacent error
0
none
full
pointer
motion-state
ghost
state
background
text
border
offset
transform
opacity
cursor
motion
default
transparent
button-ghost-text
transparent
0
none
full
pointer
none
hover
button-ghost-bg-hover
same
transparent
0
none
full
pointer
motion-state
focus-visible
transparent
same
transparent + focus
0
none
full
pointer
motion-state
active
surface-raised-2
same
transparent
0
translateY(2px)
full
pointer
motion-instant
selected
button-ghost-bg-selected
content-accent
transparent
0
none
full
pointer
motion-state
loading
transparent
content-secondary
transparent
0
none
full
wait
motion-state
disabled
transparent
content-muted
transparent
0
none
disabled
not-allowed
none
read-only
transparent
content-secondary
transparent
0
none
full
default
none
error
transparent
content-error
transparent + adjacent error
0
none
full
pointer
motion-state
destructive
state
background
text
border
offset
transform
opacity
cursor
motion
default
transparent
button-destructive-text
transparent
0
none
full
pointer
none
hover
button-destructive-bg-hover
same
transparent
0
none
full
pointer
motion-state
focus-visible
transparent
same
transparent + focus
0
none
full
pointer
motion-state
active
surface-raised-2
same
transparent
0
translateY(2px)
full
pointer
motion-instant
selected
surface-raised-2
same
border-error
0
none
full
pointer
motion-state
loading
transparent
content-error
transparent
0
none
full
wait
motion-state
disabled
transparent
content-muted
transparent
0
none
disabled
not-allowed
none
read-only
transparent
content-secondary
transparent
0
none
full
default
none
error
transparent
content-error
border-error + adjacent error
0
none
full
pointer
motion-state
Button loading retains its accessible name and changes the visible label to the specific
ongoing action, such as posting check-in. It sets aria-busy=true and prevents a
second activation.
7.3 input, textarea, and select
Each of these three primitives instantiates this complete nine-state contract through its
own aliases: input-*, textarea-*, and select-*. Textarea may grow vertically but
never horizontally. Select uses a text-labeled chevron and native or ARIA listbox
semantics.
state
background
text
border
offset
transform
opacity
cursor
motion
default
control-bg
control-text or control-placeholder
control-border
0
none
full
text, text, default
none
hover
control-bg-hover
same
same
0
none
full
text, text, default
motion-state
focus-visible
control-bg
control-text
default + focus
0
none
full
text, text, default
motion-state
active
control-bg
control-text
default + focus
0
none
full
text, text, default
motion-instant
selected
control-bg
selected text or option + content-accent mark
border-focus
0
none
full
text, text, default
motion-state
loading
skeleton-bg matching final control
visually hidden label
default
0
none
full
wait
motion-enter
disabled
control-bg
content-muted
default
0
none
disabled
not-allowed
none
read-only
control-bg
control-readonly-text
default
0
none
full
default
none
error
control-bg
control-text
control-border-error + adjacent error
0
none
full
text, text, default
motion-state
The three cursor entries map in order to input, textarea, and select.
7.4 checkbox, radio, and toggle
Checkbox is a 24px square within a 44px target and uses the path in section 5. Radio is a
24px circle with an 8px outlined inner circle, never a filled dot. Toggle is a 44px by
24px track inside a 44px-high target; its 20px outlined thumb moves exactly 20px.
state
background
text or mark
border
offset
transform
opacity
cursor
motion
default
selection-bg
none
selection-border
0
none
full
pointer
none
hover
surface-raised-2
none
same
0
none
full
pointer
motion-state
focus-visible
default
none
default + focus
0
none
full
pointer
motion-state
active
default
none
same
0
scale(.96)
full
pointer
motion-instant
selected
selection-bg-selected
selection-mark-selected
selection-border-selected
0
toggle thumb translateX(20px) only
full
pointer
motion-state
loading
skeleton-bg
none
default
0
none
full
wait
motion-enter
disabled
default
content-muted if selected
default
0
none
disabled
not-allowed
none
read-only
default
selected mark if applicable
default
0
none
full
default
none
error
default
selected mark if applicable
border-error + adjacent error
0
none
full
pointer
motion-state
7.5 chip
state
background
text
border
offset
transform
opacity
cursor
motion
default
chip-bg
chip-text
chip-border
chip-offset
none
full
default or pointer
none
hover
chip-bg-hover
same
same
same
none
full
pointer if actionable
motion-state
focus-visible
default
same
default + focus
same
none
full
pointer
motion-state
active
surface-raised-2
same
same
0
translate(2px,2px)
full
pointer
motion-instant
selected
default
chip-text-selected + check
border-focus
same
none
full
pointer
motion-state
loading
skeleton-bg
hidden
default
0
none
full
wait
motion-enter
disabled
default
content-muted
default
same
none
disabled
not-allowed
none
read-only
default
content-secondary
default
same
none
full
default
none
error
default
content-error
border-error + adjacent error
same
none
full
pointer
motion-state
7.6 avatar
Avatar is a 1:1 builder image with radius-pill; fallback uses the builder's authored
initials, never a generic stock face.
state
background
content
border
offset
transform
opacity
cursor
motion
default
surface-raised
image or initials
transparent
0
none
full
default
none
hover
same
same
border-control if linked
0
none
full
pointer if linked
motion-state
focus-visible
same
same
focus
0
none
full
pointer
motion-state
active
same
same
default
0
scale(.96) if linked
full
pointer
motion-instant
selected
same
same + text label outside
border-focus
0
none
full
pointer
motion-state
loading
skeleton-bg
none
transparent
0
none
full
wait
motion-enter
disabled
same
same
transparent
0
none
disabled
not-allowed
none
read-only
same
same
transparent
0
none
full
default
none
error
surface-raised
initials + adjacent error
border-error
0
none
full
default
motion-state
7.7 icon
state
background
stroke
border
offset
transform
opacity
cursor
motion
default
transparent
inherits labeled control text
transparent
0
none
full
inherit
none
hover
transparent
inherits hover text
transparent
0
none
full
inherit
motion-state
focus-visible
transparent
inherits
focus belongs to parent control
0
none
full
inherit
motion-state
active
transparent
inherits active text
transparent
0
none
full
inherit
motion-instant
selected
transparent
content-accent plus text or checked cue
transparent
0
none
full
inherit
motion-state
loading
transparent
content-muted
transparent
0
none
full
inherit
none
disabled
transparent
content-muted
transparent
0
none
disabled
inherit
none
read-only
transparent
content-secondary
transparent
0
none
full
inherit
none
error
transparent
content-error plus text
transparent
0
none
full
inherit
motion-state
The icon itself is never independently focusable unless it is one of the permitted
icon-only controls. In every other case, the labeled parent owns state and focus.
7.8 link
state
background
text
border or decoration
offset
transform
opacity
cursor
motion
default
transparent
link-text
underline
0
none
full
pointer
none
hover
transparent
same
underline thickness remains 1px
0
none
full
pointer
motion-state
focus-visible
transparent
same
underline + focus
0
none
full
pointer
motion-state
active
transparent
link-text-active
underline
0
none
full
pointer
motion-instant
selected
transparent
link-text
2px underline + aria-current
0
none
full
pointer
motion-state
loading
transparent
content-secondary
underline
0
none
full
wait
motion-state
disabled
transparent
content-muted
no underline
0
none
disabled
not-allowed
none
read-only
transparent
content-secondary
underline only when it remains navigable
0
none
full
default or pointer
none
error
transparent
content-error
underline + adjacent error
0
none
full
pointer
motion-state
7.9 tooltip
state
background
text
border
offset
transform
opacity
cursor
motion
default
overlay-bg
overlay-text
overlay-border
overlay shadow
translateY(0)
full
default
motion-enter
hover
same
same
same
same
none
full
default
motion-state
focus-visible
same
same
same
same
none
full
default
motion-state
active
same
same
same
same
none
full
default
none
selected
same
same
same
same
none
full
default
none
loading
same
content-secondary
same
same
none
full
wait
none
disabled
not rendered
none
none
none
none
0
default
none
read-only
same
same
same
same
none
full
default
none
error
same
content-error plus text
border-error
same
none
full
default
motion-state
Tooltips contain one short label, are not interactive, and never hold essential
information unavailable elsewhere.
7.10 skeleton
state
background
text
border
offset
transform
opacity
cursor
motion
default
skeleton-bg
none
transparent
0
none
full
default
motion-enter
hover
same
none
transparent
0
none
full
default
none
focus-visible
same
none
transparent
0
none
full
default
none
active
skeleton-bg-active
none
transparent
0
none
full
default
motion-state
selected
same
none
transparent
0
none
full
default
none
loading
same
none
transparent
0
none
full
wait
none
disabled
same
none
transparent
0
none
disabled
default
none
read-only
same
none
transparent
0
none
full
default
none
error
replaced by partial or error state
none
none
0
none
full
default
motion-state
Skeletons match final geometry. They never shimmer, pulse, rotate, or imply a percentage.
7.11 divider
state
background
text
border
offset
transform
opacity
cursor
motion
default
transparent
none
divider-line
0
none
full
default
none
hover
same
none
same
0
none
full
default
none
focus-visible
same
none
same
0
none
full
default
none
active
same
none
same
0
none
full
default
none
selected
same
none
divider-line-selected only inside tab indicator
0
none
full
default
motion-state
loading
same
none
divider-line
0
none
disabled
default
none
disabled
same
none
divider-line
0
none
disabled
default
none
read-only
same
none
divider-line
0
none
full
default
none
error
same
none
divider-line-error only when separating an error summary
0
none
full
default
motion-state
7.12 normalized composite state profiles
Composite and pattern states use the following exact profiles. This normalization avoids
copying the same nine-row contract into 32 places while still binding every component to
all nine states. A mapping below names the profile and the component-specific base
bindings; applying the profile is mechanical, with no design judgment.
profile static-flat
state
background
text
border
offset
transform
opacity
cursor
motion
default
base
base
base
base
none
full
default
none
hover
base
base
base
base
none
full
default
none
focus-visible
base
base
base
base
none
full
default
none
active
base
base
base
base
none
full
default
none
selected
base
base plus explicit selected label
border-focus if selection applies
base
none
full
default
motion-state
loading
final-geometry skeleton
none
base
0
none
full
wait
motion-enter
disabled
base
content-muted
base
base
none
disabled
default
none
read-only
base
content-secondary
base
base
none
full
default
none
error
base
base plus adjacent error
border-error where bounded
base
none
full
default
motion-state
profile interactive-flat
state
background
text
border
offset
transform
opacity
cursor
motion
default
base
base
base
0
none
full
pointer
none
hover
one permitted surface step
base
base
0
none
full
pointer
motion-state
focus-visible
base
base
base + focus
0
none
full
pointer
motion-state
active
hover
base
base
0
translateY(2px)
full
pointer
motion-instant
selected
base
content-accent plus text cue
border-focus
0
none
full
pointer
motion-state
loading
final-geometry skeleton
none
base
0
none
full
wait
motion-enter
disabled
base
content-muted
base
0
none
disabled
not-allowed
none
read-only
base
content-secondary
base
0
none
full
default
none
error
base
base plus adjacent error
border-error
0
none
full
pointer
motion-state
profile interactive-sticker
state
background
text
border
offset
transform
opacity
cursor
motion
default
base
base
border-strong
base offset
base rotation
full
pointer
none
hover
one permitted surface step
base
same
base offset
base rotation
full
pointer
motion-state
focus-visible
base
base
strong + focus
base offset
base rotation
full
pointer
motion-state
active
hover
base
strong
offset minus 2px
base rotation + translate(2px,2px)
full
pointer
motion-instant
selected
base
base plus text cue
border-focus
base offset
base rotation
full
pointer
motion-state
loading
final-geometry skeleton
none
strong
0
none
full
wait
motion-enter
disabled
base
content-muted
strong
base offset
base rotation
disabled
not-allowed
none
read-only
base
content-secondary
strong
base offset
base rotation
full
default
none
error
base
base plus adjacent error
border-error
base offset
base rotation
full
pointer
motion-state
profile overlay
state
background
text
border
offset
transform
opacity
cursor
motion
default
overlay-bg
overlay-text
overlay-border
overlay shadow
none
full
default
motion-enter
hover
same
same
same
same
none
full
default
motion-state
focus-visible
same
same
focus on first focusable child
same
none
full
default
motion-state
active
same
same
same
same
none
full
default
motion-instant
selected
same
same plus selected child cue
same
same
none
full
default
motion-state
loading
same with final-geometry skeleton
none
same
same
none
full
wait
motion-enter
disabled
same
content-muted
same
same
none
disabled
default
none
read-only
same
content-secondary
same
same
none
full
default
none
error
same
same plus adjacent error
border-error only around failing region
same
none
full
default
motion-state
profile transport
state
background
text
border
offset
transform
opacity
cursor
motion
default
base
base
base
0
none
full
pointer
none
hover
surface-raised-2
base
base
0
none
full
pointer
motion-state
focus-visible
base
base
base + focus
0
none
full
pointer
motion-state
active
surface-raised-2
base
base
0
scale(.96)
full
pointer
motion-instant
selected
base
content-accent plus pressed label
border-focus
0
none
full
pointer
motion-state
loading
base
content-secondary
base
0
none
full
wait
motion-enter
disabled
base
content-muted
base
0
none
disabled
not-allowed
none
read-only
base
content-secondary
base
0
none
full
default
none
error
base
content-error plus text
border-error
0
none
full
pointer
motion-state
7.13 composite bindings
composite
profile
base background / text / border / offset and fixed rule
card, leading
interactive-sticker if actionable, otherwise static-flat
raised / primary / strong / 6px, ±1° to ±2°
card, following
interactive-flat or static-flat
raised / primary / transparent / 0
list row
interactive-flat
ground / primary / bottom divider / 0
media tile
interactive-flat
ground / primary / transparent / 0; radius 0
avatar cluster
static-flat
transparent / primary / transparent / 0; DOM order equals visual order
empty state
static-flat
ground / primary / transparent / 0; one permitted figure by state class
toast
interactive-sticker
raised-2 / primary / strong / 4px; one line, 3 seconds
modal
overlay
raised-2 / primary / default / overlay shadow; black scrim at opacity-scrim
drawer
overlay
raised-2 / primary / default / overlay shadow; black scrim at opacity-scrim
menu
overlay
raised-2 / primary / default / overlay shadow
tab set
interactive-flat per tab
ground / primary / transparent / 0; selected tab has 2px accent underline and aria-selected
filter bar
interactive-flat per chip/control
ground / primary / bottom divider / 0; state always visible
search field
input contract
raised / primary / default / 0; results grouped by object type
pagination
interactive-flat per action
ground / primary / transparent / 0; no popularity ordering
form group
static-flat
transparent / primary / transparent / 0; label, control, hint/error in DOM order
comment
static-flat
ground / primary / bottom divider / 0
message bubble
static-flat
raised / primary / transparent / 0; no status by color alone
waveform player
transport
blue-deep / white / transparent / 0
code card
interactive-flat
raised / primary / default / 0; repo/domain, language, update
type specimen card
interactive-flat
raised / primary / default / 0; real opening lines in Satoshi
7.14 pattern bindings
pattern
profile
base binding and non-negotiable behavior
profile header
static-flat; action row uses button contracts
ground / primary / transparent / 0; explicit timezone, no counts
contribution graph
static-flat
ground / primary / default timeline / 0; read-only, no animation, text alternative
project card
interactive-flat
ground / primary / transparent / 0; equal media representations, attribution at body-s minimum
builder card
interactive-flat
ground / primary / default / 0; never drive, hours, availability, or match score
suggestion
interactive-flat
ground / primary / default / 0; public-fact reason, follow and message, no reject affordance
check-in composer
form group plus textarea
ground / primary / default / 0; two fixed prompts, private audience sentence
team strip
interactive-flat
ground / primary / bottom divider / 0; always visible in sprint surfaces
cluster board
static-flat containing team strips
ground / primary / transparent / 0; flat order only
reel
static-flat
ground / no UI text / transparent / 0; 3x3 desktop, 2x3 mobile, hard cuts
session card
interactive-flat
raised / primary / transparent / 0; explicit zone, join is sole accent
Any state not semantically applicable still renders the named profile row rather than
being omitted. A new component must identify its layer, bind all nine rows before visual
work, accept all five media types if relevant, and introduce no new token value.
8. layout archetypes
Every screen must name one archetype in its implementation note. If none fits, stop and
ask. Every archetype begins top-left with one lowercase display line, except the centered
marketing hero. Every terminal area contains the next work or person, not an empty footer.
8.1 stream
viewport
exact layout
375px
4-column grid; 16px margins; title then 32px group gap; one column capped at 343px; items separated by 1px line; 44px minimum rows
tablet
8-column grid; stream occupies 6 columns; 2 columns may hold persistent area navigation; 32px margins
desktop
240px rail plus main; stream is at most 60ch; prose inside 55ch; related context may occupy 3 adjacent grid columns
First viewport contains the page name, area context, composer or first real item, and real
people. Blue may appear on the single post or join action and on links or focus states,
never as multiple filled cards. Cards, reel, decorative banners, infinite scroll, and
more than one spot drawing are forbidden.
8.2 collection
viewport
exact layout
375px
title, filter/search bar, visible removable chips, then one media-forward column; 64px section rhythm
tablet
title and filter bar across 8 columns; 2 equal item columns with 16px gutter
desktop
title and persistent filters above a 3-column grid within 1200px; 24px gutters
First viewport contains the page name, filter state, and at least one real item or an
adjacent-result empty state. The sole blue filled element may be the primary add/start
action. Project media outranks the action and therefore removes a competing large accent.
Popularity sort, featured rows, unequal software-card size, rotated repeated cards, and
cartoon treatment on directory browse are forbidden.
8.3 record
viewport
exact layout
375px
title or builder identity, focal media/avatar/graph, then evidence; actions follow identity and remain reachable without overlay
tablet
focal media or graph spans 8 columns; identity and action row sit above; evidence stacks below
desktop
focal media or graph spans 8 of 12 columns; metadata/actions occupy 4; evidence follows at 96px section rhythm
First viewport is media for a project, or person plus graph for a profile. Blue is limited
to the single minimal action or linked metadata. Project pages contain no cartoon
elements, platform decoration, count, popularity signal, or cropped 16:9 hero. Builder
authored media and prose are not transformed.
8.4 workspace
viewport
exact layout
375px
page name, always-visible team strip, current work, then conversation or controls; one column
tablet
people strip spans 8 columns; active work uses 5 columns and conversation 3
desktop
people/context occupies 3 columns; active work occupies 6; conversation or schedule occupies 3; rail remains visible
First viewport always shows who is in the room and what the room is doing. Blue belongs
to join, post, or the current single action. Simulated presence, activity ranking,
progress comparison, large brand art, and hidden team context are forbidden.
8.5 passage
viewport
exact layout
375px
one decision, one 55ch-or-narrower explanation, one control group, one primary action; 16px margins
tablet
content occupies 6 centered grid columns but text remains left aligned
desktop
content occupies 5 columns offset 1 column from the main start; never centered text except a marketing/signup completion moment
First viewport contains the decision, enough context to make it, and its action. Blue is
reserved for focus, link, active, or selected cues because the primary button is cream.
Progress bars, mandatory-looking checklists, multiple decisions, and an arrow on
returning-user passages are forbidden.
8.6 classification rule
Use stream for chronological authored items, collection for browseable made things,
record for one person or project, workspace for a small group acting together, and
passage for a linear decision flow. A new screen fitting two archetypes must be split. A
screen fitting none is blocked pending founder review.
A route may name two archetypes when a named application state governs how they appear, and
only then. Its implementation note names both archetypes and the state. The state may select
one archetype, or it may compose both on the same route in a stated order — where it composes,
the archetype named first owns the first viewport and the other follows below it, and both are
named in that order. Each archetype's contract is satisfied in full wherever it renders:
its first-viewport requirement where it is first, its content requirements wherever it sits,
and its forbidden list everywhere on the route. A rendering that satisfies neither contract
completely is a split, not a state. The state is a server-resolved fact about the request,
never a viewport, a client preference, or a builder-facing toggle. This is the single
exception to the split rule above: two archetypes reachable at one URL by any other means is
still a screen that must be split.
The only named application state is sprint mode — a sprint is running and this person is
in it, as a builder or as a mentor (founder decision D-Y, docs/open-decisions.md). Naming a
second application state is a founder decision, not a build decision.
9. navigation
9.1 mobile bottom bar
Position fixed to the bottom, z-index z-sticky, ground fill, 1px line top border.
Content height is 56px plus env(safe-area-inset-bottom).
The safe area is padding below the 56px item row, never included in the touch target.
Each destination has a 24px icon, an always-visible type-label label, and at least a
44px target.
Maximum is 5 items. Equal-width items divide the available width.
At 375px, bottom-bar labels use zero tracking under accessibility precedence so the
fixed directory and community names do not overlap. Font family, size, weight,
case, and every non-navigation type-label use remain unchanged.
Active uses content-accent on icon and label plus aria-current=page; inactive uses
content-secondary. Color is backed by the text label and current-page semantics.
No badge, count, dot, shadow, animated indicator, or icon-only label hiding.
The persistent order is home, directory, community, learn, you.
9.2 desktop rail
At 1024px and above, reserve 240px on the left, ground fill, 1px line right border.
Inset is 24px; destination gap is 8px; every destination row is at least 44px.
The wordmark or interim lowercase Satoshi wordmark occupies the first group.
Persistent destinations follow in mobile order. Account and sign-out controls form the
final group.
Collapse is a builder action. Collapsed width is 64px, icons remain 24px, every item
retains an accessible name and visible tooltip. Expanding restores labels.
Active state matches mobile and does not use a filled pill.
9.3 live sprint item
When a sprint is live, a sprint destination with the rocket icon appears after
community. When the sprint ends, the DOM node and route affordance are removed in one
state change; the list reflows with no reserved slot, disabled control, opacity change,
or dead route. Sprint records remain reachable from profiles, projects, and spaces.
OPEN-NAV-1 resolved 2026-07-23: desktop uses the temporary sixth rail item.
Mobile keeps exactly five persistent bottom-bar destinations and shows a separate,
labeled open sprint action in the mobile header while the sprint is live. It never
replaces, hides, or creates a sixth bottom-bar destination.
Placement correction, 2026-08-19 (founder decision D-Y). "Mobile header" above names
the action's role and position, not a <header> element. The placement it requires is the
app shell's persistent chrome at the top of the main region, above page content, and §16's
OPEN-ZINDEX-1 entry already describes the shipped action there. A shell that renders this
action inside <main> satisfies this subsection; the absence of a <header> element is not
a defect against it.
9.4 navigation motion and persistence
event
motion
active text/icon change
motion-state
rail collapse or expand
rail layout changes once at transition start; labels use motion-view opacity plus at most 8px horizontal transform; width itself does not animate
sprint item insert or removal
motion-enter, opacity plus at most 8px vertical movement; reduced motion uses 100ms opacity only
route transition
motion-view; no scale and no ground movement
back to collection or stream
restore session filter, scroll, and draft before paint
Profiles, projects, and public posts have permanent logged-out URLs. Back navigation
restores scroll, filters, and draft text. Forward route changes move programmatic focus
to the main heading after the new title is announced. Browser and operating-system back
gestures are never intercepted.
9.5 home is a destination, not a fixed surface
home names a destination. It does not name one surface. Its slot, icon, label, and
position in the persistent order at §9.1 are fixed and never change; what it resolves to may
change with a named application state under §8.6. Outside sprint mode home resolves to the
steady-state home. Inside sprint mode it composes: the room that person is in — a builder's
team, a mentor's cluster — occupies the first viewport, and the steady-state home follows below
it on the same route. This composition is the resolution of home for every visit inside the
state, not only a first visit; §12.2 adds what a first visit must additionally contain. A
person in the sprint in more than one capacity gets the builder resolution, and their other
surface stays reachable at its own address (founder decision D-Y).
§9.1's persistent order therefore constrains position and never content. A destination whose
content is state-dependent keeps its label unchanged across the change: the label names
where the builder is going, not what they will find, and a label that renamed itself would
make the nav report a state the builder did not choose.
The change is not announced by the navigation. No badge, dot, count, highlight, animation,
or "new" affordance marks a destination whose content has changed, and the change itself is
not a transition to animate; §9.4 governs the sprint item's insertion and nothing else. The
builder learns the state from the surface they land on, in plain copy, and never from
decoration on the way to it.
One URL per destination in every state. A state never gives a destination a second address
and never removes the address it had, so a link, a bookmark, and a back gesture resolve the
same way in both states.
10. motion system
10.1 primitive and semantic tokens
primitive
value
semantic alias
primitive-duration-100
100ms
motion-instant
primitive-duration-160
160ms
motion-state
primitive-duration-220
220ms
motion-enter
primitive-duration-280
280ms
motion-view
primitive-duration-500
500ms
motion-reel-cadence
primitive-delay-30
30ms
motion-list-stagger
primitive-delay-40
40ms
motion-anticipation
primitive-delay-55
55ms
motion-reel-stagger
primitive-delay-60
60ms
motion-follow-through
primitive-duration-120
120ms
motion-overshoot-settle
primitive-ease-linear
cubic-bezier(0,0,1,1)
instant feedback
primitive-ease-standard
cubic-bezier(.2,0,0,1)
state and element change
primitive-ease-view
cubic-bezier(.4,0,.2,1)
view change
primitive-ease-step
steps(1,end)
reel hard cut
10.2 mapping
interaction
duration
easing
transform ceiling
button press, checkbox, toggle
instant
linear
section 5 exact transform
hover, focus, expand
state
standard
0 unless specified
menu, toast, drawer enter/exit
enter
standard
one axis, 8px maximum
page or rail transition
view
view
one axis, 8px maximum
list entry
enter
standard
8px; 30ms stagger through item 6, then simultaneous
reel
500ms cadence, 55ms tile stagger
step
none, hard content cut
Expressive motion is allowed only for first run, signup completion, first check-in, team
formation, the drop, project publication, and finale.
10.3 cartoon physics
Anticipation moves an expressive element 3px against travel for 40ms.
Entering cards and toasts overshoot their final position by 8% of the travel distance
and settle for 120ms. Inputs, menus, and functional controls never overshoot.
Button squash is at most 4% and only along travel.
One figure part may follow 60ms behind the body.
Exactly one settle is allowed. A bounce sequence is a defect.
Entering movement is one axis and 8px maximum. Scale and fade never occur together.
Nothing loops except the reel. Counts never count up. The graph never animates.
Any response begins within 100ms. Work longer than 400ms displays matching skeletons.
Motion never blocks input. A new action interrupts and resolves the current transition
immediately to its new target state.
10.4 reduced motion
prefers-reduced-motion: reduce sets every transform distance, rotation animation,
anticipation, overshoot, follow-through, stagger, and squash animation to 0. Static
rotations and full sticker offsets remain, because form is not motion. All remaining
state changes use a 100ms opacity transition.
component
reduced behavior
button/chip
no transform or scale; fill, border, text, and checked cue still change
card/toast
render directly at resting position with full static offset and rotation
menu/drawer/modal
100ms opacity only; focus management unchanged
list
all items render together; no stagger
drawn figure/device
final settled pose is static; meaningful copy remains
burst
static burst remains
contribution graph
unchanged because it never animates
reel
freezes as the complete 2x3 or 3x3 grid; no tile cycles
11. content, voice, and microcopy
11.1 terminology lock
forbidden in system copy
required
user, member, student
builder
submission, entry, product
project
build when the medium may be non-software
make
cohort for the two-week program
sprint
group for sprint makers
team
pod, house, cohort subgroup
cluster
update when referring to the every-other-day obligation
check-in
showcase, gallery, marketplace
directory
forum, server
community
submit
post, publish, save, or upload plus the object
click here
verb plus object
learn more
name the destination
11.2 grammar
Product copy is lowercase except proper nouns and type-eyebrow.
Builder-authored copy is preserved exactly.
Em dash, en dash, and exclamation mark are forbidden in system copy.
Avoid negative parallelism, aphorisms, forced groups of three, significance inflation,
and fake emphasis.
Labels begin with a verb and name the object.
Errors use one sentence: [what happened], [what to do next].
Confirmations name the result, such as check-in posted.
Numerals are always digits. In-product dates use 22 jul. Email uses 22 july 2026.
In-product time uses 09:30 America/Los_Angeles (UTC−07:00) with the real IANA zone
and current numeric offset. Never show an unlabeled abbreviation such as PST.
Sprint duration is 2 weeks, not 14 days.
11.3 six flow-specific errors
that file is over 50mb, try a smaller one.
the upload stopped before it finished, retry the demo video.
that timezone does not match an IANA zone, choose one from the list.
the bio draft was not saved, review it and choose save bio.
this builder cannot receive messages, return to their profile.
the sprint closed on 22 jul, join the next sprint waitlist.
No error is a modal. Each appears beside its cause and connects through
aria-describedby.
11.4 empty state catalog
Every line contains state plus exactly one next route. Suggested people and projects use
real accumulated data, never placeholders.
surface
exact example
new home
start with a guided make or meet a builder working near your timezone.
own projects
no projects here yet. explore the directory, then add what you're making.
public profile with no projects
this builder has not shared a project yet. see what they care about making.
contribution graph
nothing here yet, which is honest. post a project update when you make something.
directory before first finale
the first sprint projects land on finale day. explore projects added outside a sprint.
directory filter
no projects match these filters. remove one filter to see nearby work.
people search
no builders match that search. widen the timezone or interest filter.
passive suggestions unavailable
no suggestions fit yet. search the directory for a builder to meet.
active discovery query
no builders fit every part of that request. remove one constraint and ask again.
connections
you have not met anyone here yet. find a builder whose work you want to know.
direct messages
no messages yet. find a builder and start a conversation.
community area
the conversation starts with what people are making. read the latest community share.
regional area
this regional area is quiet right now. join the latest community-wide share.
own team space
your team has not posted here yet. share what you're working on.
persisted teams
no standing team is active here. find a former teammate in your connections.
archive
no guided makes match this medium. explore another medium.
archive progress
you have not started a guided make. choose one that fits the medium you want to try.
lecture library
no talks match this topic. browse all recorded talks.
sprint home, team has done nothing yet
your team has not made anything yet. open the team space and say what you want to make.
sprint check-ins
your first check-in opens on day 2. see what your team is making.
sprint team posts
your team has not shared its first post. show the part someone else can experience.
convergence suggestions
no shared direction is drafted yet. add each teammate's creative pull and try again.
mentor sessions
no mentor session is scheduled. view the open mentor pool.
workshop chat
no one has posted in this workshop chat. ask the first question.
wildcard asks
your team has not made an ask. write the one response that would help most.
finale room before start
the room opens at 09:30 America/Los_Angeles (UTC−07:00). view the team list.
ended sprint
this sprint is now a record. join the community's weekly share.
Search and filter empties also render 3 adjacent real results when available. First-run
home shows the archive, 3 suggested builders, and latest community activity before any
personal emptiness.
12. states, edge cases, and failure design
Every non-ideal state contains a plain state sentence, an honest reason when known, and
exactly one next action. Partial data renders; one failed section never blocks a whole
view.
12.1 state by surface class
surface class
loading
empty
partial
error
offline
permission
stream
row-shaped skeletons
real recent activity or person route
loaded posts remain; gap sentence inline
inline sentence plus retry
top banner, queued posts labeled queued
private area reason plus route back
collection
tile-shaped skeletons
adjacent real results
loaded tiles remain; missing group named
failed group gets retry, other groups remain
banner; cached items remain
unavailable private items omitted, explanation shown
record
media/header skeletons
evidence route, never blank identity
loaded identity remains; missing evidence named
failing section only gets retry
cached record remains with banner
exact field or surface reason
workspace
people strip and work-shaped skeletons
first action plus visible people
available work remains; failed pane named
inline pane recovery
queued messages/check-ins preserved
name required role and how to obtain it
passage
final-control skeleton only when necessary
not applicable, show first decision
saved answers remain, failed step named
adjacent to the failing control
preserve draft, banner, retry
explain missing account/team relationship
Loading longer than 400ms uses skeletons matching final geometry. Only a full-page
session restore may use a spinner, with an accessible label. Progress percentages are
never used on people or indeterminate work.
12.2 first-run and beginner contract
A first visit must show available substance before absence:
one guided make from the archive;
exactly 3 suggested builders, with public-fact reasons and no score;
the latest real community activity;
one clear route to complete structured profile fields;
no zero count, empty graph emphasis, blank dashboard, progress meter, or mascot praise.
The full cartoon register is allowed once here: one feature-tier tool-of-making figure
and one arrow device. The copy remains plain and never claims the builder is behind.
A first visit during sprint mode composes with this contract and never replaces it
(founder decision D-Y). The room that person is in — a builder's team, a mentor's cluster —
is rendered above, and items 1 through 4 follow below it on the same route. All five items are
still satisfied: a first visit inside the state shows one guided make, exactly 3 suggested
builders, the latest real community
activity, and one route to complete structured profile fields, and item 5 binds the team
block as well as everything under it. A sprint home that omits any of items 1 through 4 is
incomplete, not an alternative contract.
This is the one place the sprint-mode ordering overrides §11.4. §11.4 closes with
"First-run home shows the archive, 3 suggested builders, and latest community activity before
any personal emptiness." Inside sprint mode that ordering is inverted by founder decision D-Y:
the team block is first even when the team has done nothing yet. The rest of that sentence
stands — all three items still appear, and they still appear before any other personal
emptiness on the route. Outside sprint mode §11.4's ordering is unchanged.
Item 5 is the binding constraint on the team block itself. The team's own emptiness on the
first day of a sprint is stated once, in the words at §11.4, and is never filled. No sample
post, no suggested first message, no prompt written as though a teammate wrote it, no
presence or activity indicator, no countdown, and no progress meter, bar, ring, or percentage
drawn from elapsed days or from work done. The meter item 5 forbids is a shape whose fill is a
function of elapsed time or of work done.
A sprint surface may state where the calendar is, as text. It may not draw it
(founder decision D-Z). "day 4 of 14" is a fact, and so is the name of the beat the sprint is
on; either may be written on a sprint surface, including the home. What stays forbidden is the
shape: a bar, a ring, a percentage, or anything else whose length or fill is a function of
elapsed time or of work done. Text stating a fact is allowed; a shape that grows is not. The
day number carries no judgement — it does not say the builder is behind, ahead, or on track,
and it is never paired with a target, a pace, or a remaining-work figure, because a number
that implies a rate is a meter written in words.
An earlier version of this amendment left this unsettled and told a session to stop and ask.
It is now ruled, and app/sprint/page.tsx's "day N of 14" is permitted rather than merely
tolerated.
The activity prohibition in this section forbids MANUFACTURED activity. It does not forbid
reporting real activity (founder decision D-Y sub-ruling, recorded 2026-08-21, written in here
2026-08-23). "No presence or activity indicator" sits in a list every other item of which is a
fabrication: a sample post, a suggested first message, a prompt written as though a teammate wrote
it. Read flat, it would also forbid item 3 of this same section, which REQUIRES the latest real
community activity, and it would forbid a sprint home from saying that a teammate did something a
teammate actually did.
The founder's reasoning, recorded: every other item in that list is a fabrication, and a sentence
saying a real teammate really did a real thing is the opposite of the failure the clause exists to
prevent. The sentence they all hang off settles it. The team's own emptiness is never filled is
a rule about not inventing substance the team does not have. Stating substance the team does have
is not filling emptiness; it is the emptiness genuinely having ended.
So the test is provenance, not shape. Did the platform observe this, or did the platform compose
it? An observed fact about a real person's real action may be stated. Anything the platform
composed to stand in for activity that did not happen may not, and nothing here relaxes item 5's
ban on a meter, a countdown, or any shape whose fill is a function of elapsed time or work done —
a real fact rendered as a growing bar is still a meter.
12.3 stall signal
Trigger: 2 consecutive missed sprint check-ins. Audience: the builder, their teammates,
and operators only. It never appears on a public profile, project, directory, discovery
result, connection, or contribution graph.
property
exact value
archetype
workspace inline observation
surface
surface-raised
text
content-primary; timestamp in content-secondary
border
1px border-default on the left, not red or yellow
icon
none
cartoon
none
motion
none
heading
we haven't heard from [name] in 2 check-ins.
action copy
to the builder: post a check-in when you can. to a teammate: send [name] a message.
accessibility
status is text, not color; no assertive live announcement
It is a teammate noticing, not a system warning. It never says inactive, at risk,
behind, failed, or noncompliant.
12.4 fixed edge states
Team below 3: your team changed after a move. you're now making with [team name].
Wildcard miss: we couldn't get this one. here's who we tried.
Sprint ended: preserve the record and point to the weekly community share.
Over limit: state the limit, current number, and one alternative; no cartoon.
Lost work, money, permissions, or data: flat copy, no illustration, no expressive
motion, and no comic beat.
Deprecated surface: replacement link remains for 1 full release cycle.
13. accessibility
Target WCAG 2.2 AA for all interface content and AAA for body text on its permitted
grounds. Section 2 is the measured evidence. content-secondary is metadata, not body
prose; content-muted is non-essential or large UI only.
13.1 focus and touch
Every focusable element renders a 2px border-focus ring at 2px offset. On ground,
raised, and raised-2 it measures 8.00, 7.35, and 6.63 respectively. The 2px offset around
a cream button exposes its dark parent surface, so the ring is measured against that
surface rather than against the cream fill. Focus is never suppressed.
Touch math:
content
minimum target construction
24px icon-only permitted control
10px on each side = 44px
16px icon plus label
control min-height 44px; at least 14px distributed vertical space around icon
15px button label at line-height 1
12px vertical inset produces 39px, so min-height 44px governs
24px checkbox/radio
10px invisible hit inset each side = 44px
24px toggle track
10px vertical hit inset = 44px high
dense rows
min-height remains 44px after one-step visual inset reduction
13.2 color-independent meaning
color use
required secondary cue
focus blue
2px ring geometry and keyboard focus
active/selected blue
checked mark, underline, aria-current, aria-selected, or explicit text
success green
shipped, posted, or other literal label
error red
adjacent error sentence and erroneous semantics
warning yellow
literal offline or caution label
cream primary action
action label, sticker outline, and hard offset
graph mark type
type text and inspectable content, not color
13.3 keyboard map
pattern
keys and exact behavior
global page
Tab follows visual and DOM order; Shift+Tab reverses
button/link
Enter activates; Space activates button, checkbox, radio, and toggle
menu
Arrow Up/Down moves; Home/End first/last; Enter selects; Escape closes and restores trigger
select/listbox
Arrow Up/Down changes active option; Enter commits; Escape cancels
radio group
Arrow keys move and select; Tab enters and leaves the group once
tab set
Arrow Left/Right moves; Home/End first/last; selected panel follows documented automatic activation only when instant
collection grid
normal Tab order; arrow keys only when implemented as an ARIA grid
modal/drawer
focus enters first meaningful control, traps, Escape closes, and returns to opener
tooltip
appears on trigger focus and hover; Escape dismisses without moving focus
media transport
Space play/pause when player focused; arrows seek only inside player; captions remain keyboard reachable
contribution graph
each inspectable mark is a dated link in chronological DOM order; text alternative follows
reel
not focusable and not interactive
13.4 screen reader requirements
composite or pattern
required semantics
nav
<nav aria-label="primary">; current destination aria-current=page
filter bar
named group; removable chips state their filter and remove action
search
<search> or named form; result groups are headings, never one ranked list
modal/drawer
dialog name and description, aria-modal=true for modal, focus trap and restoration
menu
trigger expanded/control relationship; menu and item roles only for action menus
tabs
tablist, tab, tabpanel relationships and selected state
toast
polite live region; specific one-line confirmation
form group
visible label; hint/error ids in aria-describedby; aria-invalid on error
avatar cluster
real builder names in DOM order; overlapping visuals do not hide names
media
alt, transcript, and captions as appropriate; no text baked into images
waveform
named player, time text, labeled transport, transcript or equivalent
contribution graph
visible timeline plus text list of marks by date and linked source
suggestion
builder heading, public-fact reason, follow and message; no dismiss or reject control
stall
normal inline text, not assertive alert
illustration
aria-hidden=true when decorative; meaningful cast figure has medium text label
Every surface survives 2x string length. lang and dir follow the content. Demo videos
and lecture recordings cannot publish without captions.
13.5 web delivery invariants
These checks were added by the ui-ux-pro-max review where they do not conflict with the
constitution:
The first focusable element is a visible-on-focus skip to main content link.
Heading levels are sequential; type tokens do not determine semantic heading rank.
The viewport uses width=device-width, initial-scale=1; zoom is never disabled.
At 200% browser zoom and 400% text zoom, content reflows without loss, overlap, or a
two-dimensional reading requirement.
Form controls containing editable text render at 16px on touch devices, using the
existing desktop type-body value, to prevent browser auto-zoom. Labels keep their
named type token.
Required fields use visible (required) text, not color or an unexplained asterisk.
Validation occurs after blur or submit, not on every keystroke. Multiple errors create
a linked summary and focus the first invalid field.
Inputs use semantic types and valid autocomplete values. Long passages auto-save
drafts, and closing with unsaved changes asks for confirmation.
Fixed mobile navigation reserves
56px + env(safe-area-inset-bottom) padding after main content, so the last control is
never covered.
Portrait and landscape are both supported. No essential action depends on hover,
gesture, drag, or precise pointing.
Builder media declares intrinsic dimensions or aspect ratio before load. Below-fold
media lazy-loads; hero media does not. Responsive sources avoid downloading a 1920px
asset into a 400px slot.
Fonts use font-display: swap; only the above-fold required weights are preloaded.
Lists over 50 rendered rows use windowing or pagination while preserving accessible
order and deep links.
Layout shifts caused by asynchronous content are defects; final-geometry skeletons
reserve the space.
The skill's generic recommendations for member counts, light mode, purple/green colors,
Atkinson Hyperlegible, spinners, gradients, badges, and a different icon family were
rejected because they conflict with binding Launchology decisions.
14. token architecture and handoff
14.1 three tiers
Tokens are authored once as JSON. Primitive tokens contain raw values, semantic tokens
contain roles, and component tokens contain single-property bindings. Components may
reference component tokens, which resolve to semantic tokens, which resolve to
primitives. Components never reference primitives or literals.
This example is complete for the primary button vertical slice and is copy-pasteable
W3C DTCG-style JSON. The same shape applies to every catalog entry in sections 2 through
10.
{
  "primitive": {
    "color": {
      "black": { "$type": "color", "$value": "#000000" },
      "raised": { "$type": "color", "$value": "#0E0E0E" },
      "white": { "$type": "color", "$value": "#FFFFFF" },
      "blue-500": { "$type": "color", "$value": "#4DA3FF" },
      "blue-deep": { "$type": "color", "$value": "#1B4FD8" },
      "cream-100": { "$type": "color", "$value": "#FFFDF0" },
      "cream-200": { "$type": "color", "$value": "#F7F0D4" },
      "cream-300": { "$type": "color", "$value": "#EDE2BC" }
    },
    "space": {
      "4": { "$type": "dimension", "$value": "4px" },
      "12": { "$type": "dimension", "$value": "12px" }
    },
    "radius": {
      "6": { "$type": "dimension", "$value": "6px" }
    },
    "border": {
      "2": { "$type": "dimension", "$value": "2px" }
    },
    "duration": {
      "100": { "$type": "duration", "$value": "100ms" },
      "160": { "$type": "duration", "$value": "160ms" }
    },
    "easing": {
      "linear": { "$type": "cubicBezier", "$value": [0, 0, 1, 1] },
      "standard": { "$type": "cubicBezier", "$value": [0.2, 0, 0, 1] }
    }
  },
  "semantic": {
    "color": {
      "surface-ground": { "$type": "color", "$value": "{primitive.color.black}" },
      "surface-emphasis": { "$type": "color", "$value": "{primitive.color.cream-100}" },
      "surface-emphasis-hover": { "$type": "color", "$value": "{primitive.color.cream-200}" },
      "surface-emphasis-active": { "$type": "color", "$value": "{primitive.color.cream-300}" },
      "content-on-emphasis": { "$type": "color", "$value": "{primitive.color.raised}" },
      "border-on-emphasis": { "$type": "color", "$value": "{primitive.color.raised}" },
      "border-focus": { "$type": "color", "$value": "{primitive.color.blue-500}" },
      "offset-sticker": { "$type": "color", "$value": "{primitive.color.blue-deep}" }
    },
    "motion": {
      "instant-duration": { "$type": "duration", "$value": "{primitive.duration.100}" },
      "instant-easing": { "$type": "cubicBezier", "$value": "{primitive.easing.linear}" },
      "state-duration": { "$type": "duration", "$value": "{primitive.duration.160}" },
      "state-easing": { "$type": "cubicBezier", "$value": "{primitive.easing.standard}" }
    }
  },
  "component": {
    "button": {
      "primary": {
        "bg": { "$type": "color", "$value": "{semantic.color.surface-emphasis}" },
        "bg-hover": { "$type": "color", "$value": "{semantic.color.surface-emphasis-hover}" },
        "bg-active": { "$type": "color", "$value": "{semantic.color.surface-emphasis-active}" },
        "text": { "$type": "color", "$value": "{semantic.color.content-on-emphasis}" },
        "border": { "$type": "color", "$value": "{semantic.color.border-on-emphasis}" },
        "focus": { "$type": "color", "$value": "{semantic.color.border-focus}" },
        "offset-color": { "$type": "color", "$value": "{semantic.color.offset-sticker}" },
        "offset-distance": { "$type": "dimension", "$value": "{primitive.space.4}" },
        "radius": { "$type": "dimension", "$value": "{primitive.radius.6}" },
        "border-width": { "$type": "dimension", "$value": "{primitive.border.2}" },
        "padding-block": { "$type": "dimension", "$value": "{primitive.space.12}" },
        "motion-press-duration": { "$type": "duration", "$value": "{semantic.motion.instant-duration}" },
        "motion-press-easing": { "$type": "cubicBezier", "$value": "{semantic.motion.instant-easing}" }
      }
    }
  }
}

14.2 naming
JSON paths and generated CSS names follow
{tier}-{category}-{role}-{variant}-{state}, lowercase and hyphen-delimited.
Omit a segment only when no ambiguity remains.
State is last: component-button-primary-bg-hover.
A token represents one property. Do not create bundles such as button-style.
Primitive names describe the value family, not its use.
Semantic names describe purpose, not appearance.
Component names start with the one component they serve.
A proposed token with no derivable name is probably a local literal and is rejected.
14.3 generation path
Validate the JSON schema and alias graph.
Reject aliases that skip a tier or resolve in a cycle.
Generate CSS custom properties in primitive, semantic, component order.
Generate Tailwind theme references from the same JSON. Tailwind contains
var(--token) references, never copied literals.
Generate platform and email artifacts. Email inlining is the sole sanctioned literal
output and is generated, never hand-authored.
Snapshot the generated artifacts and fail CI when regeneration changes them.
14.4 complete catalog cross-reference
family
defined in
consumed in
orphan/undefined result
primitive and semantic colors
2.1–2.2
2.3–2.7, 5, 7, 8, 9, 12, 13
none
component colors
2.3
every table in 7
none
type
3.1–3.2
6, 8, 9, 11, 12
none
space, radius, border, offset, rotation, opacity
4.1
4.2–4.4, 5, 6, 7, 8, 9, 13
none
z-index
4.4
9, overlays and toast profiles in 7
none
icon inventory
6.2
6.3, 9, 12, 13
none
duration and easing
10.1
5, 7, 9, 10
none
state names
7.1
every primitive, composite, and pattern
all 9 present
14.5 automated drift checks
rg -n '#[0-9A-Fa-f]{3,8}|rgba?\(|hsla?\(|oklch\(' app components \
  --glob '!**/generated/**'
rg -nU -P -i '(?<!@font-face \{\n  )(font-?family|font-?size|border-?radius|z-?index):(?!\s*var\()' \
  app --glob '!app/tokens.css'
rg -n '[0-9]+px|[0-9]+ms|cubic-bezier' app --glob '!app/tokens.css'
rg -n 'gradient|backdrop-filter|backdrop-blur|drop-shadow|text-shadow' app components
rg -niP \
  -e '(?<=[<.=_">-])(leaderboard|winner|featured|streak)s?\b' \
  -e '\b(leaderboard|winner|featured|streak)s?(?=\s{0,3}[(){}.:=<-]|(?-i:[A-Z]))' \
  -e '(?-i:(?<=[a-z])(Leaderboard|Winner|Featured|Streak)s?\b)' \
  -e '\btop[-_]?builders?\b' -e '\bview[-_]?counts?\b' \
  -e '\bfollower[-_]?counts?\b' -e '\bmatch[-_]?scores?\b' \
  app components \
  | rg -v -e '\bno\b' -e '\bnever\b' -e '\bwithout\b' -e '\bnothing\b'
rg -niP \
  -e '(?<=[<.=_">-])(swipe|reject)(s|ed|ing)?\b' \
  -e '\b(swipe|reject)(s|ed|ing)?(?=\s{0,3}[(){}.:=_<-]|(?-i:[A-Z]))' \
  -e '(?-i:(?<=[a-z])(Swipe|Reject)(s|ed|ing)?\b)' \
  -e '\bpass on\b' -e '\bdecline[-_]?builders?\b' \
  -e '(?-i:(?<=[a-z])DeclineBuilders?\b)' \
  app components

All six commands must return zero shipped-component matches. Tests and generated output
use explicit allowlists, never broad directory exclusions. The second command (locked
properties) matches both kebab-case CSS (font-size:) and camelCase JSX inline-style
keys (fontSize:). The fourth and fifth commands (podium/status and swipe/reject
language) additionally require the matched term to occur in a JSX/identifier context (a
tag name, prop, property access, or camelCase-joined compound), not inside plain
rendered prose; the fourth command also drops any surviving match whose line contains an
explicit negation word (no/never/without/nothing), since a genuine violation and a
sentence-case heading naming the same feature can otherwise be syntactically
indistinguishable on one line — see §16.2 for why (amended 2026-07-29).
15. ship tests
These procedures test a rendered implementation and can also test whether this manual
contains enough instruction to produce one.
test
procedure
binary pass
failure
greyscale
render all archetypes and states with filter: grayscale(1); operate every control
every state retains outline, text, mark, geometry, or semantics
any status or selection disappears with color
blur
blur content to 12px while preserving block geometry
black field, one focal block, top-left heading, narrow mono column, and hard media geometry remain recognizable
competing focal blocks, decorative banner, or generic dashboard silhouette
beginner
use a new account with no projects, connections, or graph marks
archive, 3 builders, recent community activity, and one route forward appear before emptiness
blank dashboard, zero count, guilt, score, or dead end
375px
test every template at 375x667 and 375x812, 2x strings, safe area, and software keyboard
no horizontal scroll; 44px targets; fixed nav covers nothing
clipping, overlap, hidden action, or more than five bottom items
keyboard
use only Tab, Shift+Tab, Enter, Space, Escape, arrows, Home, and End
all actions operate, focus is visible, overlays trap and restore, graph marks are reachable
mouse-only action, lost focus, hidden focus, or keyboard trap
podium
search source and inspect ordering, copy, and data
no winner, rank, score, status count, popularity sort, scarce badge, person rejection, or negative signal
any person is made more worthy, visible, or rejectable by the interface
paste
paste each system sentence into an unrelated product and evaluate terminology and object specificity
every action, error, empty state, and confirmation names a Launchology object or relationship
generic copy such as something went wrong, learn more, or success
15.1 document-level final run
test
result
evidence
greyscale
pass
section 13.2 names a non-color cue for every functional color
blur
pass
section 8 fixes the composition silhouette for all five archetypes
beginner
pass
sections 11.4 and 12.2 specify real substance before absence
375px
blocked only for live sprint navigation
all layout and safe-area values are exact; OPEN-NAV-1 prevents an invalid sixth bottom item
keyboard
pass
section 13.3 supplies the pattern map and section 13.4 semantics
podium
pass
sections 1, 11, 12, and 14 make ranking and rejection mechanically testable
paste
pass
section 11 locks terms, formulas, and real flow-specific examples
16. open gaps, derivations, conflicts, and missing assets
Implementation may proceed around a gap, but must stop at the named blast radius.
id
type
missing or conflict
interim rule
what breaks if wrong
OPEN-NAV-1
resolved 2026-07-23
5 persistent mobile items + 5-item maximum + temporary sprint access
keep 5 bottom items; use a labeled mobile-header action during a live sprint; use the sixth rail item on desktop
primary destination is hidden, overcrowded, or inconsistent
OPEN-LOGO-1
missing asset
no approved logo; supplied dotted lowercase image is inspiration only
lowercase Satoshi wordmark; do not trace or ship the image
favicon, clear space, nav, email, and social lockup drift
OPEN-ILLUSTRATION-1
partially resolved 2026-08-25
the palette half is closed; the asset half is not. A dedicated illustration palette now exists (D-III, section 2.5). Still missing: every cast figure, device, and feature scene as artwork. Wren is specified in section 17 and no Wren artwork exists
WHAT CHANGED: the palette clause and the full-bleed clause. The palette is no longer white, blue, and blue-deep only; it is those three plus rust, buff, and rust-deep (section 2.5). Full bleed is permitted for the Wren onboarding surface and no other, per D-JJJ (docs/open-decisions.md, 2026-08-25), whose grounds are recorded there and are not restated here. WHAT DID NOT CHANGE: spot tier remains the rule on every surface other than Wren onboarding; section 8.1's one-spot-drawing-per-surface rule still binds; the permission does not generalise to any other surface or any other cast figure; and no artwork may be shipped that does not exist
generated art crosses into UI or becomes inconsistent
OPEN-REEL-1
missing content
reel requires real builder media
do not ship reel before first finale; use static display hero
placeholders or stock work would fake community
OPEN-NONLATIN-1
missing font
no script-matched companion for localized interface strings
interface strings remain Latin; authored content uses system mono
localization changes metrics and brand register
OPEN-GRAPH-1
unresolved rendering
timeline content and behavior are fixed, exact visual drawing is not
flat chronological timeline, inspectable links, no animation, text list
a later design could imply score or hide sparse periods
OPEN-AI-1
resolved 2026-08-25
active discovery query layer has no approved conversation pattern
RESOLVED 2026-08-25 by docs/wren-prd.md, accepted under founder decision D-DDD (docs/open-decisions.md, 2026-08-25), which names the AI surface Wren and makes that document its specification. What is resolved: the conversation pattern (docs/wren-prd.md §3 and §6), the memory model (§4), the consent model (§5), and the honesty rules with their checks (§9 and §10). TWO of the three prohibitions this row carried as an interim rule are superseded by that specification rather than dropped, and the third is not: public facts only is now the scope model at §5.1, where every scope beyond public is off by default and revocable, and no score or reject control is now §2, which forbids Wren ranking a builder, scoring a builder to their face, or comparing two builders. The third clause, apply passage archetype, is NEITHER superseded NOR satisfied, and marking this row resolved does not close it. docs/wren-prd.md does not mention the passage archetype anywhere — a case-insensitive sweep for passage and archetype over that file returns nothing — so the specification is silent on it rather than replacing it. The clause has a recorded violation still present in committed source: audit item I5 (docs/prd-audit-priorities.md) records the signed-in discovery surface rendering page-frame collection-page while passage-page is used on that route only in the no-profile branch, and that is still true of app/discover/page.tsx today. The archetype clause therefore survives this resolution unchanged and continues to bind the discovery surface. What is NOT resolved: that archetype clause and audit I5; audit item I6, the convergence stage, which is a second AI conversation surface that this row's own wording (the active discovery query layer) has never covered and that no marker names — resolving this row does not widen it, and that scope gap is now markerless; the five items at docs/wren-prd.md §15, which are recorded in docs/open-decisions.md and are deliberately not restated here; and the visual direction, which founder decision D-FFF requires be settled in a design pass before any Wren surface is built — OPEN-MOTION-1 and OPEN-ILLUSTRATION-1 are separate rows in this very table, this row asserts nothing about their state, and a build loop must not decide either as a side effect of shipping a chat surface. Implementation is licensed to Phase 1 only, per docs/wren-prd.md §14. This row records the conversation pattern as decided; it does not record the surface as built, and nothing of Wren exists in this repository.
AI could speak for builders or leak private disposition
OPEN-SPONSOR-1
unresolved placement
sponsor fixed slots and sizes are not contracted
named content-secondary text only, no logo
credit could compete with builder work
OPEN-TEAM-1
resolved 2026-07-23
persist/dissolve member rule
2 explicit opt-ins persist the team with opted-in members only; if all respond and fewer than 2 opt in, dissolve; connection history always remains
software could preserve or dissolve a team against its people
OPEN-WORKSHOP-1
content
day 3 and day 8 workshop topics
no placeholder titles
schedule copy could promise unplanned content
OPEN-FINALE-1
scale validation
~20-team synchronous rooms are unmodeled
workspace archetype, equal slots, every team watched
room may fail access or create implicit selection
OPEN-EMAIL-1
platform validation
dark-ground email untested across clients
test before send; light email is only a documented constitution exception
unreadable or inverted email
OPEN-MOTION-1
validation
motion values are derived, not user-tested
retain tokens and collect run-one evidence
interaction may feel too slow or expressive
OPEN-REF-1
missing repository input
no docs/references/ directory was present
supplied turn images are non-binding review context only
future maintainers cannot audit original visual files from the repo
OPEN-ZINDEX-1
resolved 2026-08-10 (added 2026-07-29)
.mobile-sprint-bar (app/globals.css, global persistent chrome rendered by AppShell.tsx inside <main>, sticky top:0) and .team-strip (app/globals.css, page-content sticky header in TeamWorkspace.tsx, also sticky top:0, no offset separating the two) could co-occur in the same DOM subtree on the team workspace route whenever a sprint was live, and the §4.4 z-index scale had exactly one primitive-z-sticky token for what are actually two distinct competing sub-layers: persistent global chrome versus page-content sticky headers. Tying both to that one token would have made §4.4's own DOM-order tie-break rule decide the winner, flipping the outcome, where the literal value 19 previously kept the sprint bar on top unconditionally
RESOLVED 2026-08-10. primitive-z-chrome (2) was inserted for persistent global chrome and, per §4.4's new insertion rule, every layer above it shifted up by one, menu/drawer/modal/toast/critical moving from 2–6 to 3–7. .mobile-sprint-bar and .bottom-nav bind primitive-z-chrome; .team-strip and .message-composer, .community-composerstay onprimitive-z-stickyas page content;.media-visual > svgand.input-with-icon > svgstay there as lifts within a component, which cannot collide with chrome.app/globals.css:156is nowz-index: var(--primitive-z-chrome)and noz-indexin the product source is a literal. **Citation correction:** every earlier statement of this marker citedapp/globals.css:157; the literal was on **156**, and 157 was display: flex;. **Gap closed 2026-08-10:** .rail, also app-shell chrome and sticky on desktop, now declares z-index: var(--primitive-z-chrome)atapp/globals.css:1031`, so it is separated from page content by the scale rather than only by the desktop grid columns
a founder-controlled global CTA banner could be silently covered by ordinary page content, or vice versa, depending on unrelated DOM ordering changes elsewhere in a page
16.1 derived decisions
decision
derivation
review trigger
cream 100/200/300
Amendment A plus supplied warm wordmark direction; measured contrast in section 2
founder changes primary-button temperature
blue-deep hard offset
surviving sticker physics; 3.16:1 non-text separation on black
accessibility evidence changes
opacity-disabled: .48
midpoint of the accessible reduced-emphasis range, backed by semantics and cursor
disabled-state usability test
1ch base / 2ch dense gap
constitution's ch-snap rule and Space Mono fixed cell
dense surface usability
z-index 0–6
exact required stacking order, consecutive to avoid magic escalation
new floating layer
Lucide at 1.5px
matches 24px rounded functional contract and complete PRD inventory
required semantic icon is unavailable
checkbox path
constitution requires a hand-drawn stroke; path uses the 24px component grid
visual accessibility test
form text at 16px on touch
existing type-body desktop value prevents mobile auto-zoom
browser behavior changes
safe-area and fixed-nav reserve
56px bar plus environment inset prevents covered controls
navigation geometry changes
16.2 explicit conflicts resolved by precedence
Amendment A replaces every older blue primary-button fill instruction with the cream
family. Blue remains link, focus, active, and selected. Blue-deep remains offset only.
The generic ui-ux-pro-max design-system output suggested member counts, light mode,
purple and green UI colors, Atkinson Hyperlegible, and broader motion. The binding
constitution and accessibility-specific Launchology rules override all of them.
The generic skill suggested spinner or shimmer loading. Launchology requires quiet
final-geometry skeletons and permits a spinner only for full-page session restore.
The generic skill suggested a different default icon family. The exact 24px, 1.5px
Launchology contract and this manual's Lucide decision remain authoritative.
Amendment (2026-07-29): §14.5's second drift-check command matched property names
(font-family, font-size, border-radius, z-index) rather than literal values,
flagging 119 correct var(--token-*) usages in app/globals.css as violations; per
part 19, a rule that flags correct usage is wrong and is rewritten, so it was split
into two commands, one requiring those four properties to carry a non-var() value
and one matching literal px/ms/cubic-bezier values anywhere.
Amendment (2026-07-29): the first of those two commands (font-family/font-size/
border-radius/z-index without var()) also matched every one of the eight
@font-face { font-family: "..."; } declarations at the top of app/globals.css. A
@font-face block is the definition site the tokens ultimately reference — a literal
font name there is structurally unavoidable and correct, not drift. The command now
excludes exactly those eight lines by adjacency to @font-face {, not by excluding
the file or the property: the four unscaled z-index literals and the one
ui-monospace fallback stack elsewhere in the same file still return as real matches
and remain unresolved (next loop's work).
Amendment (2026-07-29): §1.2's podium test and §14.5's fourth and fifth commands
(podium/status language and swipe/reject language) matched banned terms as plain
substrings anywhere in a file, including inside rendered prose that describes what
the product refuses to do — five confirmed false positives, all negation copy ("no
judges, prizes, leaderboard, or cuts", "no follower count", "PUBLIC FACTS, NO MATCH
SCORE") or unrelated accept/accepted usage (file-upload MIME attributes, sprint
invitation and timezone-override acceptance — none a swipe or reject on a person).
Per part 19, a rule that flags correct usage is wrong and is rewritten: a product
affordance is code that renders, sorts, scores, or acts on a person, not a string
describing its absence, so both patterns now require the term to occur in a
JSX/identifier context (touching a tag, property-access, attribute, or object-key
marker, or camelCase-joined into a longer identifier) rather than as a bare word in
running text. The bare accept term is also dropped from the swipe/reject command:
it collides with the standard HTML <input accept="..."> MIME attribute and generic
invitation-acceptance flows, and was never itself evidence of rejecting a person —
the constraint this check enforces is about rejecting/swiping away a person, which
accept does not signal on its own.
Amendment (2026-07-29): an adversarial verification subagent planted realistic
violations and found three gaps the same-day narrowing above had missed. (1) The
locked-property command only matched kebab-case CSS syntax (font-size:), not
camelCase JSX inline-style object keys (fontSize:, zIndex:) — the property
alternation now accepts an optional internal hyphen (font-?size), matching both
spellings under the existing case-insensitive flag. (2) A genuine violation
(<h2>This week's leaderboard</h2>) escaped the podium/status command because
requiring the term to touch a JSX/identifier marker on both sides had no way to
admit "immediately followed by a closing tag" without reopening the exact
"PUBLIC FACTS, NO MATCH SCORE</p>" false positive the same-day narrowing had just
fixed — both are a short text node ending right before its closing tag, and the two
cases are not distinguishable by adjacency alone. The command now allows that
adjacency but pipes the result through a second rg -v stage that drops any
surviving line containing an explicit negation word (no/never/without/nothing),
since every known false positive is negation copy and no known violation is. (3) A
button rendering the literal word "Reject" as its only text content escaped because
it was preceded by > (a tag's own closing bracket), which wasn't in the trigger
set — added, since a control's label text starting immediately after its own
opening tag is exactly the shape a real control takes and prose is never shaped this
way. A handleDeclineBuilderstyle camelCase identifier also escaped the "decline
builder" phrase, which required a literal space — the compound now tolerates a
hyphen, underscore, or camelCase join the same way the other compound terms already
did.
Amendment (2026-07-29): a second adversarial verification round found two more real
gaps in the same three commands (podium, 14.5d, 14.5e). (1) rejectBuilder(builder.id)
escaped: the prior round's camelCase fix only recognized the banned term at the END
of a compound (preceded by a lowercase letter, e.g. handleReject), not at the START
(followed by an uppercase letter, e.g. rejectBuilder) — all three commands' second
alternation now also treats "followed immediately by an uppercase letter" as a
trigger. (2) The locked-properties command (font-family/font-size/border-radius
/z-index without var()) was shipped without the i flag despite requiring it to
match the camelCase spellings added the previous round — zIndex:/fontSize: in
JSX inline styles silently escaped case-sensitively; added i back.
Amendment (2026-07-29): a third adversarial verification round confirmed both fixes
above hold, then found one more real, in-scope bug: the "followed by an uppercase
letter" trigger added in the previous amendment was written as a bare [A-Z] inside
an already-case-insensitive (i) pattern. PCRE2 folds character-class ranges under
i, so [A-Z] there actually matched any letter, not just uppercase — silently
turning the camelCase-boundary heuristic into "followed by literally anything," which
made the podium and swipe/reject commands misfire on ordinary prose (a planted
comment reading "ranked-people" tripped the podium check for this reason alone, and
in general any occurrence of "ranking", "streaked", "featured", etc. followed by any
letter would have matched). Fixed by wrapping that branch in the same
case-sensitivity override already used elsewhere in these commands:
(?-i:[A-Z]) i
