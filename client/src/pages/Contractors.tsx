import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link } from "wouter";
import { Check, ChevronDown, MapPin, Play, Smartphone, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero, Reveal, Section, SiteLayout } from "@/components/site";
import { cn } from "@/lib/utils";
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
  "Eaton", "Ingham", "Jackson", "Genesee", "Lapeer",
];

const FOCUS_COUNTIES = ["Muskegon", "Kent", "Ottawa", "Kalamazoo"];

const LICENSE_CHOICES = [
  { value: "licensed_builder", title: "Licensed contractor", desc: "Residential builder or maintenance and alteration license" },
  { value: "licensed_trade", title: "Licensed in a specific trade", desc: "Electrical, plumbing, or mechanical" },
  { value: "unlicensed", title: "Skilled tradesman or handyman, not licensed", desc: "Plenty of our work falls here. It is not a mark against you." },
  { value: "unsure", title: "Not sure", desc: "We will sort it out when we talk." },
];

const SMS_CONSENT_TEXT =
  "I agree to receive text messages from Josh Moore about jobs and scheduling. Message frequency varies. Message and data rates may apply. Reply STOP to opt out, HELP for help.";

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

  // Bot checks. The honeypot stays empty for people; started_at lets the server
  // drop anything posted within a few seconds of the page loading.
  const [honeypot, setHoneypot] = useState("");
  const [startedAt] = useState(() => Date.now());

  const [videoOpen, setVideoOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [prompt, setPrompt] = useState(true);
  const promptTimer = useRef<number | null>(null);

  const set = (k: string, v: string) => setVals((p) => ({ ...p, [k]: v }));
  const pick = (k: string, v: string) => setPicks((p) => ({ ...p, [k]: v }));
  // Stable identity so the memoized chip grids below do not re-render while typing.
  const toggle = useCallback((k: string, v: string) => {
    setSets((p) => {
      const cur = p[k] || [];
      return { ...p, [k]: cur.includes(v) ? cur.filter((x) => x !== v) : cur.concat(v) };
    });
  }, []);

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

  // Debounced. This used to run on every keystroke, and a synchronous localStorage
  // write of the whole form on each character is slow enough inside the Facebook and
  // Messenger in-app browsers to drop characters and dismiss the keyboard.
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ vals, sets, picks }));
      } catch {
        /* private mode, fine */
      }
    }, 400);
    return () => window.clearTimeout(id);
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
    if (k === "phone") return (vals.phone || "").replace(/\D/g, "").length >= 10;
    return !!(vals[k] || "").trim();
  };
  const got = need.filter(filled).length;
  const pct = Math.round((got / need.length) * 100);
  const nextUp = need.find((k) => !filled(k));

  // Blur validation. Runs the same filled() check Submit uses, for one required
  // field, so an error shows as soon as someone leaves a field empty. Optional
  // fields are never marked. `bad` stays a plain list of keys.
  const touch = (k: string) => {
    if (!need.includes(k)) return;
    setBad((b) => {
      if (filled(k)) return b.includes(k) ? b.filter((x) => x !== k) : b;
      return b.includes(k) ? b : b.concat(k);
    });
  };

  // Clear an error the moment its field is filled in, whether by typing, picking a
  // pill, or tapping a chip. Returns the same array when nothing changed so React
  // skips the re-render.
  useEffect(() => {
    setBad((b) => {
      const next = b.filter((k) => !filled(k));
      return next.length === b.length ? b : next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vals, picks, sets]);

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

  // Facebook and Messenger open links in their own stripped down WebView, which is
  // slow and handles form focus badly. Most of our traffic arrives that way, so say
  // plainly how to get out of it rather than letting people fight the keyboard.
  const [inApp, setInApp] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent || "";
    setInApp(/FBAN|FBAV|FB_IAB|Instagram|Messenger|FBMD/i.test(ua));
  }, []);

  /* submit */
  async function onSubmit(e: FormEvent) {
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
      smsConsent: picks.smsConsent === "yes" ? "yes" : "no",
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
      company_website: honeypot,
      started_at: startedAt,
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
  const F = { vals, set, bad, picks, pick, touch };

  /* ---------------------------------------------------------------- done */

  if (done) {
    return (
      <SiteLayout>
        <Section tone="paper" className="dots-paper min-h-[60vh]" containerClassName="max-w-xl">
          <Reveal>
            <div className="surface p-8 text-center sm:p-12">
              <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-navy text-white" aria-hidden="true">
                <Check className="size-8" strokeWidth={2.5} />
              </span>
              <h1 className="display-md mt-7 text-navy">Thanks {done.name}. You're on the list.</h1>
              <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
                We will reach out when something in your trade comes up in your area. If you gave us a
                number that takes texts, that is probably how you will hear from us first.
              </p>
              <div className="mt-8">
                <Button asChild size="lg">
                  <Link href="/">Back to the site</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </Section>
      </SiteLayout>
    );
  }

  /* ---------------------------------------------------------------- page */

  return (
    // Bottom padding matches the fixed submit bar so the footer can scroll clear of it.
    <SiteLayout className="pb-[calc(7rem+env(safe-area-inset-bottom))]">
      {videoOpen ? (
        // Scrolls when the column is taller than the viewport (short phones, the
        // Facebook in-app browser), and m-auto on the column keeps it centered when
        // it fits. The Skip button sits above the video so it is always in reach.
        <div className="fixed inset-0 z-[100] flex overflow-y-auto p-4" role="dialog" aria-modal="true" aria-label="Intro video">
          <div className="fixed inset-0 bg-navy/90 backdrop-blur-sm" onClick={closeVideo} />
          <div className="relative m-auto flex flex-col items-center gap-4">
            <Button type="button" variant="light" size="lg" onClick={closeVideo}>
              Skip to the form
            </Button>
            <div
              className="relative aspect-[9/16] overflow-hidden rounded-[1.5rem] border border-white/10 bg-black shadow-lift"
              style={{ width: "min(calc(60svh * 9 / 16), 92vw)" }}
            >
              <iframe
                title="Intro from Josh Moore"
                src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=${muted ? 1 : 0}&playsinline=1&rel=0&modestbranding=1&controls=1`}
                allow="autoplay; encrypted-media; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 block h-full w-full border-0"
              />
              {prompt && muted ? (
                <button
                  type="button"
                  onClick={goLoud}
                  aria-label="Tap for sound"
                  className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-3 bg-navy/40 text-white"
                >
                  <span className="flex size-16 items-center justify-center rounded-full bg-brand text-white shadow-lift">
                    <Volume2 className="size-7" />
                  </span>
                  <span className="text-[15px] font-semibold">Tap for sound</span>
                </button>
              ) : null}
              {!prompt && muted ? (
                <button
                  type="button"
                  onClick={goLoud}
                  aria-label="Turn sound on"
                  className="absolute right-3 top-3 z-[2] flex size-11 items-center justify-center rounded-full border border-white/20 bg-navy/70 text-white"
                >
                  <Volume2 className="size-4" />
                </button>
              ) : null}
            </div>
            <p className="max-w-[34ch] text-center text-[13px] text-white/60">
              Quick look at what I'm doing and who I'm looking for.
            </p>
          </div>
        </div>
      ) : null}

      {/* Progress. Sits under the sticky header and follows the visitor down the form. */}
      <div className="sticky top-[72px] z-30 border-b border-line bg-white/92 backdrop-blur-md">
        <div className="h-1 bg-line" role="progressbar" aria-label="Form progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div className="h-full bg-brand transition-[width] duration-300 ease-out" style={{ width: `${pct}%` }} />
        </div>
        <div className="container flex max-w-3xl items-center justify-between gap-4 py-2.5 text-[13px] text-ink-muted">
          <span className="truncate">
            {pct === 100 ? "All set, hit submit" : nextUp ? `Next up: ${LABELS[nextUp] || nextUp}` : "Let's get you set up"}
          </span>
          <span className="shrink-0">
            <b className="font-semibold text-navy">{pct}</b>% done
          </span>
        </div>
      </div>

      <PageHero
        tone="paper"
        eyebrow="Contractors and trades"
        title="Let's connect."
        lede={
          <>
            I'm expanding the side of my business that does fix and flips so we can take on more
            jobs, and I would love to connect with you and see where we can fit in with each other.
            <span className="mt-4 block">
              Take a second to fill out your information below so we can connect and see how we can
              do some projects together.
            </span>
          </>
        }
        actions={
          <>
            <Button type="button" size="lg" onClick={() => setVideoOpen(true)}>
              <Play />
              Watch the quick intro
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#intake">Go to the form</a>
            </Button>
          </>
        }
        aside={
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] shadow-lift">
              <img
                src="/media-kit/assets/josh-moore-yellow-shirt.jpg"
                alt="Josh Moore"
                width={1279}
                height={1280}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover object-[32%_30%] lg:aspect-[4/5]"
              />
            </div>
            <div className="surface relative mx-4 -mt-10 p-5 sm:absolute sm:-bottom-6 sm:-left-4 sm:mx-0 sm:mt-0 sm:w-[300px] lg:-left-8">
              <p className="eyebrow eyebrow-line">Concentrating on right now</p>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                {FOCUS_COUNTIES.map((c) => (
                  <li key={c} className="flex items-center gap-2 font-display text-[17px] font-semibold text-navy">
                    <MapPin className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
                    {c} County
                  </li>
                ))}
              </ul>
            </div>
          </div>
        }
      />

      <Section tone="paper" id="intake" containerClassName="max-w-3xl" className="scroll-mt-32 pt-10 pb-40 md:pt-14 md:pb-44">
        {inApp ? (
          <Reveal className="mb-5">
            <div className="surface flex gap-4 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy text-white" aria-hidden="true">
                <Smartphone className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-navy">Typing giving you trouble?</p>
                <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">
                  You opened this inside Facebook, and its built in browser fights with the
                  keyboard. Tap the three dots in the corner and choose <b className="font-semibold text-navy">Open in browser</b>,
                  or paste <b className="font-semibold text-navy">itsjoshmoore.com/contractors</b> into Safari or Chrome. Anything
                  you have already filled in is saved on this phone.
                </p>
              </div>
            </div>
          </Reveal>
        ) : null}

        <form
          onSubmit={onSubmit}
          noValidate
          className="grid gap-5"
          onKeyDown={(e) => {
            // Enter on a checkbox or radio is an implicit submit in Chrome and Edge.
            // Only the Submit button sends this form; textareas keep their newlines.
            const t = e.target as HTMLElement;
            const type = (t as HTMLInputElement).type;
            if (e.key === "Enter" && t.tagName !== "TEXTAREA" && t.tagName !== "SELECT" && type !== "submit" && type !== "button") {
              e.preventDefault();
            }
          }}
        >
          {/* Honeypot. Off screen, out of the tab order, no autofill meaning, and left empty by people. */}
          <div aria-hidden="true" className="sr-only">
            <span>Leave this blank</span>
            <input
              id="ref_code_2"
              name="ref_code_2"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <Reveal>
            <FormCard n="01" title="How to reach you" sub="The basics. Everything else builds off this.">
              <Text {...F} k="name" label="Your name" req err="Please enter your name." />
              <Text {...F} k="company" label="Business name" hint="Leave blank if you work under your own name." />
              <Text {...F} k="phone" label="Mobile number" req type="tel" ph="(616) 555-0100" hint="This is where job offers and scheduling texts go."
                err="Please enter a mobile number with the area code." />
              <Pills {...F} k="sms" label="Can that number receive text messages?" req opts={[["yes", "Yes"], ["no", "No, call me"]]} />
              <Consent {...F} k="smsConsent" text={SMS_CONSENT_TEXT} />
              <Text {...F} k="email" label="Email" req type="email" hint="Where we send your paperwork and payment records." err="Please enter your email." />
              <Pills {...F} k="contactPref" label="Best way to reach you" req opts={[["text", "Text"], ["call", "Call"], ["email", "Email"]]} />
            </FormCard>
          </Reveal>

          <Reveal delay={0.05}>
            <FormCard n="02" title="What you do" sub="Check everything you take on. Be generous, we would rather call you and hear no.">
              <div
                data-field="trades"
                role="group"
                aria-label="Trades you take on"
                aria-invalid={bad.includes("trades") ? "true" : undefined}
                aria-describedby={bad.includes("trades") ? "jmc-trades-error" : undefined}
              >
                <TradeChips selected={sets.trades || []} toggle={toggle} />
                <p className="field-help"><b className="font-semibold text-navy">{tradeList.length}</b> selected</p>
                <Err k="trades" msg="Please pick at least one trade." bad={bad} />
              </div>
              <Text {...F} k="tradesOther" label="Anything not on that list?" ph="Septic, well pumps, masonry, pools" />
              <Select {...F} k="primaryTrade" label="Your main trade" req opts={tradeList}
                hint="The one you would want to be called for first." />
              <Row>
                <Select {...F} k="years" label="Years doing this" req opts={["Under 2", "2 to 5", "5 to 10", "10 to 20", "20 or more"]} />
                <Select {...F} k="crew" label="Is it just you?" req opts={["Just me", "Me plus 1 or 2", "Crew of 3 to 5", "Crew of 6 or more"]} />
              </Row>
              <Pills {...F} k="capacity" label="How many jobs can you comfortably run at once?" opts={[["1", "One"], ["2", "Two"], ["3+", "Three or more"]]} />
            </FormCard>
          </Reveal>

          <Reveal delay={0.05}>
            <FormCard n="03" title="How you work" sub="There is no wrong answer here. Plenty of our work does not need a license, and we hire accordingly.">
              <div data-field="licenseType">
                <span className="field-label" id="jmc-licenseType-label">How you work<Req req /></span>
                <div
                  className="grid gap-3"
                  role="radiogroup"
                  aria-labelledby="jmc-licenseType-label"
                  aria-invalid={bad.includes("licenseType") ? "true" : undefined}
                  aria-describedby={bad.includes("licenseType") ? "jmc-licenseType-error" : undefined}
                >
                  {LICENSE_CHOICES.map((c) => (
                    <label key={c.value} className="choice cursor-pointer">
                      <input
                        type="radio"
                        name="licenseType"
                        value={c.value}
                        checked={picks.licenseType === c.value}
                        onChange={() => pick("licenseType", c.value)}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-input bg-white peer-checked:border-navy peer-checked:bg-navy peer-focus-visible:ring-[3px] peer-focus-visible:ring-brand/40"
                      >
                        <span className="size-2 rounded-full bg-white" />
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[15px] font-semibold leading-snug text-navy">{c.title}</span>
                        <span className="text-sm leading-relaxed text-ink-soft">{c.desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <Err k="licenseType" msg="Please choose one." bad={bad} />
                {isLicensed ? (
                  <Inset>
                    <Row>
                      <Text {...F} k="licenseKind" label="License type" ph="Residential builder, master electrician" />
                      <Text {...F} k="licenseNumber" label="License number" />
                    </Row>
                    <Row>
                      <Text {...F} k="licenseState" label="State" />
                      <Text {...F} k="licenseExpiry" label="Expires" ph="MM/YYYY" />
                    </Row>
                  </Inset>
                ) : null}
              </div>

              <Pills {...F} k="insured" label="Do you carry general liability insurance?" req opts={[["yes", "Yes"], ["no", "No"]]} />
              {isInsured ? (
                <Inset>
                  <Row cols={3}>
                    <Text {...F} k="insCarrier" label="Carrier" />
                    <Text {...F} k="insCoverage" label="Coverage" ph="$1,000,000" />
                    <Text {...F} k="insExpiry" label="Expires" ph="MM/YYYY" />
                  </Row>
                  <Pills {...F} k="coi" label="Can you send a certificate of insurance if we ask?" opts={[["yes", "Yes"], ["no", "Not right now"]]} />
                </Inset>
              ) : null}

              <Pills {...F} k="comp" label="Workers comp" req opts={[["yes", "Yes, I carry it"], ["exempt", "Exempt, sole proprietor"], ["no", "No"]]} />
            </FormCard>
          </Reveal>

          <Reveal delay={0.05}>
            <FormCard n="04" title="Where you work" sub="Check every county you will drive to.">
              <div
                data-field="areas"
                role="group"
                aria-label="Counties you will drive to"
                aria-invalid={bad.includes("areas") ? "true" : undefined}
                aria-describedby={bad.includes("areas") ? "jmc-areas-error" : undefined}
              >
                <CountyChips selected={sets.areas || []} toggle={toggle} />
                <p className="field-help"><b className="font-semibold text-navy">{(sets.areas || []).length}</b> selected</p>
                <Err k="areas" msg="Please pick at least one county." bad={bad} />
              </div>
              <Row>
                <Text {...F} k="areasOther" label="Any county not listed?" ph="County name" />
                <Select {...F} k="radius" label="How far will you travel?" opts={["Up to 20 miles", "Up to 40 miles", "Up to 60 miles", "Anywhere, for the right job"]} />
              </Row>
              <Text {...F} k="areasAvoid" label="Anywhere you would rather not go?" ph="County, town, or area" />
            </FormCard>
          </Reveal>

          <Reveal delay={0.05}>
            <FormCard n="05" title="Pricing and payment" sub="Rough is fine. We are not holding you to a number here.">
              <Pills {...F} k="pricing" label="How do you usually price work?" req opts={[["bid", "By the bid"], ["hourly", "Hourly"], ["unit", "By the unit"], ["mix", "Mix of those"]]} />
              <Text {...F} k="rate" label="Typical rate or range" ph="$65/hr, or $385 a square" />
              <Pills {...F} k="ten99" label="Are you set up to be paid as a 1099 contractor?" req
                hint="We will collect a W-9 from you before your first payment, not here."
                opts={[["yes", "Yes"], ["no", "No"], ["unsure", "Not sure"]]} />
            </FormCard>
          </Reveal>

          <Reveal delay={0.05}>
            <FormCard n="06" title="Availability" sub="Helps us stop calling you about work you cannot take." optional>
              <Select {...F} k="leadTime" label="Notice you need to schedule" opts={["A day or two", "About a week", "Two weeks", "A month"]}
                hint="How much heads up you want before a start date." />
              <Pills {...F} k="weekends" label="Do you work weekends?" opts={[["yes", "Yes"], ["sometimes", "Sometimes"], ["no", "No"]]} />
            </FormCard>
          </Reveal>

          <Reveal delay={0.05}>
            <FormCard n="07" title="Show us your work" sub="Anything that shows what you do. Skip it if you would rather just talk." optional>
              <Row>
                <Text {...F} k="website" label="Website" ph="https://" />
                <Text {...F} k="facebook" label="Facebook" />
              </Row>
              <Row>
                <Text {...F} k="instagram" label="Instagram" ph="@handle" />
                <Text {...F} k="google" label="Google Business listing" />
              </Row>
              <Text {...F} k="photoLinks" label="Photos of recent work" hint="Paste a link to a folder, album, or post. You can also just text them to us later." />
              <Inset label="Reference 1">
                <Row><Text {...F} k="ref1name" label="Name" /><Text {...F} k="ref1phone" label="Phone" type="tel" /></Row>
              </Inset>
              <Inset label="Reference 2">
                <Row><Text {...F} k="ref2name" label="Name" /><Text {...F} k="ref2phone" label="Phone" type="tel" /></Row>
              </Inset>
            </FormCard>
          </Reveal>

          <Reveal delay={0.05}>
            <FormCard n="08" title="Anything else" sub="Last box. Tell us whatever does not fit above." optional>
              <Text {...F} k="notes" label="Anything else we should know?" area ph="What you are best at, what you would rather not touch, who sent you" />
              <p className="text-sm text-ink-muted">
                By submitting you agree to the{" "}
                <Link href="/privacy" className="font-medium text-brand-600 underline-offset-4 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </FormCard>
          </Reveal>

          {sendError ? (
            <div role="alert" className="rounded-2xl border border-destructive/30 bg-white p-5 text-[15px] leading-relaxed text-destructive">
              Could not send that: {sendError}. Your answers are saved on this device, so try again in a moment.
            </div>
          ) : null}
        </form>
      </Section>

      {/* Sticky submit. When a tap on Submit does nothing, the reason has to be right here
          next to the button, not somewhere up the page the user has to go hunting for. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <div className="container flex max-w-3xl items-center gap-3 py-2 sm:gap-4 sm:py-3">
          <p
            aria-live="polite"
            className={cn("flex-1 text-xs leading-snug sm:text-[13px]", bad.length ? "font-semibold text-destructive" : "text-ink-muted")}
          >
            {bad.length
              ? `Still needed: ${bad.slice(0, 3).map((k) => LABELS[k] || k).join(", ")}${bad.length > 3 ? `, and ${bad.length - 3} more` : ""}`
              : pct === 100
                ? "Looks complete."
                : `${need.length - got} left. Takes about four minutes.`}
          </p>
          <Button
            type="submit"
            size="lg"
            disabled={sending}
            onClick={onSubmit}
            className={cn("shrink-0 max-sm:h-11 max-sm:px-6 max-sm:text-[15px]", got < need.length && !sending && "opacity-75")}
          >
            {sending ? "Sending..." : "Submit"}
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}


/* ----------------------------------------------------------- chip grids
   61 buttons between them. Memoized on the selected list alone, so typing a
   name no longer re-renders every chip on the page. That per-keystroke work
   is what made the Facebook and Messenger in-app browsers drop characters. */

const TradeChips = memo(function TradeChips(
  { selected, toggle }: { selected: string[]; toggle: (k: string, v: string) => void },
) {
  return (
    <div className="grid gap-5">
      {TRADE_GROUPS.map(([g, list]) => (
        <div key={g}>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{g}</p>
          <div className="flex flex-wrap gap-2">
            {list.map((t) => (
              <button type="button" key={t} className="pill" aria-pressed={selected.includes(t)}
                onClick={() => toggle("trades", t)}>{t}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

const CountyChips = memo(function CountyChips(
  { selected, toggle }: { selected: string[]; toggle: (k: string, v: string) => void },
) {
  return (
    <div className="flex flex-wrap gap-2">
      {COUNTIES.map((c) => (
        <button type="button" key={c} className="pill" aria-pressed={selected.includes(c)}
          onClick={() => toggle("areas", c)}>{c}</button>
      ))}
    </div>
  );
});

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
  touch: (k: string) => void;
};

/** Joins the help and error ids a control should be described by. */
function describedBy(id: string, hint: boolean, invalid: boolean) {
  return [hint && `${id}-help`, invalid && `${id}-error`].filter(Boolean).join(" ") || undefined;
}

function Req({ req }: { req?: boolean }) {
  return req
    ? <span className="text-brand-600" aria-hidden="true"> *</span>
    : <span className="ml-2 font-medium normal-case tracking-normal text-ink-muted">optional</span>;
}

function Err({ k, msg, bad }: { k: string; msg: string; bad: string[] }) {
  if (!bad.includes(k)) return null;
  return <p id={`jmc-${k}-error`} className="field-error" role="alert">{msg}</p>;
}

function Text(p: FieldCtx & { k: string; label: string; hint?: string; req?: boolean; ph?: string; type?: string; area?: boolean; err?: string }) {
  const id = `jmc-${p.k}`;
  const invalid = p.bad.includes(p.k);
  const common = {
    id,
    value: p.vals[p.k] || "",
    placeholder: p.ph,
    className: cn("field", p.area && "min-h-[7rem] resize-y"),
    "aria-invalid": invalid ? ("true" as const) : undefined,
    "aria-describedby": describedBy(id, !!p.hint, invalid),
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => p.set(p.k, e.target.value),
    onBlur: () => p.touch(p.k),
  };
  return (
    <div data-field={p.k}>
      <label htmlFor={id} className="field-label">
        {p.label}<Req req={p.req} />
      </label>
      {p.area ? <textarea {...common} rows={4} /> : (
        <input
          {...common}
          type={p.type || "text"}
          inputMode={p.type === "tel" ? "tel" : p.type === "email" ? "email" : undefined}
          autoComplete={p.k === "name" ? "name" : p.k === "email" ? "email" : p.k === "phone" ? "tel" : p.k === "company" ? "organization" : undefined}
        />
      )}
      {p.hint ? <p id={`${id}-help`} className="field-help">{p.hint}</p> : null}
      <Err k={p.k} msg={p.err || `Please enter ${LABELS[p.k] || "this"}.`} bad={p.bad} />
    </div>
  );
}

function Select(p: FieldCtx & { k: string; label: string; req?: boolean; opts: string[]; hint?: string }) {
  const id = `jmc-${p.k}`;
  const invalid = p.bad.includes(p.k);
  return (
    <div data-field={p.k}>
      <label htmlFor={id} className="field-label">
        {p.label}<Req req={p.req} />
      </label>
      <div className="relative">
        <select
          id={id}
          value={p.vals[p.k] || ""}
          className="field appearance-none pr-11"
          aria-invalid={invalid ? "true" : undefined}
          aria-describedby={describedBy(id, !!p.hint, invalid)}
          onChange={(e) => p.set(p.k, e.target.value)}
          onBlur={() => p.touch(p.k)}
        >
          <option value="">Select</option>
          {p.opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
      </div>
      {p.hint ? <p id={`${id}-help`} className="field-help">{p.hint}</p> : null}
      <Err k={p.k} msg="Please choose one." bad={p.bad} />
    </div>
  );
}

function Pills(p: FieldCtx & { k: string; label: string; req?: boolean; hint?: string; opts: Array<[string, string]> }) {
  const id = `jmc-${p.k}`;
  const invalid = p.bad.includes(p.k);
  return (
    <div data-field={p.k}>
      <span className="field-label" id={`${id}-label`}>{p.label}<Req req={p.req} /></span>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-labelledby={`${id}-label`}
        aria-invalid={invalid ? "true" : undefined}
        aria-describedby={describedBy(id, !!p.hint, invalid)}
      >
        {p.opts.map(([v, t]) => (
          <button type="button" key={v} className="pill" aria-pressed={p.picks[p.k] === v}
            onClick={() => p.pick(p.k, v)}>{t}</button>
        ))}
      </div>
      {p.hint ? <p id={`${id}-help`} className="field-help">{p.hint}</p> : null}
      <Err k={p.k} msg="Please choose one." bad={p.bad} />
    </div>
  );
}

// Optional. Stored in picks so it rides along in the saved draft like every other choice.
function Consent(p: FieldCtx & { k: string; text: string }) {
  const id = `jmc-${p.k}`;
  const on = p.picks[p.k] === "yes";
  return (
    <div data-field={p.k}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-paper px-4 py-3.5">
        <input
          id={id}
          name={p.k}
          type="checkbox"
          checked={on}
          onChange={(e) => p.pick(p.k, e.target.checked ? "yes" : "no")}
          className="mt-0.5 size-5 shrink-0 rounded border-input accent-navy"
        />
        <span className="text-sm leading-relaxed text-ink-soft">{p.text}</span>
      </label>
      <p className="field-help">Optional. Leave it unchecked and we will reach you by call or email instead.</p>
    </div>
  );
}

/* ---------------------------------------------------------------- shell */

function Row({ cols = 2, children }: { cols?: 2 | 3; children: ReactNode }) {
  return <div className={cn("grid gap-5", cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>{children}</div>;
}

/** A paper inset inside a card, for follow up fields and the reference blocks. */
function Inset({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="mt-4 grid gap-5 rounded-2xl border border-line bg-paper p-5 first:mt-0">
      {label ? <p className="-mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{label}</p> : null}
      {children}
    </div>
  );
}

function FormCard(p: { n: string; title: string; sub: string; optional?: boolean; children: ReactNode }) {
  const id = `jmc-sec-${p.n}`;
  return (
    <section className="surface p-6 sm:p-8" aria-labelledby={id}>
      <span className="eyebrow eyebrow-line">Step {p.n}</span>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <h2 id={id} className="text-2xl text-navy sm:text-[1.75rem]">{p.title}</h2>
        {p.optional ? (
          <span className="rounded-full border border-line bg-paper px-2.5 py-0.5 text-xs font-semibold text-ink-muted">optional</span>
        ) : null}
      </div>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{p.sub}</p>
      <div className="mt-7 grid gap-6">{p.children}</div>
    </section>
  );
}
