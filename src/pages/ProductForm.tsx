import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  X, 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Minus, 
  AlertCircle,
  Calculator,
  History,
  Trash2
} from 'lucide-react';
import { SmartPricingGrid } from '@/components/SmartPricingGrid';
import { Product, PlanOption, StockType } from '@/data/products';
import { useToast } from '@/components/ui/use-toast';

// Rich Text Editor Component
const RichTextEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder }) => {
  const [isPreview, setIsPreview] = useState(false);

  const formatText = (format: string) => {
    const textarea = document.getElementById('rich-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'heading':
        formattedText = `## ${selectedText}`;
        break;
      case 'list':
        formattedText = `• ${selectedText}`;
        break;
      default:
        formattedText = selectedText;
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);
  };

  const renderPreview = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^• (.*$)/gm, '<li>$1</li>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => formatText('bold')}
        >
          <strong>B</strong>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => formatText('italic')}
        >
          <em>I</em>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => formatText('heading')}
        >
          H2
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => formatText('list')}
        >
          •
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
        >
          {isPreview ? 'Edit' : 'Preview'}
        </Button>
      </div>
      
      {isPreview ? (
        <div 
          className="min-h-[100px] p-3 border rounded-md bg-gray-50"
          dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
        />
      ) : (
        <Textarea
          id="rich-editor"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[100px]"
        />
      )}
    </div>
  );
};

