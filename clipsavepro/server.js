const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const path = require('path');

const app = express();
const PORT = 10000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/youtube-download', async (req, res) => {
    const { url, quality } = req.body;
    
    if (!url) {
        return res.status(400).json({ success: false, error: 'URL দরকার' });
    }
    
    try {
        const info = await ytdl.getInfo(url);
        let format;
        
        if (quality === 'audio') {
            format = ytdl.chooseFormat(info.formats, { quality: 'lowestaudio', filter: 'audioonly' });
        } else {
            format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });
        }
        
        res.json({
            success: true,
            downloadUrl: format.url,
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url
        });
    } catch (error) {
        res.json({ success: false, error: 'ভিডিও পাওয়া যাচ্ছে না' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClipSavePro চলছে পোর্ট ${PORT} এ`);
});
