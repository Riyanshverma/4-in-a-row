import { Card, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { STEPS } from "@/lib/landing-data"

function StepCard({ step, index }: { step: (typeof STEPS)[number]; index: number }) {
  const { ref, className, style } = useScrollReveal<HTMLDivElement>({ index })

  return (
    <Card
      ref={ref}
      style={style}
      className={cn("gap-3 transition-transform hover:-translate-y-0.5 hover:shadow-md", className)}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-secondary">0{step.step}</span>
          <step.icon className="size-5 text-secondary" strokeWidth={2} />
        </div>
        <CardTitle className="font-heading text-lg">{step.title}</CardTitle>
        <CardDescription className="leading-relaxed">{step.description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

export function HowToPlaySection() {
  return (
    <section id="how-to-play" className="mx-auto max-w-[1280px] px-6 py-16 md:py-24">
      <SectionHeader eyebrow="Getting started" title="Four steps to your first match" />

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <StepCard key={step.step} step={step} index={index} />
        ))}
      </div>
    </section>
  )
}