// Image Upload Component
const ImageUploadZone: React.FC<{
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}> = ({ images, onImagesChange, maxImages = 5 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    for (const file of imageFiles) {
      if (images.length >= maxImages) break;
      
      const fileName = `${Date.now()}-${file.name}`;
      setUploadProgress(prev => ({ ...prev, [fileName]: 0 }));
      
      // Simulate upload progress
      const uploadSimulation = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[fileName] || 0;
          if (current >= 100) {
            clearInterval(uploadSimulation);
            return prev;
          }
          return { ...prev, [fileName]: current + 10 };
        });
      }, 100);
      
      // Create object URL for preview (in real app, upload to server)
      const imageUrl = URL.createObjectURL(file);
      
      setTimeout(() => {
        onImagesChange([...images, imageUrl]);
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileName];
          return newProgress;
        });
      }, 1000);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          Drag & drop images here, or click to select
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          id="image-upload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          Select Images
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Maximum {maxImages} images. Supported: JPG, PNG, GIF
        </p>
      </div>

      {/* Upload Progress */}
      {Object.entries(uploadProgress).map(([fileName, progress]) => (
        <div key={fileName} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{fileName}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ))}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Product image ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="w-3 h-3" />
              </Button>
              {index === 0 && (
                <Badge className="absolute bottom-1 left-1 text-xs">
                  Primary
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface ProductFormProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    id: '',
    name: '',
    category: '',
    description: '',
    longDescription: '',
    features: [''],
    price: { monthly: 0, yearly: 0, original: 0 },
    plans: [],
    stock: true,
    popular: false,
    badge: '',
    tags: [],
    image: '',
    images: [],
    rating: 5
  });
  
  const [stockHistory, setStockHistory] = useState<Array<{ date: string; stock: StockType; previousStock?: StockType; reason?: string }>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setFormData(product);
      setStockHistory(product.stockHistory?.map(entry => ({
        ...entry,
        reason: 'Manual update'
      })) || []);
    } else {
      // Reset form for new product
      setFormData({
        id: `product-${Date.now()}`,
        name: '',
        category: '',
        description: '',
        longDescription: '',
        features: [''],
        price: { monthly: 0, yearly: 0, original: 0 },
        plans: [],
        stock: true,
        popular: false,
        badge: '',
        tags: [],
        image: '',
        images: [],
        rating: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setStockHistory([]);
    }
  }, [product, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.category?.trim()) {
      newErrors.category = 'Category is required';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.id?.trim()) {
      newErrors.id = 'Product ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Track stock changes
    const newStockHistory = [...stockHistory];
    if (product && product.stock !== formData.stock) {
      newStockHistory.push({
        date: new Date().toISOString(),
        stock: formData.stock!,
        reason: 'Manual update via form'
      });
    }

    const productData: Product = {
      ...formData,
      updatedAt: new Date().toISOString(),
      stockHistory: newStockHistory.map(({ reason, ...entry }) => entry),
      features: formData.features?.filter(f => f.trim()) || [],
      tags: formData.tags || []
    } as Product;

    onSave(productData);
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || []), '']
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.map((f, i) => i === index ? value : f) || []
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags?.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Product' : 'Create New Product'}
          </DialogTitle>
          <DialogDescription>
            {product 
              ? 'Update product information and pricing' 
              : 'Add a new product to your inventory'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="id">Product ID *</Label>
                <Input
                  id="id"
                  value={formData.id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                  placeholder="unique-product-id"
                />
                {errors.id && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.id}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Entertainment, Streaming"
              />
              {errors.category && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.category}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description *</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief product description"
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Long Description</Label>
              {/* Feature 3: RICH TEXT EDITOR FOR DESCRIPTIONS */}
              <RichTextEditor
                value={formData.longDescription || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, longDescription: value }))}
                placeholder="Detailed product description with formatting..."
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Features</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </div>
              <div className="space-y-2">
                {formData.features?.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Enter feature"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthly">Monthly Price (₹)</Label>
                <Input
                  id="monthly"
                  type="number"
                  min="0"
                  value={formData.price?.monthly || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    price: { ...prev.price, monthly: parseFloat(e.target.value) || 0 }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearly">Yearly Price (₹)</Label>
                <Input
                  id="yearly"
                  type="number"
                  min="0"
                  value={formData.price?.yearly || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    price: { ...prev.price, yearly: parseFloat(e.target.value) || 0 }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="original">Original Price (₹)</Label>
                <Input
                  id="original"
                  type="number"
                  min="0"
                  value={formData.price?.original || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    price: { ...prev.price, original: parseFloat(e.target.value) || 0 }
                  }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Advanced Pricing Plans</Label>
              <SmartPricingGrid
                plans={formData.plans || []}
                onChange={(plans) => setFormData(prev => ({ ...prev, plans }))}
              />
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <div className="space-y-2">
              <Label>Product Images</Label>
              {/* Feature 2: DRAG-AND-DROP IMAGE UPLOAD SYSTEM */}
              <ImageUploadZone
                images={formData.images || []}
                onImagesChange={(images) => {
                  setFormData(prev => ({
                    ...prev,
                    images,
                    image: images[0] || prev.image // Set first image as primary
                  }));
                }}
                maxImages={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary-image">Primary Image URL</Label>
              <Input
                id="primary-image"
                value={formData.image || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="/images/exampleimage.jpg"
              />
            </div>
          </TabsContent>

          <TabsContent value="stock" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Stock Status</Label>
                <Select
                  value={typeof formData.stock === 'boolean' 
                    ? (formData.stock ? 'true' : 'false')
                    : formData.stock === 'unlimited' 
                      ? 'unlimited' 
                      : 'number'
                  }
                  onValueChange={(value) => {
                    if (value === 'true') {
                      setFormData(prev => ({ ...prev, stock: true }));
                    } else if (value === 'false') {
                      setFormData(prev => ({ ...prev, stock: false }));
                    } else if (value === 'unlimited') {
                      setFormData(prev => ({ ...prev, stock: 'unlimited' }));
                    } else {
                      setFormData(prev => ({ ...prev, stock: 0 }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">In Stock</SelectItem>
                    <SelectItem value="false">Out of Stock</SelectItem>
                    <SelectItem value="unlimited">Unlimited Stock</SelectItem>
                    <SelectItem value="number">Limited Quantity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {typeof formData.stock === 'number' && (
                <div className="space-y-2">
                  <Label htmlFor="stock-quantity">Stock Quantity</Label>
                  <Input
                    id="stock-quantity"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      stock: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>
              )}
            </div>

            {/* Feature 4: AUTOMATIC STOCK HISTORY TRACKING */}
            {stockHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Stock History (Automatic Tracking)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {stockHistory.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {typeof entry.stock === 'boolean' 
                                ? (entry.stock ? 'In Stock' : 'Out of Stock')
                                : entry.stock === 'unlimited' 
                                  ? 'Unlimited Stock'
                                  : `${entry.stock} units`
                              }
                            </span>
                            {entry.previousStock !== undefined && (
                              <span className="text-xs text-gray-500">
                                (from: {typeof entry.previousStock === 'boolean' 
                                  ? (entry.previousStock ? 'In Stock' : 'Out of Stock')
                                  : entry.previousStock === 'unlimited' 
                                    ? 'Unlimited'
                                    : `${entry.previousStock}`
                                })
                              </span>
                            )}
                          </div>
                          {entry.reason && (
                            <span className="text-sm text-gray-500">
                              Reason: {entry.reason}
                            </span>
                          )}
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>{new Date(entry.date).toLocaleDateString()}</div>
                          <div>{new Date(entry.date).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {stockHistory.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No stock changes recorded yet. Changes will be automatically tracked when you update stock levels.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="popular"
                  checked={formData.popular || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, popular: checked }))}
                />
                <Label htmlFor="popular">Mark as Popular</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="badge">Badge Text</Label>
              <Input
                id="badge"
                value={formData.badge || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                placeholder="e.g., New, Sale, Popular"
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeTag(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      addTag(input.value.trim());
                      input.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            {product ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;