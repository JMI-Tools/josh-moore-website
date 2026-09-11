import { useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouteSeo } from "@/hooks/useSeo";

/* ------------------------------------------------------------------ data */

const TRADE_GROUPS: ReadonlyArray<readonly [string, readonly string[]]> = [
  ["Structure and exterior", ["Roofing", "Gutters", "Siding", "Soffit and fascia", "Framing", "Foundation", "Waterproofing", "Concrete flatwork", "Driveways", "Grading"]],
  ["Mechanical and electrical", ["HVAC", "Ductwork", "Plumbing", "Repipe", "Water heaters", "Sewer", "Drain tile", "Sump systems", "Electrical", "Panel upgrades", "Recessed lighting"]],
  ["Interior finish", ["Drywall finish", "Interior paint", "Exterior paint", "Trim", "Carpentry", "Interior doors", "Cabinets", "Countertops", "Quartz countertops", "Backsplash", "Tile", "Shower pans", "Bath rebuild"]],
  ["Flooring", ["LVP", "Carpet", "Hardwood refinish"]],
  ["Site and wrap up", ["Landscaping", "Hauling", "General labor", "Final clean", "Punch list"]],
  ["Running the job", ["General contractor", "Project management"]],
];

// Focus counties lead. The rest stay available so nobody good rules themselves out.
const COUNTIES = [
  "Muskegon", "Kent", "Ottawa", "Kalamazoo", "Allegan", "Barry", "Calhoun",
  "Van Buren", "Ionia", "Montcalm", "St. Joseph", "Cass", "Branch", "Berrien",
  "Eaton", "Ingham", "Jackson",
];

const LICENSE_CHOICES = [
  { value: "licensed_builder", title: "Licensed contractor", desc: "Residential builder or maintenance and alteration license" },
  { value: "licensed_trade", title: "Licensed in a specific trade", desc: "Electrical, plumbing, or mechanical" },
  { value: "unlicensed", title: "Skilled tradesman or handyman, not licensed", desc: "Plenty of our work falls here. It is not a mark against you." },
  { value: "unsure", title: "Not sure", desc: "We will sort it out when we talk." },
];

const VIDEO_ID = "DiL1_o8aQIg";
const DRAFT_KEY = "jm-contractor-intake-draft";
const SEEN_KEY = "jm-contractor-intake-video-seen";

type Vals = Record<string, string>;
type Sets = Record<string, string[]>;

const REQUIRED_TEXT = ["name", "phone", "email", "primaryTrade", "years", "crew"] as const;
const REQUIRED_PICK = ["sms", "contactPref", "licenseType", "insured", "comp", "pricing", "ten99"] as const;

const LABELS: Record<string, string> = {
  name: "your name", phone: "your number", email: "your email",
  sms: "whether that number texts", contactPref: "best way to reach you",
  trades: "your trades", primaryTrade: "your main trade", years: "years doing this",
  crew: "crew size", licenseType: "how you work", insured: "insurance",
  comp: "workers comp", areas: "your counties", pricing: "how you price", ten99: "1099 setup",
};

/* ------------------------------------------------------------- component */

