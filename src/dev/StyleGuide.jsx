import { CheckIcon, CrossIcon } from '../components/icons/FeedbackIcons'
import './StyleGuide.css'

const COLORS = [
  { name: '--color-bg', label: 'Háttér', value: '#f7f3ea' },
  { name: '--color-surface', label: 'Felület', value: '#ffffff' },
  { name: '--color-ink', label: 'Szöveg', value: '#2b2620' },
  { name: '--color-primary', label: 'Elsődleges', value: '#2f5d77' },
  { name: '--color-success', label: 'Helyes (siker)', value: '#2f9e58' },
  { name: '--color-error', label: 'Hibás', value: '#c94f3d' },
]

const SPACES = ['space-1', 'space-2', 'space-3', 'space-4', 'space-5', 'space-6', 'space-7', 'space-8']

// Static mockup only, for visual review. The real reusable, interactive
// version is built in Task 1.1 (PlaceValueTable component).
function SampleTable({ mode }) {
  const classes = [
    { name: 'Milliós osztály', digits: mode === 'display' ? ['1', '2', '3'] : ['', '', ''] },
    { name: 'Ezres osztály', digits: mode === 'display' ? ['4', '5', '6'] : ['', '', ''] },
    { name: 'Egyes osztály', digits: mode === 'display' ? ['7', '8', '9'] : ['', '', ''] },
  ]
  const placeLabels = ['Sz', 'T', 'E']

  return (
    <div className="sample-table" data-mode={mode}>
      {classes.map((cls) => (
        <div className="sample-table-class" key={cls.name}>
          <div className="sample-table-class-name">{cls.name}</div>
          <div className="sample-table-cells">
            {cls.digits.map((digit, i) => (
              <div className="sample-table-cell-wrap" key={placeLabels[i]}>
                <div className={`sample-table-cell ${mode === 'interactive' ? 'is-empty' : ''}`}>
                  {digit}
                </div>
                <div className="sample-table-place-label">{placeLabels[i]}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function StyleGuide() {
  return (
    <div className="style-guide">
      <header className="style-guide-header">
        <h1>Stílus referencia</h1>
        <p>Design tokenek és minta komponensek áttekintése.</p>
        <a href="./">← Vissza az alkalmazáshoz</a>
      </header>

      <section>
        <h2>Színek</h2>
        <div className="color-grid">
          {COLORS.map((c) => (
            <div className="color-swatch" key={c.name}>
              <div className="color-swatch-block" style={{ background: c.value }} />
              <div className="color-swatch-label">{c.label}</div>
              <code>{c.value}</code>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Tipográfia</h2>
        <p className="section-note">
          Nagy, jól olvasható számjegyek a cél (10–11 éves diákok).
        </p>
        <div className="type-scale">
          <div style={{ fontSize: 'var(--text-xs)' }}>Apró szöveg (xs)</div>
          <div style={{ fontSize: 'var(--text-sm)' }}>Másodlagos szöveg (sm)</div>
          <div style={{ fontSize: 'var(--text-base)' }}>Alap szöveg (base)</div>
          <div style={{ fontSize: 'var(--text-lg)' }}>Alcím (lg)</div>
          <div style={{ fontSize: 'var(--text-xl)' }}>Szakaszcím (xl)</div>
          <div style={{ fontSize: 'var(--text-2xl)' }}>Oldalcím (2xl)</div>
          <div className="digit-sample" style={{ fontSize: 'var(--text-digit)' }}>
            0 1 2 3 4 5 6 7 8 9
          </div>
        </div>
      </section>

      <section>
        <h2>Térköz skála</h2>
        <div className="space-scale">
          {SPACES.map((s) => (
            <div className="space-row" key={s}>
              <code>--{s}</code>
              <div className="space-box" style={{ width: `var(--${s})`, height: `var(--${s})` }} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Visszajelzés (szín + ikon együtt)</h2>
        <p className="section-note">
          A szín önmagában soha nem hordoz jelentést — mindig ikon is párosul hozzá.
        </p>
        <div className="feedback-row">
          <div className="feedback-pill feedback-success">
            <CheckIcon />
            <span>Helyes!</span>
          </div>
          <div className="feedback-pill feedback-error">
            <CrossIcon />
            <span>Próbáld újra!</span>
          </div>
        </div>
      </section>

      <section>
        <h2>Helyiérték táblázat — minta</h2>
        <p className="section-note">
          Statikus makett a tankönyvi elrendezés ellenőrzésére. A valódi,
          újrafelhasználható komponenst az 1.1-es feladat építi meg.
        </p>
        <h3>Megjelenítő mód (kitöltött)</h3>
        <SampleTable mode="display" />
        <h3>Interaktív mód (üres, nagy érintőfelület)</h3>
        <SampleTable mode="interactive" />
      </section>
    </div>
  )
}

export default StyleGuide
