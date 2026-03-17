import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Loader2,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { navigate } from "../App";
import { formatPrice } from "../components/ProductCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAddToCart, useGetProduct } from "../hooks/useQueries";

interface ProductDetailPageProps {
  productId: bigint;
}

export default function ProductDetailPage({
  productId,
}: ProductDetailPageProps) {
  const [quantity, setQuantity] = useState(1);
  const { data: product, isLoading } = useGetProduct(productId);
  const addToCart = useAddToCart();
  const { isLoginSuccess } = useInternetIdentity();

  const handleAddToCart = () => {
    if (!isLoginSuccess) {
      toast.error("Please sign in to add items to your cart");
      return;
    }
    if (!product) return;
    addToCart.mutate(
      { productId: product.id, quantity: BigInt(quantity) },
      {
        onSuccess: () => toast.success(`${product.name} added to cart`),
        onError: () => toast.error("Failed to add to cart"),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <Skeleton className="h-6 w-32 mb-8" />
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton className="h-96 w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-20 text-center">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display font-bold text-2xl mb-2">
          Product Not Found
        </h2>
        <p className="text-muted-foreground mb-6">
          This product may no longer be available.
        </p>
        <Button onClick={() => navigate({ name: "shop" })}>Back to Shop</Button>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0n;
  const imageUrl = product.imageUrl?.startsWith("http")
    ? product.imageUrl
    : `https://placehold.co/600x450/1e2a4a/ffffff?text=${encodeURIComponent(product.name)}`;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => navigate({ name: "shop" })}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Shop
      </button>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted shadow-card">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://placehold.co/600x450/1e2a4a/ffffff?text=${encodeURIComponent(product.name)}`;
              }}
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <Badge variant="outline" className="w-fit mb-3 text-xs">
            {product.category}
          </Badge>
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-3 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-4 w-4 ${
                    s <= 4 ? "fill-accent text-accent" : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              4.0 (128 reviews)
            </span>
          </div>

          <div className="text-3xl font-display font-bold text-foreground mb-6">
            {formatPrice(product.price)}
          </div>

          <Separator className="mb-6" />

          <p className="text-muted-foreground leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-6">
            <div
              className={`h-2 w-2 rounded-full ${
                isOutOfStock
                  ? "bg-destructive"
                  : Number(product.stock) < 10
                    ? "bg-accent"
                    : "bg-green-500"
              }`}
            />
            <span className="text-sm font-medium">
              {isOutOfStock
                ? "Out of Stock"
                : Number(product.stock) < 10
                  ? `Only ${product.stock} left in stock`
                  : "In Stock"}
            </span>
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium text-sm">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(Math.min(Number(product.stock), quantity + 1))
                  }
                  className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <Button
            data-ocid="product.add_to_cart.button"
            size="lg"
            disabled={isOutOfStock || addToCart.isPending}
            onClick={handleAddToCart}
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            {addToCart.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ShoppingCart className="h-5 w-5" />
            )}
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>

          <Separator className="my-6" />

          {/* Meta */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex gap-2">
              <span className="font-medium text-foreground">Category:</span>
              <button
                type="button"
                onClick={() =>
                  navigate({ name: "shop", category: product.category })
                }
                className="text-primary hover:underline"
              >
                {product.category}
              </button>
            </div>
            <div className="flex gap-2">
              <span className="font-medium text-foreground">Stock:</span>
              <span>{product.stock.toString()} units</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
