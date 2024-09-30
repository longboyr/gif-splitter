const express = require('express');
const multer = require('multer');
const path = require('path');
const { splitGIFIntoGrid } = require('./gifProcessor');
const fs = require('fs');

const app = express();
const port = 3000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files from the "output" directory
app.use('/output', express.static(path.join(__dirname, 'output')));

// Serve the index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Helper function to clear the output directory
function clearOutputDirectory(outputDir) {
    if (fs.existsSync(outputDir)) {
        fs.readdirSync(outputDir).forEach(file => {
            const filePath = path.join(outputDir, file);
            if (fs.lstatSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
            }
        });
    }
}

// Handle file uploads
app.post('/upload', upload.single('gif'), async (req, res) => {
    const filePath = req.file.path;
    const rows = parseInt(req.body.n, 10) || 2;
    const columns = parseInt(req.body.m, 10) || 2;

    const outputDir = 'output';

    // Create the output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // Clear the output directory before creating new files
    clearOutputDirectory(outputDir);

    try {
        // Process the GIF and split it into grid pieces
        await splitGIFIntoGrid(filePath, rows, columns);

        // Generate file paths for the split GIFs
        const gridFiles = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                gridFiles.push(`/output/output_${row}_${col}.gif`);
            }
        }

        // Return the list of file paths to the client
        res.json({ gridFiles });
    } catch (error) {
        console.error('Error processing GIF:', error);
        res.status(500).json({ error: 'Error processing GIF' });
    } finally {
        // Optionally: Delete the uploaded file after processing
        fs.unlinkSync(filePath);
    }
});

app.post('/clear-output', (req, res) => {
    fs.readdirSync('output').forEach(file => {
        fs.unlinkSync(path.join('output', file));
    });
    res.json({ message: 'Output directory cleared' });
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
