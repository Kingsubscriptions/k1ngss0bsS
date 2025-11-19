import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useGiveawayContent } from '@/context/GiveawayContentContext';
import { Save, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const GiveawayManagement = () => {
    const { content, setContent, saveContent, isLoading, error } = useGiveawayContent();
    const [isSaving, setIsSaving] = React.useState(false);
    const [saveStatus, setSaveStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus('idle');
        try {
            await saveContent();
            setSaveStatus('success');
        } catch (err) {
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (error && !isLoading) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load giveaway content: {error}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Giveaway Page Management</CardTitle>
                        <CardDescription>Control all the content on the public free giveaway page.</CardDescription>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isSaving ? 'Saving...' : 'Save All Changes'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Header Section */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold">Header Section</h3>
                    <div className="space-y-2">
                        <Label htmlFor="header_title">Header Title</Label>
                        <Input
                            id="header_title"
                            value={content.header_title || ''}
                            onChange={(e) => setContent({ ...content, header_title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="header_subtitle">Header Subtitle</Label>
                        <Input
                            id="header_subtitle"
                            value={content.header_subtitle || ''}
                            onChange={(e) => setContent({ ...content, header_subtitle: e.target.value })}
                        />
                    </div>
                </div>

                {/* About Section */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold">About Section</h3>
                    <div className="space-y-2">
                        <Label htmlFor="about_section_title">About Title</Label>
                        <Input
                            id="about_section_title"
                            value={content.about_section_title || ''}
                            onChange={(e) => setContent({ ...content, about_section_title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="about_section_content">About Content</Label>
                        <Textarea
                            id="about_section_content"
                            value={content.about_section_content || ''}
                            onChange={(e) => setContent({ ...content, about_section_content: e.target.value })}
                        />
                    </div>
                </div>

                {/* Payment Info Section */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold">Payment Information</h3>
                    <div className="space-y-2">
                        <Label htmlFor="payment_info_title">Payment Title</Label>
                        <Input
                            id="payment_info_title"
                            value={content.payment_info_title || ''}
                            onChange={(e) => setContent({ ...content, payment_info_title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="payment_info_content">Payment Content (Supports Markdown)</Label>
                        <Textarea
                            id="payment_info_content"
                            rows={10}
                            value={content.payment_info_content || ''}
                            onChange={(e) => setContent({ ...content, payment_info_content: e.target.value })}
                            placeholder="e.g., ### Mobile Banking (JazzCash & EasyPaisa)..."
                        />
                    </div>
                </div>
                 {/* CTA Section */}
                 <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold">Call to Action (CTA)</h3>
                    <div className="space-y-2">
                        <Label htmlFor="cta_title">CTA Title</Label>
                        <Input
                            id="cta_title"
                            value={content.cta_title || ''}
                            onChange={(e) => setContent({ ...content, cta_title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cta_button_text">Button Text</Label>
                        <Input
                            id="cta_button_text"
                            value={content.cta_button_text || ''}
                            onChange={(e) => setContent({ ...content, cta_button_text: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cta_button_link">Button Link</Label>
                        <Input
                            id="cta_button_link"
                            value={content.cta_button_link || ''}
                            onChange={(e) => setContent({ ...content, cta_button_link: e.target.value })}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default GiveawayManagement;
