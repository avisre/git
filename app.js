const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

mongoose.connect('mongodb+srv://project:project@cluster0.kos1k7l.mongodb.net/fileuploads', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });

const File = mongoose.model('File', {
    filename: String,
    path: String,
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { originalname, path } = req.file;
        const file = new File({ filename: originalname, path: path });
        await file.save();
        res.json(file);
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// DELETE route to delete a file
app.delete('/files/:id', async (req, res) => {
    try {
        const fileId = req.params.id;

        // Find the file by ID
        const file = await File.findById(fileId);

        if (!file) {
            // File not found
            return res.status(404).json({ error: 'File not found' });
        }

        // Delete the file from the server
        const filePath = path.join(__dirname, 'uploads', file.filename);
        fs.unlinkSync(filePath);

        // Delete the file record from the database
        await File.findByIdAndDelete(fileId);

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/download/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (file) {
            res.download(file.path, file.filename);
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/files', async (req, res) => {
    try {
        const files = await File.find({});
        res.json({ files });
    } catch (error) {
        console.error('Error retrieving files:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
