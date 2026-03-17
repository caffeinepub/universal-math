import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navigate } from "../App";
import ProductCard from "../components/ProductCard";
import {
  useGetAllProducts,
  useGetCategories,
  useGetProductsByCategory,
  useSearchProducts,
} from "../hooks/useQueries";

const SKELETON_ITEMS = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];

interface ShopPageProps {
  initialCategory?: string;
  initialSearch?: string;
}

export default function ShopPage({
  initialCategory,
  initialSearch,
}: ShopPageProps) {
  const [searchInput, setSearchInput] = useState(initialSearch || "");
  const [activeSearch, setActiveSearch] = useState(initialSearch || "");
  const [activeCategory, setActiveCategory] = useState(initialCategory || "");
  const [showFilters, setShowFilters] = useState(false);

  const { data: allProducts, isLoading: allLoading } = useGetAllProducts();
  const { data: categories } = useGetCategories();
  const { data: searchResults, isLoading: searchLoading } =
    useSearchProducts(activeSearch);
  const { data: categoryProducts, isLoading: catLoading } =
    useGetProductsByCategory(activeCategory);

  useEffect(() => {
    if (initialCategory !== undefined) setActiveCategory(initialCategory || "");
    if (initialSearch !== undefined) {
      setSearchInput(initialSearch || "");
      setActiveSearch(initialSearch || "");
    }
  }, [initialCategory, initialSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
    setActiveCategory("");
    navigate({ name: "shop", search: searchInput || undefined });
  };

  const handleCategorySelect = (cat: string) => {
    const next = activeCategory === cat ? "" : cat;
    setActiveCategory(next);
    setActiveSearch("");
    setSearchInput("");
    navigate({ name: "shop", category: next || undefined });
  };

  const isLoading = activeSearch
    ? searchLoading
    : activeCategory
      ? catLoading
      : allLoading;

  let products = allProducts ?? [];
  if (activeSearch && searchResults) products = searchResults;
  else if (activeCategory && categoryProducts) products = categoryProducts;

  const displayCategories = categories?.length
    ? categories
    : ["Electronics", "Books", "Clothing", "Sports", "Kitchen", "Home"];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
          {activeSearch
            ? `Results for "${activeSearch}"`
            : activeCategory
              ? activeCategory
              : "All Products"}
        </h1>
        <p className="text-muted-foreground">
          {products.length} product{products.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              data-ocid="search.search_input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for anything..."
              className="pl-9"
            />
          </div>
          <Button
            data-ocid="search.submit_button"
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Search
          </Button>
        </form>
        <Button
          variant="outline"
          className="md:hidden gap-2"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Categories */}
        <aside
          className={`w-56 shrink-0 ${showFilters ? "block" : "hidden md:block"}`}
        >
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Categories
              </h3>
              {activeCategory && (
                <button
                  type="button"
                  onClick={() => handleCategorySelect("")}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
            <div className="space-y-1">
              <button
                type="button"
                data-ocid="category.tab"
                onClick={() => handleCategorySelect("")}
                className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
                  !activeCategory
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                All Products
              </button>
              {displayCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  data-ocid="category.tab"
                  onClick={() => handleCategorySelect(cat)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <span>{cat}</span>
                  {activeCategory === cat && <X className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Active filters */}
          {(activeSearch || activeCategory) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeSearch && (
                <Badge variant="secondary" className="gap-1">
                  Search: {activeSearch}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSearch("");
                      setSearchInput("");
                      navigate({ name: "shop" });
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {activeCategory && (
                <Badge variant="secondary" className="gap-1">
                  {activeCategory}
                  <button
                    type="button"
                    onClick={() => handleCategorySelect("")}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SKELETON_ITEMS.map((key) => (
                <div key={key} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div
              data-ocid="product.empty_state"
              className="text-center py-20 border border-dashed border-border rounded-xl"
            >
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display font-semibold text-lg mb-2">
                {activeSearch
                  ? "No results found"
                  : "No products in this category"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {activeSearch
                  ? "Try a different search term"
                  : "Check back soon for new arrivals"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, i) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  ocidIndex={i + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
