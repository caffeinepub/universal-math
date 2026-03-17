import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, Package, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { navigate } from "../App";
import type { OrderStatus } from "../backend.d";
import { formatPrice } from "../components/ProductCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetAllProducts, useGetUserOrders } from "../hooks/useQueries";

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> =
  {
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    processing: {
      label: "Processing",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    shipped: {
      label: "Shipped",
      className: "bg-purple-100 text-purple-800 border-purple-200",
    },
    delivered: {
      label: "Delivered",
      className: "bg-green-100 text-green-800 border-green-200",
    },
  };

const SKELETON_ITEMS = ["a", "b", "c"];

function formatDate(time: bigint): string {
  const ms = Number(time / 1000000n);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(ms));
}

export default function OrdersPage() {
  const { isLoginSuccess, login } = useInternetIdentity();
  const { data: orders, isLoading } = useGetUserOrders();
  const { data: products } = useGetAllProducts();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  if (!isLoginSuccess) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display font-bold text-2xl mb-2">
          Sign In to View Orders
        </h2>
        <p className="text-muted-foreground mb-6">
          You need to be signed in to view your order history.
        </p>
        <Button onClick={login} className="bg-primary text-primary-foreground">
          Sign In
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        {SKELETON_ITEMS.map((key) => (
          <Skeleton key={key} className="h-20 w-full mb-4 rounded-xl" />
        ))}
      </div>
    );
  }

  const sortedOrders = [...(orders ?? [])].sort((a, b) =>
    Number(b.createdAt - a.createdAt),
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display font-bold text-3xl mb-8">My Orders</h1>

      {sortedOrders.length === 0 ? (
        <div
          data-ocid="order.empty_state"
          className="text-center py-20 border border-dashed border-border rounded-xl"
        >
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display font-semibold text-lg mb-2">
            No orders yet
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            You haven't placed any orders. Start shopping!
          </p>
          <Button
            onClick={() => navigate({ name: "shop" })}
            className="bg-primary text-primary-foreground"
          >
            Shop Now
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order, i) => {
            const orderId = order.id.toString();
            const isExpanded = expandedOrders.has(orderId);
            const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;

            return (
              <div
                key={orderId}
                data-ocid={`order.item.${i + 1}`}
                className="bg-card rounded-xl border border-border shadow-xs overflow-hidden"
              >
                <button
                  type="button"
                  className="flex items-center justify-between w-full p-4 hover:bg-muted/30 transition-colors"
                  onClick={() => toggleExpand(orderId)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-display font-semibold text-sm">
                        Order #{orderId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-sm">
                      {formatPrice(order.total)}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${status.className}`}
                    >
                      {status.label}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border p-4">
                    <h4 className="font-display font-semibold text-sm mb-3">
                      Items
                    </h4>
                    <div className="space-y-2">
                      {order.items.map((item) => {
                        const product = products?.find(
                          (p) => p.id === item.productId,
                        );
                        return (
                          <div
                            key={item.productId.toString()}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-8 rounded bg-muted overflow-hidden shrink-0">
                                <img
                                  src={`https://placehold.co/80x60/1e2a4a/ffffff?text=${encodeURIComponent(product?.name ?? "Item")}`}
                                  alt={product?.name ?? "Product"}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-muted-foreground">
                                {product?.name ?? `Product #${item.productId}`}{" "}
                                × {item.quantity.toString()}
                              </span>
                            </div>
                            <span className="font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-border mt-3 pt-3 flex justify-between font-display font-bold">
                      <span>Total</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
