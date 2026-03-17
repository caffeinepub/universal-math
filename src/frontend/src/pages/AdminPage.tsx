import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Package,
  Pencil,
  Plus,
  Save,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus } from "../backend.d";
import type { Product } from "../backend.d";
import { formatPrice } from "../components/ProductCard";
import {
  useAddProduct,
  useDeleteProduct,
  useGetAllOrders,
  useGetAllProducts,
  useIsAdmin,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "../hooks/useQueries";

const CATEGORIES = [
  "Electronics",
  "Books",
  "Clothing",
  "Sports",
  "Kitchen",
  "Home",
  "Toys",
  "Beauty",
  "Automotive",
  "Garden",
  "Other",
];

const STATUS_OPTIONS: OrderStatus[] = [
  OrderStatus.pending,
  OrderStatus.processing,
  OrderStatus.shipped,
  OrderStatus.delivered,
];

const STATUS_CONFIG: Record<OrderStatus, string> = {
  [OrderStatus.pending]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [OrderStatus.processing]: "bg-blue-100 text-blue-800 border-blue-200",
  [OrderStatus.shipped]: "bg-purple-100 text-purple-800 border-purple-200",
  [OrderStatus.delivered]: "bg-green-100 text-green-800 border-green-200",
};

const EMPTY_PRODUCT: Omit<Product, "id" | "createdAt"> = {
  name: "",
  description: "",
  price: 0n,
  category: "Electronics",
  imageUrl: "",
  stock: 0n,
};

function formatDate(time: bigint): string {
  const ms = Number(time / 1000000n);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ms));
}

export default function AdminPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: products, isLoading: productsLoading } = useGetAllProducts();
  const { data: orders, isLoading: ordersLoading } = useGetAllOrders();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateOrderStatus = useUpdateOrderStatus();

  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<bigint | null>(null);
  const [formData, setFormData] =
    useState<Omit<Product, "id" | "createdAt">>(EMPTY_PRODUCT);

  const openAddDialog = () => {
    setEditingProduct(null);
    setFormData(EMPTY_PRODUCT);
    setShowProductDialog(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      stock: product.stock,
    });
    setShowProductDialog(true);
  };

  const handleSaveProduct = () => {
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    const productData: Product = {
      ...formData,
      id: editingProduct?.id ?? 0n,
      createdAt: editingProduct?.createdAt ?? 0n,
    };

    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, product: productData },
        {
          onSuccess: () => {
            toast.success("Product updated");
            setShowProductDialog(false);
          },
          onError: () => toast.error("Failed to update product"),
        },
      );
    } else {
      addProduct.mutate(productData, {
        onSuccess: () => {
          toast.success("Product added");
          setShowProductDialog(false);
        },
        onError: () => toast.error("Failed to add product"),
      });
    }
  };

  const handleDeleteProduct = (id: bigint) => {
    deleteProduct.mutate(id, {
      onSuccess: () => {
        toast.success("Product deleted");
        setDeleteProductId(null);
      },
      onError: () => toast.error("Failed to delete product"),
    });
  };

  if (adminLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
        <ShieldAlert className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display font-bold text-2xl mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have permission to access this area.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-1">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Manage products and orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Products", value: products?.length ?? 0 },
          { label: "Total Orders", value: orders?.length ?? 0 },
          {
            label: "Pending Orders",
            value:
              orders?.filter((o) => o.status === OrderStatus.pending).length ??
              0,
          },
          {
            label: "Delivered",
            value:
              orders?.filter((o) => o.status === OrderStatus.delivered)
                .length ?? 0,
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-card rounded-xl border border-border p-4"
          >
            <p className="text-2xl font-display font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger data-ocid="admin.tab" value="products">
            Products
          </TabsTrigger>
          <TabsTrigger data-ocid="admin.tab" value="orders">
            Orders
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display font-semibold text-lg">All Products</h2>
            <Button
              data-ocid="admin.product.add_button"
              onClick={openAddDialog}
              className="gap-2 bg-primary text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>

          {productsLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(products ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No products yet. Add your first product.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (products ?? []).map((product, i) => (
                      <TableRow key={product.id.toString()}>
                        <TableCell>
                          <div className="font-medium text-sm line-clamp-1">
                            {product.name}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {product.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(product.price)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-sm font-medium ${
                              product.stock === 0n ? "text-destructive" : ""
                            }`}
                          >
                            {product.stock.toString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              data-ocid={`admin.product.edit_button.${i + 1}`}
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(product)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              data-ocid={`admin.product.delete_button.${i + 1}`}
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteProductId(product.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <h2 className="font-display font-semibold text-lg mb-4">
            All Orders
          </h2>
          {ordersLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Update Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(orders ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No orders yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    [...(orders ?? [])]
                      .sort((a, b) => Number(b.createdAt - a.createdAt))
                      .map((order) => (
                        <TableRow key={order.id.toString()}>
                          <TableCell className="font-medium text-sm">
                            #{order.id.toString()}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {order.items.length} items
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(order.total)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                STATUS_CONFIG[order.status] ?? ""
                              }`}
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end">
                              <Select
                                value={order.status}
                                onValueChange={(val) =>
                                  updateOrderStatus.mutate(
                                    {
                                      id: order.id,
                                      status: val as OrderStatus,
                                    },
                                    {
                                      onSuccess: () =>
                                        toast.success(
                                          `Order #${order.id} updated`,
                                        ),
                                      onError: () =>
                                        toast.error("Failed to update order"),
                                    },
                                  )
                                }
                              >
                                <SelectTrigger className="w-36 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUS_OPTIONS.map((s) => (
                                    <SelectItem
                                      key={s}
                                      value={s}
                                      className="text-xs"
                                    >
                                      {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-lg" data-ocid="admin.product.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                data-ocid="admin.product.input"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Sony WH-1000XM5 Headphones"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Product description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (cents)</Label>
                <Input
                  id="price"
                  type="number"
                  value={Number(formData.price)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: BigInt(e.target.value || 0),
                    })
                  }
                  placeholder="e.g. 29999 for $299.99"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={Number(formData.stock)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: BigInt(e.target.value || 0),
                    })
                  }
                  placeholder="e.g. 100"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(val) =>
                  setFormData({ ...formData, category: val })
                }
              >
                <SelectTrigger data-ocid="admin.product.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              data-ocid="admin.product.cancel_button"
              variant="outline"
              onClick={() => setShowProductDialog(false)}
              className="gap-2"
            >
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button
              data-ocid="admin.product.save_button"
              onClick={handleSaveProduct}
              disabled={addProduct.isPending || updateProduct.isPending}
              className="gap-2 bg-primary text-primary-foreground"
            >
              {addProduct.isPending || updateProduct.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {editingProduct ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteProductId !== null}
        onOpenChange={(open) => !open && setDeleteProductId(null)}
      >
        <AlertDialogContent data-ocid="admin.product.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.product.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.product.confirm_button"
              onClick={() =>
                deleteProductId !== null && handleDeleteProduct(deleteProductId)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProduct.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
