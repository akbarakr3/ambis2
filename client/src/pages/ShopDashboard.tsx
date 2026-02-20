import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { LogOut, Lock, ShoppingBag, UtensilsCrossed, User, PlusCircle } from "lucide-react";
import { logout } from "../lib/auth-utils";
import { ChangePasswordDialog } from "../components/ChangePasswordDialog";
import { useChangePassword } from "../hooks/use-auth";
import Orders from "./Orders";
import Menu from "./Menu";
import { ProductCatalog } from "../components/ProductCatalog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

export default function ShopDashboard() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState<"orders" | "menu" | "neworder">("neworder");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const changePassword = useChangePassword();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    setLocation('/');
    return null;
  }

  const handleChangePassword = async (
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match");
    }
    await changePassword.mutateAsync({
      oldPassword,
      newPassword,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-50">
        <div className="container px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/ambis-cafe-logo.png" 
              alt="Ambi's Cafe" 
              className="h-10 w-10 object-contain"
            />
            <div>
              <h1 className="font-bold text-2xl text-red-700">Ambi's Cafe</h1>
              <p className="text-xs text-gray-600">Admin Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-1 hover:bg-muted">
                  <Avatar>
                    <AvatarFallback>{(user?.name && user.name[0]) || 'A'}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline font-medium">{user?.name || 'Admin'}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setIsPasswordDialogOpen(true)}>
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { logout(); }}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="container px-4 py-8 pb-32">
        {currentPage === "orders" && <Orders />}
        {currentPage === "menu" && <Menu />}
        {currentPage === "neworder" && <ProductCatalog />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white">
        <div className="container px-4 py-3 flex gap-2">
          <Button
            onClick={() => setCurrentPage("neworder")}
            className={`flex-1 gap-2 ${
              currentPage === "neworder"
                ? "bg-orange-600 hover:bg-orange-700 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            New Order
          </Button>
          <Button
            onClick={() => setCurrentPage("orders")}
            className={`flex-1 gap-2 ${
              currentPage === "orders"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Orders
          </Button>
          <Button
            onClick={() => setCurrentPage("menu")}
            className={`flex-1 gap-2 ${
              currentPage === "menu"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            <UtensilsCrossed className="h-4 w-4" />
            Menu
          </Button>
        </div>
      </div>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
        onChangePassword={handleChangePassword}
        isLoading={changePassword.isPending}
      />
    </div>
  );
}
