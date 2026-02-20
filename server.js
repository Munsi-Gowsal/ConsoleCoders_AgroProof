import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5173;

// Disable caching for development
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// Serve static files
app.use(express.static(__dirname));

// Serve node_modules for imports
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Fallback to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n  🌾 AgriProof running at:`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/\n`);
});
