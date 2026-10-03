> Source: pasted by the founders on 2026-10-03 as the binding visual design spec for Firefly. Kept verbatim. It was written for Launchology; DESIGN.md says how it maps onto Firefly.

he visual operating system for launchology. this document defines how launchology designs, not what it currently looks like. a designer and an engineer who have never spoken should be able to build the same screen from this alone.
structural note: the 20 parts below follow the requested structure. part 10 is expanded because a make-anything community has an unusually heavy media problem, and part 15 is expanded because the single largest product risk (a beginner deciding they don't belong) lives entirely in empty and first-run states.
1. purpose and how to use this document
who reads it. the two founders, any designer or engineer who joins, and any AI agent generating launchology surfaces.
what it governs. every surface carrying the launchology name: the platform (steady state and sprint mode), the marketing site, email, social, and any embed.
what it does not govern. builder-generated content. a project page must present a film, a song, or a repo without imposing launchology's aesthetic on the work itself. the frame is ours, the work inside it is theirs. this is a principle, not a technicality: the directory exists to make builders look good, not to make launchology look coherent.
how to resolve a question this document does not answer. run part 18. do not improvise, and do not copy a convention from another product because it is a convention.
precedence when rules conflict. philosophy constraints (part 2) beat every other rule in this document. accessibility (part 16) beats visual preference. after those, the more specific rule wins.
2. brand truths and design mandates
each truth is stated so that its opposite is a position a real competitor holds. each mandate is the interface consequence. a truth with no consequence was cut.
truth 1. the door is open to anyone, permanently, and this is a moral position rather than a growth tactic.
mandate: the interface never gates, scores, ranks, or sorts a person. no application state, no acceptance state, no completeness percentage on a profile, no "level." a person is never rendered as a number. scoped by the founder, 2026-08-22: the prohibition is on rendering a person as a number, not on computing one, so a score may decide what appears so long as it is never shown.
truth 2. influence comes from elevating people inside an open base, not from selecting them.
mandate: work is the largest thing on any surface. status markers are the smallest. follower counts, view counts, and popularity signals are not rendered anywhere in the product, because rendering them creates the hierarchy the base was designed to avoid.
truth 3. builders make things, and "things" spans film, music, games, writing, art, hardware, and software equally.
mandate: any component that assumes a screenshot of an app is broken. every media-bearing component must handle video, audio, image, text, and link with equal grace, and must never make a non-software project look like a fallback.
truth 4. honesty beats performance, so recorded activity must be a byproduct of working rather than a thing you can fill.
mandate: the contribution graph and every activity surface are read-only projections. no surface may invite a person to add a mark for its own sake. empty stretches render plainly and are never styled as failure.
truth 5. launchology is a home, not a tool, so it has to be worth opening when nothing is scheduled.
mandate: no surface is ever blank. every empty state offers either accumulated work to explore or a person to meet. "nothing here yet" alone is a defect.
truth 6. bonding happens in small groups, and software cannot manufacture it.
mandate: team and cluster surfaces are sized and styled for few people, with names and faces at full weight. the interface never simulates crowd or activity it does not have.
truth 7. it is free forever because sponsors fund it, and builders are never the product.
mandate: sponsor presence is legible and honest but always subordinate to builder work. sponsors appear as named credit in fixed slots. no sponsor content is ever styled as a builder project, and there is no ad unit anywhere.
truth 8. the community is global and mostly young, often on phones, often at odd hours.
mandate: mobile is the design origin, not the adaptation. every surface is specified at 375px first. timezone-sensitive information always renders with an explicit zone.
3. design principles
each states what it prioritizes and what it gives up. principles without a sacrifice were cut.
evidence over ornament.
we always lead a surface with the actual work or the actual person. we never use decorative graphics to fill space that could hold real content.
sacrifice: launchology's own brand expression is smaller and quieter than a marketing-led product's would be.
one loud thing per view.
we always give a view exactly one focal element: one accent-colored action, or one piece of media at scale, never both competing.
sacrifice: dense dashboard-style layouts that surface many things at once are not available to us.
warm in the dark.
we always keep the human register in a black interface through lowercase voice, hand-drawn cartoon elements, and generous space.
sacrifice: we give up the efficiency and authority signals of a sharp corporate dark UI.
built for 3am on a phone in another timezone.
we always favor legibility and touch comfort over information density.
sacrifice: power users see less per screen than they would in a desktop-first product.
the record never flatters.
we always render activity exactly as it happened, gaps included.
sacrifice: we lose the retention lift that streaks, scores, and completion meters reliably produce.
4. anti-identity
these are checkable. if a reviewer can point at one, it ships as a defect.
dark SaaS and crypto default. black plus neon is one bad decision away from every AI wrapper and wallet landing page. specifically banned: glow effects on any element, gradient-filled text, mesh or aurora gradients, glassmorphism, blur-behind panels, glossy or beveled surfaces, purple-to-blue gradient buttons, and animated particle or grid backgrounds. our black is flat and our blue is flat. the thing separating us from that category is the absence of glow, not the presence of taste.
the podium in any form. leaderboards, trophies, medals, rankings, winner announcements, "top builder" surfaces, scarce badges, streak counters, and progress bars applied to people. this includes soft versions: "featured" carousels that imply selection, and sort orders that default to popularity.
hackathon-bro energy. countdown timers used as pressure, "crushing it" language, prize reveals, sponsor logo walls sized like a NASCAR hood, and any visual that treats other builders as competition.
edtech coercion. completion percentages, certificates, mandatory-looking checklists, mascot encouragement, and empty-square shaming on the contribution graph.
stock startup illustration. isometric people, gradient blobs, floating 3D shapes, generic line-art figures, and any illustration that could belong to a payroll company. our cartoon work is hand-drawn, thick-lined, specific, and slightly odd.
the crowded feed. infinite scroll of low-value updates, notification badges on everything, and any pattern that rewards checking over making.
5. surface inventory and hierarchy
surface
audience
density
register
identity role
marketing site
cold visitors, mostly beginners
low
loudest, most cartoon, most motion
leads
signup and onboarding
nervous newcomers
lowest
warmest, most reassuring
leads
directory and project pages
builders, sponsors, recruiters
medium
quietest, work-forward
follows
profile
the builder and visitors
medium
restrained, evidence-heavy
follows
community space
members
high
conversational, plain
follows
team and cluster spaces
3 to 40 people
high
intimate, plain
follows
sprint surfaces (check-ins, posts, finale)
active cohort
medium
focused, low-chrome
follows
email
everyone
low
plainest of all
follows
social
cold audiences
low
loudest, cartoon-forward
leads
scaling rule. expression scales down as the surface gets closer to a builder's own work or a builder's own conversation. the marketing site may use full cartoon, full motion, and the reel device at scale. a project page uses none of it. the rule: the closer a surface is to someone else's work, the more invisible launchology becomes.
leading surfaces set identity, following surfaces inherit it. a new following surface never invents expression; it composes from existing primitives only.
6. color system
roles precede values. every value below is stated with its derivation and its computed contrast against the ground it is used on.
the ground
launchology is black. this is inherited from buildspace's site, which the founders name as the primary reference, and it is not theme-switchable. there is no light mode. a light mode would put the identity's whole warmth burden on a cream ground it was not designed for. this is a locked decision, not a backlog item.
role set and values
token
value
role
contrast on ground
rule
ground
#000000
page background, everywhere
n/a
never substituted
raised
#0E0E0E
cards, list rows, inputs
n/a
one step only
raised-2
#1A1A1A
menus, drawers, modals, hover fill
n/a
highest allowed surface
line
#262626
borders, dividers, input strokes
n/a
never used as text
text
#FFFFFF
primary text
21:1 AAA
headings, body
text-2
#8A8A8A
secondary text, captions, metadata
6.08:1 AA
never for body copy
text-3
#6B6B6B
disabled, placeholder, hint
3.95:1
large or non-essential text only, never body
blue
#4DA3FF
the accent: links, primary action, focus ring, active state
8.02:1 AAA
one per view
blue-deep
#1B4FD8
decorative fills, illustration, reel frames
3.16:1 FAILS
never text, never a button fill, in any state
success
#3FD98A
confirmations, shipped state
11.5:1 AAA
error
#FF6B6B
errors, destructive
7.57:1 AAA
never blue
warn
#FFC24D
warnings, stall signals
13.1:1 AAA
derivations. ground and text come directly from buildspace.so. blue is the accent family the founders named ("cartoonish blue or neon"), set at the brightness required to clear 7:1 on pure black so it can carry text, links, and focus without a second accent. blue-deep is the saturated cousin used where blue must read as a large flat shape rather than as text. neutrals are a four-step ramp because a black interface needs fewer greys than a light one to stay legible.
the one hard rule. blue-deep measures 3.16:1 on black and fails WCAG AA. it is locked to decorative and large-shape use. it is never a text color, never a button fill, never a border on an interactive control, in any state.
one blue per view. exactly one element in a viewport may carry blue as a fill. everything else that needs emphasis uses weight, size, or text at full white. if two things want to be blue, one of them is not important.
interaction ramps. hover lightens a surface by one token step (raised to raised-2). pressed darkens the accent by 12% (#4390E0). no off-token hex values in components, ever.
the illustration palette is separate and banned from UI. cartoon elements may use a wider range including neon greens, hot pinks, and oranges. those values may never appear as interface color: not on a button, not as a border, not as text, not as a status. the boundary is absolute so that illustration can stay playful without the interface becoming a carnival.
no gradients anywhere. not in backgrounds, not in text, not in buttons, not in illustration fills. flat color is the single strongest thing separating this identity from the dark-SaaS category it borders.
7. typographic system
roles
role
family
license
why
display
Satoshi
Fontshare Free Font EULA (ITF); commercial use granted, free, unlimited period
geometric-humanist sans carrying every heading and hero line; full weight range makes it the only place fine hierarchy is available
body and UI
Space Mono
SIL OFL 1.1
the documentary, plainspoken register; makes a builder's work look like work rather than marketing
rare accent
Array Regular
Fontshare Free Font EULA (ITF)
a poster face, rationed to near-zero, see the array rule below
non-latin fallback
ui-monospace, SFMono-Regular, Menlo, monospace
system
required, all three faces are latin-only
license note. the two Fontshare faces are free for commercial use for an unlimited period, but the grant is non-transferable and terminable, unlike Space Mono's OFL. keep the license files in the repo and do not redistribute the font files as assets.
the measured pairing, and why it works
read from the shipped font binaries, not estimated.
Satoshi
Space Mono
Array Regular
units per em
1000
1000
1600
x-height
0.484em
0.496em
0.500em
cap height
0.716em
0.700em
0.625em
natural line box
1.35em
1.48em
1.15em
advance, lowercase n
0.562em
0.612em (fixed)
0.500em
weights
300, 400, 500, 700, 900, plus italics
400, 700 only
regular only, by decision
the finding that shapes the scale: Satoshi and Space Mono differ in x-height by 2.5%. a display line in Satoshi and body copy in Space Mono set at the same size read as the same optical size, so the two faces require no compensation when they sit adjacent. this is unusual and it is why the scale below can step cleanly between families without a size correction.
Array's caps run 13% shorter than Satoshi's while its x-height matches. it is built for lowercase display at large size and nothing else. its natural line box of 1.15em confirms it: there is no room for descenders in a normal paragraph.
weight availability is asymmetric and this drives hierarchy. Satoshi has five weights, Space Mono has two. therefore all fine-grained hierarchy lives in display, and body hierarchy is built from size and color only. never attempt a "slightly bolder" body step; it does not exist.
Space Mono specifics that constrain the system
property
measured
consequence
units per em
1000
baseline for all ratios below
x-height
496 (0.496em)
small. at any given px size Space Mono reads roughly 10% smaller than Inter, so every body step is set one px larger than a grotesque equivalent would be
cap height
700 (0.7em)
standard, no adjustment needed
advance width
612 (0.612em)
wide for a monospace. drives the measure cap below
natural line box
1.481em (asc 1120, desc 361, gap 0)
line heights below 1.5 will feel cramped; 1.5 is the floor
weights available
400 and 700 only
no light, no medium, no semibold. the entire hierarchy is built from two weights plus size and color
italics available
regular and bold italic
the only tonal axis beyond weight
the two-weight constraint is the single most shaping fact in this system. with no 500 or 600 available, weight cannot carry fine-grained hierarchy. hierarchy is therefore built from, in order of precedence: size, then color (text versus text-2), then weight, then tracking. any design that wants a "slightly bolder" step does not exist and must be solved with size or color instead.
honest caution. Space Mono has idiosyncratic letterforms and a small x-height, which make it excellent at large sizes and demanding across long paragraphs. long-form reading surfaces (the build archive, lecture descriptions, project long descriptions) therefore use body-l at line height 1.7 and hold to the measure cap without exception. if a surface needs more than roughly 400 words of continuous prose, that is a signal the content should be broken up, not that the type should shrink.
scale
mobile-first. desktop values in parentheses where they differ.
step
family
size
weight
line
tracking
case
use
poster
Array Regular
64 (120)
400
1.05
-0.01em
lowercase
see the array rule; never in the product
display-1
Satoshi
40 (72)
900
1.05
-0.03em
lowercase
hero, one per page
display-2
Satoshi
30 (48)
700
1.1
-0.02em
lowercase
section openers
display-3
Satoshi
22 (28)
700
1.2
-0.01em
lowercase
card titles, project names
display-4
Satoshi
17 (18)
500
1.3
0
lowercase
small headings, list group titles
body-l
Space Mono
17 (18)
400
1.7
0
sentence
long-form reading
body
Space Mono
15 (16)
400
1.6
0
sentence
default UI text
body-s
Space Mono
14
400
1.5
0
sentence
secondary text, captions
label
Space Mono
13
400
1.3
+0.06em
lowercase
field labels, metadata
eyebrow
Space Mono
12
700
1.2
+0.12em
uppercase
the only uppercase in the system
button
Space Mono
15
700
1
+0.02em
lowercase
all actions
numeric
Space Mono
inherits
400
inherits
0
n/a
all counts, dates, durations
the display face may now go small. Satoshi is text-capable, so the previous 24px display floor is lifted and replaced by display-4 at 17px. the boundary between families is by role, not by size: Satoshi names things, Space Mono says things. a heading is Satoshi at any size; a sentence is Space Mono at any size.
the array rule. Array Regular appears at most twice across the entire marketing site and zero times inside the product. permitted uses: the hero line, and at most one other single moment. never below 48px, never for more than eight words, never in a paragraph, never for UI, never for a heading that repeats across pages. if a third use is proposed, one of the existing two is removed first. this is a hard count, not a guideline, because the face only stays special while it is rare.
emphasis. in display, emphasis is weight (500 to 700 to 900). in body, weight emphasis is 700 and it is the only step available; italic is reserved for quotations. never both at once.
fixed versus contextual. family, case, and tracking are fixed and never overridden. size and line height are contextual within the scale. a size not on the scale requires a governance exception (part 19).
case rule. the product is lowercase. headings, buttons, labels, nav, and empty states are lowercase. two exceptions and no others: proper nouns keep their capitals, and the eyebrow step is uppercase. builder-authored content is never case-transformed, in any component, ever.
measure. body copy is capped at 55ch. at Space Mono's 0.612em advance, 55ch equals 33.7em, the same absolute line length as a comfortable 65ch proportional measure.
script coverage, measured
all three faces are latin-only. measured against the shipped binaries. Satoshi maps 431 glyphs, Array 393, Space Mono 624; none carry cyrillic, greek, CJK, arabic, hebrew, or indic.
range
coverage
basic latin
95/96
latin-1 supplement
95/96
latin extended-A
126/128
latin extended-B
33/208
greek
1/144
cyrillic
0/256
CJK, arabic, hebrew, devanagari
0
consequence, and it matters because the community is global. Space Mono handles western, central, and eastern european latin-script languages. it cannot render japanese, korean, chinese, russian, greek, arabic, hebrew, or indic scripts at all.
the non-latin rule. builder-authored content in any non-latin script renders in the system monospace fallback stack. this is a supported path, not a broken one: the fallback must be tested at every text step, and no layout may break, clip, or overflow when it engages. launchology's own interface strings stay latin until a localization pass selects a script-matched companion face, which is a register item.
8. spatial system
base unit: 4px. consciously adopted rather than derived, because it divides the body line-height (14 x 1.6 = 22.4, rounds to 24) cleanly and because inventing a novel base unit would cost every future contributor time for no expressive gain.
scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
application rules, so this is a system rather than a list:
step
applies to
4
icon to label, inside chips
8
between tightly related items, list row padding
12
inside inputs and buttons
16
card padding (mobile), between paragraphs
24
card padding (desktop), between form fields
32
between distinct component groups
48
between subsections
64
section rhythm (mobile)
96
section rhythm (desktop)
128
above and below a hero only
horizontal rhythm in dense surfaces snaps to the character cell. lists, check-in feeds, directory metadata, and any tabular data align on ch units rather than px, which is available for free because the body face is monospace and which makes columns line up like a terminal without a grid.
breakpoints and grid.
breakpoint
grid
margin
gutter
container
mobile < 640
4 col
16
12
fluid
tablet 640 to 1023
8 col
32
16
fluid
desktop >= 1024
12 col
n/a
24
1200 max
density modes. two only. comfortable is the default everywhere. dense is permitted on exactly three surfaces (directory browse, community message lists, cluster team lists) and only reduces vertical padding by one scale step. it never reduces type size or touch targets.
radius scale. 0, 6, 12, 999.
radius
applies to
0
reel tiles and media thumbnails only, derived from the grid reference the founders selected
6
inputs, buttons, chips, small controls
12
cards, panels, drawers, modals
999
status pills and media transport controls only
borders. line at 1px is the default separator. borders exist to define an editable or interactive region. decorative borders are not used. a card on raised against ground needs no border; if it has one, the border is doing the work and the fill should be removed.
elevation. black interfaces cannot rely on shadow. depth is expressed by surface step (ground to raised to raised-2) and nothing else. exactly one shadow exists in the system: 0 8px 32px rgba(0,0,0,.6), used only on elements that float above the page (menus, drawers, modals, toasts). shadows never appear on cards, buttons, or inputs.
9. composition grammar
what makes a launchology layout recognizable with the content blurred: a black field, one bright blue element, a large lowercase display line at the top left, monospace text in a narrow column, and a hard-edged media block that is either full-bleed or precisely gridded, with a lot of empty black around all of it.
page archetypes. every view in the product is one of five. a new view that is none of these requires a governance exception.
stream, a vertical sequence of authored items (community area, check-in feed, team space). single column, capped at 60ch, items separated by line, no cards.
collection, a browsable set of made things (directory, archive, lecture library). grid, media-forward, metadata in body-s, filters persistent at top.
record, one person or one project (profile, project page). media or graph at top, evidence below, actions minimal and to the right on desktop.
workspace, a place where a small group does something (team space, cluster, mentor session, finale room). people visible at all times, chrome minimal.
passage, a linear flow (onboarding, signup, convergence, post composer). one decision per screen, progress implied by content rather than a bar.
how a page begins. every page opens with a lowercase display line that names what you are looking at in plain words, positioned top-left, never centered except on the marketing site. no page opens with a decorative banner.
how a page ends. with either the next thing to do or the next person to meet, never with whitespace and never with a footer as the only closing element. a dead end is a defect (see part 15).
alignment. everything is left-aligned. centered text is permitted only in the marketing hero and in empty states. justified text is never used.
whitespace philosophy. black space is the primary compositional material and is not treated as waste. when a layout feels thin, the answer is to remove elements rather than to add decoration.
focal hierarchy. each view declares one focal element in this precedence: media > person > action > text. two focal elements in one viewport is a defect.
10. imagery, the cartoon system, iconography, and graphic devices
photography
launchology does not commission or use stock photography, ever. the only photographic content in the product is builder-generated: project media, demo videos, and profile images. this is not a budget decision. stock photography of people would put strangers where community members belong.
builder media, by placement
placement
aspect
min source
fit
project page hero
16:9
1920 wide
contain, never crop
project card
4:3
800 wide
cover
reel tile
1:1
600 wide
cover
profile avatar
1:1
400 wide
cover, radius 999
demo video
16:9
1280 wide
contain
social card
1.91:1
1200x630
composed, not cropped from project media
the non-visual media rule. audio, writing, and code have no natural thumbnail, and defaulting them to a grey placeholder makes non-software work look like a failure state (a direct violation of truth 3). each gets a designed representation instead: audio renders as a waveform on blue-deep with transport controls; writing renders as a type specimen showing the actual opening lines in the display face; code and links render as a monospace card showing the repo or domain, language, and last update. these are first-class, not fallbacks, and they are visually as substantial as an image thumbnail.
what disqualifies an asset. below minimum resolution, contains a competing logo lockup, contains a leaderboard or ranking, or is a stock image.
the cartoon system
cartooning here is a construction method, not a coat of paint. a system where the cartoon lives only in color, corner radius, or a friendly typeface has failed and gets rebuilt. the vocabulary below is derived from the references the founders selected (the sticker-layered cards and hand-drawn figures in the parker reference, the hard-cut media grid, and buildspace's black ground), not imported from a general cartoon style.
10.1 form language
everything drawn in launchology is built from one construction: the cutout.
rule
specification
outline
uniform stroke, no tapering, no variable weight. 3px at 1x for spot, 4px at feature, 6px at full-bleed. always text white or blue, never line grey
terminals
rounded caps and rounded joints, always. no mitered corners anywhere in drawn work
fill
flat, single value from the illustration palette. no gradient, no shading, no texture, no glow, ever
depth
implied by hard offset shadow only: a solid copy of the silhouette in blue-deep, offset 4px right and 4px down at spot size, 6px at feature, 8px at full-bleed, zero blur. this is the only depth model in drawn work
volume
implied by overlap and offset, never by rendering. one form passes in front of another; nothing is lit
exaggeration
one exaggerated attribute per object, maximum. a guitar has an oversized headstock or an oversized body, not both
proportion liberty
limbs and appendages may run to 1.5x natural; heads to 1.3x. beyond that the object stops reading as itself
symmetry breaking
every drawn object is rotated between 1 and 3 degrees off true, and no two adjacent objects rotate the same direction. perfectly axis-aligned drawn work is a defect
simplification
an object is drawn with the fewest closed shapes that keep it identifiable at 24px. if it needs more than six shapes, it is too complex for this system
the test for whether something belongs to the form language: strip its color and its offset shadow. if the remaining outline silhouette is still identifiable and still slightly crooked, it is constructed correctly.
10.2 drawn elements as content, in three tiers
tier
size
role
where
spot
24 to 64px
annotates or labels; sits inside a component
medium chips, empty-state inline marks, per-medium representations in the directory
feature
120 to 320px
the primary content of a section; text serves it
onboarding steps, empty states, the standing weekly thing's promo, error pages
full-bleed
edge to edge
the entire view is drawn; type sits on top
marketing hero alternative, finale celebration, the "you're in" moment after signup
one idea across three tiers. an object drawn at spot size uses the same closed shapes as at full-bleed, with stroke weight and offset scaling per the table in 10.1. it is never redrawn with more detail at larger size; it is the same drawing bigger. this is what keeps a spot camera and a full-bleed camera obviously the same camera.
where drawn work outranks text. in first-run, in empty states, and in the completion moment after the finale, the drawn element is the primary content and the copy is the caption. everywhere else text leads and drawn work supports.
10.3 the cast: tools of making
launchology has no mascot. a mascot that stands and smiles does no job and would violate the anti-identity rule against decoration. instead the cast is the instruments of making, personified, which exist because truth 3 requires every medium to be represented as a first-class citizen rather than a fallback.
figure
represents
job
camera
film and video
medium chip, per-medium empty state, directory filter, project representation
guitar
music and audio
same, plus it is the face of the waveform player from the non-visual media rule
controller
games
same
terminal window
software and code
same, plus the face of the code card
pen
writing
same, plus the face of the type specimen card
brush
art and design
same
construction. each is built from the form language in 10.1, has exactly one oversized attribute, and carries a face made of two dot eyes and a single-stroke mouth positioned on the object's largest flat plane.
permitted expressions: neutral, working (eyes down, slight lean forward), pleased (mouth curve up, eyes as arcs), stuck (mouth flat, one eyebrow stroke), asleep (eyes as single strokes, only in the empty and offline states). six expressions total, no more.
permitted poses: upright, leaning, mid-motion with speed lines, and stacked with another figure. never dancing, never waving, never holding a sign.
scale relationships. figures are drawn to the same optical weight regardless of the object's real-world size, so a guitar and a pen occupy the same visual footprint in a medium chip row.
what they may never do: appear on a project page (that surface belongs to the builder), appear in a destructive confirmation, appear more than once per view, speak in first person, react to a person's failure, or represent a person. the cast represents mediums, never members.
aging. as new mediums enter the community, new figures are drawn from the same six-shape budget and the same face construction. the cast grows by addition; existing figures are never restyled.
10.4 device vocabulary
five devices, each with an assigned meaning. a device used without its meaning is garnish and is a defect.
device
construction
means
dosage
ring
hand-drawn ellipse, 3px, blue, 1.5 turns so the stroke overlaps itself, always rotated off-axis
"this one thing"
one per view, and only around an element that is genuinely singular
arrow
hand-drawn, 3px, slight curve, rounded cap, arrowhead as two strokes
"go here next"
first-run and onboarding only. banned from every returning-user surface
underline
single hand-drawn stroke under display type, 4px, blue, extends 4px past the word on each side
emphasis inside a heading
one per heading, never more than three words
speed lines
two or three parallel strokes, 3px, trailing an object, length equal to half the object's width
"this just changed state"
attached to a drawn figure only, never to UI, never persistent
burst
six to eight radiating strokes from a point, uneven lengths, blue or illustration palette
"a thing was completed"
one per completion event, never on a recurring action
grid interaction. devices are the only elements permitted to break the grid. the ring and burst may overlap adjacent elements by up to 12px. the arrow may bleed across a gutter. devices never overlap text, and never bleed off the viewport edge. everything else in the system respects the grid absolutely.
composability. a maximum of one device per view. a device and a drawn figure may co-occur only on high-expression surfaces (part 5), and never on a following surface.
10.5 component-level cartooning
this is the layer that decides whether the identity is structural or a costume. components are built from cutout logic in their silhouette and their reaction to input, not decorated with cartoon accessories.
component
cartoon logic
where it is structural vs quiet
button, primary
full sticker: 2px outline, flat blue fill, hard 4px offset in blue-deep, rotated 0 degrees (buttons are the one exception to the rotation rule, because a crooked button reads as broken)
structural everywhere
button press
the button translates 4px toward its shadow and the shadow collapses to 0, so it physically presses into the surface
structural everywhere
button, secondary and ghost
outline only, no fill, no offset
quiet; cartoon appears only on press (2px translate)
card, leading surfaces
sticker: outline, raised fill, 6px offset, rotated 1 to 2 degrees
structural on marketing, onboarding, empty states
card, following surfaces
flat, raised fill, no outline, no offset, no rotation
quiet by rule. a directory of 200 rotated cards is unusable
input
2px outline, no offset, no rotation. focus adds the blue ring
quiet always. inputs are where people work
chip and medium tag
sticker at spot scale, 2px outline, 2px offset, carries its cast figure at 16px
structural everywhere, because it is the medium's identity
toast
sticker with 4px offset, enters with overshoot
structural
menu, drawer, modal
flat, no outline, no offset
quiet always. these are working surfaces
toggle and checkbox
outline construction, the check drawn as a hand-drawn stroke rather than a geometric tick
structural, it is a one-time cheap detail
skeleton and loading
flat raised blocks, no cartoon
quiet always
contribution graph
flat, no cartoon of any kind
permanently quiet. it is a record, and drawing on a record editorializes it
the rule that generalizes: cartoon logic is structural where a person acts or arrives, and quiet where a person reads, works, or is shown evidence.
10.6 motion as cartoon physics
cartoon motion is timing and exaggeration. these values extend part 11 rather than replacing it; part 11's durations govern, and the physics below govern the shape of the curve.
property
rule
anticipation
expressive elements move 3px against their travel direction for 40ms before the primary move. functional elements have no anticipation
overshoot
entering sticker elements overshoot their resting position by 8% and settle over 120ms. cards and toasts only; never inputs, never menus
squash and stretch
maximum 4% deformation, only on button press, only along the axis of travel. anything beyond 4% reads as a broken layout
follow-through
a drawn figure's secondary parts (a guitar's strap, a pen's clip) trail the primary body by 60ms
secondary motion
a maximum of one secondary element per figure
settle
everything comes to rest with a single settle, never a bounce sequence. two bounces is a defect
which moments earn expressive motion: first-run, signing up, posting a first check-in, a team forming, the drop landing, a project publishing to the directory, the finale. seven moments. nothing else in the product animates expressively.
reduced motion. the character survives through form, not movement. with prefers-reduced-motion, expressive elements render in their overshoot-settled state with their offset shadow at full size and their rotation intact. nothing is removed, only stilled. the burst device renders statically rather than being suppressed, because removing it would delete the meaning "a thing was completed."
10.7 typography inside the cartoon system
type participates in exactly three places and stays neutral everywhere else.
the underline device on display headings (10.4).
the poster step in Array Regular, which is itself the most expressive typographic moment in the identity and is rationed to two instances (part 7).
drawn labels inside full-bleed illustration, hand-lettered from the form language, maximum four words, never used for anything a person must read to proceed.
everywhere else type is a neutral reading surface. no distorted, arced, outlined, or animated lettering. no drawn type in body copy, in navigation, in forms, in errors, or in any string a screen reader must announce accurately.
10.8 states as the primary stage
state design is where this register does its most valuable work and where it does its most damage if misjudged.
state class
treatment
first run
full register. feature-tier drawn figure, one device (arrow permitted here and nowhere else), warm copy
empty, own content
full register. feature-tier figure in the asleep or neutral expression, framed as not-yet
empty, search or filter
spot only. a single small figure, no device. the person is mid-task
loading
cartoon-free. flat skeletons
success, low stakes
spot plus burst on first occurrence only, then decays (10.9)
success, high stakes (project published, finale complete)
full register, full-bleed permitted
error, recoverable
spot only, neutral expression, never pleased. copy stays flat
error, costly (work lost, payment, permissions, data)
cartoon-free, absolutely. no figure, no device, no expressive motion
stall signal (two missed check-ins)
cartoon-free, absolutely. this is a person struggling. a drawn figure here is hostile
over-limit
cartoon-free. state the number and the alternative
offline
spot only, asleep expression, because it is a low-stakes waiting state
destructive confirmation
cartoon-free, absolutely
the governing rule: the register drops entirely the moment a person has lost work, time, money, or standing. levity in those moments is the fastest way to make a warm product feel contemptuous.
10.9 voice inside the register
copy is part of the cartooning and it is the fastest place to overreach.
rhythm. the comic beat is a short sentence after a longer one, never a punchline. copy may be light; it may not be funny at the reader's expense.
what it may joke about: the product's own limits, the absurdity of starting something, the operators themselves.
what it may never joke about: a person's skill, a person's output, a person's silence, another builder, or the reason something failed.
zones where the voice goes flat and stays flat: every state marked cartoon-free above, plus the contribution graph, plus anything a mentor or teammate will read about a specific person.
exclamation marks remain banned in product copy (part 13). the register is carried by construction and drawing, not punctuation.
10.10 restraint, dosage, and fatigue
an unbudgeted cartoon system is charming on the first visit and exhausting on the tenth.
expression zones by surface class (extends part 5):
zone
surfaces
budget
high
marketing, signup, onboarding, finale, the seven expressive moments
one feature or full-bleed drawing + one device + expressive motion
low
community stream, team space, profile, archive, lectures
spot drawings only, no devices, functional motion only
cartoon-free
directory browse, project pages, contribution graph, check-in composer, mentor sessions, all dense and repeated surfaces, all costly-failure states
nothing. flat components, functional motion
maximum expressive load in one view: one drawing plus one device. when a view exceeds it, cut in this order: (1) the device, (2) expressive motion, (3) the drawing's scale tier, (4) the drawing.
intensity scales inversely with frequency and density. a surface a person sees once per cohort may carry full register. a surface they see daily carries spot at most. a surface with more than twenty repeating rows carries nothing.
decay rule. any celebratory drawing or burst tied to a repeatable action fires on the first three occurrences per person, then never again for that action. the check-in composer is the clearest case: the first check-in earns a burst, the seventh earns silence, and the silence is correct.
conflict resolution, per surface class. on high-expression surfaces, expression wins and clarity is protected by keeping copy plain. on low surfaces, clarity wins and expression is cut to spot. on cartoon-free surfaces there is no conflict, because expression is not permitted to enter.
10.11 production system
a cartoon system dies when nobody can make the next asset.
construction procedure for any new drawn object:
name the object and the single job it does in the interface. an object with no job is not made.
reduce it to six or fewer closed shapes that survive at 24px.
choose one attribute to exaggerate, no more.
apply the outline, terminal, and fill rules from 10.1.
rotate 1 to 3 degrees, direction chosen to oppose whatever sits next to it.
add the hard offset in blue-deep at the tier's offset value.
if it is a cast member, add the two-dot face and select from the six permitted expressions.
export at all three tiers from the same source, never redrawn.
brief structure when commissioning or generating an asset: object, job in the interface, tier, expression (if cast), the one exaggerated attribute, the adjacent element it must rotate against, and the palette values permitted. a brief missing the "job" field is rejected before work starts.
quality gate, all five required before an asset ships:
constructible from the six-shape budget
identifiable in silhouette alone at 24px
rotation present and opposing its neighbor
offset shadow present, zero blur, correct tier value
no gradient, no glow, no shading, no third stroke weight
disqualification test. an asset is rejected if it: uses tapering or variable line weight, sits axis-aligned, renders volume with shading, adds a seventh shape, uses a palette value from the interface set rather than the illustration set, depicts a person, or could be dropped into a payroll company's marketing without anyone noticing.
capacity reconciliation, stated plainly. two founders building a platform cannot also produce a large illustrated library. the honest scope for run one is: six cast figures, five devices, and no more than four feature-tier scenes. everything else uses spot drawings composed from the existing six. full-bleed work is deferred until after the first sprint. this is logged as a shortfall rather than pretended away.
10.12 accessibility of drawn work
classification. every drawn element is either decorative (aria-hidden, no alt) or meaningful (alt text describing the information, not the drawing). a cast figure inside a medium chip is meaningful, and its alt is the medium name.
no information exists only in a drawing. every cast figure in a functional role sits beside a text label. the medium chip always reads "film" in text next to the camera.
contrast obligation for outlined forms. an outline carrying meaning must clear 3:1 against its own fill and against the ground behind it. blue on ground measures 8.02:1 and passes. blue-deep fills therefore require a text white outline, never a blue one.
devices are always decorative and always aria-hidden, because their meaning is duplicated by the copy and the layout. a ring is never the only indication that something is selected.
motion sensitivity is handled by 10.6: stilled, not removed.
10.13 verification, all four required
greyscale. strip color. the identity must survive on outline weight, offset shadow, rotation, and silhouette alone. it does, because none of those four are color-dependent.
freeze. remove all motion. the identity must survive in a still screenshot. it does, because the register lives in construction rather than animation.
blur. blur the content. the composition must read as launchology from silhouette and rotation alone: black field, one bright element, crooked cutouts with hard offsets.
density. apply the system to the directory at 200 projects, the most utilitarian surface in the product. the register correctly collapses to nothing there, per 10.10. this is the system working, not failing: the rules already say dense surfaces are cartoon-free, so the identity is carried by type, color, and the reel instead.
the reel
the signature graphic device, derived from the media grid the founders selected as a reference.
definition. a grid of square media tiles (radius 0) that cycle their content on a fixed interval, so the block reads as continuously alive without any tile demanding attention.
specification. 3x3 on desktop, 2x3 on mobile. each tile advances every 500ms. tiles are staggered by 55ms so no two ever flip on the same frame. transition is a hard cut, never a crossfade, because the reference's energy comes from the cut. source content is real builder work pulled from the directory, never placeholder and never stock.
where it may appear. marketing hero, directory landing, finale recap, and social exports. it is banned from every surface where a person is trying to read or work, because a permanently animating block adjacent to text is hostile.
what it is a system for, not a decoration. the reel is how launchology renders the fact that many people are making things at once, which is the flywheel made visible. any future surface that needs to express collective activity uses the reel rather than inventing a new device.
reduced motion. the reel freezes into a static grid and does not cycle. it never falls back to a single image.
iconography
a single stroke icon set, 1.5px stroke, 24px grid, rounded caps, no fills. icons are functional only and never decorative. an icon never appears without a text label except in a transport control or a persistent nav item whose meaning is unambiguous. icons never carry brand expression; the illustration system does that.
11. motion and interaction system
motion's job here is to confirm and to convey liveness, never to entertain. a black interface with animated ornament reads as a crypto landing page within one second.
category
duration
easing
example
instant feedback
100ms
linear
button press, checkbox
state change
160ms
cubic-bezier(.2,0,0,1)
hover, focus, expand
element enter or exit
220ms
cubic-bezier(.2,0,0,1)
menu, toast, drawer
view transition
280ms
cubic-bezier(.4,0,.2,1)
page change
reel cadence
500ms per tile, 55ms stagger
step
the reel only
choreography. entering elements move a maximum of 8px and always along one axis. never scale-and-fade at once. staggered lists animate at 30ms intervals and stop staggering after the sixth item.
what must never animate. the contribution graph never animates on load, because animating a record of someone's work turns evidence into a performance. counts never count up. the ground never moves. nothing loops except the reel.
how the interface responds to intent. every interactive element has a visible response within 100ms. actions that take longer than 400ms show a skeleton in raised, never a spinner, except for a full-page load.
how it confirms. confirmation is textual and specific, in a toast at bottom-center on raised-2, 3 seconds, one line, lowercase. it names what happened ("check-in posted") rather than congratulating ("nice work!").
how it corrects. errors appear adjacent to the cause, never as a modal, in error with a plain-language sentence stating what to do next. the interface never blames the person.
reduced motion. prefers-reduced-motion disables the reel's cycling, all transforms, and all staggering. opacity transitions remain at 100ms. no functionality is lost.
12. component architecture
layered: primitives compose into composites, composites into patterns, patterns into templates. a component may only compose from the layer below it.
primitives
button, input, textarea, select, checkbox, radio, toggle, chip, avatar, icon, link, tooltip, skeleton, divider.
button variants: primary (fill blue, text #000), secondary (fill raised-2, text text), ghost (no fill, text text), destructive (text error, ghost only, never a fill).
required state matrix for every primitive: default, hover, focus-visible, active, selected, loading, disabled, read-only, error. a component shipped without all nine is incomplete.
focus is a 2px blue ring at 2px offset, on every focusable element, never removed.
touch targets are a minimum of 44x44px including padding, on every surface, at every breakpoint.
composites
card, list row, media tile, avatar cluster, empty state, toast, modal, drawer, menu, tab set, filter bar, search field, pagination, form group, comment, message bubble, waveform player, code card, type specimen card.
patterns
these are launchology-specific and encode product meaning.
pattern
composed of
rules
profile header
avatar, display-3 name, mono metadata, action row
never shows counts of followers or projects; timezone always explicit
contribution graph
timeline of inspectable marks
read-only; never animates; empty stretches render plainly; hovering a mark reveals its content; never scored or totaled
project card
media tile or designed representation, display-3 title, builder attribution, medium chip
builder attribution is never smaller than body-s; the medium chip is the only place medium is stated
builder card
avatar, name, capability chips, one line of authored prose
never shows availability, drive, or hours, which are private matching inputs; never shows a match score
suggestion
builder card plus a plain-language reason
reason cites public profile facts only; two actions, follow and message; dismissal is silent and has no reject affordance
check-in composer
textarea, two prompts, post action
prompts are "what did you work on" and "what's blocking you"; never gamified; never shows a streak
team strip
avatar cluster, team name, space link
always visible inside sprint surfaces so the team is never out of sight
cluster board
grid of team strips
flat ordering; never sorted by activity or progress
reel
media tile grid
see part 10
session card
time with explicit zone, mentor avatar, teams on the floor, join action
join is the only accent element on the card
templates
marketing page, signup passage, onboarding passage, directory browse, project record, profile record, community stream, team workspace, sprint dashboard, finale room, email.
rules for creating a new component
prove no existing composite can be configured to do it.
name the layer it belongs to and compose only from the layer below.
define all nine states before any visual work.
verify it holds all five media types (part 10) if it carries media.
verify it introduces no new color, radius, or type value.
verify it cannot be used to rank, score, or compare people. scoped by the founder, 2026-08-22: the prohibition is on rendering a person as a number, not on computing one, so a score may decide what appears so long as it is never shown.
add it to this document in the same pass it ships, or it does not ship.
13. content, voice, and microcopy as design
voice is defined by constraints because adjectives are unenforceable.
hard constraints. lowercase throughout except proper nouns and the eyebrow step. no em dashes or en dashes, anywhere, ever. no negative parallelism ("it isn't x, it's y"). no aphorism formulas. no forced groups of three. no significance inflation. no emphasis words used for fake weight ("truly," "incredibly"). no exclamation marks in the product interface (they are permitted in outreach email and in human-written messages, not in system copy). sentences flow through commas rather than clipping into fragments for drama.
terminology lock. one term per concept, permanently: builder (never user, member, or student), project (never submission, entry, or product), make (never build when referring to non-software work), team, cluster, sprint (never cohort when referring to the two weeks), check-in, directory, community. a violation is a bug.
labels and actions. verb first, lowercase, specific to the object: "post check-in," not "submit." never "click here." never "learn more" without an object.
errors. state what happened and what to do, in one sentence, without apology or blame. "that file is over 50mb, try a smaller one."
empty states. never a bare "nothing here." see part 15.
confirmations. name the completed action plainly. "check-in posted." never "success!"
numbers and dates. numerals always. dates as "22 jul" in-product and "22 july 2026" in email. times always carry a zone. durations as "2 weeks," never "14 days," when referring to the sprint.
exemplar lines that demonstrate the rules.
empty directory: "no projects yet. the first ones land on finale day."
empty graph: "nothing here yet, which is honest. it fills when you check in or ship something."
first check-in prompt: "two or three lines is plenty. your team sees this, nobody else does."
solo option at signup: "building alone is a real choice, not the safe one."
failed wildcard ask: "we couldn't get this one. here's who we tried."
14. information architecture and navigation
structural model. two modes over four persistent objects. the objects (people, projects, connections, spaces) are permanent. sprint mode is a temporary layer that appears in navigation only while a sprint is live and disappears cleanly when it ends.
primary navigation (persistent, all breakpoints): home, directory, community, learn (archive plus lectures), you (profile). sprint appears as a sixth item only during a sprint and is removed, not disabled, when the sprint ends.
navigation patterns. mobile is a bottom bar with five items maximum, 56px tall, labels always visible, never icon-only. desktop is a left rail at 240px, collapsible to 64px, with labels retained in tooltip. the bar and rail are ground with a line top or right border, never a shadow.
state persistence. filters, scroll position, and draft text persist for the session on every collection and stream surface. a person who opens a project and goes back never loses their place.
search. one search entry point that queries people and projects together, with results grouped by object type and never blended into a single ranked list, because a blended ranking would rank people against projects and eventually against each other.
filtering. always additive, never exclusive by default. filter state is always visible as removable chips. no filter defaults to sorting by popularity.
deep links and entry points. every project, profile, and public post has a permanent shareable URL that renders fully without authentication. this is required by the directory's purpose: a sponsor or recruiter must be able to open a builder's work with no account.
rule for placing something new in the IA. identify which of the four objects it belongs to and nest it there. if it belongs to none, it is probably sprint-scoped and lives under sprint. if it belongs to more than one, it is two things and should be split.
15. states, edge cases, and failure design
this part carries unusual weight because the largest product risk is a beginner deciding within thirty seconds that they do not belong here.
pattern family, applied everywhere: every non-ideal state has (1) a plain sentence naming the state without euphemism, (2) an honest reason where one exists, and (3) exactly one thing to do next. states 1 and 3 are mandatory. illustration is permitted only in first-run and empty states, and only one per view.
state
rule
first run
never an empty shell. a new profile shows the archive, three suggested builders, and the community's latest activity before it shows anything about the person's own emptiness.
empty (own content)
frame as not-yet rather than absence, and always point at someone else's work to explore. never guilt.
empty (search or filter)
state what was searched, offer to widen, and show three adjacent results rather than nothing.
loading
skeletons in raised matching final layout. never a spinner except full-page. never a progress percentage.
partial
render what loaded and mark the gap plainly. never block a whole view on one failed section.
error
plain sentence, cause if known, one recovery action. never a modal. never an error code alone.
offline
banner in warn, queued actions preserved and clearly labeled as queued.
permission
explain what the person is missing and how to get it, never a bare "access denied."
over-limit
state the limit and the number, offer the alternative.
stall (two missed check-ins)
surfaced to the person and their team as a plain observation, never a warning, never red, never public beyond the team. this is the single most delicate state in the product; it must read as a teammate noticing, not as a system flagging.
team fell below three
never framed as failure of the remaining people. states the merge plainly and names the new team.
wildcard ask failed
states the failure honestly and names the attempt. this is required by the drop's design.
sprint ended
the surface is not deleted. it becomes a record, and the view points at the standing weekly thing and the persisted team.
deprecated
a plain notice with the replacement linked, present for one full release cycle before removal.
the dead-end rule. no state in the product may leave a person with nothing to do. every terminal state carries at least one route back to work or to people.
16. accessibility and inclusive standard
conformance target: WCAG 2.2 AA, with AAA on body text. this is enforceable, not aspirational, and it is a philosophical requirement rather than a compliance one: a product whose first principle is no barrier to entry cannot ship barriers.
contrast. body text is AAA on its ground. all values in part 6 carry computed ratios. blue-deep and text-3 are constrained by rule because they fail. no new color enters the system without a computed ratio in this document.
color independence. no state, status, or meaning is ever conveyed by color alone. every colored status carries a text label or an icon. this is checked by rendering the surface in greyscale; if meaning is lost, it fails.
focus. 2px blue ring at 2px offset on every focusable element. focus is never suppressed. focus order follows visual order. modals and drawers trap focus and restore it on close.
keyboard. every action is reachable and operable by keyboard. escape closes any overlay. arrow keys navigate menus and grids. the reel is not focusable because it is not interactive.
touch. 44x44px minimum, every surface, every breakpoint, including dense mode.
screen readers. every media item carries alt text or a transcript. the contribution graph exposes a text alternative listing marks by date, because a visual timeline is otherwise invisible. live regions announce toasts. decorative illustration is aria-hidden.
motion. prefers-reduced-motion is honored globally, including the reel. no functionality is motion-dependent.
language. every surface must survive a doubling of string length. no text is baked into images. lang is set correctly per content.
captions. demo videos and lecture recordings require captions before they publish. this is a hard gate on the lecture library.
17. token architecture and handoff
three tiers. primitive holds raw values, semantic holds roles, component holds bindings. components reference semantic tokens only, never primitives, so a value change propagates without touching components.
naming: [tier]-[category]-[role]-[variant]-[state], lowercase, hyphen-delimited.
primitive:  color-black, color-blue-500, space-16, radius-12, dur-160
semantic:   color-ground, color-raised, color-text, color-text-2,
            color-accent, color-accent-decorative, color-success,
            color-error, color-warn, color-line,
            space-inset-card, space-stack-section,
            type-display-1, type-body, type-label,
            motion-state, motion-enter, motion-view
component:  button-primary-bg, button-primary-bg-hover,
            card-radius, input-border-focus, reel-tile-interval

aliasing. a component token always resolves to a semantic token, never to a primitive and never to a literal. a literal value in a component is a defect.
theming. the architecture supports theming, but only one theme exists and light mode is out of scope (part 6). the tier structure exists for future sub-brands and for surface-level density, not for inverting the ground.
platform mapping. tokens are authored once as JSON and generated into CSS custom properties for web. mobile and email consume the same source. email additionally requires inlined literal values, which is the single sanctioned exception to the no-literals rule.
versioning. semantic versioning on the token package. a value change is a minor; a rename or removal is a major and requires a deprecation cycle (part 19).
18. decision framework, designing something new
follow in order. do not skip.
is it real? does this serve a builder making something, a builder finding a person, or the community's continuity? if it serves engagement, retention, or metrics alone, stop.
does it rank, score, or compare people? if yes, stop. redesign or abandon. this test has already killed several features and is expected to keep doing so. scoped by the founder, 2026-08-22: the prohibition is on rendering a person as a number, not on computing one, so a score may decide what appears so long as it is never shown.
which of the five archetypes is it? (part 9.) if none, escalate rather than invent.
which of the four objects does it belong to? (part 14.) if none, it is sprint-scoped.
can existing components do it? configure before creating.
does it hold all five media types? if it carries media and assumes an image, redesign.
what is the one focal element? if two, split the view.
run the default rejection check. name the conventional solution for this problem. reject it explicitly, or adopt it with a stated reason grounded in this document. silent defaults are the primary failure mode.
specify all nine states before visuals.
run the tests below. all must pass.
ship tests.
greyscale test: render greyscale; no meaning is lost.
blur test: blur the content; the layout is still identifiably launchology.
beginner test: a person with nothing made and nobody known opens this surface and is not made to feel absent.
375px test: it works on a small phone without horizontal scroll.
keyboard test: every action is reachable without a mouse.
podium test: nothing here creates a winner.
paste test: no sentence in the copy would survive being pasted into another company's product.
19. governance and evolution
ownership. the two founders own this document jointly. either may amend it. amendments are written into the document in the same change that ships the design, never afterward.
changing a rule versus taking an exception. an exception is a one-time deviation, recorded inline in the exception log with the surface, the rule, the reason, and an expiry date. three exceptions against the same rule mean the rule is wrong and must be rewritten rather than repeatedly excused.
what requires a full rule change: anything touching part 2 (brand truths), part 4 (anti-identity), the color ground, the type families, or the accessibility target. these are the load-bearing layer and are not adjusted casually.
drift detection. every new surface is checked against the ship tests in part 18 before it ships. any literal color, spacing, or type value found in code is a drift defect and is fixed at the token layer, not locally.
deprecation. a deprecated component or token stays available for one full release cycle with a notice, then is removed. nothing is silently deleted.
when to revisit rather than obey. if a rule forces a solution that is worse for a builder than the alternative, the rule is wrong. record the case, take the exception, and schedule the rewrite. a design system that produces worse products than its absence has failed regardless of its internal consistency.
20. open decisions register
honest and complete. an empty register on thin material would be evidence of fabrication elsewhere.
#
gap
blast radius
what resolves it
interim rule
priority
1
display typeface unresolved RESOLVED. Satoshi replaces Antor as display, Array Regular added as a rationed accent. both measured, both licensed for commercial use.
n/a
n/a
n/a
closed
2
body monospace unidentified RESOLVED. Space Mono, SIL OFL 1.1, four styles supplied. metrics measured and folded into part 7.
n/a
n/a
n/a
closed
3
no script-matched companion face for non-latin interface strings. Space Mono is measured latin-only; builder content in other scripts falls back to system mono, but launchology's own strings cannot be localized beyond latin.
localization, any non-latin market
select a companion monospace with CJK or cyrillic coverage and matching metrics
interface strings stay latin; builder content uses the system fallback and must not break layout
high
4
no logo exists.
favicon, social exports, nav, email, OG images
design or commission it
wordmark set in the display face, lowercase, as an interim
high
5
illustration palette values are undefined. construction rules are fully locked (part 10.1) but the fill hex values are not.
all drawn work
first cast figure locks the palette; needs 4 to 6 values that each clear 3:1 against ground
drawn work uses text, blue, and blue-deep only until locked
high
14
production capacity shortfall, logged plainly. the cartoon system as specified needs six cast figures, five devices, and four feature scenes before run one, and two founders are also building the platform.
all high-expression surfaces
commission an illustrator, or cut to three cast figures and two devices
ship spot tier only; full-bleed deferred past the first sprint
high
6
the reel needs real builder media and none exists yet. the device is banned from using placeholder or stock content.
marketing hero, directory landing, social
run one's finale populates it
the reel does not ship before the first finale; marketing uses a static display-type hero instead
high
7
contribution graph visual form is specified as a timeline but not drawn. rules are fixed (build-only, lifetime, inspectable, never animated); the rendering is not.
profile record
design pass
rules in parts 12 and 11 hold; any rendering satisfying them is valid
medium
8
community area taxonomy is minimal by decision but unvalidated.
community stream, navigation
run one's usage
minimal set only; add on demonstrated demand
medium
9
email rendering constraints are untested. dark-ground email is unreliable across clients.
all email
test across major clients
email may use a light ground as the single sanctioned exception to part 6, pending test
medium
10
AI query layer has no interface pattern. part 12 specifies discovery suggestions but not the conversational surface.
discovery
design pass before that feature ships
must obey the no-score and silent-dismissal rules regardless of form
medium
11
sponsor credit slots are undefined. truth 7 requires them legible and subordinate; no placement or sizing is fixed.
project pages, sprint surfaces, marketing
first sponsor agreement
named text credit in text-2 only, no logos, until specified
medium
12
finale room at scale is unmodeled. ~20 teams synchronous, many rooms at once.
finale template
technical spike
workspace archetype rules hold
low until the sprint
13
no motion or interaction has been tested with real users. every value in part 11 is derived, not validated.
