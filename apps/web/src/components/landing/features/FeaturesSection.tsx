import { Card, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { FEATURES, type Feature } from "@/lib/landing-data"

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const { ref, className, style } = useScrollReveal<HTMLDivElement>({ index })

  return (
    <Card
      ref={ref}
      style={style}
      className={cn(
        "gap-3 transition-transform hover:-translate-y-0.5 hover:shadow-md",
        className,
        feature.large && "md:col-span-2"
      )}
    >
      <CardHeader>
        <feature.icon className="size-6 text-secondary" strokeWidth={2} />
        <CardTitle className="font-heading text-xl">{feature.title}</CardTitle>
        <CardDescription className="leading-relaxed">{feature.description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-16 md:py-24">
      <SectionHeader
        eyebrow="Under the hood"
        title="Built for real matches, not demos"
        description="Every feature here runs in production, not just in a pitch deck."
      />

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </div>
    </section>
  )
}