export default function Contractors() {
  useRouteSeo("/contractors");

  const [vals, setVals] = useState<Vals>({ licenseState: "MI" });
  const [sets, setSets] = useState<Sets>({ trades: [], areas: [] });
  const [picks, setPicks] = useState<Vals>({});
  const [bad, setBad] = useState<string[]>([]);
  const [done, setDone] = useState<null | { name: string }>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [videoOpen, setVideoOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [prompt, setPrompt] = useState(true);
  const promptTimer = useRef<number | null>(null);

  const set = (k: string, v: string) => setVals((p) => ({ ...p, [k]: v }));
  const pick = (k: string, v: string) => setPicks((p) => ({ ...p, [k]: v }));
  const toggle = (k: string, v: string) =>
    setSets((p) => {
      const cur = p[k] || [];
      return { ...p, [k]: cur.includes(v) ? cur.filter((x) => x !== v) : cur.concat(v) };
    });

  /* draft, harmless if storage is blocked */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.vals) setVals(d.vals);
        if (d.sets) setSets(d.sets);
        if (d.picks) setPicks(d.picks);
      }
      if (localStorage.getItem(SEEN_KEY) !== "1") setVideoOpen(true);
      else setVideoOpen(false);
    } catch {
      setVideoOpen(true);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ vals, sets, picks }));
    } catch {
      /* private mode, fine */
    }
  }, [vals, sets, picks]);

  /* video overlay */
  useEffect(() => {
    if (!videoOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    setMuted(true);
    setPrompt(true);
    promptTimer.current = window.setTimeout(() => setPrompt(false), 7000);
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeVideo();
    };
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
      if (promptTimer.current) window.clearTimeout(promptTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoOpen]);

  function closeVideo() {
    if (promptTimer.current) window.clearTimeout(promptTimer.current);
    setVideoOpen(false);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function goLoud() {
    if (promptTimer.current) window.clearTimeout(promptTimer.current);
    setMuted(false);
    setPrompt(false);
  }

  /* progress */
  const need = useMemo(
    () => [...REQUIRED_TEXT, ...REQUIRED_PICK, "trades", "areas"] as string[],
    [],
  );
  const filled = (k: string) => {
    if (k === "trades" || k === "areas") return (sets[k] || []).length > 0;
    if ((REQUIRED_PICK as readonly string[]).includes(k)) return !!picks[k];
    return !!(vals[k] || "").trim();
  };
  const got = need.filter(filled).length;
  const pct = Math.round((got / need.length) * 100);
  const nextUp = need.find((k) => !filled(k));

  const tradeList = useMemo(() => {
    const extra = (vals.tradesOther || "").split(",").map((s) => s.trim()).filter(Boolean);
    return (sets.trades || []).concat(extra);
  }, [sets.trades, vals.tradesOther]);

  useEffect(() => {
    if (vals.primaryTrade && !tradeList.includes(vals.primaryTrade)) set("primaryTrade", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradeList.join("|")]);

  const isLicensed = picks.licenseType === "licensed_builder" || picks.licenseType === "licensed_trade";
  const isInsured = picks.insured === "yes";

  /* submit */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const missing = need.filter((k) => !filled(k));
    setBad(missing);
    if (missing.length) {
      // Rendering the errors changes the page height, which was cancelling a smooth
      // scroll mid-flight and leaving the user on an unchanged screen. Wait for that
      // paint, then jump instantly so it cannot be interrupted.
      setTimeout(() => {
        const el = document.querySelector<HTMLElement>(`[data-field="${missing[0]}"]`);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - Math.max(90, window.innerHeight * 0.3);
        window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
        const focusable = el.querySelector<HTMLElement>("input, select, textarea, button");
        if (focusable) setTimeout(() => focusable.focus({ preventScroll: true }), 60);
      }, 80);
      return;
    }

    const areasExtra = (vals.areasOther || "").split(",").map((s) => s.trim()).filter(Boolean);
    const payload = {
      name: vals.name, company: vals.company || null,
      phone: vals.phone, smsCapable: picks.sms === "yes",
      email: vals.email, contactPref: picks.contactPref,
      trades: tradeList, primaryTrade: vals.primaryTrade,
      years: vals.years, crew: vals.crew, capacity: picks.capacity || null,
      licensed: isLicensed, licenseType: picks.licenseType,
      license: isLicensed
        ? { kind: vals.licenseKind || null, number: vals.licenseNumber || null, state: vals.licenseState || null, expires: vals.licenseExpiry || null }
        : null,
      insured: isInsured,
      insurance: isInsured
        ? { carrier: vals.insCarrier || null, coverage: vals.insCoverage || null, expires: vals.insExpiry || null, coiAvailable: picks.coi === "yes" }
        : null,
      workersComp: picks.comp,
      areas: (sets.areas || []).concat(areasExtra),
      radius: vals.radius || null, areasAvoid: vals.areasAvoid || null,
      pricingModel: picks.pricing, rate: vals.rate || null,
      accepts1099: picks.ten99,
      availability: { leadTime: vals.leadTime || null, weekends: picks.weekends || null },
      links: {
        website: vals.website || null, facebook: vals.facebook || null,
        instagram: vals.instagram || null, google: vals.google || null, photos: vals.photoLinks || null,
      },
      references: [
        { name: vals.ref1name || null, phone: vals.ref1phone || null },
        { name: vals.ref2name || null, phone: vals.ref2phone || null },
      ].filter((r) => r.name || r.phone),
      notes: vals.notes || null,
      status: "new",
      source: "itsjoshmoore.com/contractors",
    };

    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/submit-contractor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.success) throw new Error(out.error || `Server returned ${res.status}`);
      setDone({ name: (vals.name || "").split(" ")[0] || "there" });
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  /* ------------------------------------------------------------- pieces */

  // Field components live at module scope (below). Defining them inline here
  // gave React a new component type every render, which remounted every input on
  // each keystroke and dropped focus. F carries the state they need.
  const F = { vals, set, bad, picks, pick };

  /* ---------------------------------------------------------------- done */

  if (done) {
    return (
      <div className="jm-contractors">
        <Style />
        <Header />
        <main className="jmc-thanks">
          <div className="jmc-thanks__in">
            <div className="jmc-check" aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
            <h1>Thanks {done.name}. You're on the list.</h1>
            <p>We will reach out when something in your trade comes up in your area. If you gave us a number that takes texts, that is probably how you will hear from us first.</p>
            <a className="jmc-btn" href="/">Back to the site</a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ---------------------------------------------------------------- page */

  return (
    <div className="jm-contractors">
      <Style />

      {videoOpen ? (
        <div className="jmc-vid" role="dialog" aria-modal="true" aria-label="Intro video">
          <div className="jmc-vid__scrim" onClick={closeVideo} />
          <div className="jmc-vid__box">
            <div className="jmc-vid__frame">
              <iframe
                title="Intro from Josh Moore"
                src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=${muted ? 1 : 0}&playsinline=1&rel=0&modestbranding=1&controls=1`}
                allow="autoplay; encrypted-media; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
              {prompt && muted ? (
                <button type="button" className="jmc-vid__sound" onClick={goLoud} aria-label="Tap for sound">
                  <span className="jmc-vid__ring">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a9 9 0 0 1 0 14" />
                    </svg>
                  </span>
                  <span className="jmc-vid__soundt">Tap for sound</span>
                </button>
              ) : null}
              {!prompt && muted ? (
                <button type="button" className="jmc-vid__unmute" onClick={goLoud} aria-label="Turn sound on">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" />
                  </svg>
                </button>
              ) : null}
            </div>
            <button type="button" className="jmc-vid__skip" onClick={closeVideo}>Skip to the form</button>
            <p className="jmc-vid__note">Quick look at what I'm doing and who I'm looking for.</p>
          </div>
        </div>
      ) : null}

      <Header />

      <div className="jmc-prog">
        <div className="jmc-prog__bar"><div className="jmc-prog__fill" style={{ width: `${pct}%` }} /></div>
        <div className="jmc-prog__meta">
          <span>{pct === 100 ? "All set, hit submit" : nextUp ? `Next up: ${LABELS[nextUp] || nextUp}` : "Let's get you set up"}</span>
          <span><b>{pct}</b>% done</span>
        </div>
      </div>

      <main>
        <section className="jmc-hero">
          <div className="jmc-hero__in">
            <h1>Let's connect.</h1>
            <p>I'm expanding the side of my business that does fix and flips so we can take on more jobs, and I would love to connect with you and see where we can fit in with each other.</p>
            <p>As of right now we are concentrating on <b>Muskegon County, Kent County, Ottawa County and Kalamazoo County</b>.</p>
            <p>Take a second to fill out your information below so we can connect and see how we can do some projects together.</p>
            <button type="button" className="jmc-replay" onClick={() => setVideoOpen(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              Watch the quick intro
            </button>
          </div>
        </section>

        <form className="jmc-wrap" onSubmit={onSubmit} noValidate>
          <Section n="01" title="How to reach you" sub="The basics. Everything else builds off this.">
            <Text {...F} k="name" label="Your name" req />
            <Text {...F} k="company" label="Business name" hint="Leave blank if you work under your own name." />
            <Text {...F} k="phone" label="Mobile number" req type="tel" ph="(269) 555-0100" hint="This is where job offers and scheduling texts go." />
            <Pills {...F} k="sms" label="Can that number receive text messages?" req opts={[["yes", "Yes"], ["no", "No, call me"]]} />
            <Text {...F} k="email" label="Email" req type="email" hint="Where we send your paperwork and payment records." />
            <Pills {...F} k="contactPref" label="Best way to reach you" req opts={[["text", "Text"], ["call", "Call"], ["email", "Email"]]} />
          </Section>

          <Section n="02" title="What you do" sub="Check everything you take on. Be generous, we would rather call you and hear no.">
            <div className="jmc-f" data-field="trades">
              {TRADE_GROUPS.map(([g, list]) => (
                <div className="jmc-tgroup" key={g}>
                  <div className="jmc-tgroup__h">{g.toUpperCase()}</div>
                  <div className="jmc-chips">
                    {list.map((t) => (
                      <button type="button" key={t}
                        className={"jmc-chip" + ((sets.trades || []).includes(t) ? " on" : "")}
                        onClick={() => toggle("trades", t)}>{t}</button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="jmc-count"><b>{tradeList.length}</b> selected</div>
              <Err k="trades" msg="Pick at least one." bad={bad} />
            </div>
            <Text {...F} k="tradesOther" label="Anything not on that list?" ph="Septic, well pumps, masonry, pools" />
            <Select {...F} k="primaryTrade" label="Your main trade" req opts={tradeList}
              hint="The one you would want to be called for first." />
            <div className="jmc-row">
              <Select {...F} k="years" label="Years doing this" req opts={["Under 2", "2 to 5", "5 to 10", "10 to 20", "20 or more"]} />
              <Select {...F} k="crew" label="Is it just you?" req opts={["Just me", "Me plus 1 or 2", "Crew of 3 to 5", "Crew of 6 or more"]} />
            </div>
            <Pills {...F} k="capacity" label="How many jobs can you comfortably run at once?" opts={[["1", "One"], ["2", "Two"], ["3+", "Three or more"]]} />
          </Section>

          <Section n="03" title="How you work" sub="There is no wrong answer here. Plenty of our work does not need a license, and we hire accordingly.">
            <div className="jmc-f" data-field="licenseType">
              <div className="jmc-choices">
                {LICENSE_CHOICES.map((c) => (
                  <button type="button" key={c.value}
                    className={"jmc-choice" + (picks.licenseType === c.value ? " on" : "")}
                    onClick={() => pick("licenseType", c.value)}>
                    <span className="jmc-choice__t">{c.title}</span>
                    <span className="jmc-choice__d">{c.desc}</span>
                  </button>
                ))}
              </div>
              <Err k="licenseType" msg="Pick one." bad={bad} />
              {isLicensed ? (
                <div className="jmc-reveal">
                  <div className="jmc-row">
                    <Text {...F} k="licenseKind" label="License type" ph="Residential builder, master electrician" />
                    <Text {...F} k="licenseNumber" label="License number" />
                  </div>
                  <div className="jmc-row">
                    <Text {...F} k="licenseState" label="State" />
                    <Text {...F} k="licenseExpiry" label="Expires" ph="MM/YYYY" />
                  </div>
                </div>
              ) : null}
            </div>

            <Pills {...F} k="insured" label="Do you carry general liability insurance?" req opts={[["yes", "Yes"], ["no", "No"]]} />
            {isInsured ? (
              <div className="jmc-reveal">
                <div className="jmc-row3">
                  <Text {...F} k="insCarrier" label="Carrier" />
                  <Text {...F} k="insCoverage" label="Coverage" ph="$1,000,000" />
                  <Text {...F} k="insExpiry" label="Expires" ph="MM/YYYY" />
                </div>
                <Pills {...F} k="coi" label="Can you send a certificate of insurance if we ask?" opts={[["yes", "Yes"], ["no", "Not right now"]]} />
              </div>
            ) : null}

            <Pills {...F} k="comp" label="Workers comp" req opts={[["yes", "Yes, I carry it"], ["exempt", "Exempt, sole proprietor"], ["no", "No"]]} />
          </Section>

          <Section n="04" title="Where you work" sub="Check every county you will drive to.">
            <div className="jmc-f" data-field="areas">
              <div className="jmc-chips">
                {COUNTIES.map((c) => (
                  <button type="button" key={c}
                    className={"jmc-chip" + ((sets.areas || []).includes(c) ? " on" : "")}
                    onClick={() => toggle("areas", c)}>{c}</button>
                ))}
              </div>
              <div className="jmc-count"><b>{(sets.areas || []).length}</b> selected</div>
              <Err k="areas" msg="Pick at least one county." bad={bad} />
            </div>
            <div className="jmc-row">
              <Text {...F} k="areasOther" label="Any county not listed?" ph="County name" />
              <Select {...F} k="radius" label="How far will you travel?" opts={["Up to 20 miles", "Up to 40 miles", "Up to 60 miles", "Anywhere, for the right job"]} />
            </div>
            <Text {...F} k="areasAvoid" label="Anywhere you would rather not go?" ph="County, town, or area" />
          </Section>

          <Section n="05" title="Pricing and payment" sub="Rough is fine. We are not holding you to a number here.">
            <Pills {...F} k="pricing" label="How do you usually price work?" req opts={[["bid", "By the bid"], ["hourly", "Hourly"], ["unit", "By the unit"], ["mix", "Mix of those"]]} />
            <Text {...F} k="rate" label="Typical rate or range" ph="$65/hr, or $385 a square" />
            <Pills {...F} k="ten99" label="Are you set up to be paid as a 1099 contractor?" req
              hint="We will collect a W-9 from you before your first payment, not here."
              opts={[["yes", "Yes"], ["no", "No"], ["unsure", "Not sure"]]} />
          </Section>

          <Section n="06" title="Availability" sub="Helps us stop calling you about work you cannot take." optional>
            <Select {...F} k="leadTime" label="Notice you need to schedule" opts={["A day or two", "About a week", "Two weeks", "A month"]}
              hint="How much heads up you want before a start date." />
            <Pills {...F} k="weekends" label="Do you work weekends?" opts={[["yes", "Yes"], ["sometimes", "Sometimes"], ["no", "No"]]} />
          </Section>

          <Section n="07" title="Show us your work" sub="Anything that shows what you do. Skip it if you would rather just talk." optional>
            <div className="jmc-row">
              <Text {...F} k="website" label="Website" ph="https://" />
              <Text {...F} k="facebook" label="Facebook" />
            </div>
            <div className="jmc-row">
              <Text {...F} k="instagram" label="Instagram" ph="@handle" />
              <Text {...F} k="google" label="Google Business listing" />
            </div>
            <Text {...F} k="photoLinks" label="Photos of recent work" hint="Paste a link to a folder, album, or post. You can also just text them to us later." />
            <div className="jmc-ref">
              <div className="jmc-ref__h">REFERENCE 1</div>
              <div className="jmc-row"><Text {...F} k="ref1name" label="Name" /><Text {...F} k="ref1phone" label="Phone" type="tel" /></div>
            </div>
            <div className="jmc-ref">
              <div className="jmc-ref__h">REFERENCE 2</div>
              <div className="jmc-row"><Text {...F} k="ref2name" label="Name" /><Text {...F} k="ref2phone" label="Phone" type="tel" /></div>
            </div>
          </Section>

          <Section n="08" title="Anything else" sub="Last box. Tell us whatever does not fit above." optional>
            <Text {...F} k="notes" label="Anything else we should know?" area ph="What you are best at, what you would rather not touch, who sent you" />
          </Section>

          {sendError ? (
            <div className="jmc-sendfail">
              Could not send that: {sendError}. Your answers are saved on this device, so try again in a moment.
            </div>
          ) : null}
        </form>
      </main>

      <div className="jmc-submit">
        <div className="jmc-submit__in">
          {/* When a tap on Submit does nothing, the reason has to be right here next
              to the button, not somewhere up the page the user has to go hunting for. */}
          <div className={"jmc-submit__note" + (bad.length ? " is-bad" : "")}>
            {bad.length
              ? `Still needed: ${bad.slice(0, 3).map((k) => LABELS[k] || k).join(", ")}${bad.length > 3 ? `, and ${bad.length - 3} more` : ""}`
              : pct === 100
                ? "Looks complete."
                : `${need.length - got} left. Takes about four minutes.`}
          </div>
          <button type="submit" className="jmc-btn" disabled={sending} onClick={onSubmit}>
            {sending ? "Sending..." : "Submit"}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}


/* ------------------------------------------------------- field components
   These MUST stay at module scope. Declared inside Contractors they would be a
   new component type on every render, so React would unmount and remount each
   input as you typed and the keyboard would close after every character. */

type FieldCtx = {
  vals: Vals;
  set: (k: string, v: string) => void;
  bad: string[];
  picks: Vals;
  pick: (k: string, v: string) => void;
};

function Err({ k, msg, bad }: { k: string; msg: string; bad: string[] }) {
  if (!bad.includes(k)) return null;
  return <div className="jmc-err">{msg}</div>;
}

function Text(p: FieldCtx & { k: string; label: string; hint?: string; req?: boolean; ph?: string; type?: string; area?: boolean }) {
  const common = {
    id: `jmc-${p.k}`,
    value: p.vals[p.k] || "",
    placeholder: p.ph,
    className: p.bad.includes(p.k) ? "jmc-bad" : "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => p.set(p.k, e.target.value),
  };
  return (
    <div className="jmc-f" data-field={p.k}>
      <label htmlFor={`jmc-${p.k}`}>
        {p.label} {p.req ? <span className="jmc-req">*</span> : <span className="jmc-opt">optional</span>}
      </label>
      {p.hint ? <p className="jmc-hint">{p.hint}</p> : null}
      {p.area ? <textarea {...common} /> : (
        <input
          {...common}
          type={p.type || "text"}
          inputMode={p.type === "tel" ? "tel" : p.type === "email" ? "email" : undefined}
          autoComplete={p.k === "name" ? "name" : p.k === "email" ? "email" : p.k === "phone" ? "tel" : p.k === "company" ? "organization" : undefined}
        />
      )}
      <Err k={p.k} msg="We need this one." bad={p.bad} />
    </div>
  );
}

function Select(p: FieldCtx & { k: string; label: string; req?: boolean; opts: string[]; hint?: string }) {
  return (
    <div className="jmc-f" data-field={p.k}>
      <label htmlFor={`jmc-${p.k}`}>
        {p.label} {p.req ? <span className="jmc-req">*</span> : <span className="jmc-opt">optional</span>}
      </label>
      {p.hint ? <p className="jmc-hint">{p.hint}</p> : null}
      <select id={`jmc-${p.k}`} value={p.vals[p.k] || ""} className={p.bad.includes(p.k) ? "jmc-bad" : ""}
        onChange={(e) => p.set(p.k, e.target.value)}>
        <option value="">Select</option>
        {p.opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <Err k={p.k} msg="Pick one." bad={p.bad} />
    </div>
  );
}

function Pills(p: FieldCtx & { k: string; label: string; req?: boolean; hint?: string; opts: Array<[string, string]> }) {
  return (
    <div className="jmc-f" data-field={p.k}>
      <label>{p.label} {p.req ? <span className="jmc-req">*</span> : <span className="jmc-opt">optional</span>}</label>
      {p.hint ? <p className="jmc-hint">{p.hint}</p> : null}
      <div className="jmc-pills">
        {p.opts.map(([v, t]) => (
          <button type="button" key={v} className={"jmc-pill" + (p.picks[p.k] === v ? " on" : "")}
            onClick={() => p.pick(p.k, v)}>{t}</button>
        ))}
      </div>
      <Err k={p.k} msg="Pick one." bad={p.bad} />
    </div>
  );
}

/* ---------------------------------------------------------------- shell */


function Section(p: { n: string; title: string; sub: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <section className="jmc-sec">
      <div className="jmc-sec__head">
        <span className="jmc-sec__n">{p.n}</span>
        <h2>{p.title}</h2>
        {p.optional ? <span className="jmc-opt">optional</span> : null}
      </div>
      <p className="jmc-sec__sub">{p.sub}</p>
      {p.children}
    </section>
  );
}

/* Scoped hard under .jm-contractors so nothing leaks into the rest of the site. */
function Style() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
.jm-contractors{--c-bg:#F8FAFC;--c-card:#fff;--c-ink:#0F172A;--c-ink2:#64748B;--c-ink3:#94A3B8;
--c-line:#E2E8F0;--c-line2:#CBD5E1;--c-acc:#2563EB;--c-accb:#60A5FA;--c-soft:#EFF6FF;--c-red:#DC2626;
background:var(--c-bg);color:var(--c-ink);
font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}
.jm-contractors *{box-sizing:border-box}
.jm-contractors main{padding-bottom:96px}
.jmc-wrap{max-width:680px;margin:0 auto;padding:0 16px}
.jmc-prog{position:sticky;top:0;z-index:30;background:var(--c-ink);border-bottom:1px solid rgba(255,255,255,.08)}
.jmc-prog__bar{height:3px;background:rgba(255,255,255,.14)}
.jmc-prog__fill{height:100%;background:var(--c-accb);transition:width .25s ease-out}
.jmc-prog__meta{display:flex;justify-content:space-between;max-width:680px;margin:0 auto;padding:9px 16px;font-size:13px;color:#94A3B8}
.jmc-prog__meta b{color:#fff;font-weight:600}
.jmc-hero{background:var(--c-ink);color:#fff;padding:34px 16px 42px}
.jmc-hero__in{max-width:680px;margin:0 auto}
.jmc-hero h1{font-size:34px;line-height:1.12;letter-spacing:-.03em;margin:0 0 14px;font-weight:800;color:#fff}
.jmc-hero p{color:#CBD5E1;font-size:15.5px;margin:0 0 11px;max-width:54ch;line-height:1.55}
.jmc-hero p b{color:#fff;font-weight:600}
@media(max-width:520px){.jmc-hero h1{font-size:29px}}
.jmc-replay{display:inline-flex;align-items:center;gap:7px;margin-top:14px;cursor:pointer;
background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);color:#fff;font:inherit;font-size:13.5px;
font-weight:500;padding:8px 14px;border-radius:999px}
.jmc-replay:hover{background:rgba(255,255,255,.13)}
.jmc-sec{background:var(--c-card);border:1px solid var(--c-line);border-radius:12px;padding:20px;margin:14px 0;
box-shadow:0 1px 2px rgba(15,23,42,.06)}
.jmc-sec__head{display:flex;align-items:baseline;gap:9px;margin-bottom:4px}
.jmc-sec__n{font-size:11px;font-weight:700;color:var(--c-acc);letter-spacing:.09em}
.jmc-sec h2{font-size:17px;margin:0;font-weight:600;letter-spacing:-.01em}
.jmc-sec__sub{color:var(--c-ink2);font-size:14px;margin:0 0 18px}
.jmc-opt{font-size:11px;font-weight:600;color:var(--c-ink3);background:var(--c-bg);border:1px solid var(--c-line);
padding:2px 7px;border-radius:999px}
.jmc-f{margin-bottom:17px}
.jmc-f:last-child{margin-bottom:0}
.jm-contractors label{display:block;font-size:14px;font-weight:500;margin-bottom:6px;color:var(--c-ink)}
.jmc-hint{font-size:13px;color:var(--c-ink2);margin:-2px 0 7px}
.jmc-req{color:var(--c-acc);font-weight:700}
.jm-contractors input,.jm-contractors select,.jm-contractors textarea{width:100%;font:inherit;font-size:16px;
padding:11px 12px;color:var(--c-ink);background:#fff;border:1px solid var(--c-line2);border-radius:9px;outline:none;
appearance:none;-webkit-appearance:none}
.jm-contractors select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' stroke='%2364748B' stroke-width='1.6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
background-repeat:no-repeat;background-position:right 12px center;padding-right:34px}
.jm-contractors textarea{min-height:84px;resize:vertical}
.jm-contractors input:focus,.jm-contractors select:focus,.jm-contractors textarea:focus{border-color:var(--c-acc);box-shadow:0 0 0 3px var(--c-soft)}
.jm-contractors .jmc-bad{border-color:var(--c-red)}
.jmc-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.jmc-row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
@media(max-width:520px){.jmc-row,.jmc-row3{grid-template-columns:1fr}}
.jmc-pills{display:flex;flex-wrap:wrap;gap:8px}
.jmc-pill{padding:9px 15px;border:1px solid var(--c-line2);border-radius:999px;font:inherit;font-size:14.5px;
cursor:pointer;background:#fff;color:var(--c-ink)}
.jmc-pill.on{background:var(--c-acc);border-color:var(--c-acc);color:#fff;font-weight:600}
.jmc-tgroup{margin-bottom:15px}
.jmc-tgroup__h{font-size:11px;font-weight:700;letter-spacing:.08em;color:var(--c-ink3);margin-bottom:8px}
.jmc-chips{display:flex;flex-wrap:wrap;gap:7px}
.jmc-chip{padding:7px 13px;border:1px solid var(--c-line2);border-radius:999px;font:inherit;font-size:14px;
cursor:pointer;background:#fff;color:var(--c-ink)}
.jmc-chip:hover{border-color:var(--c-ink3)}
.jmc-chip.on{background:var(--c-ink);border-color:var(--c-ink);color:#fff}
.jmc-count{font-size:13px;color:var(--c-ink2);margin-top:10px}
.jmc-count b{color:var(--c-ink)}
.jmc-choices{display:flex;flex-direction:column;gap:8px}
.jmc-choice{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:13px 14px;cursor:pointer;
border:1px solid var(--c-line2);border-radius:10px;background:#fff;font:inherit;text-align:left;width:100%}
.jmc-choice.on{border-color:var(--c-acc);background:var(--c-soft)}
.jmc-choice__t{font-size:15px;font-weight:500;line-height:1.35;color:var(--c-ink)}
.jmc-choice__d{font-size:13px;color:var(--c-ink2);line-height:1.4}
.jmc-reveal{margin-top:14px;padding:15px;background:var(--c-bg);border:1px solid var(--c-line);border-radius:10px}
.jmc-ref{border:1px solid var(--c-line);border-radius:10px;padding:14px;margin-bottom:10px;background:var(--c-bg)}
.jmc-ref__h{font-size:11px;font-weight:700;letter-spacing:.08em;color:var(--c-ink3);margin-bottom:10px}
.jmc-err{color:var(--c-red);font-size:13px;margin-top:5px}
.jmc-sendfail{background:#FEF2F2;border:1px solid #FECACA;color:#991B1B;border-radius:10px;padding:14px;
margin:14px 0;font-size:14px}
.jmc-submit{position:fixed;left:0;right:0;bottom:0;z-index:40;background:rgba(248,250,252,.94);
backdrop-filter:blur(8px);border-top:1px solid var(--c-line);padding:12px 16px calc(12px + env(safe-area-inset-bottom))}
.jmc-submit__in{max-width:680px;margin:0 auto;display:flex;align-items:center;gap:14px}
.jmc-submit__note{font-size:13px;color:var(--c-ink2);flex:1;line-height:1.35}
.jmc-submit__note.is-bad{color:var(--c-red);font-weight:600}
.jmc-btn{font:inherit;font-size:16px;font-weight:600;padding:13px 26px;border-radius:10px;border:1px solid var(--c-acc);
background:var(--c-acc);color:#fff;cursor:pointer;flex:none;text-decoration:none;display:inline-block}
.jmc-btn:hover{background:#1D4ED8;border-color:#1D4ED8}
.jmc-btn:disabled{opacity:.5;cursor:not-allowed}
.jmc-thanks{display:grid;place-items:center;padding:80px 16px;min-height:52vh}
.jmc-thanks__in{max-width:520px;text-align:center}
.jmc-thanks h1{font-size:30px;font-weight:800;letter-spacing:-.03em;margin:18px 0 12px}
.jmc-thanks p{color:var(--c-ink2);font-size:16px;line-height:1.6;margin:0 0 26px}
.jmc-check{width:58px;height:58px;border-radius:50%;background:#DCFCE7;color:#15803D;display:grid;
place-items:center;margin:0 auto}
.jmc-vid{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:16px}
.jmc-vid__scrim{position:absolute;inset:0;background:rgba(8,12,22,.88);backdrop-filter:blur(6px)}
.jmc-vid__box{position:relative;display:flex;flex-direction:column;align-items:center;gap:14px}
.jmc-vid__frame{position:relative;width:min(calc(70vh * 9 / 16),92vw);aspect-ratio:9/16;border-radius:16px;
overflow:hidden;background:#000;box-shadow:0 24px 60px rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.12)}
.jmc-vid__frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}
.jmc-vid__sound{position:absolute;inset:0;z-index:2;cursor:pointer;display:flex;flex-direction:column;
align-items:center;justify-content:center;gap:12px;background:rgba(8,12,22,.42);border:0;color:#fff;font:inherit}
.jmc-vid__ring{width:68px;height:68px;border-radius:50%;background:var(--c-accb);display:grid;place-items:center;
color:var(--c-ink);box-shadow:0 6px 24px rgba(96,165,250,.45)}
.jmc-vid__soundt{font-size:15px;font-weight:600}
.jmc-vid__unmute{position:absolute;right:12px;top:12px;z-index:2;width:38px;height:38px;border-radius:50%;
background:rgba(8,12,22,.66);border:1px solid rgba(255,255,255,.2);color:#fff;display:grid;place-items:center;cursor:pointer}
.jmc-vid__skip{background:#fff;color:var(--c-ink);border:1px solid #fff;font:inherit;font-size:15px;font-weight:600;
padding:11px 22px;border-radius:10px;cursor:pointer}
.jmc-vid__note{color:#94A3B8;font-size:13px;text-align:center;max-width:34ch;margin:0}
`,
      }}
    />
  );
}
