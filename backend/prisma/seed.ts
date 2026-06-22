import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Super admin
  const adminHash = await bcrypt.hash('admin123!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@propfirmhub.com' },
    update: {},
    create: {
      email: 'admin@propfirmhub.com',
      username: 'superadmin',
      passwordHash: adminHash,
      role: 'SUPER_ADMIN',
      isVerified: true,
    },
  });

  // Demo editor
  const editorHash = await bcrypt.hash('editor123!', 12);
  await prisma.user.upsert({
    where: { email: 'editor@propfirmhub.com' },
    update: {},
    create: {
      email: 'editor@propfirmhub.com',
      username: 'editor',
      passwordHash: editorHash,
      role: 'EDITOR',
      isVerified: true,
    },
  });

  // Brokers
  const brokers = await Promise.all([
    prisma.broker.upsert({
      where: { slug: 'eightcap' },
      update: {},
      create: { name: 'Eightcap', slug: 'eightcap', regulation: 'ASIC, CySEC', website: 'https://eightcap.com', rating: 4.5, description: 'Multi-regulated broker known for tight spreads.' },
    }),
    prisma.broker.upsert({
      where: { slug: 'tradelocker' },
      update: {},
      create: { name: 'TradeLocker', slug: 'tradelocker', regulation: 'FSCA', website: 'https://tradelocker.com', rating: 4.3, description: 'Modern broker powering major prop firms.' },
    }),
    prisma.broker.upsert({
      where: { slug: 'match-trader' },
      update: {},
      create: { name: 'Match-Trader', slug: 'match-trader', regulation: 'CySEC', website: 'https://match-trader.com', rating: 4.2, description: 'Advanced trading technology for prop firms.' },
    }),
  ]);

  // Prop Firms
  const ftmo = await prisma.propFirm.upsert({
    where: { slug: 'ftmo' },
    update: {},
    create: {
      name: 'FTMO',
      slug: 'ftmo',
      shortDescription: 'The world\'s most recognized prop trading firm with over 100,000 funded traders.',
      description: 'FTMO is a leading proprietary trading company that provides funding to successful traders. Founded in 2015, FTMO has funded over 100,000 traders worldwide and is known for its transparent rules and reliable payouts.',
      websiteUrl: 'https://ftmo.com',
      affiliateUrl: 'https://ftmo.com/?affiliateId=example',
      country: 'Czech Republic',
      founded: 2015,
      platforms: ['MT4', 'MT5', 'cTrader'],
      evaluationType: 'TWO_STEP',
      instantFunding: false,
      minFundingSize: 10000,
      maxFundingSize: 200000,
      profitSplit: 80,
      maxAllocation: 2000000,
      tradingFee: 155,
      payoutFrequency: 'Monthly',
      maxDailyDrawdown: 5,
      maxTotalDrawdown: 10,
      drawdownType: 'static',
      rules: {
        minTradingDays: '4',
        profitTarget: '10%',
        maxLoss: '10%',
        newsCannot: 'Yes - news trading allowed',
        weekendHolding: 'Yes',
        eaAllowed: 'Yes',
      },
      brokerId: brokers[0].id,
      trustScore: 95,
      averageRating: 4.7,
      reviewCount: 2847,
      isFeatured: true,
      isActive: true,
    },
  });

  const topstep = await prisma.propFirm.upsert({
    where: { slug: 'topstep' },
    update: {},
    create: {
      name: 'TopStep',
      slug: 'topstep',
      shortDescription: 'Top US-based prop firm specializing in futures trading with excellent support.',
      description: 'TopStep is one of the most established prop trading firms in the US, focused exclusively on futures trading. They offer a straightforward two-step evaluation process and are known for excellent customer support.',
      websiteUrl: 'https://topstep.com',
      affiliateUrl: 'https://topstep.com/?affiliateId=example',
      country: 'USA',
      founded: 2012,
      platforms: ['NinjaTrader', 'Rithmic', 'TradingView'],
      evaluationType: 'TWO_STEP',
      instantFunding: false,
      minFundingSize: 50000,
      maxFundingSize: 150000,
      profitSplit: 90,
      maxAllocation: 500000,
      payoutFrequency: 'Weekly',
      maxDailyDrawdown: 4,
      maxTotalDrawdown: 8,
      drawdownType: 'trailing',
      brokerId: brokers[1].id,
      trustScore: 88,
      averageRating: 4.5,
      reviewCount: 1923,
      isFeatured: true,
      isActive: true,
    },
  });

  await prisma.propFirm.upsert({
    where: { slug: 'myforexfunds' },
    update: {},
    create: {
      name: 'MyForexFunds',
      slug: 'myforexfunds',
      shortDescription: 'Fast-growing prop firm with instant funding options and high profit splits.',
      websiteUrl: 'https://myforexfunds.com',
      affiliateUrl: 'https://myforexfunds.com/?ref=example',
      country: 'Canada',
      founded: 2020,
      platforms: ['MT4', 'MT5'],
      evaluationType: 'INSTANT',
      instantFunding: true,
      minFundingSize: 5000,
      maxFundingSize: 300000,
      profitSplit: 85,
      maxDailyDrawdown: 5,
      maxTotalDrawdown: 12,
      drawdownType: 'static',
      brokerId: brokers[2].id,
      trustScore: 75,
      averageRating: 4.2,
      reviewCount: 3102,
      isFeatured: false,
      isActive: true,
    },
  });

  // Funding programs
  await prisma.fundingProgram.upsert({
    where: { id: 'ftmo-challenge' },
    update: {},
    create: {
      id: 'ftmo-challenge',
      firmId: ftmo.id,
      name: 'FTMO Challenge',
      accountSizes: [10000, 25000, 50000, 100000, 200000],
      profitSplit: 80,
      fee: 155,
      description: '2-step evaluation with 10% profit target in Phase 1, 5% in Phase 2.',
    },
  });

  // Offers
  await prisma.offer.upsert({
    where: { id: 'ftmo-discount-2024' },
    update: {},
    create: {
      id: 'ftmo-discount-2024',
      title: '10% OFF FTMO Challenge',
      description: 'Get 10% discount on any FTMO challenge account',
      discount: 10,
      couponCode: 'PROPFIRMHUB10',
      affiliateUrl: 'https://ftmo.com/?affiliateId=example&code=PROPFIRMHUB10',
      firmId: ftmo.id,
      isActive: true,
    },
  });

  // FAQs
  await prisma.fAQ.createMany({
    data: [
      { firmId: ftmo.id, question: 'How long does the FTMO Challenge take?', answer: 'The FTMO Challenge has no time limit in the traditional sense. You have a minimum of 4 trading days and must hit the profit target while staying within drawdown limits.', order: 1 },
      { firmId: ftmo.id, question: 'What is the profit split at FTMO?', answer: 'FTMO starts with an 80/20 split in your favor. After several successful months, the split can increase up to 90%.', order: 2 },
      { firmId: ftmo.id, question: 'Can I use Expert Advisors (EAs)?', answer: 'Yes, EAs are allowed on FTMO accounts as long as they comply with all trading rules and do not use prohibited strategies.', order: 3 },
    ],
    skipDuplicates: true,
  });

  // CMS Pages
  const pages = [
    { title: 'About Us', slug: 'about', body: '# About PropFirmHub\n\nPropFirmHub is the leading independent comparison platform for proprietary trading firms. We help traders find the best prop firms with the most transparent information.' },
    { title: 'Contact', slug: 'contact', body: '# Contact Us\n\nEmail: contact@propfirmhub.com\n\nWe aim to respond within 24 hours.' },
    { title: 'Privacy Policy', slug: 'privacy-policy', body: '# Privacy Policy\n\nYour privacy is important to us...' },
    { title: 'Terms of Service', slug: 'terms', body: '# Terms of Service\n\nBy using PropFirmHub, you agree to these terms...' },
    { title: 'Disclaimer', slug: 'disclaimer', body: '# Disclaimer\n\nTrading involves significant risk. PropFirmHub may earn affiliate commissions from links on this site.' },
  ];

  for (const page of pages) {
    await prisma.page.upsert({ where: { slug: page.slug }, update: {}, create: page });
  }

  // Menus
  await prisma.menu.upsert({
    where: { name: 'header' },
    update: {},
    create: {
      name: 'header',
      items: {
        create: [
          { label: 'Prop Firms', url: '/firms', order: 1 },
          { label: 'Compare', url: '/compare', order: 2 },
          { label: 'Top Rated', url: '/top-rated', order: 3 },
          { label: 'Offers', url: '/offers', order: 4 },
          { label: 'Blog', url: '/blog', order: 5 },
        ],
      },
    },
  });

  // Settings
  const defaultSettings = [
    { key: 'site_name', value: 'PropFirmHub' },
    { key: 'site_description', value: 'The #1 Prop Firm Comparison Platform' },
    { key: 'contact_email', value: 'contact@propfirmhub.com' },
    { key: 'meta_title', value: 'PropFirmHub — Compare Prop Firms' },
    { key: 'meta_description', value: 'Compare 100+ prop trading firms. Find the best funding and profit splits.' },
  ];
  for (const s of defaultSettings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  }

  console.log('✅ Database seeded successfully!');
  console.log('Admin login: admin@propfirmhub.com / admin123!');
  console.log('Editor login: editor@propfirmhub.com / editor123!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
