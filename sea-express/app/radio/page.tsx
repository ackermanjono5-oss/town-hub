export default function RadioPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Local Radio</h1>
        <p className="text-muted-foreground">
          Listen live to Garden Route community radio
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="p-5 rounded-lg border border-border hover:border-primary card-lift bg-background">
          <h3 className="font-bold text-xl mb-1">Eden FM 93.8 FM</h3>
          <p className="text-sm font-medium text-accent mb-3">George • Southern Cape</p>
          <p className="text-muted-foreground mb-4">The Southern Cape community radio station, broadcasting to George, Oudtshoorn and Mossel Bay since 2003.</p>
          <a href="#" className="text-primary font-medium hover:underline">Listen live</a>
        </div>
        
        <div className="p-5 rounded-lg border border-border hover:border-primary card-lift bg-background">
          <h3 className="font-bold text-xl mb-1">Plettenberg Bay Community Radio 90.3 FM</h3>
          <p className="text-sm font-medium text-accent mb-3">Plettenberg Bay</p>
          <p className="text-muted-foreground mb-4">Local community radio for Plettenberg Bay.</p>
          <p className="text-sm text-muted-foreground italic">Stream coming soon</p>
        </div>
      </div>
    </div>
  );
}
