// Create a canvas element
const canvas = document.createElement('canvas');
const ctx = document.context('2d');

// Function to generate icon of specified size
function generateIcon(size) {
    canvas.width = size;
    canvas.height = size;
    
    // Draw a simple colored square with 'CE' text
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = 'white';
    ctx.font = `${size/2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CE', size/2, size/2);
    
    return canvas.toDataURL('image/png');
}

// Generate icons of different sizes
const icon16 = generateIcon(16);
const icon48 = generateIcon(48);
const icon128 = generateIcon(128); 