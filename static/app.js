// AuraVocal - Frontend Application Logic

const API_BASE = "";

// State
let state = {
  status: {},
  jobs: { processing: [], queue: [], done: [] },
  files: [],
  currentTrack: null,
  activeLogJob: null,
  isWatcherRunning: false
};

// DOM Elements
const elements = {
  // Telemetry
  gpuValue: document.getElementById("gpu-value"),
  watcherStatus: document.getElementById("watcher-status"),
  watcherDot: document.getElementById("watcher-dot"),
  btnToggleWatcher: document.getElementById("btn-toggle-watcher"),
  btnOpenTerminal: document.getElementById("btn-open-terminal"),

  // Form
  jobForm: document.getElementById("job-form"),
  inputUrl: document.getElementById("input-url"),
  inputTitle: document.getElementById("input-title"),
  inputStart: document.getElementById("input-start"),
  inputEnd: document.getElementById("input-end"),
  btnFetchMeta: document.getElementById("btn-fetch-meta"),
  fetchText: document.getElementById("fetch-text"),
  fetchSpinner: document.getElementById("fetch-spinner"),
  btnSubmitJob: document.getElementById("btn-submit-job"),

  // Tabs & Lists
  tabButtons: document.querySelectorAll(".tab-btn"),
  tabContents: document.querySelectorAll(".tab-content"),
  badgeActiveCount: document.getElementById("badge-active-count"),
  badgeLibraryCount: document.getElementById("badge-library-count"),
  btnRefreshData: document.getElementById("btn-refresh-data"),
  listProcessing: document.getElementById("list-processing"),
  listQueue: document.getElementById("list-queue"),
  listCompleted: document.getElementById("list-completed"),

  // Audio Player Dock
  audioPlayer: document.getElementById("global-audio-player"),
  playerTitle: document.getElementById("player-title"),
  playerStatus: document.getElementById("player-status"),
  btnPlayPause: document.getElementById("btn-play-pause"),
  iconPlay: document.getElementById("icon-play"),
  iconPause: document.getElementById("icon-pause"),
  btnSeekBack: document.getElementById("btn-seek-back"),
  btnSeekFwd: document.getElementById("btn-seek-fwd"),
  seekSlider: document.getElementById("seek-slider"),
  currentTime: document.getElementById("current-time"),
  durationTime: document.getElementById("duration-time"),
  volumeSlider: document.getElementById("volume-slider"),
  btnMute: document.getElementById("btn-mute"),
  playerDownloadLink: document.getElementById("player-download-link"),

  // Terminal Drawer
  logDrawer: document.getElementById("log-drawer"),
  logDrawerTitle: document.getElementById("log-drawer-title"),
  logContent: document.getElementById("log-content"),
  btnCloseLog: document.getElementById("btn-close-log"),
  btnClearLog: document.getElementById("btn-clear-log"),

  // Toast
  toastContainer: document.getElementById("toast-container")
};

// Utilities
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function colorizeLog(text) {
  if (!text) return "No logs found.";
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/(\[demucs\])/gi, '<span class="log-tag-demucs">$1</span>')
    .replace(/(\[ffmpeg\])/gi, '<span class="log-tag-ffmpeg">$1</span>')
    .replace(/(\[yt-dlp\])/gi, '<span class="log-tag-ytdlp">$1</span>')
    .replace(/(\[OK\])/gi, '<span class="log-tag-ok">$1</span>')
    .replace(/(ERROR[^\n]*)/gi, '<span class="log-tag-error">$1</span>');
}

