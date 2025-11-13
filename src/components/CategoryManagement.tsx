import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCategories, Category } from '@/context/CategoriesContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

const CategoryManagement: React.FC = () => {
  const { categories, loading, error, addCategory, updateCategory, deleteCategory } = useCategories();
  const [form, setForm] = useState<Omit<Category, 'id'>>({ name: '', description: '', image_url: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const handleResetForm = () => {
    setEditingId(null);
    setForm({ name: '', description: '', image_url: '' });
    setMessage('');
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({ name: category.name, description: category.description, image_url: category.image_url });
    setMessage('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setMessage('Name is required.');
      return;
    }

    try {
      if (editingId) {
        const success = await updateCategory(editingId, form);
        if (success) {
          setMessage('Category updated successfully.');
        } else {
          setMessage('Failed to update category.');
        }
      } else {
        const success = await addCategory(form);
        if (success) {
          setMessage('Category created successfully.');
          handleResetForm();
        } else {
          setMessage('Failed to create category.');
        }
      }
    } catch (error) {
      setMessage('Failed to save category. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        const success = await deleteCategory(id);
        if (success) {
          setMessage('Category deleted successfully.');
        } else {
          setMessage('Failed to delete category.');
        }
      } catch (error) {
        setMessage('Failed to delete category. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.5fr,2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {editingId ? 'Edit Category' : 'Create Category'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {message}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="category_name">Name</Label>
                <Input
                  id="category_name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Entertainment"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category_description">Description</Label>
                <Textarea
                  id="category_description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="A short description of the category."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category_image_url">Image URL</Label>
                <Input
                  id="category_image_url"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://example.com/image.png"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" className="flex-1">
                  {editingId ? 'Update Category' : 'Create Category'}
                </Button>
                <Button type="button" variant="outline" onClick={handleResetForm}>
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading categories...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : categories.length === 0 ? (
              <p>No categories yet. Create your first one to get started.</p>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="rounded-lg border bg-card/60 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{category.name}</p>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(category.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoryManagement;
