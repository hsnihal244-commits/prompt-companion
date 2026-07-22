import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useVerticalSectionPager } from "@/hooks/use-vertical-section-pager";
import { RotatingHeadline } from "./RotatingHeadline";

const SECTION_COUNT = 3;

export function LandingPage() {
  const pager = useVerticalSectionPager(SECTION_COUNT);

  return (
    <main
      ref={pager.viewportRef}
      {...pager.interactionProps}
      className="fixed inset-0 overflow-hidden bg-black font-sans text-white outline-none touch-none overscroll-none"
      tabIndex={0}
      aria-label={`No More Copium landing page, section ${pager.index + 1} of ${SECTION_COUNT}`}
    >
      <div ref={pager.trackRef} className="h-full will-change-transform">
        <HeroSection active={pager.index === 0} onContinue={() => pager.goTo(1)} />
        <PlaceholderSection
          active={pager.index === 1}
          eyebrow="Built around you"
          title="A plan that ends the guessing."
          body="Clear direction. Visible progress. No more pretending random effort is a strategy."
          onContinue={() => pager.goTo(2)}
        />
        <FinalSection active={pager.index === 2} />
      </div>
    </main>
  );
}

function HeroSection({ active, onContinue }: { active: boolean; onContinue: () => void }) {
  return (
    <section
      className="relative h-full min-h-[100dvh] overflow-hidden bg-black"
      aria-hidden={!active}
    >
      <div
        className="absolute inset-x-0 top-0 h-[64%] bg-white"
        aria-label="Hero image placeholder"
      />
      <div className="pointer-events-none absolute inset-x-0 top-[39%] h-[39%] bg-gradient-to-b from-transparent via-black/75 to-black" />

      <div className="absolute inset-x-0 bottom-[calc(4.8rem+env(safe-area-inset-bottom))] z-[1] px-5">
        <div className="landing-display text-[clamp(2.15rem,10vw,5.25rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-white">
          <RotatingHeadline />
        </div>
        <p className="mt-2 text-center text-[clamp(1rem,4.5vw,1.4rem)] font-medium tracking-[-0.02em] text-white/78">
          All with <span className="text-red-500">No More Copium</span>
        </p>
      </div>

      <button
        type="button"
        onClick={onContinue}
        tabIndex={active ? 0 : -1}
        className="group absolute inset-x-0 bottom-[calc(0.8rem+env(safe-area-inset-bottom))] z-[2] mx-auto flex w-fit flex-col items-center gap-0.5 rounded-full px-5 py-1.5 text-white/65 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 active:scale-[0.97]"
        aria-label="Continue to the next section"
      >
        <ChevronDown className="landing-swipe-chevron h-5 w-5" aria-hidden="true" />
        <span className="text-[10px] font-medium uppercase tracking-[0.18em]">Swipe down</span>
      </button>
    </section>
  );
}

function PlaceholderSection({
  active,
  eyebrow,
  title,
  body,
  onContinue,
}: {
  active: boolean;
  eyebrow: string;
  title: string;
  body: string;
  onContinue: () => void;
}) {
  return (
    <section
      className="relative flex h-full min-h-[100dvh] items-center bg-[#080808] px-6"
      aria-hidden={!active}
    >
      <div className="mx-auto w-full max-w-xl">
        <div className="h-px w-10 bg-red-500" />
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-[clamp(2.5rem,11vw,5.5rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-white">
          {title}
        </h2>
        <p className="mt-6 max-w-md text-base leading-7 text-white/55">{body}</p>
        <button
          type="button"
          onClick={onContinue}
          tabIndex={active ? 0 : -1}
          className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-red-500 hover:bg-red-500 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          Continue
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function FinalSection({ active }: { active: boolean }) {
  return (
    <section
      className="relative flex h-full min-h-[100dvh] items-center justify-center bg-black px-6 text-center"
      aria-hidden={!active}
    >
      <div className="w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-500">
          No More Copium
        </p>
        <h2 className="mt-4 text-[clamp(3rem,13vw,6rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-white">
          Start for real.
        </h2>
        <p className="mx-auto mt-6 max-w-sm text-base leading-7 text-white/55">
          The full story is coming. The work can start now.
        </p>
        <Link
          to="/access"
          tabIndex={active ? 0 : -1}
          className="mt-10 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-red-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-red-500 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Enter No More Copium
        </Link>
      </div>
    </section>
  );
}