// Fetch System Status
async function fetchStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/status`);
    if (!res.ok) return;
    const data = await res.json();
    state.status = data;

    // Render Hardware / GPU
    if (data.cuda_available) {
      elements.gpuValue.innerText = data.gpu_name.replace("NVIDIA ", "");
      elements.gpuValue.parentElement.querySelector(".status-dot").className = "status-dot green";
    } else {
      elements.gpuValue.innerText = "CPU (Slow)";
      elements.gpuValue.parentElement.querySelector(".status-dot").className = "status-dot red";
    }

    // Render Watcher Service
    state.isWatcherRunning = data.watcher_running;
    if (data.watcher_running) {
      elements.watcherStatus.innerText = "Active";
      elements.watcherDot.className = "status-dot green";
      elements.btnToggleWatcher.title = "Stop background watcher service";
    } else {
      elements.watcherStatus.innerText = "Stopped";
      elements.watcherDot.className = "status-dot red";
      elements.btnToggleWatcher.title = "Start background watcher service";
    }
  } catch (err) {
    console.error("fetchStatus error:", err);
  }
}

// Fetch Jobs
async function fetchJobs() {
  try {
    const res = await fetch(`${API_BASE}/api/jobs`);
    if (!res.ok) return;
    const data = await res.json();
    state.jobs = data;

    renderProcessingList(data.processing || []);
    renderQueueList(data.queue || []);

    const totalActive = (data.processing?.length || 0) + (data.queue?.length || 0);
    elements.badgeActiveCount.innerText = totalActive;
  } catch (err) {
    console.error("fetchJobs error:", err);
  }
}

// Fetch Output Files
async function fetchFiles() {
  try {
    const res = await fetch(`${API_BASE}/api/files`);
    if (!res.ok) return;
    const data = await res.json();
    state.files = data.files || [];
    renderFilesList(state.files);
    elements.badgeLibraryCount.innerText = state.files.length;
  } catch (err) {
    console.error("fetchFiles error:", err);
  }
}

// Render Processing List
function renderProcessingList(items) {
  if (items.length === 0) {
    elements.listProcessing.innerHTML = `
      <div class="empty-state">
        <p>No jobs currently separating. Submit a track on the left to begin.</p>
      </div>`;
    return;
  }

  elements.listProcessing.innerHTML = items.map(job => `
    <div class="item-card processing">
      <div class="item-left">
        <div class="item-icon processing">
          <div class="spinner"></div>
        </div>
        <div class="item-info">
          <div class="item-title">${escapeHtml(job.title)}</div>
          <div class="item-meta">
            <span>Processing on GPU</span>
            ${job.start && job.end ? `<span>• Trim: ${job.start} - ${job.end}</span>` : ""}
          </div>
        </div>
      </div>
      <div class="item-actions">
        <button class="icon-btn" onclick="openLog('${job.filename}')" title="Inspect Live Log">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 17 10 11 4 5"></polyline>
            <line x1="12" y1="19" x2="20" y2="19"></line>
          </svg>
        </button>
      </div>
    </div>
  `).join("");
}

// Render Queue List
function renderQueueList(items) {
  if (items.length === 0) {
    elements.listQueue.innerHTML = `
      <div class="empty-state">
        <p>Queue is empty.</p>
      </div>`;
    return;
  }

  elements.listQueue.innerHTML = items.map(job => `
    <div class="item-card">
      <div class="item-left">
        <div class="item-icon queued">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="item-info">
          <div class="item-title">${escapeHtml(job.title)}</div>
          <div class="item-meta">
            <span>Waiting in line</span>
            ${job.start && job.end ? `<span>• Trim: ${job.start} - ${job.end}</span>` : ""}
          </div>
        </div>
      </div>
      <div class="item-actions">
        <button class="icon-btn danger" onclick="deleteJob('queue', '${job.filename}')" title="Cancel Job">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  `).join("");
}

// Render Completed Library
function renderFilesList(files) {
  if (files.length === 0) {
    elements.listCompleted.innerHTML = `
      <div class="empty-state">
        <p>No separated audio tracks yet. Completed tracks will be stored here.</p>
      </div>`;
    return;
  }

  elements.listCompleted.innerHTML = files.map(file => {
    const isCurrent = state.currentTrack && state.currentTrack.filename === file.filename;
    return `
      <div class="item-card ${isCurrent ? 'processing' : ''}">
        <div class="item-left">
          <div class="item-icon done">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
          <div class="item-info">
            <div class="item-title">${escapeHtml(file.title)}</div>
            <div class="item-meta">
              <span>${file.size_mb} MB</span>
              <span>•</span>
              <span>44.1kHz Stereo WAV</span>
            </div>
          </div>
        </div>
        <div class="item-actions">
          <button class="icon-btn" onclick="playTrack('${file.filename}', '${escapeHtml(file.title)}')" title="Play Instrumental Track">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
          <a class="icon-btn" href="/api/audio/${encodeURIComponent(file.filename)}" download title="Download WAV">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </a>
          <button class="icon-btn danger" onclick="deleteAudioFile('${file.filename}')" title="Delete Track">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[m]);
}

