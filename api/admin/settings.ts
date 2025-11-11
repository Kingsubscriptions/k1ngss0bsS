import { promises as fs } from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'server', 'settings.json');

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      // Get admin settings
      try {
        const settingsData = await fs.readFile(SETTINGS_FILE, 'utf8');
        const settings = JSON.parse(settingsData);

        // Return all settings except admin_password
        const { admin_password, ...publicSettings } = settings;
        return res.status(200).json(publicSettings);
      } catch (error) {
        // Return default settings if file doesn't exist
        return res.status(200).json({
          whatsappNumber: "+923276847960",
          whatsappDirectOrder: false,
          enablePurchaseNotifications: true,
          enableFloatingCart: true,
          showDiscountBadges: true,
          showBreadcrumbs: true,
          popupSettings: {
            enabled: true,
            title: "Limited Time Offer",
            message: "Get 10% off when you order on WhatsApp within the next 10 minutes.",
            buttonText: "Order on WhatsApp",
            buttonHref: "https://wa.me/923276847960?text=I%20want%20to%20claim%20the%20limited%20time%20offer",
            showTimer: true,
            timerDuration: 10,
            trigger: "delay",
            delaySeconds: 6,
            frequency: "once-per-session",
            theme: "dark",
            pages: ["/", "/tools", "/product/:id"]
          }
        });
      }
    }

    if (req.method === 'POST') {
      // Update admin settings
      const newSettings = req.body;

      try {
        // Read existing settings
        let currentSettings = {};
        try {
          const settingsData = await fs.readFile(SETTINGS_FILE, 'utf8');
          currentSettings = JSON.parse(settingsData);
        } catch (error) {
          // File doesn't exist, use empty object
        }

        // Update settings
        const updatedSettings = { ...currentSettings, ...newSettings };

        // Try to save to file (will fail on Vercel read-only filesystem)
        try {
          await fs.writeFile(SETTINGS_FILE, JSON.stringify(updatedSettings, null, 2));
          return res.status(200).json({ message: 'Settings updated successfully' });
        } catch (fileError: any) {
          // If file system is read-only (like Vercel), return success but warn client
          if (fileError.code === 'EROFS') {
            console.warn('File system is read-only, settings saved locally only');
            return res.status(200).json({
              message: 'Settings updated locally (server filesystem is read-only)',
              warning: 'Changes saved locally only - use localStorage for persistence'
            });
          }
          throw fileError;
        }
      } catch (error) {
        console.error('Error updating settings:', error);
        return res.status(500).json({ error: 'Failed to update settings' });
      }
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Settings API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
