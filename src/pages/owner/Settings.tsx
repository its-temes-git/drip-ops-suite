const Settings = () => (
  <div className="space-y-6 sm:space-y-8">
    <header>
      <h1 className="font-display text-3xl sm:text-5xl tracking-wide">SETTINGS</h1>
      <p className="text-[10px] sm:text-xs tracking-widest text-muted-foreground">SYSTEM PREFERENCES</p>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <div className="border border-border bg-card p-4 sm:p-6 space-y-3">
        <h2 className="font-display text-xl sm:text-2xl">BRANCH</h2>
        <p className="text-sm text-muted-foreground">Summit Branch — Addis Ababa</p>
        <p className="text-xs text-muted-foreground">📞 0951 077 634</p>
      </div>
      <div className="border border-border bg-card p-4 sm:p-6 space-y-3">
        <h2 className="font-display text-xl sm:text-2xl">SOCIAL</h2>
        <p className="text-sm">Telegram: <span className="text-primary">@sawkemcollection</span></p>
        <p className="text-sm">TikTok: <span className="text-primary">@sawkemfashion</span></p>
      </div>
      <div className="border border-border bg-card p-4 sm:p-6 space-y-3">
        <h2 className="font-display text-xl sm:text-2xl">LOW STOCK THRESHOLD</h2>
        <input type="number" defaultValue={3} className="bg-background border border-border px-3 py-2 w-32" />
      </div>
      <div className="border border-border bg-card p-4 sm:p-6 space-y-3">
        <h2 className="font-display text-xl sm:text-2xl">CURRENCY</h2>
        <p className="text-sm">ETB — Ethiopian Birr</p>
      </div>
    </div>
  </div>
);

export default Settings;
