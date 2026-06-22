import { Mail } from 'lucide-react';
import { NewsletterForm } from './NewsletterForm';

export function NewsletterSection() {
  return (
    <section className="bg-muted/30 py-14">
      <div className="container mx-auto px-4 text-center max-w-2xl">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Stay Updated on New Prop Firms</h2>
        <p className="text-muted-foreground mb-6">
          Get weekly updates on new firms, exclusive coupons, and trading opportunities.
        </p>
        <NewsletterForm />
      </div>
    </section>
  );
}
