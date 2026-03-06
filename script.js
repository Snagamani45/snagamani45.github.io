let episodes = [];
let currentEp = null;
let lang = 'en';

async function loadData() {
    try {
        // This is the line that actually "downloads" the file
        const response = await fetch('dbepisodes.json');
        
        // This line converts the text in the file into a JS Array
        episodes = await response.json();
        
        // Now that the data is here, you can draw the list on the screen
        renderList(episodes);
        
    } catch (error) {
        console.error("The JSON file failed to load:", error);
    }
}

// 2. RENDER FUNCTION
function renderList(data) {
    const list = document.getElementById('episode-list');
    list.innerHTML = data.map(ep => `
        <div onclick="playEp(${ep.id})" class="p-3 rounded-lg bg-gray-800/50 hover:bg-orange-600/20 border border-transparent hover:border-orange-500/50 cursor-pointer transition group">
            <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500 group-hover:text-orange-400 font-mono">EP ${ep.id}</span>
                <span class="text-[10px] text-gray-600">${ep.duration}</span>
            </div>
            <h4 class="text-sm font-medium truncate">${ep.title}</h4>
        </div>
    `).join('');
}

// 3. SEARCH LOGIC
function handleSearch(query) {
    const filtered = episodes.filter(ep => 
        ep.title.toLowerCase().includes(query.toLowerCase())
    );
    renderList(filtered);
}

// 4. PLAYER LOGIC
function playEp(id) {
    currentEp = episodes.find(e => e.id === id);
    const video = document.getElementById('main-video');
    const source = document.getElementById('video-source');
    
    source.src = lang === 'en' ? currentEp.en : currentEp.jp;
    video.load();
    video.play();

    document.getElementById('display-title').innerText = currentEp.title;
    document.getElementById('display-meta').innerText = `Episode ${currentEp.id} • ${lang.toUpperCase()}`;
}

function switchLang(newLang) {
    lang = newLang;
    document.getElementById('btn-en').className = lang === 'en' ? 'px-4 py-2 rounded bg-orange-600 font-bold text-xs uppercase' : 'px-4 py-2 rounded bg-gray-800 font-bold text-xs uppercase';
    document.getElementById('btn-jp').className = lang === 'jp' ? 'px-4 py-2 rounded bg-orange-600 font-bold text-xs uppercase' : 'px-4 py-2 rounded bg-gray-800 font-bold text-xs uppercase';
    
    if (currentEp) playEp(currentEp.id);
}

// Initialize
window.onload = () => {
    renderList(episodes);
    lucide.createIcons();
};