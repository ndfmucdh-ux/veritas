export default function DiscoverCategoryFilter({ categories, activeCategory, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
      {categories.map(cat => {
        const CatIcon = cat.Icon;
        return (
          <button
            type="button"
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
              activeCategory === cat.id
                ? "bg-cyan/20 text-cyan border border-cyan/40 font-medium"
                : "glass border border-border/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <CatIcon className="w-3.5 h-3.5" />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}