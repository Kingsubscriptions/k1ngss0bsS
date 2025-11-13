import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Minus, 
  Save, 
  X, 
  Upload, 
  Image as ImageIcon,
  Tag,
  DollarSign,
  Package,
  Settings,
  Trash2,
  Copy,
  Calculator,
  Sparkles,
  History
} from 'lucide-react';

import { Product, PlanOption, PlanDuration, StockType } from '@/data/products';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ImageUploader } from '@/components/ui/image-uploader';
import { SmartPricingGrid } from '@/components/SmartPricingGrid';

interface EnhancedProductFormProps {
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

export const EnhancedProductForm: React.FC<EnhancedProductFormProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Product>({
    id: '',
    name: '',
    category: '',
    image: '',
    images: [],
    features: [],
    price: { monthly: 0, original: 0 },
    plans: [],
    description: '',
    longDescription: '',
    badge: '',
    stock: true,
    stockHistory: [],
    rating: 5,
    popular: false,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');
  const [showAdvancedPricing, setShowAdvancedPricing] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        stockHistory: product.stockHistory || []
      });
      // Show advanced pricing if product has plans
      setShowAdvancedPricing(!!product.plans && product.plans.length > 0);
    } else {
      // Reset form for new product
      setFormData({
        id: '',
        name: '',
        category: '',
        image: '',
        images: [],
        features: [],
        price: { monthly: 0, original: 0 },
        plans: [],
        description: '',
        longDescription: '',
        badge: '',
        stock: true,
        stockHistory: [],
        rating: 5,
        popular: false,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setShowAdvancedPricing(false);
    }
    setErrors({});
  }, [product, isOpen]);

  const generateId = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (formData.features.length === 0) newErrors.features = 'At least one feature is required';
    
    // Validate pricing
    if (!showAdvancedPricing) {
      if (!formData.price.monthly && !formData.price.yearly) {
        newErrors.price = 'At least one price (monthly or yearly) is required';
      }
    } else {
      if (!formData.plans || formData.plans.length === 0) {
        newErrors.plans = 'At least one plan is required when using advanced pricing';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const productData: Product = {
      ...formData,
      id: formData.id || generateId(formData.name),
      updatedAt: new Date().toISOString(),
      createdAt: formData.createdAt || new Date().toISOString(),
      // Add current stock change to history
      stockHistory: [
        ...(formData.stockHistory || []),
        { 
          date: new Date().toISOString(), 
          stock: formData.stock 
        }
      ]
    };

    onSave(productData);
    onClose();
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags?.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag.trim()]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const addPlan = () => {
    const newPlan: PlanOption = {
      type: 'New Plan',
      description: '',
      durations: [
        { duration: '1 Month', price: 0, original: 0 }
      ]
    };
    setFormData(prev => ({
      ...prev,
      plans: [...(prev.plans || []), newPlan]
    }));
  };

  const updatePlan = (planIndex: number, updates: Partial<PlanOption>) => {
    setFormData(prev => ({
      ...prev,
      plans: prev.plans?.map((plan, i) => 
        i === planIndex ? { ...plan, ...updates } : plan
      ) || []
    }));
  };

  const removePlan = (planIndex: number) => {
    setFormData(prev => ({
      ...prev,
      plans: prev.plans?.filter((_, i) => i !== planIndex) || []
    }));
  };

  const handleStockChange = (value: string) => {
    let newStock: StockType;
    if (value === 'unlimited') newStock = 'unlimited';
    else if (value === 'out') newStock = false;
    else if (value === 'limited') newStock = 1;
    else newStock = true;

    setFormData(prev => ({
      ...prev,
      stock: newStock
    }));
  };

  const handlePriceModeToggle = (advanced: boolean) => {
    setShowAdvancedPricing(advanced);
    if (advanced && (!formData.plans || formData.plans.length === 0)) {
      // Auto-create a basic plan when switching to advanced mode
      setFormData(prev => ({
        ...prev,
        plans: [{
          type: 'Standard Plan',
          description: 'Standard pricing plan',
          durations: [
            { 
              duration: '1 Month', 
              price: prev.price.monthly || 0, 
              original: prev.price.original || 0 
            }
          ]
        }]
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            {product ? 'Enhanced Product Editor' : 'Create New Product'}
          </DialogTitle>
          <DialogDescription>
            {product ? 'Advanced product management with smart pricing and rich content editing' : 'Create a new product with advanced features and smart pricing'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing">Smart Pricing</TabsTrigger>
            <TabsTrigger value="media">Media & Content</TabsTrigger>
            <TabsTrigger value="stock">Stock & Analytics</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    name: e.target.value,
                    id: prev.id || generateId(e.target.value)
                  }))}
                  placeholder="e.g., Netflix Premium"
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="id">Product ID</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                  placeholder="Auto-generated from name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Entertainment, Streaming"
              />
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description *</Label>
              <RichTextEditor
                value={formData.description || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                placeholder="Brief description of the product with rich formatting"
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">Detailed Description</Label>
              <RichTextEditor
                value={formData.longDescription || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, longDescription: value }))}
                placeholder="Detailed product information with rich formatting, lists, and links"
              />
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Product Features *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </div>
              {formData.features.map((feature, index) => (
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
              {errors.features && <p className="text-sm text-red-500">{errors.features}</p>}
            </div>
          </TabsContent>

          {/* Smart Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            {/* Pricing Mode Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Pricing Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={!showAdvancedPricing}
                      onCheckedChange={(checked) => handlePriceModeToggle(!checked)}
                    />
                    <Label>Simple Pricing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={showAdvancedPricing}
                      onCheckedChange={handlePriceModeToggle}
                    />
                    <Label>Advanced Plans & Smart Pricing</Label>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {showAdvancedPricing 
                    ? 'Use advanced plans with auto-calculation, custom pricing, and savings display'
                    : 'Use simple monthly/yearly pricing for basic products'
                  }
                </p>
              </CardContent>
            </Card>

            {!showAdvancedPricing ? (
              /* Simple Pricing */
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Simple Pricing</CardTitle>
                  <CardDescription>Set basic monthly/yearly pricing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Monthly Price (₹)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.price.monthly || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          price: { ...prev.price, monthly: parseInt(e.target.value) || undefined }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Yearly Price (₹)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.price.yearly || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          price: { ...prev.price, yearly: parseInt(e.target.value) || undefined }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Original Price (₹)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.price.original || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          price: { ...prev.price, original: parseInt(e.target.value) || undefined }
                        }))}
                      />
                    </div>
                  </div>
                  {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                </CardContent>
              </Card>
            ) : (
              /* Advanced Smart Pricing */
              <div className="space-y-6">
                {/* Plan Management */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Product Plans
                      </CardTitle>
                      <CardDescription>Create and manage multiple pricing plans</CardDescription>
                    </div>
                    <Button type="button" variant="outline" onClick={addPlan}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Plan
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.plans?.map((plan, planIndex) => (
                      <Card key={planIndex} className="border-2">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Plan {planIndex + 1}</CardTitle>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removePlan(planIndex)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Plan Name</Label>
                              <Input
                                value={plan.type}
                                onChange={(e) => updatePlan(planIndex, { type: e.target.value })}
                                placeholder="e.g., Premium Plan"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Plan Description</Label>
                              <Input
                                value={plan.description || ''}
                                onChange={(e) => updatePlan(planIndex, { description: e.target.value })}
                                placeholder="Brief plan description"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {errors.plans && <p className="text-sm text-red-500">{errors.plans}</p>}
                  </CardContent>
                </Card>

                {/* Smart Pricing Grid */}
                {formData.plans && formData.plans.length > 0 && (
                  <SmartPricingGrid
                    plans={formData.plans}
                    onChange={(updatedPlans) => setFormData(prev => ({ ...prev, plans: updatedPlans }))}
                  />
                )}
              </div>
            )}
          </TabsContent>

          {/* Media & Content Tab */}
          <TabsContent value="media" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUploader
                    value={formData.image}
                    onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                    placeholder="Main product image URL or upload file"
                  />
                </CardContent>
              </Card>

              {/* Product Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rating (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={formData.rating || 5}
                      onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 5 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Badge Text</Label>
                    <Input
                      value={formData.badge || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                      placeholder="e.g., Best Seller, New!, 25% OFF"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.popular || false}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, popular: checked }))}
                    />
                    <Label>Mark as Popular Product</Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Tags</CardTitle>
                <CardDescription>Add tags to help with categorization and filtering</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter tag and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const target = e.target as HTMLInputElement;
                        addTag(target.value);
                        target.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).parentElement?.querySelector('input');
                      if (input?.value) {
                        addTag(input.value);
                        input.value = '';
                      }
                    }}
                  >
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock & Analytics Tab */}
          <TabsContent value="stock" className="space-y-6">
            {/* Stock Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Advanced Stock Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Stock Status</Label>
                  <Select
                    value={
                      formData.stock === 'unlimited' ? 'unlimited' :
                      formData.stock === true ? 'in-stock' :
                      formData.stock === false ? 'out' :
                      typeof formData.stock === 'number' ? 'limited' : 'in-stock'
                    }
                    onValueChange={handleStockChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-stock">In Stock (Unlimited)</SelectItem>
                      <SelectItem value="unlimited">In Stock (Marked as Unlimited)</SelectItem>
                      <SelectItem value="limited">Limited Quantity</SelectItem>
                      <SelectItem value="out">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {typeof formData.stock === 'number' && (
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setFormData(prev => ({ ...prev, stock: value }));
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stock History */}
            {formData.stockHistory && formData.stockHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Stock History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {formData.stockHistory.map((history, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">
                          {new Date(history.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <Badge variant="outline">
                          {history.stock === true ? 'In Stock' : 
                           history.stock === false ? 'Out of Stock' :
                           history.stock === 'unlimited' ? 'Unlimited' :
                           `${history.stock} units`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Created Date</Label>
                    <Input
                      type="datetime-local"
                      value={formData.createdAt ? new Date(formData.createdAt).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        createdAt: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString()
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Updated</Label>
                    <Input
                      type="datetime-local"
                      value={formData.updatedAt ? new Date(formData.updatedAt).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        updatedAt: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString()
                      }))}
                    />
                  </div>
                </div>

                <Alert>
                  <Settings className="w-4 h-4" />
                  <AlertDescription>
                    Advanced settings are automatically managed. Changes here will affect product metadata and timestamps.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            {product ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedProductForm;