export function StatsBar() {
  const stats = [
    { value: '100+', label: 'Prop Firms Reviewed' },
    { value: '$5M+', label: 'Max Funding Available' },
    { value: '90%', label: 'Highest Profit Split' },
    { value: '50+', label: 'Countries Supported' },
  ];

  return (
    <section className="bg-primary text-primary-foreground py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm opacity-80">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
