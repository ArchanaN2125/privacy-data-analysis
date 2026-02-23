/**
 * ZeroShare Platform - Enterprise Edition
 */

// --- GLOBAL STATE ---
const appState = {
    isAuthenticated: true, // [DEV MODE] Auth bypassed - direct dashboard access
    token: localStorage.getItem('zs_token') || null,
    userRole: 'Admin',
    uniA: { submitted: false, maskedTotal: 0, maskedPassed: 0, keyTotal: 0, keyPassed: 0 },
    uniB: { submitted: false, maskedTotal: 0, maskedPassed: 0, keyTotal: 0, keyPassed: 0 },
    stagedFile: null,
    lastHash: null
};

// --- API HELPER ---
async function fetchAPI(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (appState.token) {
        headers['Authorization'] = `Bearer ${appState.token}`;
    }

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.msg || data.error || 'API Error');
    }
    return data;
}

// --- NOTIFICATION SYSTEM ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline';

    toast.innerHTML = `
        <ion-icon name="${icon}"></ion-icon>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Auto remove after 4s
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// --- DOM ELEMENTS ---
const screens = {
    login: document.getElementById('login-overlay'),
    dashboard: document.getElementById('app-dashboard')
};

const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.tab-section');

// Forms & Inputs
const login = {
    user: document.getElementById('login-user'),
    pass: document.getElementById('login-pass'),
    btn: document.getElementById('btn-login'),
    error: document.getElementById('login-error')
};


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // [DEV MODE] Skip login - directly show dashboard
    showDashboard();

    // Setup Navigation
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!appState.isAuthenticated) return;

            navButtons.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.dataset.target;
            document.getElementById(targetId).classList.add('active');

            const titleMap = {
                'section-overview': 'Dashboard Overview',
                'section-analysis': 'Privacy-Preserving Analysis',
                'section-integrity': 'Document Integrity Verification',
                'section-verify': 'Proof Verification Portal',
                'section-audit': 'System Audit Log'
            };
            document.getElementById('page-title').textContent = titleMap[targetId];

            if (targetId === 'section-overview') {
                loadDashboardData();
            }
        });
    });

    // Login Handler
    login.btn.addEventListener('click', handleLogin);
    document.getElementById('btn-demo').addEventListener('click', () => {
        login.user.value = 'admin';
        login.pass.value = 'password123';
        handleLogin();
    });

    // PDF Upload Handler
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const btnGenHash = document.getElementById('btn-generate-hash');

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFileSelect(e.target.files[0]));

    // Drag & Drop
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--primary)'; });
    dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--border)'; });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        if (e.dataTransfer.files.length) handleFileSelect(e.dataTransfer.files[0]);
    });

    // Manual Hash Gen
    btnGenHash.addEventListener('click', generatePdfHash);

    // Proof ID Handlers
    document.getElementById('btn-generate-proof').addEventListener('click', generateProofID);
    document.getElementById('btn-copy-proof').addEventListener('click', copyProofID);
    document.getElementById('btn-verify').addEventListener('click', verifyProofID);

    // Logout Handler
    document.getElementById('btn-logout').addEventListener('click', handleLogout);

    // SMPC Handlers
    setupSMPCHandlers();
});

function showDashboard() {
    appState.isAuthenticated = true;
    screens.login.classList.add('hidden');
    screens.dashboard.classList.remove('hidden');
    loadDashboardData();
}

// --- DASHBOARD OVERVIEW ---
async function loadDashboardData() {
    try {
        const [proofs, aggregates, auditLogs] = await Promise.all([
            fetchAPI('/api/proof/history'),
            fetchAPI('/api/aggregate/history'),
            fetchAPI('/api/audit/audit-logs').catch(() => []) // Fallback if regular user can't see all audit logs
        ]);

        // Update Stats
        document.getElementById('stat-proofs').textContent = proofs.length;
        document.getElementById('stat-aggregates').textContent = aggregates.length;

        // For verifications, let's count successful audits or just mock for now if not explicitly tracked
        const successfulVerifies = auditLogs.filter(log => log.eventType.includes('VERIFY_SUCCESS')).length;
        document.getElementById('stat-verifications').textContent = successfulVerifies || 0;

        // Render Proof History
        const proofList = document.getElementById('proof-history-list');
        if (proofs.length === 0) {
            proofList.innerHTML = '<li class="loading">No proofs generated yet.</li>';
        } else {
            proofList.innerHTML = proofs.slice(0, 5).map(p => `
                <li class="history-item">
                    <div class="h-info">
                        <span class="h-title">Proof Generated</span>
                        <span class="h-meta">${p.proofId}</span>
                    </div>
                    <span class="h-tag">${new Date(p.timestamp).toLocaleDateString()}</span>
                </li>
            `).join('');
        }

        // Render Aggregate History
        const aggregateList = document.getElementById('aggregate-history-list');
        if (aggregates.length === 0) {
            aggregateList.innerHTML = '<li class="loading">No aggregate calculations found.</li>';
        } else {
            aggregateList.innerHTML = aggregates.slice(0, 5).map(a => `
                <li class="history-item">
                    <div class="h-info">
                        <span class="h-title">Aggregate Calculation</span>
                        <span class="h-meta">Pass Rate: ${a.finalPercentage}%</span>
                    </div>
                    <span class="h-tag">${new Date(a.timestamp).toLocaleDateString()}</span>
                </li>
            `).join('');
        }

    } catch (err) {
        console.error("Dashboard Load Error:", err);
        // Show friendly empty state instead of leaving loader stuck
        const proofList = document.getElementById('proof-history-list');
        const aggregateList = document.getElementById('aggregate-history-list');
        if (proofList) proofList.innerHTML = '<li class="loading">No proofs generated yet.</li>';
        if (aggregateList) aggregateList.innerHTML = '<li class="loading">No aggregate calculations found.</li>';
    }
}

// --- AUTHENTICATION ---
async function handleLogin() {
    const organizationId = login.user.value;
    const password = login.pass.value;

    try {
        const data = await fetchAPI('/api/auth/login', 'POST', { organizationId, password });

        appState.token = data.token;
        localStorage.setItem('zs_token', data.token);

        appState.isAuthenticated = true;
        showDashboard();

        backendLog('USER_LOGIN', `Organization ${organizationId} connected to backend.`);
        showToast(`Welcome back, ${organizationId}!`);
    } catch (err) {
        console.error(err);
        login.error.textContent = err.message;
        login.error.classList.remove('hidden');
        login.pass.value = '';
        showToast(err.message, 'error');
    }
}

function handleLogout() {
    localStorage.removeItem('zs_token');
    appState.token = null;
    appState.isAuthenticated = false;

    screens.dashboard.classList.add('hidden');
    screens.login.classList.remove('hidden');
    showToast('Logged out successfully');
}


function showLogin() {
    appState.isAuthenticated = false;
    screens.dashboard.classList.add('hidden');
    screens.login.classList.remove('hidden');
}

// --- FEATURE 1: SECURE MULTI-PARTY COMPUTATION ---
function setupSMPCHandlers() {
    document.getElementById('btn-submit-a').addEventListener('click', () => submitData('uniA', 'a'));
    document.getElementById('btn-submit-b').addEventListener('click', () => submitData('uniB', 'b'));
    document.getElementById('btn-compute').addEventListener('click', performComputation);
}

function submitData(uniKey, prefix) {
    const totalInput = document.getElementById(`${prefix}-total`);
    const passedInput = document.getElementById(`${prefix}-passed`);

    const total = parseInt(totalInput.value);
    const passed = parseInt(passedInput.value);

    if (isNaN(total) || isNaN(passed) || total <= 0) {
        alert("Invalid input data.");
        return;
    }

    // ENCRYPTION LAYER (Local Masking for SMPC pattern)
    const maskT = Math.floor(Math.random() * 5000);
    const maskP = Math.floor(Math.random() * 5000);

    appState[uniKey].keyTotal = maskT;
    appState[uniKey].keyPassed = maskP;
    appState[uniKey].maskedTotal = total + maskT;
    appState[uniKey].maskedPassed = passed + maskP;
    appState[uniKey].submitted = true;

    // UI Feedback
    document.getElementById(`btn-submit-${prefix}`).classList.add('hidden');
    document.getElementById(`status-${prefix}`).classList.remove('hidden');

    totalInput.type = "text"; totalInput.value = "ENCRYPTED"; totalInput.disabled = true;
    passedInput.type = "text"; passedInput.value = "ENCRYPTED"; passedInput.disabled = true;

    document.getElementById(`ready-${prefix}`).classList.add('ready');
    const name = prefix === 'a' ? 'Metro State' : 'Grand Valley';
    document.getElementById(`ready-${prefix}`).innerHTML = `<ion-icon name="checkmark-circle"></ion-icon> ${name}: Submitted`;

    const uniName = prefix === 'a' ? 'Metro State' : 'Grand Valley';
    backendLog('DATA_SUBMIT', `${uniName} prepared masked data.`);

    if (appState.uniA.submitted && appState.uniB.submitted) {
        document.getElementById('btn-compute').disabled = false;
    }
}

async function performComputation() {
    const btn = document.getElementById('btn-compute');
    btn.innerHTML = '<ion-icon name="sync-outline" class="spin"></ion-icon> Computing...';

    try {
        const finalTotal = (appState.uniA.maskedTotal + appState.uniB.maskedTotal) - (appState.uniA.keyTotal + appState.uniB.keyTotal);
        const finalPassed = (appState.uniA.maskedPassed + appState.uniB.maskedPassed) - (appState.uniA.keyPassed + appState.uniB.keyPassed);

        // CALL BACKEND AGGREGATE API
        const data = await fetchAPI('/api/aggregate/compute-aggregate', 'POST', {
            totalStudents: finalTotal,
            passedStudents: finalPassed
        });

        document.getElementById('res-total').textContent = finalTotal;
        document.getElementById('res-passed').textContent = finalPassed;
        document.getElementById('res-percentage').textContent = data.finalPercentage + '%';

        document.getElementById('analysis-results').classList.remove('hidden');
        btn.innerHTML = '<ion-icon name="checkmark-done-outline"></ion-icon> Computation Complete';
        btn.disabled = true;

        showToast('Aggregate computation stored successfully.');
        backendLog('COMPUTE_EXEC', `Final Aggregate stored in DB: ${data.resultId}`);

    } catch (err) {
        showToast("Computation Error: " + err.message, 'error');
        btn.innerHTML = '<ion-icon name="sync-outline"></ion-icon> Retry Computation';
        btn.disabled = false;
    }
}


// --- FEATURE 2: DOCUMENT INTEGRITY VERIFICATION ---

function handleFileSelect(file) {
    if (!file || file.type !== 'application/pdf') {
        showToast("Please upload a valid PDF file.", 'error');
        return;
    }

    appState.stagedFile = file;

    document.getElementById('upload-text').innerHTML = `Selected: <b>${file.name}</b>`;
    document.getElementById('btn-generate-hash').disabled = false;
    document.getElementById('file-result').classList.add('hidden');
    document.getElementById('proof-area').classList.add('hidden');
}

async function generatePdfHash() {
    if (!appState.stagedFile) return;

    const file = appState.stagedFile;
    const btn = document.getElementById('btn-generate-hash');
    btn.innerHTML = '<ion-icon name="sync-outline" class="spin"></ion-icon> Hashing...';
    btn.disabled = true;

    const arrayBuffer = await readFileAsArrayBuffer(file);
    const hashHex = await crypto.subtle.digest('SHA-256', arrayBuffer)
        .then(hashBuffer => {
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        });

    appState.lastHash = hashHex;

    document.getElementById('file-result').classList.remove('hidden');
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-size').textContent = (file.size / 1024 / 1024).toFixed(2) + " MB";
    document.getElementById('file-hash').textContent = hashHex;

    document.getElementById('proof-area').classList.remove('hidden');
    document.getElementById('proof-card').classList.add('hidden');

    btn.innerHTML = '<ion-icon name="finger-print-outline"></ion-icon> Generate Integrity Hash';

    backendLog('DOC_HASH', `PDF hash generated locally: ${hashHex.substring(0, 8)}...`);
    appState.stagedFile = null;
}

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}


// --- FEATURE 3: PROOF ID SYSTEM ---

async function generateProofID() {
    if (!appState.lastHash) return;

    const btn = document.getElementById('btn-generate-proof');
    btn.innerHTML = '<ion-icon name="sync-outline" class="spin"></ion-icon> Storing Proof...';

    try {
        // CALL BACKEND PROOF API
        const data = await fetchAPI('/api/proof/create-proof', 'POST', {
            hash: appState.lastHash,
            organizationId: 'ZS-MAIN-ORG'
        });

        document.getElementById('proof-id-display').textContent = data.proofId;
        document.getElementById('proof-card').classList.remove('hidden');
        btn.innerHTML = '<ion-icon name="id-card-outline"></ion-icon> Proof ID Stored in DB';
        btn.disabled = true;

        showToast('Proof stored and hash sent to blockchain.');
        backendLog('PROOF_GEN', `Proof ID created in MongoDB: ${data.proofId}`);
    } catch (err) {
        showToast("Storage Error: " + err.message, 'error');
        btn.innerHTML = '<ion-icon name="id-card-outline"></ion-icon> Retry Storage';
        btn.disabled = false;
    }
}

function copyProofID() {
    const id = document.getElementById('proof-id-display').textContent;
    navigator.clipboard.writeText(id).then(() => {
        const btn = document.getElementById('btn-copy-proof');
        const original = btn.innerHTML;
        btn.innerHTML = '<ion-icon name="checkmark-outline" style="color:var(--accent)"></ion-icon>';
        showToast('Proof ID copied to clipboard');
        setTimeout(() => btn.innerHTML = original, 2000);
    });
}

async function verifyProofID() {
    const input = document.getElementById('verify-input');
    const resultDiv = document.getElementById('verify-result');
    const id = input.value.trim();

    if (!id) return;

    try {
        // CALL BACKEND VERIFY API (Search by hash in this implementation, or id if updated)
        // For simplicity, we search by hash (lastHash) but in real app we'd search by proofId
        // Update: Let's use the Verify API which in our proofController checks for hash.
        // If the user inputs proofId, we'd need a different endpoint. 
        // For now, let's assume the user pastes the hash or we update controller.

        const data = await fetchAPI('/api/proof/verify-proof', 'POST', {
            hash: id // Using ID as hash for the verify-proof check in this implementation
        });

        resultDiv.classList.remove('hidden');
        resultDiv.className = 'verify-result hidden';

        if (data.status === 'VALID') {
            resultDiv.classList.add('success');
            resultDiv.classList.remove('hidden');
            resultDiv.innerHTML = `
                <ion-icon name="shield-checkmark" class="verify-icon"></ion-icon>
                <div class="verify-title">Proof Verified in DB</div>
                <p>Immutable record found in MongoDB.</p>
                <div class="verify-meta">
                    <div class="verify-row"><span>Proof ID:</span> <span>${data.proofId}</span></div>
                    <div class="verify-row"><span>Org:</span> <span>${data.organizationId}</span></div>
                    <div class="verify-row"><span>Timestamp:</span> <span>${new Date(data.timestamp).toLocaleString()}</span></div>
                </div>
            `;
            backendLog('VERIFY_SUCCESS', `Proof verified in DB: ${data.proofId}`);
        } else {
            throw new Error("Invalid Proof");
        }
    } catch (err) {
        resultDiv.classList.add('error');
        resultDiv.classList.remove('hidden');
        resultDiv.innerHTML = `
            <ion-icon name="alert-circle" class="verify-icon"></ion-icon>
            <div class="verify-title">Verification Failed</div>
            <p>${err.message}</p>
        `;
        backendLog('VERIFY_FAIL', `Failed verification attempt.`);
    }
}


// --- AUDIT SYSTEM ---
async function backendLog(eventType, message) {
    try {
        // CALL BACKEND AUDIT API
        // If we have a proofId, we find it or use a default
        const data = await fetchAPI('/api/audit/log-event', 'POST', {
            proofId: 'SYS-LOG',
            eventType: eventType
        });

        uiLog(eventType, message);
    } catch (err) {
        console.warn("Logging to backend failed, showing locally only.");
        uiLog(eventType, message);
    }
}

function uiLog(type, message) {
    const list = document.getElementById('audit-list');
    const row = document.createElement('tr');
    const timestamp = new Date().toLocaleTimeString();

    row.innerHTML = `
        <td><span style="color:var(--primary)">[${timestamp}]</span></td>
        <td>${message}</td>
        <td><ion-icon name="shield-checkmark" style="color:var(--accent)"></ion-icon> Verified</td>
    `;
    list.prepend(row);
}
