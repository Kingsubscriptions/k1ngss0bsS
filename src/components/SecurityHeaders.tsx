import { useEffect } from 'react';

const SecurityHeaders: React.FC = () => {
  useEffect(() => {
    // Add security headers via meta tags
    const addMetaTag = (name: string, content: string) => {
      const existing = document.querySelector(`meta[name="${name}"]`);
      if (existing) {
        existing.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    // Security Headers
    addMetaTag('referrer', 'strict-origin-when-cross-origin');
    addMetaTag('x-content-type-options', 'nosniff');
    addMetaTag('x-frame-options', 'DENY');
    addMetaTag('x-xss-protection', '1; mode=block');

    // Content Security Policy (basic)
    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!csp) {
      const cspMeta = document.createElement('meta');
      cspMeta.httpEquiv = 'Content-Security-Policy';
      cspMeta.content = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' data: https:;
        connect-src 'self' https://mfocjlndrxeufwexdkev.supabase.co wss://mfocjlndrxeufwexdkev.supabase.co;
        frame-ancestors 'none';
      `.replace(/\s+/g, ' ').trim();
      document.head.appendChild(cspMeta);
    }

    // Remove any existing CSP that might conflict
    const existingCSP = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    if (existingCSP.length > 1) {
      for (let i = 1; i < existingCSP.length; i++) {
        existingCSP[i].remove();
      }
    }
  }, []);

  return null; // This component doesn't render anything
};

export default SecurityHeaders;
