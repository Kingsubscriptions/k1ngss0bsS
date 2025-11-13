import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save, 
  LogOut, 
  Package, 
  TrendingUp, 
  Users, 
  CheckCircle,
  XCircle,
  BarChart3,
  GripVertical
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import ProductForm from './ProductForm';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

// Import the product types and data
import { Product, StockType } from '@/data/products';
import { useProductsContext } from '@/context/ProductsContext';

interface DashboardProps {
  onLogout: () => void;
}

const ProductDashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const {
    products: allProducts,
    setProducts: setProductsContext,
    deleteProduct: deleteProductContext,
    updateProduct: updateProductContext,
  } = useProductsContext();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  // Filter and sort products
  useEffect(() => {
    let filtered = [...allProducts];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product =>
        product.category.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    // Apply stock filter
    if (stockFilter !== 'all') {
      filtered = filtered.filter(product => {
        const inStock = product.stock === true || product.stock === 'unlimited' || (typeof product.stock === 'number' && product.stock > 0);
        return stockFilter === 'in-stock' ? inStock : !inStock;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'price':
          aValue = a.price.monthly || a.price.yearly || 0;
          bValue = b.price.monthly || b.price.yearly || 0;
          break;
        case 'created':
          aValue = new Date(a.createdAt || '').getTime();
          bValue = new Date(b.createdAt || '').getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredProducts(filtered);
  }, [allProducts, searchTerm, categoryFilter, stockFilter, sortBy, sortOrder]);

  const saveProducts = async () => {
    try {
      setSaveStatus('saving');
      await setProductsContext([...allProducts]);
      setSaveStatus('success');
    } catch (error) {
      console.error('Error saving products:', error);
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const getStockStatus = (stock: StockType) => {
    if (stock === false || stock === 0) return { label: 'Out of Stock', color: 'destructive' as const };
    if (stock === true || stock === 'unlimited') return { label: 'In Stock', color: 'default' as const };
    if (typeof stock === 'number' && stock > 0) return { label: `${stock} left`, color: stock < 5 ? 'secondary' as const : 'default' as const };
    return { label: 'Unknown', color: 'secondary' as const };
  };

  const getUniqueCategories = () => {
    const categories = new Set<string>();
    allProducts.forEach(product => {
      product.category.split(',').forEach(cat => {
        categories.add(cat.trim());
      });
    });
    return Array.from(categories);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleBulkAction = async (action: 'in-stock' | 'out-stock' | 'delete') => {
    if (selectedProducts.length === 0) return;

    const promises: Promise<void>[] = [];

    switch (action) {
      case 'delete': {
        if (window.confirm(`Delete ${selectedProducts.length} selected products?`)) {
          selectedProducts.forEach(id => promises.push(deleteProductContext(id)));
        }
        break;
      }
      case 'in-stock': {
        allProducts.forEach(product => {
          if (selectedProducts.includes(product.id)) {
            promises.push(updateProductContext({ ...product, stock: true }));
          }
        });
        break;
      }
      case 'out-stock': {
        allProducts.forEach(product => {
          if (selectedProducts.includes(product.id)) {
            promises.push(updateProductContext({ ...product, stock: false }));
          }
        });
        break;
      }
      default:
        break;
    }

    if (promises.length > 0) {
      await Promise.all(promises);
      setSelectedProducts([]);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProductContext(productId);
    }
  };

  const duplicateProduct = async (product: Product) => {
    const newProduct: Product = {
      ...product,
      id: `${product.id}-copy-${Date.now()}`,
      name: `${product.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setProductsContext([...allProducts, newProduct]);
  };

  const handleSaveProduct = async (product: Product) => {
    await updateProductContext(product);
    setEditingProduct(null);
    setShowCreateForm(false);
  };

  const stats = {
    total: allProducts.length,
    inStock: allProducts.filter(p => p.stock !== false && p.stock !== 0).length,
    outOfStock: allProducts.filter(p => p.stock === false || p.stock === 0).length,
    popular: allProducts.filter(p => p.popular).length,
    categories: getUniqueCategories().length,
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const reorderedProducts = Array.from(allProducts);
    const [removed] = reorderedProducts.splice(source.index, 1);
    reorderedProducts.splice(destination.index, 0, removed);

    setProductsContext(reorderedProducts);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('Admin token not found');
        setSaveStatus('error');
        return;
      }

      setSaveStatus('saving');
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(reorderedProducts),
      });

      if (!response.ok) {
        throw new Error('Failed to save product order');
      }

      setSaveStatus('success');
    } catch (error) {
      console.error('Error saving product order:', error);
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">KINGS SUBS WEB Controller</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Advanced Product Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={saveProducts}
                disabled={saveStatus === 'saving'}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {saveStatus !== 'idle' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Alert className={saveStatus === 'success' ? 'border-green-500 bg-green-50' : saveStatus === 'error' ? 'border-red-500 bg-red-50' : ''}>
            {saveStatus === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
            {saveStatus === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
            <AlertDescription>
              {saveStatus === 'success' && 'Products saved locally. The catalog has been updated immediately.'}
              {saveStatus === 'error' && 'Failed to save products. Please try again.'}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics & Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Package className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">In Stock</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.inStock}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <XCircle className="w-8 h-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.outOfStock}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Popular</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.popular}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Categories</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.categories}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Products Management</CardTitle>
                    <CardDescription>
                      View, edit, and manage all your products from one place
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {getUniqueCategories().map(category => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by stock" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stock Status</SelectItem>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="out-stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                    const [field, order] = value.split('-');
                    setSortBy(field);
                    setSortOrder(order as 'asc' | 'desc');
                  }}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                      <SelectItem value="category-asc">Category (A-Z)</SelectItem>
                      <SelectItem value="price-asc">Price (Low-High)</SelectItem>
                      <SelectItem value="price-desc">Price (High-Low)</SelectItem>
                      <SelectItem value="created-desc">Newest First</SelectItem>
                      <SelectItem value="created-asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedProducts.length > 0 && (
                  <div className="flex items-center gap-4 mb-4 p-4 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">
                      {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('in-stock')}>
                        Mark In Stock
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('out-stock')}>
                        Mark Out of Stock
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                        Delete Selected
                      </Button>
                    </div>
                  </div>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <Droppable droppableId="products">
                    {(provided) => (
                      <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                        {filteredProducts.map((product, index) => {
                          const stockStatus = getStockStatus(product.stock);
                          return (
                            <Draggable key={product.id} draggableId={product.id} index={index}>
                              {(provided) => (
                                <TableRow ref={provided.innerRef} {...provided.draggableProps}>
                                  <TableCell {...provided.dragHandleProps}>
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                  </TableCell>
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedProducts.includes(product.id)}
                                      onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-3">
                                      <img
                                        src={product.image || '/images/DefaultImage.jpg'}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/images/DefaultImage.jpg';
                                }}
                              />
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category.split(',')[0].trim()}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {product.price.monthly && `PKR ${product.price.monthly}/mo`}
                              {product.price.yearly && `PKR ${product.price.yearly}/yr`}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.color}>{stockStatus.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {product.popular && <Badge className="bg-yellow-100 text-yellow-800">Popular</Badge>}
                              {product.badge && <Badge variant="secondary">{product.badge}</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingProduct(product)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => duplicateProduct(product)}
                              >
                                Copy
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </TableBody>
                    )}
                  </Droppable>
                </Table>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all'
                        ? 'No products match your current filters.'
                        : 'Get started by adding your first product.'}
                    </p>
                    {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all' ? (
                      <Button variant="outline" onClick={() => {
                        setSearchTerm('');
                        setCategoryFilter('all');
                        setStockFilter('all');
                      }}>
                        Clear Filters
                      </Button>
                    ) : (
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>

      <ProductForm
        product={editingProduct}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleSaveProduct}
      />
      
      <ProductForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSave={handleSaveProduct}
      />
    </div>
    </DragDropContext>
  );
};

export default ProductDashboard;
