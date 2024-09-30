const fs = require('fs');
const omggif = require('omggif');
const { createCanvas } = require('canvas');
const GIFEncoder = require('gif-encoder-2');

// Helper function to clear the canvas
function clearCanvas(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
}

// Function to apply the disposal method
function applyDisposalMethod(disposalMethod, ctx, canvas, width, height) {
    if (disposalMethod === 2) { // Restore to background (clear)
        clearCanvas(ctx, width, height);
    } 
}

// Function to merge frame data and handle transparency
function mergeFrameData(frameData, previousFrameData, disposalMethod) {
    if (disposalMethod === 3) {
        return previousFrameData.slice(); // Restore previous frame
    }
    
    const mergedFrameData = new Uint8Array(frameData.length);
    mergedFrameData.set(frameData);

    for (let i = 0; i < frameData.length; i += 4) {
        if (frameData[i + 3] === 0) { // If the pixel is fully transparent
            mergedFrameData[i] = previousFrameData[i];       // Red
            mergedFrameData[i + 1] = previousFrameData[i + 1]; // Green
            mergedFrameData[i + 2] = previousFrameData[i + 2]; // Blue
            mergedFrameData[i + 3] = previousFrameData[i + 3]; // Alpha
        }
    }

    return mergedFrameData;
}

// Function to split the GIF into a grid of smaller GIFs
async function splitGIFIntoGrid(filePath, rows, columns) {
    const gifData = fs.readFileSync(filePath);
    const gif = new omggif.GifReader(gifData);

    const width = gif.width;
    const height = gif.height;
    const tileWidth = Math.floor(width / columns);
    const tileHeight = Math.floor(height / rows);

    console.log(`GIF Width: ${width}, Height: ${height}`);
    console.log(`Splitting into ${rows} rows and ${columns} columns (Tile Size: ${tileWidth}x${tileHeight})`);

    let previousFullFrameData = new Uint8Array(width * height * 4); // Buffer for previous frame

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const encoder = new GIFEncoder(tileWidth, tileHeight);
            const outputPath = `output/output_${row}_${col}.gif`;

            const tileStream = fs.createWriteStream(outputPath);
            encoder.createReadStream().pipe(tileStream);

            encoder.start();
            encoder.setRepeat(0); // Loop forever
            encoder.setDelay(gif.frameInfo(0).delay * 10); // Frame delay (converted from 100ths of a second)
            encoder.setQuality(10); // Quality

            for (let frameIndex = 0; frameIndex < gif.numFrames(); frameIndex++) {
                const canvas = createCanvas(tileWidth, tileHeight);
                const ctx = canvas.getContext('2d');

                // Decode current frame
                const fullFrameData = new Uint8Array(width * height * 4);
                gif.decodeAndBlitFrameRGBA(frameIndex, fullFrameData);

                const frameInfo = gif.frameInfo(frameIndex);
                const disposalMethod = frameInfo.disposal || 0; // Default to 0 if undefined

                // Merge current frame data with previous one
                const mergedFrameData = mergeFrameData(
                    fullFrameData,
                    previousFullFrameData,
                    disposalMethod
                );

                // Clear canvas for disposal method 2
                applyDisposalMethod(disposalMethod, ctx, canvas, tileWidth, tileHeight);

                // Extract and draw tile for current row/col
                const tileFrameData = ctx.createImageData(tileWidth, tileHeight);
                for (let y = 0; y < tileHeight; y++) {
                    for (let x = 0; x < tileWidth; x++) {
                        const fullIndex = ((y + row * tileHeight) * width + (x + col * tileWidth)) * 4;
                        const tileIndex = (y * tileWidth + x) * 4;

                        // Copy RGBA values
                        tileFrameData.data[tileIndex] = mergedFrameData[fullIndex];
                        tileFrameData.data[tileIndex + 1] = mergedFrameData[fullIndex + 1];
                        tileFrameData.data[tileIndex + 2] = mergedFrameData[fullIndex + 2];
                        tileFrameData.data[tileIndex + 3] = mergedFrameData[fullIndex + 3];
                    }
                }

                // Draw the tile onto the canvas
                ctx.putImageData(tileFrameData, 0, 0);

                // Add the tile frame to the encoder
                encoder.addFrame(ctx);

                // Store current frame as the previous frame for the next iteration
                previousFullFrameData = mergedFrameData;
            }

            encoder.finish(); // Finalize GIF
            console.log(`GIF created at ${outputPath}`);
        }
    }
}

module.exports = {
    splitGIFIntoGrid,
};
