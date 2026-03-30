let player = null;
let allEpisodes = [];
let currentEp = null;

function initPortal() {
    const urlParams = new URLSearchParams(window.location.search);
    const seriesKey = urlParams.get('series') || 'db';
    
    const titles = {
        'db': 'Dragon Ball',
        'dbz': 'Dragon Ball Z',
        'dbzkai': 'Dragon Ball Z Kai',
        'dbzmovies': 'Movies',
        'dbgt': 'Dragon Ball GT',
    };
    document.getElementById('series-title').innerText = titles[seriesKey] || 'CC Portal';

    // Init Video.js player
    // @ts-ignore
    player = videojs('main-video', {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        html5: { 
            hls: { 
                overrideNative: true 
            },
            vhs: {
                overrideNative: true,
                allowSeeksWithinUnsafeLiveWindow: true,
                handleManifestRedirects: true,
            },
            nativeAudioTracks: false,
            nativeVideoTracks: false,
        },
        controlBar: {
            skipButtons: {
                backward: 5,
                forward: 5
            }
        }
    });
    player.on('keydown', (e) => {
        if (e.key === 'ArrowRight') player.currentTime(player.currentTime() + 10);
        if (e.key === 'ArrowLeft') player.currentTime(player.currentTime() - 10);
        if (e.key === ' ') player.paused() ? player.play() : player.pause();
    });

    // When a new source loads, read its audio tracks and build buttons
    player.on('loadedmetadata', () => {
        buildAudioKey(seriesKey);
    });

    // Load episodes via fetch (works on GitHub Pages / any HTTP server)
    fetch(`episodes/${seriesKey}.json`)
        .then(r => {
            if (!r.ok) throw new Error('not found');
            return r.json();
        })
        .then(data => {
            allEpisodes = data;
            if (allEpisodes.length === 0) {
                showEmpty(seriesKey);
            } else {
                renderList(allEpisodes);
            }
        })
        .catch(() => showEmpty(seriesKey));

    // @ts-ignore
    lucide.createIcons();
}

function showEmpty(seriesKey) {
    document.getElementById('episode-list').innerHTML = `
        <div class="text-center p-8 text-gray-400">
            <p class="mb-4">No episodes available yet for "${seriesKey}".</p>
        </div>`;
}

// ── AUDIO TRACK BUTTONS ───────────────────────────────────────────────
// Called after loadedmetadata — reads actual tracks from the HLS manifest
async function buildAudioKey(series) {
    const container = document.getElementById('audio-track-key');
    
    try {
        console.log("Fetching audio tracks");
        const res = await fetch('tracknames.json');
        const data = await res.json();
        const entry = data.find(d => d.series === series);
        
        if (!entry) {
            container.innerHTML = '<span class="text-gray-500">No track info available</span>';
            return;
        }

        const tracks = Object.entries(entry)
            .filter(([k]) => k.startsWith('audio_'))
            .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));

        container.innerHTML = tracks.map(([key, label], i) =>
            `<span>
                <span class="text-orange-400 font-bold">${key.replace('_', ' ')}</span> = ${label}
            </span>${i < tracks.length - 1 ? '<span class="text-gray-600">|</span>' : ''}`
        ).join('');

    } catch (e) {
        container.innerHTML = '<span class="text-gray-500">Could not load track info</span>';
    }
}

// function switchAudioTrack(selectedIndex) {
//     const tracks = player.audioTracks();
//     for (let i = 0; i < tracks.length; i++) {
//         tracks[i].enabled = (i === selectedIndex);
//     }

//     // Update active button styling
//     const buttons = document.querySelectorAll('#audio-track-buttons .audio-btn');
//     buttons.forEach((btn, i) => {
//         btn.classList.toggle('active', i === selectedIndex);
//     });
// }
// ─────────────────────────────────────────────────────────────────────

function renderList(data) {
    const list = document.getElementById('episode-list');
    list.innerHTML = data.map(ep => `
        <div onclick="playEp(${ep.id})" class="p-3 rounded-lg bg-black/40 hover:bg-orange-600/20 border border-white/5 hover:border-orange-500/50 cursor-pointer transition-all group">
            <div class="flex justify-between items-center mb-1">
                <span class="text-[10px] text-orange-500 font-black tracking-tighter">EPISODE ${ep.id}</span>
                <span class="text-[10px] text-gray-500">${ep.duration || ''}</span>
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

    player.src({ type: 'application/x-mpegURL', src: currentEp.hls });
    player.play();

    document.getElementById('display-title').innerText = currentEp.title;
    document.getElementById('display-meta').innerText = `NOW STREAMING • EPISODE ${currentEp.id}`;

    console.log(player.duration());
    console.log(player.currentSrc());
    // @ts-ignore
    console.log(document.getElementById('main-video').readyState);
    
    // Reset audio buttons while new source loads
    document.getElementById('audio-track-key').innerHTML = 
        '<span class="text-xs text-gray-500 p-2">Loading tracks...</span>';
    
    if (window.innerWidth < 1024) window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.onload = initPortal;
