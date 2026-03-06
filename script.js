let allEpisodes = [];
    let currentEp = null;
    let lang = 'en';

    // 1. DYNAMIC DATA LOADING
    async function initPortal() {
        const urlParams = new URLSearchParams(window.location.search);
        const seriesKey = urlParams.get('series') || 'db'; // Default to DB
        
        // Update Title UI
        const titles = {
            'db': 'Dragon Ball',
            'dbz': 'Dragon Ball Z',
            'dbzkai': 'Dragon Ball Z Kai',
            'dbzmovies': 'Movies & Specials',
            'dbgt':'Dragon Ball GT',
        };
        document.getElementById('series-title').innerText = titles[seriesKey] || 'CC Portal';

        try {
            // This attempts to fetch e.g., "dbz.json" or "db.json"
            const response = await fetch(`${seriesKey}.json`);
            if (!response.ok) throw new Error("JSON not found");
            allEpisodes = await response.json();
            renderList(allEpisodes);
        } catch (err) {
            console.error(err);
            // Fallback: If JSON is missing, show a helpful message
            document.getElementById('episode-list').innerHTML = `
                <div class="text-center p-8 text-gray-400">
                    <p class="mb-4">No data found for "${seriesKey}".</p>
                    <p class="text-xs">Create a file named <b>${seriesKey}.json</b> to populate this list.</p>
                </div>`;
        }
        lucide.createIcons();
    }

    function renderList(data) {
        const list = document.getElementById('episode-list');
        list.innerHTML = data.map(ep => `
            <div onclick="playEp(${ep.id})" class="p-3 rounded-lg bg-black/40 hover:bg-orange-600/20 border border-white/5 hover:border-orange-500/50 cursor-pointer transition-all group">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-[10px] text-orange-500 font-black tracking-tighter">EPISODE ${ep.id}</span>
                    <span class="text-[10px] text-gray-500">${ep.duration}</span>
                </div>
                <h4 class="text-sm font-bold text-gray-200 group-hover:text-white truncate">${ep.title}</h4>
            </div>`
        ).join('');
    }

    function handleSearch(query) {
        const filtered = allEpisodes.filter(ep => 
            ep.title.toLowerCase().includes(query.toLowerCase()) ||
            ep.id.toString() === query
        );
        renderList(filtered);
    }

    function playEp(id) {
        currentEp = allEpisodes.find(e => e.id === id);
        const video = document.getElementById('main-video');
        const source = document.getElementById('video-source');
        
        source.src = lang === 'en' ? currentEp.en : currentEp.jp;
        video.load();
        video.play();

        document.getElementById('display-title').innerText = currentEp.title;
        document.getElementById('display-meta').innerText = `NOW STREAMING • EPISODE ${currentEp.id}`;
        
        if (window.innerWidth < 1024) window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function switchLang(newLang) {
        lang = newLang;
        document.getElementById('btn-en').className = lang === 'en' ? 'px-4 py-1.5 rounded-md bg-orange-600 font-bold text-xs transition uppercase' : 'px-4 py-1.5 rounded-md font-bold text-xs transition uppercase hover:text-white text-gray-400';
        document.getElementById('btn-jp').className = lang === 'jp' ? 'px-4 py-1.5 rounded-md bg-orange-600 font-bold text-xs transition uppercase' : 'px-4 py-1.5 rounded-md font-bold text-xs transition uppercase hover:text-white text-gray-400';
        
        if (currentEp) playEp(currentEp.id);
    }

    window.onload = initPortal;