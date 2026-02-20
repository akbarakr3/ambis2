import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Trash2, Edit2 } from "lucide-react";

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number | string;
  quantity?: number;
  category?: string;
  imageUrl?: string;
  inStock?: boolean;
}

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (id: number) => void;
}

export function ProductCard({ product, isAdmin, onEdit, onDelete }: ProductCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
      {product.imageUrl && (
        <div className="w-full h-40 overflow-hidden bg-gray-200">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
        {product.category && (
          <p className="text-sm text-gray-500 mb-2">{product.category}</p>
        )}
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 flex-grow">{product.description}</p>
        )}
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold text-green-600">
            ₹{typeof product.price === 'string' ? parseFloat(product.price) : product.price}
          </span>
          {product.quantity !== undefined && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
              Qty: {product.quantity}
            </span>
          )}
        </div>
        <div className="flex gap-2 mt-auto">
          {isAdmin && (
            <div className="flex gap-2 ml-auto">
              {onEdit && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onEdit(product)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => onDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
