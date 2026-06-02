# Company logos — Industry Demand marquee

Drop logo files here to replace the text wordmark fallbacks used by
`components/IndustryDemand.tsx`.

- `global/` — international employers (marquee scrolls left)
- `thai/` — Thai employers (marquee scrolls right)

Naming: lowercase company name, `.svg` preferred (crisp + tiny), e.g.
`global/google.svg`, `thai/scb.svg`. Match the `name.toLowerCase()` used in
`GLOBAL_COMPANIES` / `THAI_COMPANIES`.

Each logo renders grayscale at 60% opacity and turns full colour on hover, so
single-colour or full-colour artwork both work. Until a file exists, the slot
shows a clean monochrome wordmark — no broken images.
