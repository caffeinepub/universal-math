import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { navigate } from "../App";
import type { Product } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAddToCart } from "../hooks/useQueries";

interface ProductCardProps {
  product: Product;
  ocidIndex?: number;
}

export function formatPrice(cents: bigint): string {
  const dollars = Number(cents) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dollars);
}

function getPlaceholderImage(product: Product): string {
  if (product.imageUrl?.startsWith("http")) {
    return product.imageUrl;
  }
  const name = encodeURIComponent(product.name);
  return `https://placehold.co/400x300/1e2a4a/ffffff?text=${name}`;
}

export default function ProductCard({ product, ocidIndex }: ProductCardProps) {
  const addToCart = useAddToCart();
  const { isLoginSuccess } = useInternetIdentity();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoginSuccess) {
      toast.error("Please sign in to add items to your cart");
      return;
    }
    addToCart.mutate(
      { productId: product.id, quantity: 1n },
      {
        onSuccess: () => toast.success(`${product.name} added to cart`),
        onError: () => toast.error("Failed to add to cart"),
      },
    );
  };

  const isOutOfStock = product.stock <= 0n;

  return (
    <article
      data-ocid={ocidIndex ? `product.item.${ocidIndex}` : undefined}
      className="group bg-card rounded-lg border border-border overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <button
        type="button"
        className="relative aspect-[4/3] overflow-hidden bg-muted w-full block"
        onClick={() => navigate({ name: "product", id: product.id })}
      >
        <img
          src={getPlaceholderImage(product)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://placehold.co/400x300/1e2a4a/ffffff?text=${encodeURIComponent(product.name)}`;
          }}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
            <Badge
              variant="secondary"
              className="bg-foreground text-primary-foreground"
            >
              Out of Stock
            </Badge>
          </div>
        )}
        <Badge className="absolute top-2 left-2 text-xs bg-secondary text-secondary-foreground border-0">
          {product.category}
        </Badge>
      </button>

      {/* Content */}
      <div className="p-4">
        <button
          type="button"
          className="text-left w-full"
          onClick={() => navigate({ name: "product", id: product.id })}
        >
          <h3 className="font-display font-semibold text-sm leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
            {product.name}
          </h3>
        </button>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {product.description}
        </p>
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`h-3 w-3 ${
                s <= 4 ? "fill-accent text-accent" : "fill-muted text-muted"
              }`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">(4.0)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-lg text-foreground">
            {formatPrice(product.price)}
          </span>
          <Button
            size="sm"
            disabled={isOutOfStock || addToCart.isPending}
            onClick={handleAddToCart}
            className="h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </div>
    </article>
  );
}
