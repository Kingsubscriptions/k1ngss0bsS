const fs = require('fs');
const https = require('https');
const path = require('path');

const images = [
    { name: 'chatgpt-logo.png', url: 'https://logo.clearbit.com/openai.com' },
    { name: 'netflix-logo.png', url: 'https://logo.clearbit.com/netflix.com' },
    { name: 'spotify-logo.png', url: 'https://logo.clearbit.com/spotify.com' },
    { name: 'canva-logo.png', url: 'https://logo.clearbit.com/canva.com' },
    { name: 'adobe-logo.png', url: 'https://logo.clearbit.com/adobe.com' },
    { name: 'office-logo.png', url: 'https://logo.clearbit.com/office.com' },
    { name: 'prime-video-logo.png', url: 'https://logo.clearbit.com/primevideo.com' },
    { name: 'nordvpn-logo.png', url: 'https://logo.clearbit.com/nordvpn.com' },
    { name: 'coursera-logo.png', url: 'https://logo.clearbit.com/coursera.org' },
    { name: 'grammarly-logo.png', url: 'https://logo.clearbit.com/grammarly.com' },
    { name: 'midjourney-logo.png', url: 'https://logo.clearbit.com/midjourney.com' },
    { name: 'semrush-logo.png', url: 'https://logo.clearbit.com/semrush.com' },
    { name: 'linkedin-logo.png', url: 'https://logo.clearbit.com/linkedin.com' },
    { name: 'crunchyroll-logo.png', url: 'https://logo.clearbit.com/crunchyroll.com' },
    { name: 'scribd-logo.png', url: 'https://logo.clearbit.com/scribd.com' },
    { name: 'github-copilot-logo.png', url: 'https://logo.clearbit.com/github.com' },
    { name: 'windows-logo.png', url: 'https://logo.clearbit.com/microsoft.com' },
    { name: 'udemy-logo.png', url: 'https://logo.clearbit.com/udemy.com' },
    { name: 'ahrefs-logo.png', url: 'https://logo.clearbit.com/ahrefs.com' },
    { name: 'discord-logo.png', url: 'https://logo.clearbit.com/discord.com' },
    { name: 'microsoft-365-logo.png', url: 'https://logo.clearbit.com/office.com' }
];

const downloadImage = (url, filename) => {
    const filePath = path.join(__dirname, 'public', 'images', 'products', filename);
    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${filename}`);
        });
    }).on('error', (err) => {
        fs.unlink(filename);
        console.error(`Error downloading ${filename}: ${err.message}`);
    });
};

images.forEach(img => downloadImage(img.url, img.name));
