import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@shared/seo";

type FaqSectionProps = {
  faqs: FaqItem[];
  title?: string;
  subtitle?: string;
};

/**
 * Visible FAQ block — pairs with FAQPage JSON-LD for AEO / VEO / AIO.
 */
export default function FaqSection({
  faqs,
  title = "Filter questions, answered",
  subtitle = "Straight answers about filter size, MERV, and replacement timing.",
}: FaqSectionProps) {
  return (
    <section
      id="faq"
      className="py-16 md:py-24 scroll-mt-20"
      aria-labelledby="faq-heading"
    >
      <div className="container max-w-3xl">
        <span className="section-label">Answers</span>
        <h2
          id="faq-heading"
          className="text-3xl md:text-4xl font-bold mb-3 tracking-tight"
        >
          {title}
        </h2>
        <p className="text-muted-foreground mb-10 leading-relaxed max-w-2xl">
          {subtitle}
        </p>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.question} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold hover:no-underline">
                <span className="seo-speakable-q">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground leading-relaxed seo-speakable-a">
                  {faq.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
