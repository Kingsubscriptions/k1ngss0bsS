import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSiteContent, SiteContent } from '@/context/SiteContentContext';
import { Globe, Users, FilePlus2 } from 'lucide-react';

const SiteContentManagement: React.FC = () => {
  const { content, loading, error, updateContent } = useSiteContent();
  const [form, setForm] = useState<SiteContent>(content);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm(content);
  }, [content]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    try {
      const success = await updateContent(form);
      if (success) {
        setMessage('Content updated successfully.');
      } else {
        setMessage('Failed to update content.');
      }
    } catch (error) {
      setMessage('Failed to update content. Please try again.');
    }
  };

  if (loading) return <p>Loading site content...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              SEO Meta Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input
                id="meta_title"
                value={form.seo.meta_title}
                onChange={(e) => setForm({ ...form, seo: { ...form.seo, meta_title: e.target.value } })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                rows={3}
                value={form.seo.meta_description}
                onChange={(e) => setForm({ ...form, seo: { ...form.seo, meta_description: e.target.value } })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                value={form.seo.keywords}
                onChange={(e) => setForm({ ...form, seo: { ...form.seo, keywords: e.target.value } })}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Social Media Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={form.social_links.facebook}
                onChange={(e) => setForm({ ...form, social_links: { ...form.social_links, facebook: e.target.value } })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={form.social_links.twitter}
                onChange={(e) => setForm({ ...form, social_links: { ...form.social_links, twitter: e.target.value } })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={form.social_links.instagram}
                onChange={(e) => setForm({ ...form, social_links: { ...form.social_links, instagram: e.target.value } })}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FilePlus2 className="h-5 w-5" />
              Footer Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="footer_text">Footer Text</Label>
              <Input
                id="footer_text"
                value={form.footer.text}
                onChange={(e) => setForm({ ...form, footer: { ...form.footer, text: e.target.value } })}
              />
            </div>
          </CardContent>
        </Card>
        <Button type="submit">Save Content</Button>
        {message && <p>{message}</p>}
      </div>
    </form>
  );
};

export default SiteContentManagement;
