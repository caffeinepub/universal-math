import { ShoppingBag } from "lucide-react";
import { navigate } from "../App";

export default function Footer() {
  const year = new Date().getFullYear();
  const utm = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="font-display font-bold text-lg">
                Universal <span className="text-accent">Mart</span>
              </span>
            </div>
            <p className="text-sm text-primary-foreground/60">
              Everything you need, all in one place. Your universal shopping
              destination.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm uppercase tracking-wider text-primary-foreground/80">
              Shop
            </h4>
            <ul className="space-y-2">
              {[
                "Electronics",
                "Books",
                "Clothing",
                "Sports",
                "Kitchen",
                "Home",
              ].map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => navigate({ name: "shop", category: cat })}
                    className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm uppercase tracking-wider text-primary-foreground/80">
              Support
            </h4>
            <ul className="space-y-2">
              {["Help Center", "Track Order", "Returns", "Contact Us"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-sm text-primary-foreground/60 cursor-pointer hover:text-primary-foreground transition-colors">
                      {item}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm uppercase tracking-wider text-primary-foreground/80">
              Company
            </h4>
            <ul className="space-y-2">
              {["About Us", "Careers", "Press", "Privacy Policy"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-sm text-primary-foreground/60 cursor-pointer hover:text-primary-foreground transition-colors">
                      {item}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/50">
            © {year} Universal Mart. All rights reserved.
          </p>
          <p className="text-sm text-primary-foreground/50">
            Built with ❤️ using{" "}
            <a
              href={utm}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary-foreground/80 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
