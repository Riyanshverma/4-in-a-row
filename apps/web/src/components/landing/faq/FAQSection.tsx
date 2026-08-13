import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { FAQ_ITEMS } from "@/lib/landing-data"

export function FAQSection() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-16 md:py-24">
      <SectionHeader eyebrow="Questions" title="Frequently asked" />

      <Accordion className="mx-auto mt-12 max-w-2xl">
        {FAQ_ITEMS.map((item, i) => (
          <AccordionItem key={item.question} value={`item-${i}`}>
            <AccordionTrigger className="text-left font-medium">{item.question}</AccordionTrigger>
            <AccordionContent className="leading-relaxed text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