// Fetch YouTube Metadata
async function fetchMetadata() {
  const url = elements.inputUrl.value.trim();
  if (!url) return;

  elements.fetchText.classList.add("hidden");
  elements.fetchSpinner.classList.remove("hidden");
  elements.btnFetchMeta.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/api/metadata?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (data.title) {
      elements.inputTitle.value = data.title;
      showToast(`Found: "${data.title}"`, "success");
    } else {
      showToast("Could not auto-fetch title. Please enter title manually.", "info");
    }
  } catch (err) {
    showToast("Error querying YouTube metadata.", "error");
  } finally {
    elements.fetchText.classList.remove("hidden");
    elements.fetchSpinner.classList.add("hidden");
    elements.btnFetchMeta.disabled = false;
  }
}

// Submit New Separation Job
elements.jobForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const url = elements.inputUrl.value.trim();
  const title = elements.inputTitle.value.trim();
  const start = elements.inputStart.value.trim();
  const end = elements.inputEnd.value.trim();

  if (!url) {
    showToast("Please enter a valid YouTube URL", "error");
    return;
  }

  elements.btnSubmitJob.disabled = true;
  try {
    const res = await fetch(`${API_BASE}/api/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, title, start: start || null, end: end || null })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`Track "${data.title}" queued for separation!`, "success");
      elements.inputUrl.value = "";
      elements.inputTitle.value = "";
      elements.inputStart.value = "";
      elements.inputEnd.value = "";
      fetchJobs();
    } else {
      showToast(data.detail || "Failed to queue job", "error");
    }
  } catch (err) {
    showToast("Network error submitting job", "error");
  } finally {
    elements.btnSubmitJob.disabled = false;
  }
});

// Delete Job
window.deleteJob = async function(folder, filename) {
  if (!confirm(`Cancel job "${filename}"?`)) return;
  try {
    const res = await fetch(`${API_BASE}/api/jobs/${folder}/${filename}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Job removed from queue.", "info");
      fetchJobs();
    }
  } catch (err) {
    showToast("Failed to delete job", "error");
  }
};

