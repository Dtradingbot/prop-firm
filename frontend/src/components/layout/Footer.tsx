import Link from 'next/link';
import { NewsletterForm } from '@/components/home/NewsletterForm';

const footerLinks = {
  'Prop Firms': [
    { href: '/firms', label: 'All Firms' },
    { href: '/top-rated', label: 'Top Rated' },
    { href: '/trending', label: 'Trending' },
    { href: '/compare', label: 'Compare' },
    { href: '/offers', label: 'Latest Offers' },
  ],
  Resources: [
    { href: '/brokers', label: 'Broker Directory' },
    { href: '/blog', label: 'Blog' },
    { href: '/blog/how-to-pass-prop-firm', label: 'How to Pass' },
    { href: '/blog/best-prop-firms-2024', label: 'Best Firms 2024' },
  ],
  Company: [
    { href: '/pages/about', label: 'About Us' },
    { href: '/pages/contact', label: 'Contact' },
    { href: '/pages/privacy-policy', label: 'Privacy Policy' },
    { href: '/pages/terms', label: 'Terms of Service' },
    { href: '/pages/disclaimer', label: 'Disclaimer' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-xl font-bold text-gradient">PropFirmHub</Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              The most comprehensive prop trading firm directory. Compare funding, profit splits,
              rules, and reviews for all major prop firms.
            </p>
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Subscribe to our newsletter</p>
              <NewsletterForm compact />
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-sm mb-3">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} PropFirmHub. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Disclaimer: Trading involves risk. We may earn commissions from affiliate links.
          </p>
        </div>
      </div>
    </footer>
  );
}
