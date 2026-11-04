const fs = require('fs');
const path = require('path');

async function fixAssets() {
  let Jimp;
  try {
    Jimp = require('jimp-compact');
  } catch (e) {
    console.log('jimp-compact not found, skipping asset conversion');
    return;
  }

  const assetsDir = path.join(__dirname, 'assets');
  const files = ['logo.png', 'icon.png', 'adaptive-icon.png', 'splash.png'];

  for (const file of files) {
    const filePath = path.join(assetsDir, file);
    if (!fs.existsSync(filePath)) continue;

    const buf = fs.readFileSync(filePath);
    const isPng =
      buf.length > 8 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47;

    if (!isPng) {
      console.log(`Converting ${file} from JPEG to real PNG...`);
      const img = await Jimp.read(buf);
      img.resize(512, 512);
      const pngBuffer = await img.getBufferAsync(Jimp.MIME_PNG);
      fs.writeFileSync(filePath, pngBuffer);
      console.log(`Fixed ${file} (${pngBuffer.length} bytes, valid PNG)`);
    } else {
      console.log(`${file} is already a valid PNG.`);
    }
  }
}

fixAssets().catch((err) => {
  console.error('Error fixing assets:', err);
});
