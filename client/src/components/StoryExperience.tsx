import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { STORY_DURATION, storyChapters } from "@/content/media-kit";
import "./story-experience.css";

const FRAME_COUNT = 500;
const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** Full-viewport, scroll-directed scene. Frames are loaded around the visitor,
 * with a coarse pass for fast chapter jumps and a bounded decoded-image cache. */
export default function StoryExperience({
  run,
  onEnter,
  onPressKit,
}: {
  run: number;
  onEnter: () => void;
  onPressKit: () => void;
}) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const foreground = useRef<HTMLCanvasElement>(null);
  const background = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const active = run > 0;
  const time = progress * STORY_DURATION;
  const chapterIndex = Math.max(
    0,
    storyChapters.findLastIndex((c) => time + 0.03 >= c.start),
  );
  const chapter = storyChapters[chapterIndex];
  const end = storyChapters[chapterIndex + 1]?.start ?? STORY_DURATION;
  const chapterProgress = clamp((time - chapter.start) / (end - chapter.start));
  const captionOpacity =
    chapterIndex === 0 && chapterProgress < 0.08
      ? 1
      : Math.min(1, chapterProgress / 0.09, (1 - chapterProgress) / 0.12);
  const exit = clamp((progress - 0.958) / 0.04);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);

  useEffect(() => {
    if (!active || !section.current) return;
    window.scrollTo({ top: section.current.offsetTop, behavior: "instant" });
    section.current.focus({ preventScroll: true });
  }, [run, active]);

  useEffect(() => {
    if (!active) return;
    const root = section.current!,
      screen = stage.current!;
    const front = foreground.current!,
      back = background.current!;
    const ctx = front.getContext("2d"),
      backdrop = back.getContext("2d");
    if (!ctx || !backdrop) {
      setFailed(true);
      return;
    }
    let disposed = false,
      raf = 0,
      current = 0,
      target = 0,
      inFlight = 0,
      drawn = -1,
      failures = 0;
    let width = 0,
      height = 0,
      dpr = 1,
      painted = false;
    const images = new Map<number, HTMLImageElement>();
    const pending = new Set<number>(),
      rejected = new Set<number>();
    const small =
      matchMedia("(max-width: 900px)").matches ||
      (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection?.saveData;
    const directory = small ? "frames-small" : "frames";
    const coarse = Array.from(
      { length: Math.ceil(FRAME_COUNT / 20) },
      (_, n) => n * 20,
    ).concat(FRAME_COUNT - 1);
    const retained = new Set(coarse);

    function paint() {
      if (disposed || !width || !height || !images.size) return;
      const wanted = Math.round(current);
      let index = wanted;
      if (!images.has(index))
        index = Array.from(images.keys()).reduce((best, key) =>
          Math.abs(key - wanted) < Math.abs(best - wanted) ? key : best,
        );
      if (index === drawn) return;
      const image = images.get(index)!;
      drawn = index;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, width, height);
      const ratio = image.naturalWidth / image.naturalHeight;
      const portrait = width / height < 1;
      const baseScale = portrait
        ? (width * 1.34) / image.naturalWidth
        : Math.max(width / image.naturalWidth, height / image.naturalHeight);
      // The final portrait has very little headroom in the source. Fit its
      // full height below the masthead instead of cropping it to fill widescreens.
      const finale = portrait ? 0 : clamp((index / 8 - 51.7) / 1.2);
      const finalScale = Math.min(
        width / image.naturalWidth,
        (height - 200) / image.naturalHeight,
      );
      const scale = baseScale + (finalScale - baseScale) * finale;
      const w = image.naturalWidth * scale,
        h = w / ratio;
      const x = (width - w) / 2;
      const y = portrait
        ? height * 0.35 - h / 2
        : ((height - h) / 2) * (1 - finale) + 110 * finale;
      ctx!.drawImage(image, x, y, w, h);
      const cover = Math.max(
        back.width / image.naturalWidth,
        back.height / image.naturalHeight,
      );
      backdrop!.drawImage(
        image,
        (back.width - image.naturalWidth * cover) / 2,
        (back.height - image.naturalHeight * cover) / 2,
        image.naturalWidth * cover,
        image.naturalHeight * cover,
      );
      if (!painted) {
        painted = true;
        setReady(true);
      }
      front.dataset.frame = String(index);
      // Keep the coarse overview plus nearby frames, not 500 decoded full-size images.
      if (images.size > 70) {
        Array.from(images.keys())
          .filter((i) => !retained.has(i))
          .sort((a, b) => Math.abs(b - wanted) - Math.abs(a - wanted))
          .slice(0, images.size - 65)
          .forEach((i) => images.delete(i));
      }
    }

    function request(index: number) {
      if (
        disposed ||
        pending.has(index) ||
        images.has(index) ||
        rejected.has(index)
      )
        return;
      pending.add(index);
      inFlight++;
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (disposed) return;
        pending.delete(index);
        inFlight--;
        images.set(index, image);
        paint();
        fill();
      };
      image.onerror = () => {
        if (disposed) return;
        pending.delete(index);
        inFlight--;
        rejected.add(index);
        failures++;
        if (!images.size && failures > 6) setFailed(true);
        fill();
      };
      image.src = `/media-kit/${directory}/f_${String(index + 1).padStart(3, "0")}.webp`;
    }

    function fill() {
      if (disposed) return;
      const wanted = Math.round(target);
      const candidates = [wanted];
      if (!reduced) {
        for (let distance = 1; distance <= 12; distance++)
          candidates.push(wanted + distance, wanted - distance);
        candidates.push(...coarse);
      }
      for (const index of candidates) {
        if (inFlight >= 5) break;
        if (index >= 0 && index < FRAME_COUNT) request(index);
      }
    }

    function tick() {
      if (disposed) return;
      const delta = target - current;
      current =
        reduced || Math.abs(delta) < 0.08 ? target : current + delta * 0.2;
      paint();
      if (Math.abs(target - current) > 0.08) raf = requestAnimationFrame(tick);
      else raf = 0;
    }

    function update() {
      const p = clamp(
        -root.getBoundingClientRect().top /
          Math.max(1, root.offsetHeight - screen.offsetHeight),
      );
      setProgress(p);
      const currentTime = p * STORY_DURATION;
      const chapter =
        [...storyChapters].reverse().find((c) => c.start <= currentTime) ??
        storyChapters[0];
      target = reduced
        ? Math.min(499, Math.round((chapter.start + 1) * 8))
        : p * (FRAME_COUNT - 1);
      fill();
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function resize() {
      width = screen.clientWidth;
      height = screen.clientHeight;
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      front.width = Math.round(width * dpr);
      front.height = Math.round(height * dpr);
      back.width = Math.ceil(width / 8);
      back.height = Math.ceil(height / 8);
      drawn = -1;
      paint();
      update();
    }
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(screen);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", update);
      images.clear();
    };
  }, [active, reduced]);

  const jump = (index: number) => {
    if (!section.current || !stage.current) return;
    const chapterStart = storyChapters[index].start;
    const chapterEnd = storyChapters[index + 1]?.start ?? STORY_DURATION;
    const p =
      (chapterStart + Math.min(2, (chapterEnd - chapterStart) * 0.25)) /
      STORY_DURATION;
    window.scrollTo({
      top:
        section.current.offsetTop +
        (section.current.offsetHeight - stage.current.offsetHeight) * p,
      behavior: "instant",
    });
  };

  return (
    <section
      ref={section}
      id="story-intro"
      tabIndex={-1}
      className={`story-world ${active ? "is-entered" : "is-arrival"}`}
      aria-label={
        active ? "Josh’s immersive story" : "Choose your way into Josh’s story"
      }
    >
      <div
        ref={stage}
        className={`story-screen ${active ? `story-scene-${chapter.id}` : ""}`}
      >
        <img
          className="story-poster"
          src="/media-kit/story-poster.webp"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
        />
        {active && (
          <>
            <canvas
              ref={background}
              className={`story-background ${ready ? "is-ready" : ""}`}
              aria-hidden="true"
            />
            <canvas
              ref={foreground}
              className={`story-canvas ${ready ? "is-ready" : ""}`}
              role="img"
              aria-label={`Animated scene: ${chapter.label}`}
            />
          </>
        )}
        <div className="story-shade" />
        <header className="story-masthead">
          <a className="story-wordmark" href="/">
            JOSH MOORE<span>REAL ESTATE. REAL LIFE.</span>
          </a>
          <button onClick={onPressKit}>
            The press kit <ArrowUpRight size={15} />
          </button>
        </header>

        {!active ? (
          <>
            <div className="story-arrival-copy">
              <p className="story-kicker">
                An unconventional path. A very real reason.
              </p>
              <h1>
                Every chapter
                <br />
                brought me <em>here.</em>
              </h1>
              <p className="story-arrival-note">
                Before the real estate, there was a whole other story.
              </p>
              <div className="story-choices">
                <button onClick={onEnter} className="story-enter">
                  Experience my story <ArrowRight size={19} />
                </button>
                <button onClick={onPressKit} className="story-direct">
                  Go straight to the press kit <ArrowUpRight size={17} />
                </button>
              </div>
            </div>
            <div className="story-arrival-foot">
              <span>SALES / MUSIC / SNEAKERS / SOFTWARE / REAL ESTATE</span>
              <span>JOSH MOORE · WEST MICHIGAN</span>
            </div>
          </>
        ) : (
          <>
            <h1 className="sr-only">Josh Moore’s story and press kit</h1>
            <div className="story-coordinate">
              <span>THE LONG WAY HERE</span>
              <span>0{chapterIndex + 1} / 0{storyChapters.length}</span>
            </div>
            <div
              className="story-chapter-copy"
              style={{
                opacity: reduced ? 1 : captionOpacity * (1 - exit),
                transform: reduced
                  ? undefined
                  : `translateY(${(1 - captionOpacity) * 18}px)`,
              }}
            >
              <p className="story-kicker">
                <span />
                {chapter.label}
              </p>
              <h2>{chapter.title}</h2>
              <p className="story-narrative">{chapter.text}</p>
            </div>
            <nav className="story-rail" aria-label="Story chapters">
              {storyChapters.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => jump(index)}
                  aria-label={`Chapter: ${item.label}`}
                  aria-current={index === chapterIndex ? "step" : undefined}
                >
                  <span className="story-rail-number">0{index + 1}</span>
                  <span className="story-rail-label">{item.label}</span>
                  <span className="story-rail-line">
                    <i
                      style={{
                        transform: `scaleX(${index < chapterIndex ? 1 : index === chapterIndex ? chapterProgress : 0})`,
                      }}
                    />
                  </span>
                </button>
              ))}
            </nav>
            <div className="story-scroll-cue">
              {progress < 0.03
                ? "Scroll to walk through my story"
                : progress > 0.95
                  ? "Keep going. Meet Josh."
                  : "Keep going"}
              <ArrowDown size={16} />
            </div>
            {!ready && !failed && (
              <p className="story-loading" role="status">
                Setting the scene…
              </p>
            )}
            {failed && (
              <div className="story-loading" role="status">
                The scene couldn’t load.{" "}
                <button onClick={onPressKit}>
                  Read my story instead <ArrowRight size={14} />
                </button>
              </div>
            )}
            <div
              className="story-to-paper"
              style={{ opacity: exit }}
              aria-hidden={exit < 0.8}
              inert={exit < 0.8}
            >
              <span>
                And this is where
                <br />
                <em>it brought me.</em>
              </span>
              <button
                onClick={onPressKit}
                style={{ pointerEvents: exit > 0.8 ? "auto" : "none" }}
                tabIndex={exit > 0.8 ? 0 : -1}
              >
                Meet Josh <ArrowDown size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
