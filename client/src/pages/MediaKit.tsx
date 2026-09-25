import { useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Mail,
  RotateCcw,
} from "lucide-react";
import { useRouteSeo } from "@/hooks/useSeo";
import {
  conversationTopics,
  fullBio,
  MEDIA_EMAIL,
  pressLinks,
  shortBio,
} from "@/content/media-kit";
import Footer from "@/components/Footer";
import StoryExperience from "@/components/StoryExperience";
import "./media-kit.css";
import mediaAssets from "@/content/media-assets.json";

export default function MediaKit() {
  useRouteSeo("/mediakit");
  const [experienceRun, setExperienceRun] = useState(0);
  const [bioVersion, setBioVersion] = useState<"short" | "full">("short");
  const [copyStatus, setCopyStatus] = useState("");
  const pressRef = useRef<HTMLElement>(null);
  const bio = bioVersion === "short" ? shortBio : fullBio;
  const enterStory = () => setExperienceRun((value) => value + 1);
  const scrollToKit = () => {
    pressRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
    pressRef.current?.focus({ preventScroll: true });
  };
  async function copyBio() {
    try {
      await navigator.clipboard.writeText(bio);
      setCopyStatus("Bio copied.");
    } catch {
      setCopyStatus("Select the bio text to copy it, or use Download bio.");
    }
  }

  function downloadBio() {
    const url = URL.createObjectURL(
      new Blob(
        [
          `Josh Moore\n${bio}\n\nMedia contact: ${MEDIA_EMAIL}\nhttps://www.itsjoshmoore.com/mediakit\n`,
        ],
        { type: "text/plain;charset=utf-8" },
      ),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `josh-moore-${bioVersion}-bio.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="mk-page mk-immersive-edition">
      <a className="mk-skip" href="#press-kit">
        Skip to press kit
      </a>
      <main>
        <StoryExperience
          run={experienceRun}
          onEnter={enterStory}
          onPressKit={scrollToKit}
        />
        <section
          id="press-kit"
          ref={pressRef}
          tabIndex={-1}
          className="mk-introduction"
        >
          <div className="mk-shell mk-intro-grid">
            <div className="mk-portrait">
              <img
                src="/media-kit/josh-current.jpg"
                alt="Josh Moore outdoors in West Michigan, wearing glasses and a yellow shirt"
                width="976"
                height="1280"
                loading="lazy"
              />
              <span className="mk-portrait-caption">
                Josh Moore
                <br />
                <small>Investor. Entrepreneur. Dad.</small>
              </span>
            </div>
            <div className="mk-intro-copy">
              <span className="mk-eyebrow">The person behind the story</span>
              <h2>Hey, I’m Josh.</h2>
              <p className="mk-lead">
                I build real estate deals.
                <br />
                And a life worth being present for.
              </p>
              <p>
                I’m a full-time real estate investor in West Michigan,
                specializing in creative finance. The route here was
                unconventional. Every chapter gave me something I use today.
              </p>
              <p>
                The reason I keep building is pretty simple: more time with my
                family, more room to make decisions, and more ability to help
                where it matters.
              </p>
              <a
                className="mk-button mk-button-navy"
                href={`mailto:${MEDIA_EMAIL}?subject=Media%20inquiry`}
              >
                Invite me to the conversation <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </section>

        <div className="mk-kit-nav">
          <nav className="mk-shell" aria-label="Press kit sections">
            <span>THE PRESS KIT</span>
            <a href="#bio">Bio</a>
            <a href="#recognition">Recognition</a>
            <a href="#community">Community</a>
            <a href="#press">Press</a>
            <a href="#assets">Photos & contact</a>
          </nav>
        </div>

        <section id="bio" className="mk-section mk-shell mk-bio-layout">
          <div className="mk-section-intro">
            <span className="mk-eyebrow">01 / In a few words</span>
            <h2>The bio.</h2>
            <p>
              For introductions, show notes,
              <br />
              and the people behind the story.
            </p>
          </div>
          <div className="mk-bio-content">
            <div
              className="mk-bio-tabs"
              role="group"
              aria-label="Biography length"
            >
              <button
                aria-pressed={bioVersion === "short"}
                onClick={() => {
                  setBioVersion("short");
                  setCopyStatus("");
                }}
              >
                Short bio
              </button>
              <button
                aria-pressed={bioVersion === "full"}
                onClick={() => {
                  setBioVersion("full");
                  setCopyStatus("");
                }}
              >
                Full bio
              </button>
              <span>{bio.trim().split(/\s+/).length} words</span>
            </div>
            <p className="mk-bio-text">{bio}</p>
            <div className="mk-bio-tools">
              <button onClick={copyBio}>
                {copyStatus === "Bio copied." ? (
                  <Check size={16} />
                ) : (
                  <Copy size={16} />
                )}{" "}
                Copy bio
              </button>
              <button onClick={downloadBio}>
                <Download size={16} /> Download bio
              </button>
            </div>
            <p className="mk-copy-status" role="status">
              {copyStatus}
            </p>
          </div>
        </section>

        <section id="recognition" className="mk-recognition">
          <div className="mk-shell">
            <div className="mk-section-heading">
              <div>
                <span className="mk-eyebrow">02 / Along the way</span>
                <h2>A few milestones.</h2>
              </div>
              <p>
                Different chapters.
                <br />
                Something to show for each.
              </p>
            </div>
            <div className="mk-milestones">
              <a
                className="mk-milestone"
                href={pressLinks[0].href}
                target="_blank"
                rel="noreferrer"
              >
                <span className="mk-milestone-label">
                  Real estate / 2026 <ArrowUpRight size={18} />
                </span>
                <span className="mk-milestone-big">
                  West <br />
                  Michigan.
                </span>
                <h3>Best Seller Finance Strategist</h3>
                <p>Best of Best Review, 2026</p>
              </a>
              <div className="mk-milestone">
                <span className="mk-milestone-label">Creative finance</span>
                <span className="mk-milestone-big">
                  Six <br />
                  figures.
                </span>
                <h3>Creative Campus Award</h3>
                <p>Six-Figure Award recipient</p>
              </div>
              <div className="mk-milestone">
                <span className="mk-milestone-label">Music / 2017</span>
                <span className="mk-milestone-big">
                  A full page. <br />A wider world.
                </span>
                <h3>XXL Freshman issue</h3>
                <p>
                  A full-page advertisement in the 2017 edition. A U.S. tour with Project Pat
                  from Three 6 Mafia. My own small tour run in Japan.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="written-story"
          className="mk-section mk-shell mk-written-layout"
        >
          <div className="mk-section-intro">
            <span className="mk-eyebrow">The story, on paper</span>
            <h2>
              It all came
              <br />
              with me.
            </h2>
            <button className="mk-text-button" onClick={() => enterStory()}>
                <RotateCcw size={15} /> Revisit my story
            </button>
          </div>
          <div className="mk-written-copy">
            <p>
              I started in sales when I was young. I was always trying to make
              something happen. That took me from knocking on doors to making
              music, touring the country with Project Pat from Three 6 Mafia,
              and placing a full-page advertisement in the 2017 XXL Freshman issue. I also put
              together my own small tour run in Japan through my own marketing,
              branding, and management.
            </p>
            <p>
              Then came sneakers. I did well buying and selling pairs, and
                eventually started a software startup. We landed our first major
                development client and signed a deal with a huge six-figure
                backend. It felt like the next big step. Then the client ran out of
              money. Things started falling apart. My queen was seven months
              pregnant with our first daughter.
            </p>
            <p>
              Later, as a stay-at-home dad, I asked her to help carry things
              while I built something new. I promised I would work toward
              getting her to a place where she could quit her job. I was
              learning real estate with our daughter in my arms and a phone in
              my hand.
            </p>
            <p>
              Then I got my first deal. From there, it was closing after
              closing. Today, I’m a full-time investor. The sales, the music,
              the setbacks, the family: all of it is part of how I got here.
            </p>
          </div>
        </section>

        <section id="community" className="mk-community">
          <div className="mk-shell mk-community-grid">
            <div>
              <span className="mk-eyebrow">03 / Beyond the closing table</span>
              <h2>
                Opportunity should
                <br />
                reach further.
              </h2>
            </div>
            <div>
              <h3>Addison North</h3>
              <p>
                I serve on the board of Addison North, where I helped create a
                free financial education and leadership curriculum for
                underserved communities. It’s one way I put what I’ve learned to
                work beyond my own business.
              </p>
              <a
                className="mk-text-button"
                href="https://addisonnorth.org/about/"
                target="_blank"
                rel="noreferrer"
              >
                Meet Addison North <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
        </section>

        <section id="press" className="mk-section mk-shell">
          <div className="mk-section-heading">
            <div>
              <span className="mk-eyebrow">04 / In print</span>
              <h2>Press & recognition.</h2>
            </div>
          </div>
          <div className="mk-press-list">
            {pressLinks.map((item) => (
              <a
                key={item.publication}
                href={item.href}
                target="_blank"
                rel="noreferrer"
              >
                <div className="mk-publication">
                  {item.publication}
                  <small>{item.type}</small>
                </div>
                <h3>{item.title}</h3>
                <ArrowUpRight size={22} />
              </a>
            ))}
          </div>
        </section>

        <section id="music-background" className="mk-section mk-shell mk-music-background">
          <div className="mk-section-heading">
            <div>
              <span className="mk-eyebrow">Music / The creative foundation</span>
              <h2>I built the opportunity.</h2>
            </div>
          </div>
          <div className="mk-music-intro">
            <p><strong>Josh Moore, known in music as Zipps McGee.</strong></p>
            <p>Making the music was one part of it. I had to figure out how to get it in front of people. I put together my own small Japan tour through my own marketing, branding, and management. From an album campaign to a real estate deal, I bring that same instinct: see a possibility, work out the pieces, and make something happen.</p>
          </div>
          <div className="mk-press-list">
            <a href="https://www.viberate.com/artist/zipps-mcgee/" target="_blank" rel="noreferrer">
              <div className="mk-publication">Viberate<small>Artist profile</small></div>
              <div><h3>Zipps McGee: Artist Profile on Viberate</h3><p className="mk-music-description">Viberate’s artist biography highlights my Muskegon roots, lyrical storytelling, and blend of traditional and contemporary hip-hop influences.</p></div>
              <ArrowUpRight size={22} />
            </a>
            <a href="https://music.youtube.com/podcast/R04-d7Ov3oA" target="_blank" rel="noreferrer">
              <div className="mk-publication">EDP Interview<small>Previous interview · June 2, 2018</small></div>
              <div><h3>Music, Entrepreneurship &amp; Tour Life</h3><p className="mk-music-description">“EDP Interview Episode 3- Zipps Mcgee.” The episode description introduces me as a rapper and entrepreneur and covers tour life and my background.</p></div>
              <ArrowUpRight size={22} />
            </a>
          </div>
          <article className="mk-xxl-placement">
            <span className="mk-eyebrow">Magazine advertising placement / 2017</span>
            <h3>A full page for Dream Architect.</h3>
            <p>Appeared in a full-page advertisement in XXL Magazine’s 2017 Freshman issue.</p>
            <div className="mk-xxl-photos">
              <figure><a href="/media-kit/xxl-2017-cover.jpg" target="_blank" rel="noreferrer"><img src="/media-kit/xxl-2017-cover.jpg" alt="Cover of XXL Magazine’s 2017 Freshman issue" loading="lazy" width="720" height="960" /></a><figcaption>The issue: XXL’s 2017 Freshman edition.</figcaption></figure>
              <figure><a href="/media-kit/xxl-2017-advertisement.jpg" target="_blank" rel="noreferrer"><img src="/media-kit/xxl-2017-advertisement.jpg" alt="Open magazine showing Zipps McGee’s full-page Dream Architect advertisement on the left" loading="lazy" width="720" height="960" /></a><figcaption>Zipps McGee | Full-page advertisement | XXL 2017 Freshman Issue</figcaption></figure>
            </div>
          </article>
        </section>

        <section className="mk-conversations">
          <div className="mk-shell">
            <div className="mk-section-heading">
              <div>
                <span className="mk-eyebrow">
                  05 / Good conversations start here
                </span>
                <h2>
                  There’s a story
                  <br />
                  behind the strategy.
                </h2>
              </div>
              <p>
                For podcasts, interviews,
                <br />
                and thoughtful conversations.
              </p>
            </div>
            <div className="mk-topics">
              {conversationTopics.map((topic) => (
                <article key={topic.number}>
                  <span>{topic.number}</span>
                  <div>
                    <h3>{topic.title}</h3>
                    <p>{topic.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="assets" className="mk-section mk-shell mk-asset-vault">
          <div className="mk-section-heading">
            <div>
              <span className="mk-eyebrow">06 / Ready for your story</span>
              <h2>Photos &amp; brand assets.</h2>
              <p>Portraits, logos, and a little history. Download images for your interview, article, or show notes.</p>
            </div>
            <a className="mk-text-button" href="/media-kit/josh-moore-media-assets.zip" download>
              Download all 9 assets <Download size={18} />
            </a>
          </div>
          <div className="mk-vault-grid">
            {mediaAssets.map((asset) => (
              <article key={asset.id}>
                <a className="mk-vault-preview" href={asset.href} target="_blank" rel="noreferrer" aria-label={`View ${asset.label}`}>
                  <img src={asset.href} alt={asset.label} loading="lazy" />
                </a>
                <div className="mk-vault-details">
                  <small>{asset.group} · {asset.format}</small>
                  <h3>{asset.label}</h3>
                  <a href={asset.href} download><Download size={16} /> Download original</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mk-section mk-shell mk-assets-grid">
          <div className="mk-section-intro">
            <span className="mk-eyebrow">Keep it handy</span>
            <h2>The essentials.</h2>
            <p>
              An introduction,
              <br />
              and a direct line.
            </p>
          </div>
          <div className="mk-assets">
            <button className="mk-download-row" onClick={() => window.print()}>
              <span className="mk-file-icon">JM</span>
              <span>
                Print-friendly press kit
                <small>Save a PDF from your print dialog</small>
              </span>
              <Download size={20} />
            </button>
            <a className="mk-download-row" href="/">
              <span className="mk-file-icon">
                <ArrowUpRight size={24} />
              </span>
              <span>
                Explore my work
                <small>Investment criteria, projects, and collaboration</small>
              </span>
              <ArrowRight size={20} />
            </a>
          </div>
        </section>

        <section id="media-contact" className="mk-contact">
          <div className="mk-shell">
            <span className="mk-eyebrow">Podcasts / Interviews / Press</span>
            <h2>
              Let’s have a<br />
              <span>real conversation.</span>
            </h2>
            <a
              className="mk-button mk-button-light"
              href={`mailto:${MEDIA_EMAIL}?subject=Media%20inquiry%20for%20Josh%20Moore`}
            >
              Get in touch <ArrowUpRight size={18} />
            </a>
            <a className="mk-contact-email" href={`mailto:${MEDIA_EMAIL}`}>
              <Mail size={17} />
              {MEDIA_EMAIL}
            </a>
            <p>Tell me about your audience, the angle, and your timeline.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
