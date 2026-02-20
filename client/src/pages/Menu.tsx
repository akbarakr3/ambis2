import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "../hooks/use-products";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { 
  Plus, 
  Pencil, 
  Trash2,
  Package,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "../hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";

export default function Menu() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const { toast } = useToast();

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [broadcasts, setBroadcasts] = useState<any[]>([
    { id: 1, title: "50% Off on All Snacks", message: "Get 50% discount on all snacks this weekend!", imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=200&fit=crop" },
    { id: 2, title: "New Menu Items Added", message: "Check out our new beverages and desserts!", imageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=200&fit=crop" },
    { id: 3, title: "Free Delivery Available", message: "Orders above ₹200 get free delivery!", imageUrl: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400&h=200&fit=crop" },
  ]);
  const [currentBroadcastIndex, setCurrentBroadcastIndex] = useState(0);
  const [isBroadcastDialogOpen, setIsBroadcastDialogOpen] = useState(false);
  const [selectedBroadcastImage, setSelectedBroadcastImage] = useState<string>("");

  // Auto-slide broadcasts every 5 seconds
  useEffect(() => {
    if (broadcasts.length > 1) {
      const timer = setInterval(() => {
        setCurrentBroadcastIndex((prev) => (prev + 1) % broadcasts.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [broadcasts.length]);

  if (productsLoading) return <div className="p-8">Loading menu...</div>;

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(String(formData.get("price"))) || 0,
      quantity: parseInt(formData.get("quantity") as string) || 0,
      imageUrl: formData.get("imageUrl") as string,
      category: formData.get("category") as string,
      inStock: formData.get("isAvailable") === "on",
    };

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...data });
        toast({ title: "Product updated", description: `${data.name} updated successfully` });
        setEditingProduct(null);
        setIsProductDialogOpen(false);
      } else {
        await createProduct.mutateAsync(data);
        toast({ title: "Product created", description: `${data.name} added to menu` });
        setIsProductDialogOpen(false);
      }
    } catch (err: any) {
      console.error("Product mutation failed:", err);
      toast({ title: "Error", description: err?.message || "Failed to save product", variant: "destructive" });
    }
  };

  return (
    <div className="pb-32">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Total Menu Items Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Menu Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products?.length || 0}</div>
            </CardContent>
          </Card>

          {/* Broadcasts Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                Broadcast
              </CardTitle>
              <Dialog open={isBroadcastDialogOpen} onOpenChange={(open) => {
                setIsBroadcastDialogOpen(open);
                if (!open) setSelectedBroadcastImage("");
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-6 px-2">
                    <Plus className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Broadcast</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const newBroadcast = {
                      id: Math.max(...broadcasts.map(b => b.id), 0) + 1,
                      title: formData.get("title") as string,
                      message: formData.get("message") as string,
                      imageUrl: selectedBroadcastImage,
                    };
                    setBroadcasts([...broadcasts, newBroadcast]);
                    setIsBroadcastDialogOpen(false);
                    setSelectedBroadcastImage("");
                  }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" name="title" placeholder="Broadcast title" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" name="message" placeholder="Broadcast message" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">Select Image</Label>
                      <Input 
                        id="image" 
                        name="image" 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.currentTarget.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setSelectedBroadcastImage(event.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                    {selectedBroadcastImage && (
                      <div className="space-y-2">
                        <Label>Image Preview</Label>
                        <img src={selectedBroadcastImage} alt="Preview" className="h-32 w-full object-cover rounded-md" />
                      </div>
                    )}
                    <Button type="submit" className="w-full">Add Broadcast</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="relative overflow-hidden h-32 bg-gradient-to-r from-orange-400 to-red-400 rounded-md">
              {broadcasts.length > 0 ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {broadcasts[currentBroadcastIndex].imageUrl && (
                    <img
                      src={broadcasts[currentBroadcastIndex].imageUrl}
                      alt={broadcasts[currentBroadcastIndex].title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="relative z-10 text-center text-white px-4">
                    <h3 className="font-bold text-sm line-clamp-1">{broadcasts[currentBroadcastIndex].title}</h3>
                    <p className="text-xs line-clamp-2">{broadcasts[currentBroadcastIndex].message}</p>
                  </div>

                  {/* Navigation buttons */}
                  {broadcasts.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentBroadcastIndex((prev) => (prev - 1 + broadcasts.length) % broadcasts.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 p-1 rounded transition"
                      >
                        <ChevronLeft className="h-4 w-4 text-white" />
                      </button>
                      <button
                        onClick={() => setCurrentBroadcastIndex((prev) => (prev + 1) % broadcasts.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 p-1 rounded transition"
                      >
                        <ChevronRight className="h-4 w-4 text-white" />
                      </button>
                    </>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this broadcast?")) {
                        const newBroadcasts = broadcasts.filter((_, index) => index !== currentBroadcastIndex);
                        setBroadcasts(newBroadcasts);
                        if (currentBroadcastIndex >= newBroadcasts.length && currentBroadcastIndex > 0) {
                          setCurrentBroadcastIndex(currentBroadcastIndex - 1);
                        }
                      }
                    }}
                    className="absolute top-2 right-2 z-20 bg-red-500/60 hover:bg-red-600 p-1 rounded transition"
                    title="Delete broadcast"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>

                  {/* Indicators */}
                  {broadcasts.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1">
                      {broadcasts.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentBroadcastIndex(index)}
                          className={`h-2 rounded-full transition ${
                            index === currentBroadcastIndex ? "w-6 bg-white" : "w-2 bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-sm">
                  No broadcasts available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Menu Items</h2>
            <Dialog open={isProductDialogOpen} onOpenChange={(open) => {
              setIsProductDialogOpen(open);
              if (!open) setEditingProduct(null);
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={editingProduct?.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" defaultValue={editingProduct?.description} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input id="price" name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity Available</Label>
                    <Input id="quantity" name="quantity" type="number" min="0" defaultValue={editingProduct?.quantity || 0} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" name="category" defaultValue={editingProduct?.category} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input id="imageUrl" name="imageUrl" placeholder="https://..." defaultValue={editingProduct?.imageUrl} />
                  </div>
                  {editingProduct?.imageUrl && (
                    <div className="mt-2">
                      <Label>Preview</Label>
                      <img src={editingProduct.imageUrl} alt={editingProduct.name} className="h-32 w-full object-cover rounded-md" />
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Checkbox id="isAvailable" name="isAvailable" defaultChecked={editingProduct ? editingProduct.inStock : true} />
                    <Label htmlFor="isAvailable">In Stock</Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={createProduct.isPending || updateProduct.isPending}>
                    {editingProduct ? "Update Product" : "Create Product"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products?.map((product) => (
              <Card key={product.id}>
                {product.imageUrl && (
                  <div className="h-32 w-full overflow-hidden bg-muted rounded-t-lg">
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <Badge variant={product.inStock ? "default" : "secondary"}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                  <CardDescription>₹{product.price} • {product.category}</CardDescription>
                  <CardDescription className="text-xs text-blue-600 font-semibold">Qty: {product.quantity || 0}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setEditingProduct(product);
                        setIsProductDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this product?")) {
                          deleteProduct.mutate(product.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
