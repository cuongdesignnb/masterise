const fs = require('fs');
const path = require('path');

// 1x1 PNG gold pixel (#B88746)
const goldPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

// 1x1 JPG gold pixel (#B88746)
const goldJpgBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

const assets = [
  { relPath: 'public/brand/operator-logo-512.png', base64: goldPngBase64 },
  { relPath: 'public/og-default.jpg', base64: goldJpgBase64 },
  { relPath: 'public/icons/icon-192.png', base64: goldPngBase64 },
  { relPath: 'public/icons/icon-512.png', base64: goldPngBase64 },
  { relPath: 'src/app/icon.png', base64: goldPngBase64 },
  { relPath: 'src/app/apple-icon.png', base64: goldPngBase64 }
];

assets.forEach(asset => {
  const fullPath = path.join(__dirname, '..', asset.relPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, Buffer.from(asset.base64, 'base64'));
  console.log(`Generated: ${asset.relPath}`);
});
