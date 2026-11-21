# Steering — Structure (Clippy Reborn)

## Layout

```
clippy-reborn/
├── index.html          App shell: editor pane, Pip dock, speech bubble, toolbar, manners panel
├── styles.css          Layout, editor styling, Pip animation states, reduced-motion rules
├── app.js              Editor state, action dispatch, diff/accept flow, manners engine
├── lib.js              Pure helpers: debounce, excerpt, diff rendering, relative time
├── README.md           Concept, differentiation, estimate, compliance notes
├── research.md         Research notes with sources
├── LICENSE             MIT
├── .gitignore          Must NOT ignore .kiro
└── .kiro/
    ├── specs/
    │   └── clippy-reborn/
    │       ├── requirements.md
    │       ├── design.md
    │       └── tasks.md
    ├── steering/
    │   ├── product.md
    │   ├── tech.md
    │   └── structure.md
    └── hooks/
        └── hooks.json  (no-secrets, spec-before-code, .kiro-must-not-be-gitignored guards)
```

## Conventions
- One responsibility per file; `lib.js` holds only pure functions (testable without the DOM).
- Pip's SVG lives inline in `index.html` (no separate asset file) so the app shell is a single fetch.
- All user-visible copy lives in `app.js` as named constants (easy to audit the voice).
- localStorage keys are prefixed `pip-` (see design.md data model).
- No file may contain an API key, token, or secret of any kind. The hooks guard enforces this.
- Draft the spec before the code; update the spec when the design changes. The spec is the record, not an afterthought.
