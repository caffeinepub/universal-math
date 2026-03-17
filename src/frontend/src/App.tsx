import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import AdminPage from "./pages/AdminPage";
import CartPage from "./pages/CartPage";
import HomePage from "./pages/HomePage";
import OrdersPage from "./pages/OrdersPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ShopPage from "./pages/ShopPage";

export type Route =
  | { name: "home" }
  | { name: "shop"; category?: string; search?: string }
  | { name: "product"; id: bigint }
  | { name: "cart" }
  | { name: "orders" }
  | { name: "admin" };

function parseHash(): Route {
  const hash = window.location.hash.replace("#", "") || "/";
  if (hash === "/" || hash === "") return { name: "home" };
  if (hash.startsWith("/shop")) {
    const params = new URLSearchParams(
      hash.replace("/shop", "").replace("?", ""),
    );
    return {
      name: "shop",
      category: params.get("category") || undefined,
      search: params.get("search") || undefined,
    };
  }
  if (hash.startsWith("/product/")) {
    const id = BigInt(hash.replace("/product/", ""));
    return { name: "product", id };
  }
  if (hash === "/cart") return { name: "cart" };
  if (hash === "/orders") return { name: "orders" };
  if (hash === "/admin") return { name: "admin" };
  return { name: "home" };
}

export function navigate(route: Route) {
  switch (route.name) {
    case "home":
      window.location.hash = "/";
      break;
    case "shop": {
      const params = new URLSearchParams();
      if (route.category) params.set("category", route.category);
      if (route.search) params.set("search", route.search);
      const qs = params.toString();
      window.location.hash = qs ? `/shop?${qs}` : "/shop";
      break;
    }
    case "product":
      window.location.hash = `/product/${route.id}`;
      break;
    case "cart":
      window.location.hash = "/cart";
      break;
    case "orders":
      window.location.hash = "/orders";
      break;
    case "admin":
      window.location.hash = "/admin";
      break;
  }
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const handleHashChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const renderPage = () => {
    switch (route.name) {
      case "home":
        return <HomePage />;
      case "shop":
        return (
          <ShopPage
            initialCategory={route.category}
            initialSearch={route.search}
          />
        );
      case "product":
        return <ProductDetailPage productId={route.id} />;
      case "cart":
        return <CartPage />;
      case "orders":
        return <OrdersPage />;
      case "admin":
        return <AdminPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header currentRoute={route} />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
