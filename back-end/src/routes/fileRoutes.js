import express from 'express'
import db, { debugDatabase } from '../db.js' 
import multer from 'multer' 
import fs from 'fs' 
import axios from 'axios' 
import authMiddleware from '../middleware/authMiddleware.js' 
import FormData from 'form-data' 

const router = express.Router()

const upload = multer({ dest: 'uploads/' })

router.use(authMiddleware)

// Get all files for the authenticated user
router.get('/', (req, res) => {
    // const data = debugDatabase(); // Removed debug calls
    // console.table(data.users);   // Removed console logs
    // console.table(data.files);   // Removed console logs
    
    const getFiles = db.prepare('SELECT * FROM file WHERE user_id = ?')
    const files = getFiles.all(req.userId)
    res.json(files)
})

// Upload a file
router.post('/upload', upload.single('file'), async (req, res) => {
    // console.log('=== UPLOAD STARTED ===') // Removed console log

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' })
        }

        const filePath = req.file.path
        const fileStream = fs.createReadStream(filePath)

        const form = new FormData()
        form.append('file', fileStream, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        })

        const headers = {
            ...form.getHeaders(),
            Territory: process.env.TERRITORY,
            Account: process.env.ACCOUNT,
            Message: process.env.MESSAGE,
            Signature: process.env.SIGNATURE,
        }

        // console.log("Uploading to:", `${process.env.CESS_API_URL}/file`) // Removed console log

        const response = await axios.put(
            `${process.env.CESS_API_URL}/file`,
            form,
            { headers }
        )

        // console.log("CESS response:", response.data) // Removed console log

        if (response.data.code !== 200 || !response.data.data?.fid) {
            throw new Error(response.data.msg || "Upload failed")
        }

        const fid = response.data.data.fid

        // ✅ Insert into database
        const insertFile = db.prepare(`
            INSERT INTO file (hash, user_id, size, original_filename)
            VALUES (?, ?, ?, ?)
        `)
        insertFile.run(fid, req.userId, req.file.size, req.file.originalname)

        fs.unlinkSync(filePath) // cleanup temp file

        return res.json({
            success: true,
            fid,
            filename: req.file.originalname,
            size: req.file.size
        })

    } catch (err) {
        console.error('Upload error:', err.message)

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path)
        }

        // Handle CESS API errors specifically
        if (err.response) {
            return res.status(err.response.status || 500).json({ 
                error: err.response.data?.msg || 'CESS API Upload error' 
            });
        }
        
        return res.status(500).json({ error: err.message })
    }
})

// Download a file
router.get('/download/:hash', async (req, res) => {
    const { hash } = req.params;

    try {
        // Step 1: Fetch file from database
        const file = db.prepare('SELECT * FROM file WHERE hash = ?').get(hash);

        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Step 2: Fetch the file content from CESS API as a stream
        const cessResponse = await axios.get(
            `${process.env.CESS_API_URL}/file/download/${hash}`,
            {
                responseType: 'stream',
                headers: {
                    Territory: process.env.TERRITORY,
                    Account: process.env.ACCOUNT,
                    Message: process.env.MESSAGE,
                    Signature: process.env.SIGNATURE,
                }
            }
        );

        // Step 3: Set headers
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${file.original_filename}"`
        );

        const ext = file.original_filename.split('.').pop().toLowerCase();
        const mimeMap = {
            txt: 'text/plain',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            pdf: 'application/pdf',
            mp4: 'video/mp4',
            zip: 'application/zip',
            rar: 'application/x-rar-compressed',
            json: 'application/json',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };

        let contentType = mimeMap[ext] || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', file.size);

        // Step 4: Pipe the file content directly from CESS to the client
        cessResponse.data.pipe(res);

        cessResponse.data.on('error', (err) => {
            console.error('Error streaming file:', err);
            // Must check if headers were sent before attempting to set status
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error streaming the file' });
            }
        });

    } catch (err) {
        console.error('Download error:', err.message);
        
        if (err.response) {
            return res.status(err.response.status || 500).json({ 
                error: err.response.data?.msg || 'CESS API Download error' 
            });
        }
        
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a file
router.delete('/delete/:hash', async (req, res) => {
    const { hash } = req.params;
    // console.log('=== DELETE REQUEST STARTED ===') // Removed console log
    // console.log('Hash to delete:', hash)         // Removed console log
    // console.log('User ID:', req.userId)          // Removed console log

    try {
        // Step 1: Verify the file exists and belongs to the user
        const file = db.prepare('SELECT * FROM file WHERE hash = ? AND user_id = ?').get(hash, req.userId);
        
        if (!file) {
            // console.log('File not found or user unauthorized') // Removed console log
            return res.status(404).json({ 
                error: 'File not found or you do not have permission to delete this file' 
            });
        }

        // console.log('File found in database:', file) // Removed console log

        // Step 2: Call CESS API to delete the file
        const headers = {
            Territory: process.env.TERRITORY,
            Account: process.env.ACCOUNT,
            Message: process.env.MESSAGE,
            Signature: process.env.SIGNATURE,
        };

        // console.log('Calling CESS delete API...') // Removed console log
        // console.log('URL:', `${process.env.CESS_API_URL}/file/${hash}`) // Removed console log
        // console.log('Headers:', headers) // Removed console log

        const response = await axios.delete(
            `${process.env.CESS_API_URL}/file/${hash}`,
            { headers }
        );

        // console.log('CESS delete response:', response.data) // Removed console log

        // Step 3: Check CESS response
        if (response.data.code !== 200) {
            // console.log('CESS API returned error:', response.data.msg) // Removed console log
            throw new Error(response.data.msg || "Delete failed on CESS network");
        }

        // Step 4: Remove file from local database
        const deleteFile = db.prepare('DELETE FROM file WHERE hash = ?');
        const result = deleteFile.run(hash);

        // console.log('Database deletion result:', result) // Removed console log

        if (result.changes === 0) {
            throw new Error("Failed to delete file from database");
        }

        // console.log('=== DELETE COMPLETED SUCCESSFULLY ===') // Removed console log

        return res.json({
            success: true,
            message: 'File deleted successfully',
            deletedFile: {
                hash: file.hash,
                filename: file.original_filename,
                size: file.size
            }
        });

    } catch (err) {
        // We keep console.error to log the problem on the server side
        console.error('Delete error:', err.message) 
        
        // Differentiate between CESS API errors and other errors
        if (err.response) {
            // The request was made and the server responded with a status code
            console.error('CESS API error response:', err.response.data)
            
            // NOTE: We rely on the CESS API's status code (e.g., 400) and error message.
            return res.status(err.response.status || 500).json({ 
                error: err.response.data?.msg || 'CESS API error' 
            });
        } else if (err.request) {
            // The request was made but no response was received
            return res.status(503).json({ 
                error: 'CESS network unavailable. Please try again later.' 
            });
        } else {
            // Something happened in setting up the request
            return res.status(500).json({ 
                error: err.message || 'Internal server error' 
            });
        }
    }
});

export default router