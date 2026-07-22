import { useCallback, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useVerticalSectionPager } from "@/hooks/use-vertical-section-pager";
import { RotatingHeadline } from "./RotatingHeadline";
import { TransformationSection } from "./TransformationSection";

const SECTION_COUNT = 3;

export function LandingPage() {
  const [transformationComplete, setTransformationComplete] = useState(false);
  const canNavigate = useCallback(
    (fromIndex: number, toIndex: number) =>
      !(fromIndex === 1 && toIndex === 2 && !transformationComplete),
    [transformationComplete],
  );
  const pager = useVerticalSectionPager(SECTION_COUNT, canNavigate);

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
        <TransformationSection
          active={pager.index === 1}
          onTransformed={() => setTransformationComplete(true)}
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
