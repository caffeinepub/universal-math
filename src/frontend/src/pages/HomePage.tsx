import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  ChevronRight,
  Package,
  Shield,
  Star,
  Truck,
} from "lucide-react";
import { navigate } from "../App";
import ProductCard from "../components/ProductCard";
import { useGetAllProducts, useGetCategories } from "../hooks/useQueries";

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: "bg-blue-100 text-blue-800",
  Books: "bg-amber-100 text-amber-800",
  Clothing: "bg-pink-100 text-pink-800",
  Sports: "bg-green-100 text-green-800",
  Kitchen: "bg-orange-100 text-orange-800",
  Home: "bg-purple-100 text-purple-800",
  Toys: "bg-yellow-100 text-yellow-800",
  Beauty: "bg-rose-100 text-rose-800",
};

const CATEGORY_ICONS: Record<string, string> = {
  Electronics: "💻",
  Books: "📚",
  Clothing: "👕",
  Sports: "⚽",
  Kitchen: "🍳",
  Home: "🏠",
  Toys: "🎮",
  Beauty: "✨",
};

const SKELETON_ITEMS = ["a", "b", "c", "d", "e", "f", "g", "h"];

export default function HomePage() {
  const { data: products, isLoading: productsLoading } = useGetAllProducts();
  const { data: categories } = useGetCategories();

  const featuredProducts = products?.slice(0, 8) ?? [];
  const displayCategories = categories?.length
    ? categories
    : ["Electronics", "Books", "Clothing", "Sports", "Kitchen", "Home"];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <span className="text-accent">∑</span>
              <span className="text-primary-foreground/80">
                Everything You Need
              </span>
            </div>
            <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl leading-none tracking-tight mb-6">
              Universal
              <span className="text-accent block">Mart</span>
              <span className="font-light text-3xl md:text-4xl text-primary-foreground/70 block mt-2">
                All in One Place.
              </span>
            </h1>
            <p className="text-lg text-primary-foreground/70 mb-8 max-w-xl leading-relaxed">
              From the simplest everyday item to the most complex gadget — we've
              got every possible need covered. Discover the universal
              marketplace.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => navigate({ name: "shop" })}
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold gap-2"
              >
                Start Shopping
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10"
                onClick={() => navigate({ name: "shop" })}
              >
                Browse Categories
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-border bg-muted/50">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: Truck,
                title: "Free Shipping",
                desc: "On orders over $50",
              },
              {
                icon: Shield,
                title: "Secure Checkout",
                desc: "100% protected payments",
              },
              {
                icon: Package,
                title: "Easy Returns",
                desc: "30-day return policy",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto max-w-7xl px-4 py-14">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display font-bold text-2xl md:text-3xl">
            Shop by Category
          </h2>
          <button
            type="button"
            onClick={() => navigate({ name: "shop" })}
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            All categories <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {displayCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              data-ocid="category.tab"
              onClick={() => navigate({ name: "shop", category: cat })}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-card transition-all group ${
                CATEGORY_COLORS[cat] ?? "bg-slate-100 text-slate-800"
              }`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {CATEGORY_ICONS[cat] ?? "🛍️"}
              </span>
              <span className="text-xs font-semibold">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto max-w-7xl px-4 pb-16">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl md:text-3xl">
              Featured Products
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Handpicked for you this week
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate({ name: "shop" })}
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            View all <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {SKELETON_ITEMS.map((key) => (
              <div key={key} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display font-semibold text-lg mb-2">
              No products yet
            </h3>
            <p className="text-muted-foreground text-sm">
              Check back soon — we're stocking up!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, i) => (
              <ProductCard
                key={product.id.toString()}
                product={product}
                ocidIndex={i + 1}
              />
            ))}
          </div>
        )}
      </section>

      {/* Value Proposition Banner */}
      <section className="bg-foreground text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
                The Universal Solution
                <span className="text-accent block">for Shopping</span>
              </h2>
              <p className="text-primary-foreground/70 leading-relaxed mb-6">
                Universal Mart was founded on a simple principle: everything you
                need in one place. We've spent years sourcing millions of
                products across every category imaginable.
              </p>
              <div className="flex flex-wrap gap-6">
                {[
                  { num: "10M+", label: "Products" },
                  { num: "150+", label: "Categories" },
                  { num: "5M+", label: "Happy Customers" },
                  {
                    num: "4.8",
                    label: "Avg Rating",
                    suffix: (
                      <Star className="h-4 w-4 inline fill-accent text-accent" />
                    ),
                  },
                ].map(({ num, label, suffix }) => (
                  <div key={label}>
                    <div className="font-display font-bold text-2xl text-accent">
                      {num}
                      {suffix}
                    </div>
                    <div className="text-sm text-primary-foreground/60">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="/assets/generated/categories-collage.dim_600x600.jpg"
                alt="Product categories"
                className="rounded-2xl w-full max-w-md mx-auto shadow-elevated object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
