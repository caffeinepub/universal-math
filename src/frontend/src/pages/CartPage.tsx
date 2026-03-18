import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { navigate } from "../App";
import { formatPrice } from "../components/ProductCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetAllProducts,
  useGetCart,
  usePlaceOrder,
  useRemoveFromCart,
  useUpdateCartItem,
} from "../hooks/useQueries";

const SKELETON_ITEMS = ["a", "b", "c"];

export default function CartPage() {
  const { isLoginSuccess, login } = useInternetIdentity();
  const { data: cart, isLoading: cartLoading } = useGetCart();
  const { data: products } = useGetAllProducts();
  const removeFromCart = useRemoveFromCart();
  const updateCartItem = useUpdateCartItem();
  const placeOrder = usePlaceOrder();

  if (!isLoginSuccess) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display font-bold text-2xl mb-2">
          Sign In to View Your Cart
        </h2>
        <p className="text-muted-foreground mb-6">
          You need to be signed in to access your shopping cart.
        </p>
        <Button onClick={login} className="bg-primary text-primary-foreground">
          Sign In
        </Button>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        {SKELETON_ITEMS.map((key) => (
          <div key={key} className="flex gap-4 mb-4">
            <Skeleton className="h-24 w-24 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cartItems = cart?.items ?? [];

  const getProduct = (productId: bigint) =>
    products?.find((p) => p.id === productId) ?? null;

  const subtotal = cartItems.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return sum + (product ? Number(product.price) * Number(item.quantity) : 0);
  }, 0);

  const handlePlaceOrder = () => {
    placeOrder.mutate(undefined, {
      onSuccess: (orderId) => {
        toast.success(`Order #${orderId} placed successfully!`);
        navigate({ name: "orders" });
      },
      onError: () => toast.error("Failed to place order. Please try again."),
    });
  };

  if (cartItems.length === 0) {
    return (
      <div
        data-ocid="cart.empty_state"
        className="container mx-auto max-w-3xl px-4 py-20 text-center"
      >
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display font-bold text-2xl mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-muted-foreground mb-6">
          Looks like you haven't added anything yet. Start shopping!
        </p>
        <Button
          onClick={() => navigate({ name: "shop" })}
          className="gap-2 bg-primary text-primary-foreground"
        >
          Start Shopping <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display font-bold text-3xl mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, i) => {
            const product = getProduct(item.productId);
            if (!product) return null;
            const imageUrl = product.imageUrl?.startsWith("http")
              ? product.imageUrl
              : `https://placehold.co/200x150/1e2a4a/ffffff?text=${encodeURIComponent(product.name)}`;

            return (
              <div
                key={item.productId.toString()}
                data-ocid={`cart.item.${i + 1}`}
                className="flex gap-4 p-4 bg-card rounded-xl border border-border shadow-xs"
              >
                <button
                  type="button"
                  className="w-24 h-20 rounded-lg overflow-hidden bg-muted shrink-0"
                  onClick={() => navigate({ name: "product", id: product.id })}
                >
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://placehold.co/200x150/1e2a4a/ffffff?text=${encodeURIComponent(product.name)}`;
                    }}
                  />
                </button>

                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    className="font-display font-semibold text-sm mb-1 hover:text-primary transition-colors truncate block text-left w-full"
                    onClick={() =>
                      navigate({ name: "product", id: product.id })
                    }
                  >
                    {product.name}
                  </button>
                  <p className="text-xs text-muted-foreground mb-3">
                    {product.category}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          item.quantity > 1n
                            ? updateCartItem.mutate({
                                productId: item.productId,
                                quantity: item.quantity - 1n,
                              })
                            : removeFromCart.mutate(item.productId)
                        }
                        className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors text-sm"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">
                        {item.quantity.toString()}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateCartItem.mutate({
                            productId: item.productId,
                            quantity: item.quantity + 1n,
                          })
                        }
                        className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors text-sm"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold">
                        {formatPrice(
                          BigInt(Number(product.price) * Number(item.quantity)),
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart.mutate(item.productId, {
                            onSuccess: () => toast.success("Item removed"),
                          })
                        }
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
            <h2 className="font-display font-bold text-lg mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Subtotal (
                  {cartItems.reduce((s, i) => s + Number(i.quantity), 0)} items)
                </span>
                <span>{formatPrice(BigInt(subtotal))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600 font-medium">
                  {subtotal >= 5000 ? "Free" : formatPrice(999n)}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-display font-bold text-lg mb-6">
              <span>Total</span>
              <span>
                {formatPrice(BigInt(subtotal + (subtotal >= 5000 ? 0 : 999)))}
              </span>
            </div>

            <Button
              data-ocid="cart.checkout.button"
              size="lg"
              disabled={placeOrder.isPending}
              onClick={handlePlaceOrder}
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              {placeOrder.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
              Place Order
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Secure checkout powered by Universal Mart
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
