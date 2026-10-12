# CONQUEST — DARK STRATEGIST
## Living Continental Theatre · Alpha 0.11

### Core visual direction
A *living, explorable world*, not a rectangular puzzle board or a dashboard.
One continuous overhead terrain surface with a recognizable continent, irregular
gulfs and peninsulas, coastal water, lowlands, valleys, highlands, groves,
roads and military formations. Ownership colors are translucent influence
over geography; land should retain its own identity under every flag.

The world is now **33 × 19** logical cells, with roughly **377 traversable
continental sectors** and surrounding open water. Water remains visible but
uncapturable: there are no magic sea invasions or fake naval abilities.
Five distinct homeland capitals remain persistent after defeat.

### Micro / regional / global — same authoritative world
**MICRO / tactical**: zoom near troop stacks. Read local garrisons, formations,
topography and marches. Select a friendly battalion, then tap an enemy neighbour.

**REGIONS / operational**: observe political fronts and significant army
concentrations. Distant offensives use real corridors through owned land;
crossing an enemy's rear is not instant teleportation.

**WORLD / strategic**: entire geographical campaign on screen, with distinct
coastline, faction spheres of influence, troop aggregation markers, selected
source garrisons and the actual command deck. This is *not a passive preview*.
Tapping a friendly army marker chooses its source; tapping an attainable enemy
front dispatches a routed assault. SEND SUPPORT selects connected friendly
destinations, and force commitment 35/65/90% is preserved at every scale.
A territory can't be ordered to cross ocean or disconnected hostile land.

**AUTO**: begins MICRO. Switches to REGIONS after 11 owned land sectors,
and WORLD after 38. Manual views always override AUTO. Interactive touch zoom
and navigation remain available on phones.

### Preservation and balance
- Previous 147-sector game state must survive conversion. Older saves are
  embedded within the new landmass; troop stacks, capitals, occupations,
  marches, cooldowns, reserves and time are retained.
- Every legal attack is an engine order, not a canvas-only animation.
- Political sovereignty can change and the world keeps going.
- No fixed Game Over, no paywalls and no permanent faction elimination.
- This release is **a genuinely different continental map design, not final
  professional terrain art**. Future hand-painted assets and procedural
  geology should follow gameplay usability tests.

### Visual release criteria
Check actual mobile landscape and portrait Canvas at minimum. In WORLD:
garrisons visible as readable unit badges, sector selection works, support
remains available, distant attacks follow a legal supply corridor.
On MICRO: at least one local battle can be commanded within seconds.
Protect saved conquests during migration and ensure no water captures.
