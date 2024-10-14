const contentTypeBtn = document.getElementById('contentTypeBtn');
const contentIdInput = document.getElementById('contentId');
const streamForm = document.getElementById('streamForm');
const videoContainer = document.getElementById('videoContainer');
const embedPrefix = document.getElementById('embedPrefix');
const tvInputs = document.getElementById('tvInputs');
const seasonInput = document.getElementById('seasonInput');
const episodeInput = document.getElementById('episodeInput');
const contentInfo = document.getElementById('contentInfo');
const contentTitle = document.getElementById('contentTitle');
const contentYear = document.getElementById('contentYear');
const contentDescription = document.getElementById('contentDescription');

const embedDomains = ['vidsrc.to', 'vidsrc.me', 'vidsrc.xyz', 'vidsrc.net'];
let currentDomainIndex = 0;
let contentType = 'movie';

const OMDB_API_KEY = 'd57def1f'; // Replace with your actual OMDb API key

// Load saved data from cookies
window.onload = () => {
    contentType = getCookie('contentType') || 'movie';
    contentIdInput.value = getCookie('contentId') || '';
    seasonInput.value = getCookie('season') || '1';
    episodeInput.value = getCookie('episode') || '1';
    updateContentTypeButton();
    updateEmbedPrefix();
    tvInputs.style.display = contentType === 'tv' ? 'flex' : 'none';
};

contentTypeBtn.addEventListener('click', () => {
    contentType = contentType === 'movie' ? 'tv' : 'movie';
    updateContentTypeButton();
    updateEmbedPrefix();
    tvInputs.style.display = contentType === 'tv' ? 'flex' : 'none';
    setCookie('contentType', contentType, 30);
});

streamForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const contentId = contentIdInput.value.trim();
    if (contentId) {
        let embedUrl = `https://${embedDomains[currentDomainIndex]}/embed/${contentType}/${contentId}`;
        if (contentType === 'tv') {
            const season = seasonInput.value;
            const episode = episodeInput.value;
            if (season && episode) {
                embedUrl += `//${season}/${episode}`;
                setCookie('season', season, 30);
                setCookie('episode', episode, 30);
            } else {
                alert('Season and episode numbers are required for TV series.');
                return;
            }
        }
        updateVideoContainer(embedUrl);
        fetchContentInfo(contentId);
        setCookie('contentId', contentId, 30);
        currentDomainIndex = (currentDomainIndex + 1) % embedDomains.length;
    } else {
        alert('Please enter a valid IMDb ID.');
    }
});

function updateVideoContainer(embedUrl) {
    videoContainer.innerHTML = `<iframe src="${embedUrl}" frameborder="0" allowfullscreen referrerpolicy="origin" class="absolute top-0 left-0 w-full h-full"></iframe>`;
}

function updateEmbedPrefix() {
    embedPrefix.textContent = `https://${embedDomains[currentDomainIndex]}/embed/${contentType}`;
}

function updateContentTypeButton() {
    contentTypeBtn.querySelector('span').textContent = contentType;
}

async function fetchContentInfo(imdbId) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbId}`);
        const data = await response.json();
        if (data.Response === "True") {
            contentTitle.textContent = data.Title;
            contentYear.textContent = `${data.Year} • ${data.Runtime}`;
            contentDescription.textContent = data.Plot;
            contentInfo.classList.add('visible');
        } else {
            throw new Error(data.Error);
        }
    } catch (error) {
        console.error('Error fetching content info:', error);
        contentInfo.classList.remove('visible');
        alert('Error fetching content information. Please check the IMDb ID and try again.');
    }
}

function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName.trim() === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}

// Initial update of embed prefix
updateEmbedPrefix();
