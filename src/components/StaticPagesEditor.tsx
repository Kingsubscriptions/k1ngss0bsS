import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Eye, Save, AlertCircle } from 'lucide-react';
import { useStaticPages } from '@/context/StaticPagesContext';

interface StaticPage {
  id: number;
  page_key: string;
  title: string;
  slug: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const StaticPagesEditor: React.FC = () => {
  const { pages, updatePage, isLoading, error } = useStaticPages();
  const [selectedPageKey, setSelectedPageKey] = useState<string>('');
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [saveMessage, setSaveMessage] = useState('');

  // Page key to display name mapping
  const pageLabels: Record<string, string> = {
    'privacy-policy': 'Privacy Policy',
    'terms-conditions': 'Terms & Conditions',
    'refund-policy': 'Refund Policy',
    'dmca': 'DMCA Notice',
    'about': 'About Us',
    'contact': 'Contact Us',
  };

  useEffect(() => {
    if (pages.length > 0 && !selectedPageKey) {
      setSelectedPageKey(pages[0].page_key);
    }
  }, [pages, selectedPageKey]);

  useEffect(() => {
    if (selectedPageKey) {
      const page = pages.find(p => p.page_key === selectedPageKey);
      setEditingPage(page || null);
    }
  }, [selectedPageKey, pages]);

  const handleSave = async () => {
    if (!editingPage) return;

    setSaveMessage('Saving...');
    const success = await updatePage(editingPage.page_key, {
      title: editingPage.title,
      slug: editingPage.slug,
      content: editingPage.content,
      meta_title: editingPage.meta_title,
      meta_description: editingPage.meta_description,
      published: editingPage.published,
    });

    if (success) {
      setSaveMessage('✅ Page updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } else {
      setSaveMessage('❌ Failed to update page. Please try again.');
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  const handleInputChange = (field: keyof StaticPage, value: string | boolean) => {
    if (!editingPage) return;
    setEditingPage({ ...editingPage, [field]: value });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading static pages...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
      {/* Page List */}
      <Card>
        <CardHeader>
          <CardTitle>Pages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {pages.map((page) => (
            <button
              key={page.page_key}
              onClick={() => setSelectedPageKey(page.page_key)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedPageKey === page.page_key
                  ? 'bg-primary/10 border-primary'
                  : 'hover:bg-muted/50 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{pageLabels[page.page_key] || page.title}</p>
                  <p className="text-xs text-muted-foreground">/{page.slug}</p>
                </div>
                <Badge variant={page.published ? 'default' : 'outline'} className="text-xs">
                  {page.published ? 'Live' : 'Draft'}
                </Badge>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              {editingPage ? pageLabels[editingPage.page_key] || editingPage.title : 'Select a page'}
            </CardTitle>
            {editingPage && (
              <div className="flex gap-2">
                {editingPage.published && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/${editingPage.slug}`} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-2" />
                      View Live
                    </a>
                  </Button>
                )}
                <Button size="sm" onClick={handleSave} disabled={!editingPage}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {saveMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              saveMessage.includes('✅')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : saveMessage.includes('❌')
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {saveMessage}
            </div>
          )}

          {editingPage ? (
            <>
              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Page Title</Label>
                  <Input
                    id="title"
                    value={editingPage.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Page title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={editingPage.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="url-slug"
                  />
                  <p className="text-xs text-muted-foreground">URL: /{editingPage.slug}</p>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">SEO Settings</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      value={editingPage.meta_title || ''}
                      onChange={(e) => handleInputChange('meta_title', e.target.value)}
                      placeholder="SEO title for search engines"
                    />
                    <p className="text-xs text-muted-foreground">
                      {(editingPage.meta_title || '').length}/60 characters
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      rows={2}
                      value={editingPage.meta_description || ''}
                      onChange={(e) => handleInputChange('meta_description', e.target.value)}
                      placeholder="SEO description for search engines"
                    />
                    <p className="text-xs text-muted-foreground">
                      {(editingPage.meta_description || '').length}/160 characters
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Editor */}
              <div className="space-y-2">
                <Label htmlFor="content">Page Content (HTML)</Label>
                <Textarea
                  id="content"
                  rows={20}
                  value={editingPage.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Enter HTML content..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Use HTML tags for formatting. Supports headings, paragraphs, lists, links, etc.
                </p>
              </div>

              {/* Publish Settings */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">Publish Page</p>
                  <p className="text-sm text-muted-foreground">
                    Make this page visible to visitors
                  </p>
                </div>
                <Switch
                  checked={editingPage.published}
                  onCheckedChange={(checked) => handleInputChange('published', checked)}
                />
              </div>

              {/* Last Updated */}
              <div className="text-xs text-muted-foreground">
                Last updated: {new Date(editingPage.updated_at).toLocaleString()}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Select a page from the list to start editing</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaticPagesEditor;
