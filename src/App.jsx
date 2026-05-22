import { useState } from 'react'

const FORMSPREE_URL = 'https://formspree.io/f/mjgzwaep'
const EMAILJS_SERVICE_ID = 'service_j971m8o'
const EMAILJS_TEMPLATE_ID = 'template_omb76cr'
const EMAILJS_PUBLIC_KEY = '2yCFNfEVUg-QgberQ'
const RATES = { driveway: 0.23, patio: 0.30, walkway: 0.25, fence: 0.35, trash: 15 }
const BUNDLE_DISCOUNT = 0.10
const MAJOR = ['driveway', 'patio', 'walkway', 'fence']

const today = () => new Date().toISOString().split('T')[0]
const addDays = (d, n) => {
  const dt = new Date(d)
  dt.setDate(dt.getDate() + n)
  return dt.toISOString().split('T')[0]
}
const fmtDate = (d) => {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${m}/${day}/${y}`
}
const fmtMoney = (n) => '$' + parseFloat(n || 0).toFixed(2)

const STEPS = ['Customer', 'Services', 'Measurements', 'Review', 'Quote']

const initialState = {
  customer: { name: '', phone: '', email: '', address: '', quoteDate: today(), expiryDate: addDays(today(), 14) },
  services: { driveway: false, patio: false, walkway: false, fence: false, trash: false },
  measurements: {
    driveway: [{ l: '', w: '' }],
    patio: [{ l: '', w: '' }],
    walkway: [{ l: '', w: '' }],
    fence: [{ l: '', h: '', sides: '2' }],
    trashCans: '1',
  },
  pricing: { manualOverride: '', manualDiscount: '' },
  notes: { internal: '', customer: '' },
}

function calcEst(state) {
  const bd = {}
  let sub = 0

  if (state.services.driveway) {
    const s = state.measurements.driveway.reduce((a, x) => a + (parseFloat(x.l) || 0) * (parseFloat(x.w) || 0), 0)
    bd.driveway = { sqft: s, cost: s * RATES.driveway, label: 'Driveway Cleaning', rate: RATES.driveway }
    sub += s * RATES.driveway
  }
  if (state.services.patio) {
    const s = state.measurements.patio.reduce((a, x) => a + (parseFloat(x.l) || 0) * (parseFloat(x.w) || 0), 0)
    bd.patio = { sqft: s, cost: s * RATES.patio, label: 'Patio Cleaning', rate: RATES.patio }
    sub += s * RATES.patio
  }
  if (state.services.walkway) {
    const s = state.measurements.walkway.reduce((a, x) => a + (parseFloat(x.l) || 0) * (parseFloat(x.w) || 0), 0)
    bd.walkway = { sqft: s, cost: s * RATES.walkway, label: 'Walkway Cleaning', rate: RATES.walkway }
    sub += s * RATES.walkway
  }
  if (state.services.fence) {
    const s = state.measurements.fence.reduce((a, x) => a + (parseFloat(x.l) || 0) * (parseFloat(x.h) || 0) * (parseFloat(x.sides) || 1), 0)
    bd.fence = { sqft: s, cost: s * RATES.fence, label: 'PVC Fence Cleaning', rate: RATES.fence }
    sub += s * RATES.fence
  }
  if (state.services.trash) {
    const c = parseInt(state.measurements.trashCans) || 1
    bd.trash = { cans: c, cost: c * RATES.trash, label: 'Garbage Can Sanitation', rate: RATES.trash }
    sub += c * RATES.trash
  }

  const majorCount = MAJOR.filter((s) => state.services[s]).length
  const bundle = majorCount >= 2
  const customDiscount = parseFloat(state.pricing.manualDiscount) || 0
  const discAmt = customDiscount > 0 ? customDiscount : bundle ? sub * BUNDLE_DISCOUNT : 0
  const after = sub - discAmt
  const final = state.pricing.manualOverride ? parseFloat(state.pricing.manualOverride) : after

  return { bd, sub, bundle, discAmt, customDiscount, final }
}

// ── Stick Figure SVG ─────────────────────────────────────────────────────────
function StickFigure() {
  return (
    <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginTop: 4 }}>
      <ellipse cx="62" cy="12" rx="18" ry="4" fill="#2e7be0" />
      <path d="M46 12 Q48 2 62 2 Q76 2 78 12 Z" fill="#2e7be0" />
      <circle cx="62" cy="18" r="10" fill="none" stroke="#1a1a2e" strokeWidth="2.5" />
      <line x1="62" y1="28" x2="62" y2="58" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="62" y1="38" x2="30" y2="48" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="62" y1="38" x2="78" y2="46" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="62" y1="58" x2="48" y2="80" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="62" y1="58" x2="74" y2="80" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="30" y1="48" x2="10" y2="52" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
      <circle cx="30" cy="48" r="3" fill="#1a1a2e" />
      <line x1="10" y1="52" x2="2" y2="42" stroke="#2e7be0" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="52" x2="2" y2="58" stroke="#2e7be0" strokeWidth="2" strokeLinecap="round" />
      <rect x="0" y="90" width="90" height="18" rx="4" fill="#1a1a2e" />
      <text x="45" y="102" fontFamily="Nunito,sans-serif" fontSize="9" fill="white" textAnchor="middle" fontWeight="700">INTERNAL USE ONLY</text>
    </svg>
  )
}

// ── Header ───────────────────────────────────────────────────────────────────
function Header() {
  return (
    <div style={styles.header}>
      <div style={styles.headerInner}>
        <div style={{ flex: 1, paddingRight: 10 }}>
          <div style={styles.brandName}>THE CLEANING PEOPLE</div>
          <div style={styles.brandSub}>POWERWASHING SERVICES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
            {['DRIVEWAYS', 'PATIOS', 'WALKWAYS', 'GARBAGE CAN SANITATION + MORE'].map((s) => (
              <span key={s} style={styles.pill}>• {s}</span>
            ))}
          </div>
          <div style={styles.tagline}>WE MAKE THINGS LESS DIRTY - CONTACT TODAY!</div>
          <div style={styles.contactRow}>
            <span>✉ thecleaningpeopl3@gmail.com</span>
            <span>✆ (919) 426-6226</span>
          </div>
        </div>
        <StickFigure />
      </div>
    </div>
  )
}

// ── Step Nav ─────────────────────────────────────────────────────────────────
function StepNav({ step, onGo }) {
  return (
    <div style={styles.stepNav}>
      {STEPS.map((s, i) => (
        <button
          key={s}
          onClick={() => onGo(i)}
          style={{
            ...styles.stepBtn,
            ...(i === step ? styles.stepBtnActive : {}),
            ...(i < step ? styles.stepBtnDone : {}),
          }}
        >
          {i < step ? '✓ ' : ''}{s}
        </button>
      ))}
    </div>
  )
}

// ── Card wrapper ─────────────────────────────────────────────────────────────
function Card({ children }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardLines} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}

function SectionTitle({ children }) {
  return <div style={styles.sectionTitle}>{children}</div>
}

// ── Step 0: Customer ─────────────────────────────────────────────────────────
function StepCustomer({ data, onChange, onNext }) {
  const field = (label, id, type = 'text', placeholder = '') => (
    <div style={styles.formGroup}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        value={data[id]}
        placeholder={placeholder}
        onChange={(e) => onChange(id, e.target.value)}
      />
    </div>
  )
  return (
    <>
      <Card>
        <SectionTitle>Customer Info</SectionTitle>
        <div style={styles.formRow}>
          {field('Customer Name', 'name', 'text', 'Jane Smith')}
          {field('Phone', 'phone', 'tel', '(919) 555-0100')}
        </div>
        <div style={styles.formRow}>
          {field('Email', 'email', 'email', 'jane@email.com')}
          {field('Quote Date', 'quoteDate', 'date')}
        </div>
        <div style={{ marginBottom: 10 }}>
          {field('Service Address', 'address', 'text', '123 Main St, Wake Forest NC')}
        </div>
        {field('Quote Expires', 'expiryDate', 'date')}
      </Card>
      <div style={styles.navRow}>
        <div />
        <button style={styles.btnPrimary} onClick={onNext}>Next: Services →</button>
      </div>
    </>
  )
}

// ── Step 1: Services ─────────────────────────────────────────────────────────
const SVC_DEFS = [
  { key: 'driveway', label: 'Driveway Cleaning', price: '$0.23 / sq ft' },
  { key: 'patio', label: 'Patio Cleaning', price: '$0.30 / sq ft' },
  { key: 'walkway', label: 'Walkway Cleaning', price: '$0.25 / sq ft' },
  { key: 'fence', label: 'PVC Fence Cleaning', price: '$0.35 / sq ft' },
  { key: 'trash', label: 'Garbage Can Sanitation', price: '$15 / can' },
]

function StepServices({ services, onToggle, onNext, onBack }) {
  const majorCount = MAJOR.filter((s) => services[s]).length
  return (
    <>
      <Card>
        <SectionTitle>Select Services</SectionTitle>
        <div style={styles.serviceGrid}>
          {SVC_DEFS.map((s) => (
            <div
              key={s.key}
              onClick={() => onToggle(s.key)}
              style={{ ...styles.svcCard, ...(services[s.key] ? styles.svcCardSelected : {}) }}
            >
              <div style={{ ...styles.svcCheck, ...(services[s.key] ? styles.svcCheckSelected : {}) }}>
                {services[s.key] && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
              </div>
              <div>
                <div style={styles.svcLabel}>{s.label}</div>
                <div style={styles.svcPrice}>{s.price}</div>
              </div>
            </div>
          ))}
        </div>
        {majorCount >= 2 && (
          <div style={{ marginTop: 10 }}>
            <span style={styles.badgeGreen}>✓ 10% Bundle Discount Unlocked</span>
          </div>
        )}
        {majorCount === 1 && (
          <div style={{ marginTop: 10, fontFamily: 'var(--font-marker)', fontSize: 11, color: 'var(--ink-light)' }}>
            Add 1 more major service to unlock the 10% bundle discount.
          </div>
        )}
      </Card>
      <div style={styles.navRow}>
        <button style={styles.btnSecondary} onClick={onBack}>← Back</button>
        <button style={styles.btnPrimary} onClick={onNext}>Next: Measurements →</button>
      </div>
    </>
  )
}

// ── Step 2: Measurements ─────────────────────────────────────────────────────
function LWSection({ svc, idx, data, rateKey, onUpdate, onRemove }) {
  const sqft = (parseFloat(data.l) || 0) * (parseFloat(data.w) || 0)
  return (
    <div style={styles.measBlock}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontFamily: 'var(--font-marker)', fontSize: 11, color: 'var(--ink-light)' }}>Section {idx + 1}</span>
        {idx > 0 && (
          <button onClick={() => onRemove(svc, idx)} style={styles.btnRemove}>✕</button>
        )}
      </div>
      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Length (ft)</label>
          <input type="number" min="0" value={data.l} onChange={(e) => onUpdate(svc, idx, 'l', e.target.value)} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Width (ft)</label>
          <input type="number" min="0" value={data.w} onChange={(e) => onUpdate(svc, idx, 'w', e.target.value)} />
        </div>
      </div>
      {sqft > 0 && (
        <div style={styles.measCalc}>{sqft} sq ft → {fmtMoney(sqft * RATES[rateKey])}</div>
      )}
    </div>
  )
}

function MeasSection({ title, children, total, totalLabel }) {
  return (
    <div style={styles.measSection}>
      <div style={styles.measTitle}>{title}</div>
      {children}
      {total > 0 && (
        <div style={{ marginTop: 6, fontFamily: 'var(--font-marker)', fontSize: 13, color: 'var(--blue)' }}>
          Total: {total} sq ft — {totalLabel}
        </div>
      )}
    </div>
  )
}

function StepMeasurements({ services, measurements, onUpdate, onAdd, onRemove, onUpdateTrash, onNext, onBack }) {
  const driveTotal = measurements.driveway.reduce((a, s) => a + (parseFloat(s.l) || 0) * (parseFloat(s.w) || 0), 0)
  const patioTotal = measurements.patio.reduce((a, s) => a + (parseFloat(s.l) || 0) * (parseFloat(s.w) || 0), 0)
  const walkTotal = measurements.walkway.reduce((a, s) => a + (parseFloat(s.l) || 0) * (parseFloat(s.w) || 0), 0)
  const fenceTotal = measurements.fence.reduce((a, s) => a + (parseFloat(s.l) || 0) * (parseFloat(s.h) || 0) * (parseFloat(s.sides) || 1), 0)
  const cans = parseInt(measurements.trashCans) || 1

  const hasAny = Object.values(services).some(Boolean)

  return (
    <>
      <Card>
        <SectionTitle>Measurements</SectionTitle>
        {!hasAny && (
          <p style={{ fontFamily: 'var(--font-marker)', color: 'var(--ink-light)', padding: '8px 0' }}>
            No services selected. Go back and pick at least one.
          </p>
        )}
        {services.driveway && (
          <MeasSection title="Driveway Sections" total={driveTotal} totalLabel={fmtMoney(driveTotal * RATES.driveway)}>
            {measurements.driveway.map((s, i) => (
              <LWSection key={i} svc="driveway" idx={i} data={s} rateKey="driveway" onUpdate={onUpdate} onRemove={onRemove} />
            ))}
            <button style={styles.btnAdd} onClick={() => onAdd('driveway')}>+ Add Section</button>
          </MeasSection>
        )}
        {services.patio && (
          <MeasSection title="Patio Sections" total={patioTotal} totalLabel={fmtMoney(patioTotal * RATES.patio)}>
            {measurements.patio.map((s, i) => (
              <LWSection key={i} svc="patio" idx={i} data={s} rateKey="patio" onUpdate={onUpdate} onRemove={onRemove} />
            ))}
            <button style={styles.btnAdd} onClick={() => onAdd('patio')}>+ Add Section</button>
          </MeasSection>
        )}
        {services.walkway && (
          <MeasSection title="Walkway Sections" total={walkTotal} totalLabel={fmtMoney(walkTotal * RATES.walkway)}>
            {measurements.walkway.map((s, i) => (
              <LWSection key={i} svc="walkway" idx={i} data={s} rateKey="walkway" onUpdate={onUpdate} onRemove={onRemove} />
            ))}
            <button style={styles.btnAdd} onClick={() => onAdd('walkway')}>+ Add Section</button>
          </MeasSection>
        )}
        {services.fence && (
          <MeasSection title="PVC Fence Sections" total={fenceTotal} totalLabel={fmtMoney(fenceTotal * RATES.fence)}>
            {measurements.fence.map((s, i) => {
              const sqft = (parseFloat(s.l) || 0) * (parseFloat(s.h) || 0) * (parseFloat(s.sides) || 1)
              return (
                <div key={i} style={styles.measBlock}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-marker)', fontSize: 11, color: 'var(--ink-light)' }}>Section {i + 1}</span>
                    {i > 0 && <button onClick={() => onRemove('fence', i)} style={styles.btnRemove}>✕</button>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Length (ft)</label>
                      <input type="number" min="0" value={s.l} onChange={(e) => onUpdate('fence', i, 'l', e.target.value)} />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Height (ft)</label>
                      <input type="number" min="0" value={s.h} onChange={(e) => onUpdate('fence', i, 'h', e.target.value)} />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Sides</label>
                      <input type="number" min="1" max="4" value={s.sides} onChange={(e) => onUpdate('fence', i, 'sides', e.target.value)} />
                    </div>
                  </div>
                  {sqft > 0 && <div style={styles.measCalc}>{sqft} sq ft → {fmtMoney(sqft * RATES.fence)}</div>}
                </div>
              )
            })}
            <button style={styles.btnAdd} onClick={() => onAdd('fence')}>+ Add Section</button>
          </MeasSection>
        )}
        {services.trash && (
          <div style={styles.measSection}>
            <div style={styles.measTitle}>Garbage Can Sanitation</div>
            <div style={{ ...styles.formGroup, maxWidth: 130 }}>
              <label style={styles.label}>Number of Cans</label>
              <input type="number" min="1" value={measurements.trashCans} onChange={(e) => onUpdateTrash(e.target.value)} />
            </div>
            <div style={{ ...styles.measCalc, marginTop: 6 }}>{cans} can(s) → {fmtMoney(cans * RATES.trash)}</div>
          </div>
        )}
      </Card>
      <div style={styles.navRow}>
        <button style={styles.btnSecondary} onClick={onBack}>← Back</button>
        <button style={styles.btnPrimary} onClick={onNext}>Review Estimate →</button>
      </div>
    </>
  )
}

// ── Step 3: Review ───────────────────────────────────────────────────────────
function StepReview({ state, onPricingChange, onNotesChange, onNext, onBack }) {
  const est = calcEst(state)
  return (
    <>
      <Card>
        <SectionTitle>Internal Estimate Review</SectionTitle>
        <div style={styles.estBox}>
          {Object.entries(est.bd).length === 0 && (
            <div style={{ color: 'var(--ink-light)', fontSize: 13 }}>No services measured yet.</div>
          )}
          {Object.entries(est.bd).map(([key, val]) => (
            <div key={key} style={styles.estRow}>
              <div>
                <div style={{ color: 'var(--ink-light)' }}>{val.label}</div>
                <div style={{ fontSize: 10, color: 'var(--ink-light)', marginTop: 1 }}>
                  {key === 'trash' ? `${val.cans} can(s) @ $${RATES.trash}/can` : `${val.sqft} sq ft @ $${val.rate}/sq ft`}
                </div>
              </div>
              <div style={{ fontWeight: 700 }}>{fmtMoney(val.cost)}</div>
            </div>
          ))}
          <div style={{ ...styles.estRow, borderTop: '1px solid var(--line)', marginTop: 4, paddingTop: 8 }}>
            <div style={{ color: 'var(--ink-light)' }}>Subtotal</div>
            <div style={{ fontWeight: 700 }}>{fmtMoney(est.sub)}</div>
          </div>
          {est.discAmt > 0 && (
            <div style={styles.estRow}>
              <div>
                <div style={{ color: 'var(--ink-light)' }}>Discount</div>
                <div style={{ fontSize: 10, color: 'var(--ink-light)' }}>{est.customDiscount > 0 ? 'Manual' : '10% bundle'}</div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--green)' }}>-{fmtMoney(est.discAmt)}</div>
            </div>
          )}
          <div style={styles.estTotalRow}>
            <div style={{ fontFamily: 'var(--font-marker)', fontSize: 18 }}>Estimated Total</div>
            <div style={{ fontFamily: 'var(--font-marker)', fontSize: 24, color: 'var(--blue)' }}>{fmtMoney(est.final)}</div>
          </div>
          {state.pricing.manualOverride && (
            <div style={{ marginTop: 4 }}>
              <span style={styles.badgeBlue}>Manual Override Active</span>
            </div>
          )}
        </div>

        <SectionTitle style={{ marginTop: 8 }}>Adjustments</SectionTitle>
        <div style={styles.overrideRow}>
          <label style={{ fontFamily: 'var(--font-marker)', fontSize: 12, color: 'var(--ink-light)', whiteSpace: 'nowrap' }}>Manual Discount ($)</label>
          <input
            type="number"
            value={state.pricing.manualDiscount}
            placeholder="0.00"
            onChange={(e) => onPricingChange('manualDiscount', e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
        <div style={styles.overrideRow}>
          <label style={{ fontFamily: 'var(--font-marker)', fontSize: 12, color: 'var(--ink-light)', whiteSpace: 'nowrap' }}>Override Total ($)</label>
          <input
            type="number"
            value={state.pricing.manualOverride}
            placeholder="Leave blank to auto-calculate"
            onChange={(e) => onPricingChange('manualOverride', e.target.value)}
            style={{ flex: 1 }}
          />
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ ...styles.formGroup, marginBottom: 10 }}>
            <label style={styles.label}>Internal Notes (not shown to customer)</label>
            <textarea value={state.notes.internal} onChange={(e) => onNotesChange('internal', e.target.value)} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Customer-Facing Notes</label>
            <textarea value={state.notes.customer} onChange={(e) => onNotesChange('customer', e.target.value)} />
          </div>
        </div>
      </Card>
      <div style={styles.navRow}>
        <button style={styles.btnSecondary} onClick={onBack}>← Back</button>
        <button style={styles.btnPrimary} onClick={onNext}>Preview Quote →</button>
      </div>
    </>
  )
}

// ── Step 4: Quote ─────────────────────────────────────────────────────────────
function StepQuote({ state, onBack, onToast }) {
  const est = calcEst(state)
  const c = state.customer

  const emailQuote = async () => {
    const formspreePayload = {
      _subject: `New Quote — ${c.name} — ${c.address}`,
      _replyto: c.email || 'thecleaningpeopl3@gmail.com',
      'Customer Name': c.name,
      'Phone': c.phone,
      'Email': c.email,
      'Service Address': c.address,
      'Quote Date': c.quoteDate,
      'Expiry Date': c.expiryDate,
      'Services': Object.values(est.bd).map((v) => v.label + ': ' + fmtMoney(v.cost)).join(', '),
      'Discount': est.discAmt > 0 ? fmtMoney(est.discAmt) : 'None',
      'Total': fmtMoney(est.final),
      'Customer Note': state.notes.customer || 'None',
      'Internal Note': state.notes.internal || 'None',
    }

    const emailjsPayload = {
      customer_name: c.name,
      customer_email: c.email,
      address: c.address,
      services: Object.values(est.bd).map((v) => v.label + ': ' + fmtMoney(v.cost)).join('\n'),
      discount: est.discAmt > 0 ? fmtMoney(est.discAmt) : 'None',
      total: fmtMoney(est.final),
      customer_note: state.notes.customer || '',
      expiry_date: fmtDate(c.expiryDate),
    }

    try {
      // Send to The Cleaning People via Formspree
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formspreePayload),
      })

      // Send to customer via EmailJS (only if customer email provided)
      if (c.email) {
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: EMAILJS_SERVICE_ID,
            template_id: EMAILJS_TEMPLATE_ID,
            user_id: EMAILJS_PUBLIC_KEY,
            template_params: emailjsPayload,
          }),
        })
        onToast('Quote sent to customer!')
      } else {
        onToast(res.ok ? 'Quote sent!' : 'Submission failed.')
      }
    } catch {
      onToast('Network error. Check connection.')
    }
  }

  const copySMS = () => {
    const svcs = Object.values(est.bd).map((v) => v.label).join(', ')
    const msg = `Hi ${c.name || '[Customer]'}, this is The Cleaning People. Your powerwashing estimate for ${c.address || '[Address]'} is ${fmtMoney(est.final)}. This includes: ${svcs}. Quote valid until ${fmtDate(c.expiryDate)}. Payment accepted by cash or Cash App. Questions? Call/text (919) 426-6226.`
    navigator.clipboard.writeText(msg)
      .then(() => onToast('SMS copied to clipboard!'))
      .catch(() => {
        const ta = document.createElement('textarea')
        ta.value = msg
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        onToast('SMS copied!')
      })
  }

  return (
    <>
      <Card>
        <SectionTitle>Customer Quote Preview</SectionTitle>
        <div style={styles.quotePaper}>
          <div style={styles.quoteLines} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={styles.quoteHead}>
              <div>
                <div style={{ fontFamily: 'var(--font-marker)', fontSize: 20, color: 'var(--ink)' }}>THE CLEANING PEOPLE</div>
                <div style={{ fontFamily: 'var(--font-marker)', fontSize: 11, color: 'var(--ink-light)' }}>POWERWASHING SERVICES</div>
                <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 3 }}>(919) 426-6226 · thecleaningpeopl3@gmail.com</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-light)', textAlign: 'right' }}>
                <div><strong>Date:</strong> {fmtDate(c.quoteDate)}</div>
                <div><strong>Valid Until:</strong> {fmtDate(c.expiryDate)}</div>
              </div>
            </div>

            <div style={{ fontFamily: 'var(--font-marker)', fontSize: 14, marginBottom: 12 }}>
              For: <strong>{c.name || 'Customer Name'}</strong>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-light)', marginTop: 1 }}>{c.address || 'Service Address'}</div>
            </div>

            {state.notes.customer && (
              <div style={styles.quoteNote}>{state.notes.customer}</div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
              <thead>
                <tr>
                  <th style={{ fontFamily: 'var(--font-marker)', fontSize: 13, textAlign: 'left', borderBottom: '1.5px solid var(--ink)', padding: '5px 6px' }}>Service</th>
                  <th style={{ fontFamily: 'var(--font-marker)', fontSize: 13, textAlign: 'right', borderBottom: '1.5px solid var(--ink)', padding: '5px 6px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(est.bd).map((v) => (
                  <tr key={v.label}>
                    <td style={{ padding: '7px 6px', fontSize: 13, borderBottom: '1px dashed var(--line)' }}>{v.label}</td>
                    <td style={{ padding: '7px 6px', fontSize: 13, borderBottom: '1px dashed var(--line)', textAlign: 'right', fontWeight: 700 }}>{fmtMoney(v.cost)}</td>
                  </tr>
                ))}
                {est.discAmt > 0 && (
                  <tr>
                    <td style={{ padding: '7px 6px', fontSize: 13, color: 'var(--green)' }}>Discount {est.customDiscount > 0 ? '(adjusted)' : '(bundle)'}</td>
                    <td style={{ padding: '7px 6px', fontSize: 13, textAlign: 'right', fontWeight: 700, color: 'var(--green)' }}>-{fmtMoney(est.discAmt)}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ borderTop: '2px solid var(--ink)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--font-marker)', fontSize: 16 }}>Estimated Total</div>
              <div style={{ fontFamily: 'var(--font-marker)', fontSize: 24, color: 'var(--blue)' }}>{fmtMoney(est.final)}</div>
            </div>

            <div style={{ marginTop: 14, borderTop: '1px dashed var(--border)', paddingTop: 12, fontSize: 11, color: 'var(--ink-light)' }}>
              <div style={{ marginBottom: 4 }}><strong>Payment:</strong> Cash or Cash App accepted.</div>
              <div style={{ marginBottom: 4 }}>Quote valid until <strong>{fmtDate(c.expiryDate)}</strong>. Final price may vary based on site conditions.</div>
              <div>Questions? Call or text <strong>(919) 426-6226</strong></div>
            </div>
          </div>
        </div>
      </Card>

      <div style={styles.navRow}>
        <button style={{ ...styles.btnSecondary, ...styles.btnSm }} onClick={onBack}>← Back</button>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={{ ...styles.btnSuccess, ...styles.btnSm }} onClick={emailQuote}>✉ Email Quote</button>
          <button style={{ ...styles.btnPrimary, ...styles.btnSm }} onClick={copySMS}>💬 Copy SMS</button>
        </div>
      </div>
    </>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message }) {
  return message ? (
    <div style={styles.toast}>{message}</div>
  ) : null
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0)
  const [customer, setCustomer] = useState(initialState.customer)
  const [services, setServices] = useState(initialState.services)
  const [measurements, setMeasurements] = useState(initialState.measurements)
  const [pricing, setPricing] = useState(initialState.pricing)
  const [notes, setNotes] = useState(initialState.notes)
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2400)
  }

  const appState = { customer, services, measurements, pricing, notes }

  const updateCustomer = (field, val) => setCustomer((p) => ({ ...p, [field]: val }))
  const toggleService = (key) => setServices((p) => ({ ...p, [key]: !p[key] }))
  const updateMeas = (svc, idx, field, val) => {
    setMeasurements((p) => {
      const copy = { ...p, [svc]: p[svc].map((s, i) => i === idx ? { ...s, [field]: val } : s) }
      return copy
    })
  }
  const addSection = (svc) => {
    setMeasurements((p) => ({
      ...p,
      [svc]: [...p[svc], svc === 'fence' ? { l: '', h: '', sides: '2' } : { l: '', w: '' }],
    }))
  }
  const removeSection = (svc, idx) => {
    setMeasurements((p) => ({ ...p, [svc]: p[svc].filter((_, i) => i !== idx) }))
  }
  const updateTrash = (val) => setMeasurements((p) => ({ ...p, trashCans: val }))
  const updatePricing = (field, val) => setPricing((p) => ({ ...p, [field]: val }))
  const updateNotes = (field, val) => setNotes((p) => ({ ...p, [field]: val }))

  const next = () => setStep((s) => Math.min(s + 1, 4))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: 16 }}>
      <Header />
      <StepNav step={step} onGo={setStep} />

      {step === 0 && <StepCustomer data={customer} onChange={updateCustomer} onNext={next} />}
      {step === 1 && <StepServices services={services} onToggle={toggleService} onNext={next} onBack={back} />}
      {step === 2 && (
        <StepMeasurements
          services={services}
          measurements={measurements}
          onUpdate={updateMeas}
          onAdd={addSection}
          onRemove={removeSection}
          onUpdateTrash={updateTrash}
          onNext={next}
          onBack={back}
        />
      )}
      {step === 3 && (
        <StepReview
          state={appState}
          onPricingChange={updatePricing}
          onNotesChange={updateNotes}
          onNext={next}
          onBack={back}
        />
      )}
      {step === 4 && <StepQuote state={appState} onBack={back} onToast={showToast} />}

      <Toast message={toast} />
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  header: {
    background: 'var(--paper)',
    border: '2px solid var(--ink)',
    borderRadius: 8,
    marginBottom: 20,
    padding: '18px 20px 14px',
    position: 'relative',
    overflow: 'hidden',
  },
  headerInner: { position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  brandName: { fontFamily: 'var(--font-marker)', fontSize: 26, color: 'var(--ink)', letterSpacing: 1, lineHeight: 1.1 },
  brandSub: { fontFamily: 'var(--font-marker)', fontSize: 12, color: 'var(--ink)', letterSpacing: 2, margin: '2px 0 8px' },
  pill: {
    display: 'inline-flex', alignItems: 'flex-start', gap: 5,
    background: 'var(--blue-pill)', color: '#fff',
    fontFamily: 'var(--font-marker)', fontSize: 11,
    padding: '3px 10px', borderRadius: 20, width: 'fit-content', maxWidth: '100%', whiteSpace: 'normal', lineHeight: 1.4,
  },
  tagline: { fontFamily: 'var(--font-marker)', fontSize: 11, color: 'var(--ink)', marginTop: 10, letterSpacing: 0.5 },
  contactRow: { fontSize: 10, color: 'var(--ink)', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' },
  stepNav: { display: 'flex', gap: 6, marginBottom: 18, overflowX: 'auto', paddingBottom: 2 },
  stepBtn: {
    flex: 1, minWidth: 75, padding: '7px 5px',
    fontFamily: 'var(--font-marker)', fontSize: 13,
    background: 'var(--paper)', border: '1.5px solid var(--border)',
    borderRadius: 8, cursor: 'pointer', color: 'var(--ink-light)', textAlign: 'center', whiteSpace: 'nowrap',
  },
  stepBtnActive: { background: 'var(--blue)', borderColor: 'var(--blue)', color: '#fff' },
  stepBtnDone: { background: 'var(--green-light)', borderColor: 'var(--green)', color: 'var(--green)' },
  card: { background: 'var(--paper)', border: '1.5px solid var(--border)', borderRadius: 10, padding: 18, marginBottom: 14, position: 'relative', overflow: 'hidden' },
  cardLines: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'repeating-linear-gradient(0deg, transparent, transparent 26px, var(--line) 26px, var(--line) 27px)',
    pointerEvents: 'none', opacity: 0.35,
  },
  sectionTitle: {
    fontFamily: 'var(--font-marker)', fontSize: 18, color: 'var(--ink)',
    marginBottom: 14, borderBottom: '2px dashed var(--blue-mid)', paddingBottom: 6,
  },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 3 },
  label: { fontFamily: 'var(--font-marker)', fontSize: 13, color: 'var(--ink-light)' },
  serviceGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  svcCard: { border: '2px solid var(--border)', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(255,255,255,0.8)' },
  svcCardSelected: { borderColor: 'var(--blue)', background: 'var(--blue-light)' },
  svcCheck: { width: 18, height: 18, border: '2px solid var(--border)', borderRadius: 4, flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  svcCheckSelected: { background: 'var(--blue)', borderColor: 'var(--blue)' },
  svcLabel: { fontFamily: 'var(--font-marker)', fontSize: 14, color: 'var(--ink)' },
  svcPrice: { fontSize: 11, color: 'var(--ink-light)', marginTop: 1 },
  measSection: { background: 'var(--paper-dark)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginBottom: 10 },
  measTitle: { fontFamily: 'var(--font-marker)', fontSize: 14, color: 'var(--blue)', marginBottom: 8 },
  measBlock: { marginBottom: 10, borderBottom: '1px dashed var(--border)', paddingBottom: 8 },
  measCalc: { fontSize: 12, color: 'var(--green)', fontWeight: 700, marginTop: 3, fontFamily: 'var(--font-marker)' },
  btnRemove: { background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 16, padding: '0 2px' },
  btnAdd: { background: 'none', border: '1.5px dashed var(--blue)', color: 'var(--blue)', borderRadius: 7, padding: '5px 12px', fontFamily: 'var(--font-marker)', fontSize: 13, cursor: 'pointer', marginTop: 4 },
  estBox: { background: 'var(--paper-dark)', borderRadius: 8, padding: 12, marginBottom: 12 },
  estRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '7px 0', borderBottom: '1px dashed var(--line)', fontSize: 13, gap: 8 },
  estTotalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '2px solid var(--ink)', marginTop: 6 },
  overrideRow: { display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 },
  badgeGreen: { display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'var(--green-light)', color: 'var(--green)' },
  badgeBlue: { display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'var(--blue-light)', color: 'var(--blue)' },
  quotePaper: { background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 10, padding: 24, position: 'relative', overflow: 'hidden' },
  quoteLines: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'repeating-linear-gradient(0deg, transparent, transparent 30px, var(--line) 30px, var(--line) 31px)',
    pointerEvents: 'none', opacity: 0.55,
  },
  quoteHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, borderBottom: '2px solid var(--ink)', paddingBottom: 12 },
  quoteNote: { fontSize: 12, marginBottom: 8, color: 'var(--ink)', background: 'var(--blue-light)', padding: '7px 10px', borderRadius: 7, borderLeft: '3px solid var(--blue)' },
  btn: { padding: '9px 18px', borderRadius: 8, fontFamily: 'var(--font-marker)', fontSize: 15, cursor: 'pointer', border: '2px solid' },
  btnPrimary: { padding: '9px 18px', borderRadius: 8, fontFamily: 'var(--font-marker)', fontSize: 15, cursor: 'pointer', border: '2px solid', background: 'var(--blue)', borderColor: 'var(--blue)', color: '#fff' },
  btnSecondary: { padding: '9px 18px', borderRadius: 8, fontFamily: 'var(--font-marker)', fontSize: 15, cursor: 'pointer', border: '2px solid', background: '#fff', borderColor: 'var(--ink)', color: 'var(--ink)' },
  btnSuccess: { padding: '9px 18px', borderRadius: 8, fontFamily: 'var(--font-marker)', fontSize: 15, cursor: 'pointer', border: '2px solid', background: 'var(--green)', borderColor: 'var(--green)', color: '#fff' },
  btnSm: { padding: '6px 13px', fontSize: 13 },
  navRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 8 },
  toast: {
    position: 'fixed', bottom: 18, left: '50%', transform: 'translateX(-50%)',
    background: 'var(--ink)', color: '#fff', padding: '9px 18px',
    borderRadius: 8, fontFamily: 'var(--font-marker)', fontSize: 14,
    zIndex: 200, whiteSpace: 'nowrap',
  },
}
