const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, size, size);
    
    // Text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size/2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CE', size/2, size/2);
    
    return canvas.toBuffer();
}

// Generate icons
[16, 48, 128].forEach(size => {
    const buffer = generateIcon(size);
    fs.writeFileSync(`icons/icon${size}.png`, buffer);
}); 