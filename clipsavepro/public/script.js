let currentPlatform = 'all';

// Platform button handlers
document.querySelectorAll('.platform-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPlatform = btn.dataset.platform;
        
        const qualitySelector = document.getElementById('qualitySelector');
        if (currentPlatform === 'youtube') {
            qualitySelector.style.display = 'block';
        } else {
            qualitySelector.style.display = 'none';
        }
        
        const urlInput = document.getElementById('urlInput');
        const placeholders = {
            youtube: 'Paste YouTube URL (e.g., https://youtube.com/watch?v=...)',
            facebook: 'Paste Facebook Video URL',
            instagram: 'Paste Instagram Reel/Post URL',
            tiktok: 'Paste TikTok Video URL',
            all: 'Paste video link from any platform...'
        };
        urlInput.placeholder = placeholders[currentPlatform] || placeholders.all;
    });
});

// Download handler
document.getElementById('downloadBtn').addEventListener('click', async () => {
    const url = document.getElementById('urlInput').value.trim();
    const quality = document.getElementById('qualitySelect')?.value || 'highest';
    const downloadBtn = document.getElementById('downloadBtn');
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    
    if (!url) {
        showError('Please enter a video URL');
        return;
    }
    
    // Show loading state
    downloadBtn.disabled = true;
    downloadBtn.querySelector('.btn-text').style.display = 'none';
    downloadBtn.querySelector('.loading-spinner').style.display = 'inline-block';
    resultDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    
    try {
        let response;
        
        if (currentPlatform === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
            response = await fetch('/api/youtube-download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, quality })
            });
        } else {
            response = await fetch('/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, platform: currentPlatform })
            });
        }
        
        const data = await response.json();
        
        if (data.success) {
            if (data.title) {
                document.getElementById('videoTitle').textContent = data.title;
                document.getElementById('thumbnail').src = data.thumbnail;
                const minutes = Math.floor(data.duration / 60);
                const seconds = data.duration % 60;
                document.getElementById('videoMeta').textContent = `By ${data.author} • ${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            document.getElementById('downloadLink').href = data.downloadUrl;
            resultDiv.style.display = 'block';
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            showError(data.error || 'Failed to process video. Please try again.');
        }
    } catch (error) {
        showError('Network error. Please check your connection and try again.');
    } finally {
        downloadBtn.disabled = false;
        downloadBtn.querySelector('.btn-text').style.display = 'inline';
        downloadBtn.querySelector('.loading-spinner').style.display = 'none';
    }
});

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Enter key support
document.getElementById('urlInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('downloadBtn').click();
    }
});