// Delete Audio File
window.deleteAudioFile = async function(filename) {
  if (!confirm(`Permanently delete audio file "${filename}"?`)) return;
  try {
    const res = await fetch(`${API_BASE}/api/audio/${encodeURIComponent(filename)}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Audio track deleted.", "info");
      if (state.currentTrack && state.currentTrack.filename === filename) {
        elements.audioPlayer.pause();
        elements.playerTitle.innerText = "Select a track to play";
        elements.iconPlay.classList.remove("hidden");
        elements.iconPause.classList.add("hidden");
      }
      fetchFiles();
    }
  } catch (err) {
    showToast("Failed to delete audio file", "error");
  }
};

// Play Track
window.playTrack = function(filename, title) {
  state.currentTrack = { filename, title };
  elements.playerTitle.innerText = title;
  elements.playerStatus.innerText = "Ready to play";
  elements.playerDownloadLink.href = `/api/audio/${encodeURIComponent(filename)}`;
  elements.playerDownloadLink.download = filename;

  elements.audioPlayer.src = `/api/audio/${encodeURIComponent(filename)}`;
  elements.audioPlayer.play();
  elements.iconPlay.classList.add("hidden");
  elements.iconPause.classList.remove("hidden");
  renderFilesList(state.files);
};

// Player Event Listeners
elements.btnPlayPause.addEventListener("click", () => {
  if (!elements.audioPlayer.src) return;
  if (elements.audioPlayer.paused) {
    elements.audioPlayer.play();
    elements.iconPlay.classList.add("hidden");
    elements.iconPause.classList.remove("hidden");
  } else {
    elements.audioPlayer.pause();
    elements.iconPlay.classList.remove("hidden");
    elements.iconPause.classList.add("hidden");
  }
});

elements.audioPlayer.addEventListener("timeupdate", () => {
  const current = elements.audioPlayer.currentTime;
  const duration = elements.audioPlayer.duration || 0;
  elements.currentTime.innerText = formatTime(current);
  elements.durationTime.innerText = formatTime(duration);
  if (duration > 0) {
    elements.seekSlider.value = (current / duration) * 100;
  }
});

elements.audioPlayer.addEventListener("ended", () => {
  elements.iconPlay.classList.remove("hidden");
  elements.iconPause.classList.add("hidden");
});

elements.seekSlider.addEventListener("input", () => {
  const duration = elements.audioPlayer.duration || 0;
  if (duration > 0) {
    elements.audioPlayer.currentTime = (elements.seekSlider.value / 100) * duration;
  }
});

elements.btnSeekBack.addEventListener("click", () => {
  elements.audioPlayer.currentTime = Math.max(0, elements.audioPlayer.currentTime - 10);
});

elements.btnSeekFwd.addEventListener("click", () => {
  elements.audioPlayer.currentTime = Math.min(elements.audioPlayer.duration || 0, elements.audioPlayer.currentTime + 10);
});

elements.volumeSlider.addEventListener("input", (e) => {
  elements.audioPlayer.volume = parseFloat(e.target.value);
});

elements.btnMute.addEventListener("click", () => {
  elements.audioPlayer.muted = !elements.audioPlayer.muted;
  elements.btnMute.style.opacity = elements.audioPlayer.muted ? "0.4" : "1";
});

// Logs Drawer
window.openLog = async function(jobName) {
  state.activeLogJob = jobName;
  elements.logDrawerTitle.innerText = `Job Log: ${jobName}`;
  elements.logDrawer.classList.add("open");
  loadLogContent(jobName);
};

async function loadLogContent(jobName) {
  try {
    const res = await fetch(`${API_BASE}/api/logs/${encodeURIComponent(jobName)}`);
    const data = await res.json();
    elements.logContent.innerHTML = colorizeLog(data.log);
    elements.logContent.parentElement.scrollTop = elements.logContent.parentElement.scrollHeight;
  } catch (err) {
    elements.logContent.innerText = "Error loading log.";
  }
}

elements.btnCloseLog.addEventListener("click", () => {
  elements.logDrawer.classList.remove("open");
  state.activeLogJob = null;
});

elements.btnClearLog.addEventListener("click", () => {
  elements.logContent.innerText = "";
});

elements.btnOpenTerminal.addEventListener("click", () => {
  elements.logDrawerTitle.innerText = "System & Job Logs";
  elements.logDrawer.classList.add("open");
  if (state.jobs.processing.length > 0) {
    loadLogContent(state.jobs.processing[0].filename);
  } else if (state.jobs.done.length > 0) {
    loadLogContent(state.jobs.done[0].filename);
  } else {
    elements.logContent.innerText = "No active job logs currently. System is idle.";
  }
});

// Watcher Toggle
elements.btnToggleWatcher.addEventListener("click", async () => {
  const endpoint = state.isWatcherRunning ? "/api/watcher/stop" : "/api/watcher/start";
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { method: "POST" });
    const data = await res.json();
    showToast(state.isWatcherRunning ? "Watcher stopped." : "Watcher started.", "info");
    fetchStatus();
  } catch (err) {
    showToast("Failed to toggle watcher.", "error");
  }
});

// Tab Switching
elements.tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    elements.tabButtons.forEach(b => b.classList.remove("active"));
    elements.tabContents.forEach(c => c.classList.remove("active"));

    btn.classList.add("active");
    const targetId = btn.getAttribute("data-tab");
    document.getElementById(targetId).classList.add("active");
  });
});

// Auto metadata fetch on URL paste
elements.btnFetchMeta.addEventListener("click", fetchMetadata);
elements.inputUrl.addEventListener("paste", () => setTimeout(fetchMetadata, 100));
elements.btnRefreshData.addEventListener("click", () => {
  fetchStatus();
  fetchJobs();
  fetchFiles();
  showToast("Refreshed data.", "info");
});

// Lifecycle Polling (every 2.5s)
fetchStatus();
fetchJobs();
fetchFiles();

setInterval(() => {
  fetchStatus();
  fetchJobs();
  fetchFiles();
  if (state.activeLogJob && elements.logDrawer.classList.contains("open")) {
    loadLogContent(state.activeLogJob);
  }
}, 2500);
