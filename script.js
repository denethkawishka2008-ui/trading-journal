const firebaseConfig = {
  apiKey: "AIzaSyB9xqHvd6JiY61170MDh4p2buq6iNjz8jg",
  authDomain: "my-trading-journal-afb80.firebaseapp.com",
  projectId: "my-trading-journal-afb80",
  storageBucket: "my-trading-journal-afb80.firebasestorage.app",
  messagingSenderId: "921260248794",
  appId: "1:921260248794:web:864d95da363f9935725fe3",
  measurementId: "G-PS7GH6951L"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); 

let journalTables = []; 
let currentTableId = null;
let currentMonth = 'Jan'; 
let methodOptions = ['MSS', 'CISD'];
let sessionOptions = ['London', 'New York'];
let pairOptions = ['EUR/USD', 'GBP/USD'];
let entryReasonOptions = ['Liquidity Sweep', 'FVG Tap', 'Order Block', 'BOS Break', 'Silver Bullet'];

/*  1. HOME PAGE BACKGROUND REAL TRADING WAVE ANIMATION
function initTradingAnimation() {
    const homeView = document.getElementById('home-view');
    if (!homeView) return;

    const oldCanvas = document.getElementById('trading-canvas');
    if (oldCanvas) oldCanvas.remove();

    const canvas = document.createElement('canvas');
    canvas.id = 'trading-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '0.35'; 
    homeView.style.position = 'relative';
    homeView.insertBefore(canvas, homeView.firstChild);

    const ctx = canvas.getContext('2d');
    let width = canvas.width = homeView.offsetWidth;
    let height = canvas.height = homeView.offsetHeight;

    window.addEventListener('resize', () => {
        if(document.getElementById('trading-canvas')) {
            width = canvas.width = homeView.offsetWidth;
            height = canvas.height = homeView.offsetHeight;
        }
    });

    let points = [];
    let candles = [];
    let pulseRadius = 0;
    let pulseGrowing = true;
    let ticks = []; 

    function generateMarketWave() {
        points = [];
        candles = [];
        
        let x = 0;
        let y = height / 2 + (Math.random() - 0.5) * 50;
        
        points.push({ x: x, y: y });

        while (x < width + 200) {
            let waveDirection = Math.random() > 0.5 ? 1 : -1;
            let waveHeight = 60 + Math.random() * 120;
            let waveLength = 120 + Math.random() * 100;
            
            let targetX = x + waveLength;
            let targetY = y + (waveDirection * waveHeight);
            
            if (targetY < 80) targetY = 80 + Math.random() * 40;
            if (targetY > height - 80) targetY = height - 80 - Math.random() * 40;

            let steps = Math.floor(waveLength / 25);
            for (let i = 1; i <= steps; i++) {
                let t = i / steps;
                let currX = x + (targetX - x) * t;
                let currY = y + (targetY - y) * t;
                
                points.push({ x: currX, y: currY });

                let isBullish = (targetY < y);
                if (Math.random() > 0.2) { 
                    let candleBody = 15 + Math.random() * 30;
                    candles.push({
                        x: currX,
                        open: isBullish ? currY + candleBody/3 : currY - candleBody/3,
                        close: isBullish ? currY - candleBody/3 : currY + candleBody/3,
                        high: currY - candleBody/2 - (Math.random() * 8),
                        low: currY + candleBody/2 + (Math.random() * 8),
                        isBullish: isBullish
                    });
                }
            }
            x = targetX;
            y = targetY;
        }
    }
    generateMarketWave();

    let drawIndex = 0;
    let pX = points[0].x;
    let pY = points[0].y;

   function animateLine() {
        ctx.clearRect(0, 0, width, height);
        
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.03)';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 80) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
        }
        for (let i = 0; i < height; i += 60) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
        }

        candles.forEach(c => {
            if (c.x <= pX) {
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = c.isBullish ? '#22c55e' : '#ef4444';
                
                ctx.beginPath(); 
                ctx.moveTo(c.x, c.high); 
                ctx.lineTo(c.x, c.low); 
                ctx.stroke();
                
                ctx.fillStyle = c.isBullish ? '#22c55e' : '#ef4444';
                ctx.fillRect(c.x - 5, Math.min(c.open, c.close), 10, Math.abs(c.open - c.close));
            }
        });

        let target = points[drawIndex + 1];
        if (target) {
            let dx = target.x - pX;
            let dy = target.y - pY;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 5) {
                pX = target.x; pY = target.y; drawIndex++;
            } else {
                pX += (dx / dist) * 5; 
                pY += (dy / dist) * 5;
            }
        } else {
            drawIndex = 0;
            generateMarketWave();
            pX = points[0].x; pY = points[0].y;
        }

        if (Math.random() > 0.4) {
            ticks.push({
                x: pX, y: pY,
                vx: -(1 + Math.random() * 2), vy: (Math.random() - 0.5) * 2, alpha: 1,
                color: Math.random() > 0.5 ? '#22c55e' : '#ef4444'
            });
        }
        for (let i = ticks.length - 1; i >= 0; i--) {
            let t = ticks[i]; t.x += t.vx; t.y += t.vy; t.alpha -= 0.04;
            if (t.alpha <= 0) { ticks.splice(i, 1); } 
            else {
                ctx.beginPath(); ctx.arc(t.x, t.y, 1.5 + Math.random() * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = t.color; ctx.globalAlpha = t.alpha; ctx.fill(); ctx.globalAlpha = 1;
            }
        }

        if (pulseGrowing) { pulseRadius += 0.4; if (pulseRadius > 12) pulseGrowing = false; } 
        else { pulseRadius -= 0.4; if (pulseRadius < 5) pulseGrowing = true; }

        ctx.beginPath(); ctx.arc(pX, pY, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239, 68, 68, ${0.4 - (pulseRadius / 35)})`; ctx.fill();

        ctx.beginPath(); ctx.arc(pX, pY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444'; ctx.shadowBlur = 10; ctx.shadowColor = '#ef4444'; ctx.fill(); ctx.shadowBlur = 0;

        requestAnimationFrame(animateLine);
    }
    animateLine();
}*/

function initUIVisuals() {
    const style = document.createElement('style');
    style.innerHTML = `
        .dev-copyright-note {
            background-color: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            font-weight: bold;
            font-size: 11px;
            text-align: center;
            padding: 8px;
            border-radius: 6px;
            margin: 15px;
            border: 1px solid rgba(239, 68, 68, 0.2);
            letter-spacing: 0.5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        @keyframes trAppear {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        #image-modal {
            transition: opacity 0.3s ease;
            backdrop-filter: blur(5px);
        }
        #modal-preview-img {
            transform: scale(0.7);
            opacity: 0;
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
        }
        #image-modal.show-modal #modal-preview-img {
            transform: scale(1);
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    const sidebar = document.querySelector('.sidebar');
    if (sidebar && !document.querySelector('.dev-copyright-note')) {
        const copyrightDiv = document.createElement('div');
        copyrightDiv.className = 'dev-copyright-note';
        copyrightDiv.innerHTML = `© COPYRIGHT BY DENETH'S SOFTWARES<br>v1.4`;
        sidebar.appendChild(copyrightDiv);
    }
    
    initTradingAnimation();
}

function loadDataFromFirebase() {
    db.collection("trading_journal").doc("user_data").get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            journalTables = data.journalTables || [];
            methodOptions = data.methodOptions || ['MSS', 'CISD'];
            sessionOptions = data.sessionOptions || ['London', 'New York'];
            pairOptions = data.pairOptions || ['EUR/USD', 'GBP/USD'];
        }
        renderTableList();
        initUIVisuals(); 
    }).catch((error) => {
        console.error("Error loading data: ", error);
    });
}

function saveDataToFirebase() {
    db.collection("trading_journal").doc("user_data").set({
        journalTables: journalTables,
        methodOptions: methodOptions,
        sessionOptions: sessionOptions,
        pairOptions: pairOptions
    })
    .then(() => {
        console.log("Data Auto-Saved to Firebase Successfully! 💾");
    })
    .catch((error) => {
        console.error("Error saving data: ", error);
    });
}
function loadDataFromFirebase() {
    db.collection("trading_journal").doc("user_data").get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            journalTables = data.journalTables || [];
            methodOptions = data.methodOptions || ['MSS', 'CISD'];
            sessionOptions = data.sessionOptions || ['London', 'New York'];
            pairOptions = data.pairOptions || ['EUR/USD', 'GBP/USD'];
            
            entryReasonOptions = data.entryReasonOptions || ['Liquidity Sweep', 'FVG Tap', 'Order Block', 'BOS Break', 'Silver Bullet'];
        }
        renderTableList();
        initUIVisuals(); 
    }).catch((error) => {
        console.error("Error loading data: ", error);
    });
}

loadDataFromFirebase();

//  NOTE VIEW FIX - SHOW SECTION FUNCTION
function showSection(sectionId) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));

    if(sectionId === 'home') {
        document.getElementById('home-view').classList.remove('hidden');
        document.getElementById('btn-home').classList.add('active');
        initTradingAnimation(); 
    } else if(sectionId === 'tables') {
        document.getElementById('tables-list-view').classList.remove('hidden');
        document.getElementById('btn-tables').classList.add('active');
        renderTableList();
    } else if(sectionId === 'settings') { 
        document.getElementById('settings-view').classList.remove('hidden');
        document.getElementById('btn-settings').classList.add('active');
        renderSettingsLists(); 
    } else if(sectionId === 'note-view') {
        document.getElementById('note-view').classList.remove('hidden');
        document.getElementById('btn-Note').classList.add('active');
        internalShowSection('Upload'); // Default Sub Section
    }
}

// INTERNAL NOTES SUB-SECTION NAVIGATION
function internalShowSection(subSectionId) {
    document.getElementById('sub-section-Upload').style.display = 'none';
    document.getElementById('sub-section-Note').style.display = 'none';
    document.getElementById('btn-Upload').classList.remove('active');
    document.getElementById('btn-SubNote' ? 'btn-SubNote' : 'btn-Note').classList.remove('active');

    if (subSectionId === 'Upload') {
        document.getElementById('sub-section-Upload').style.display = 'block';
        document.getElementById('btn-Upload').classList.add('active');
    } else if (subSectionId === 'Note') {
        document.getElementById('sub-section-Note').style.display = 'block';
        const subNoteBtn = document.getElementById('btn-SubNote') || document.getElementById('btn-Note');
        if(subNoteBtn) subNoteBtn.classList.add('active');
    }
}

function createNewTable() {
    const oldModal = document.getElementById('custom-popup-modal');
    if (oldModal) oldModal.remove();

    const modal = document.createElement('div');
    modal.id = 'custom-popup-modal';
    modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:999999;";
    
    modal.innerHTML = `
        <div style="background:#1e1b4b; padding:24px; border-radius:12px; width:90%; max-width:380px; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.5); border:1px solid #312e81; animation: popupAnim 0.2s ease-out;">
            <h3 style="margin:0 0 16px 0; color:#ffffff; font-size:18px; font-weight:bold; font-family:sans-serif; letter-spacing:0.5px;">Create New Table</h3>
            <input type="text" id="new-table-input-field" placeholder="Enter table name here..." style="width:100%; padding:10px 14px; margin-bottom:20px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; font-weight:bold; background:#ffffff; color:#000000; outline:none; box-sizing:border-box;">
            <div style="display:flex; justify-content:flex-end; gap:10px;">
                <button id="popup-cancel-btn" style="padding:8px 16px; border:none; border-radius:6px; font-size:13px; font-weight:bold; cursor:pointer; background:#64748b; color:#ffffff; transition:opacity 0.2s;">Cancel</button>
                <button id="popup-create-btn" style="padding:8px 16px; border:none; border-radius:6px; font-size:13px; font-weight:bold; cursor:pointer; background:#3b82f6; color:#ffffff; transition:opacity 0.2s;">Create</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const inputField = document.getElementById('new-table-input-field');
    const createBtn = document.getElementById('popup-create-btn');
    const cancelBtn = document.getElementById('popup-cancel-btn');

    setTimeout(() => inputField.focus(), 50);

    cancelBtn.onclick = function() { modal.remove(); };

    createBtn.onclick = function() {
        const tableName = inputField.value.trim();
        if (!tableName) {
            alert("Please enter a valid table name!");
            inputField.focus();
            return;
        }

        const newTable = {
            id: Date.now(),
            name: tableName,
            months: {
                Jan: [], Feb: [], Mar: [], Apr: [], May: [], Jun: [],
                Jul: [], Aug: [], Sep: [], Oct: [], Nov: [], Dec: []
            }
        };
        
        journalTables.push(newTable);
        saveDataToFirebase(); 
        renderTableList();
        modal.remove();
    };

    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
}

function renderTableList() {
    const grid = document.getElementById('table-grid');
    if (!grid) return;
    grid.innerHTML = '';

    journalTables.forEach(table => {
        const card = document.createElement('div');
        card.className = 'table-card';
        card.innerHTML = `
            <div style="font-size: 30px;">📊</div>
            <strong>${table.name}</strong>
        `;
        card.onclick = () => openSingleTable(table.id);
        card.oncontextmenu = (event) => { showContextMenu(event, table.id); };
        grid.appendChild(card);
    });
}

function openSingleTable(tableId) {
    currentTableId = tableId;
    currentMonth = 'Jan'; 
    const tableData = journalTables.find(t => t.id === tableId);

    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.getElementById('single-table-view').classList.remove('hidden');
    document.getElementById('current-table-title').innerText = tableData.name;

    document.querySelectorAll('.month-btn').forEach(btn => btn.classList.remove('active'));
    
    const firstMonthBtn = document.querySelector('.month-tabs .month-btn');
    if (firstMonthBtn) firstMonthBtn.classList.add('active');

    renderRows(tableData.months[currentMonth]);
}

function switchMonth(monthName) {
    currentMonth = monthName;
    document.querySelectorAll('.month-btn').forEach(btn => btn.classList.remove('active'));
    if (window.event && window.event.target) {
        window.event.target.classList.add('active');
    }

    const tableData = journalTables.find(t => t.id === currentTableId);
    renderRows(tableData.months[currentMonth]);
}

function addNewRow() {
    if (!currentTableId) return;
    const tableData = journalTables.find(t => t.id === currentTableId);
    
    const newRow = { 
        date: '', day: '', pair: '', side: '', method: '', result: '', session: '',
        rr: '', entryReason: '', notes: '', image: '' 
    };
    
    tableData.months[currentMonth].push(newRow);
    saveDataToFirebase(); 
    renderRows(tableData.months[currentMonth]);
}
function renderRows(rows) {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    let weeklyWins = 0;
    let weeklyLosses = 0;
    let weeklyBEs = 0;
    let weeklyTotalProfit = 0;

    rows.forEach((row, index) => {
       
        if (!row.isWeeklyExcelRow) {
            const res = row.result || '';
            if (res === 'Profit' || res === 'WIN') weeklyWins++;
            else if (res === 'Loss' || res === 'LOSS') weeklyLosses++;
            else if (res === 'BE') weeklyBEs++;
            
            const profVal = parseFloat(row.profit) || 0;
            weeklyTotalProfit += profVal;
        }

        const tr = document.createElement('tr');
        tr.className = 'animate-tr'; 
        
        // =========================================================================
        //  WEEKLY SPECIAL SUMMARY ROW 
        // =========================================================================
        if (row.isWeeklyExcelRow) {
            const totalTrades = weeklyWins + weeklyLosses;
            const winRate = totalTrades > 0 ? Math.round((weeklyWins / totalTrades) * 100) + '%' : '0%';

           
            let specialBg = "background: linear-gradient(90deg, #2e1065 0%, #3b0764 50%, #2e1065 100%) !important; border-top: 2px solid #a855f7; border-bottom: 2px solid #a855f7; box-shadow: inset 0 0 15px rgba(168, 85, 247, 0.2);"; 
            let winRateColor = "#38bdf8";

            if (weeklyTotalProfit > 0) {
                winRateColor = "#10b981"; 
            } else if (weeklyTotalProfit < 0) {
                winRateColor = "#ef4444"; 
            }

            tr.setAttribute('style', `${specialBg} font-weight: bold; height: 38px; text-align: center;`);
            
            tr.innerHTML = `
                <td colspan="13" style="vertical-align: middle; text-align: center; padding: 0 15px; color: #ffffff; font-size: 13px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        
                        <span style="font-weight: 800; color: #000000; background: #ffffff; padding: 3px 12px; border-radius: 6px; box-shadow: 0 0 8px rgba(255,255,255,0.3); font-size: 11px; letter-spacing: 0.5px;">
                            WEEKLY SUMMARY (${row.date || '—'})
                        </span>
                        
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <div class="weekly-badge-win" style="padding: 3px 14px; border-radius: 6px; display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 900; cursor: pointer;">
                                <span style="font-size: 9px;">🟢</span> WINS <span style="background: rgba(0,0,0,0.3); color: inherit; padding: 1px 6px; border-radius: 4px; font-size: 11px; margin-left: 3px;">${weeklyWins}</span>
                            </div>
                            
                            <div class="weekly-badge-loss" style="padding: 3px 14px; border-radius: 6px; display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 900; cursor: pointer;">
                                <span style="font-size: 9px;">🔴</span> LOSSES <span style="background: rgba(0,0,0,0.3); color: inherit; padding: 1px 6px; border-radius: 4px; font-size: 11px; margin-left: 3px;">${weeklyLosses}</span>
                            </div>
                            
                            <div class="weekly-badge-be" style="padding: 3px 14px; border-radius: 6px; display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 900; cursor: pointer;">
                                <span style="font-size: 9px;">🟡</span> BEs <span style="background: rgba(0,0,0,0.3); color: inherit; padding: 1px 6px; border-radius: 4px; font-size: 11px; margin-left: 3px;">${weeklyBEs}</span>
                            </div>
                        </div>

                        <div style="background: rgba(0, 0, 0, 0.4); padding: 4px 14px; border-radius: 6px; border: 1px solid ${winRateColor}; display: flex; align-items: center; gap: 8px; box-shadow: 0 0 10px ${winRateColor}22;">
                            <span style="color: #94a3b8; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">WIN RATE:</span>
                            <span style="color: ${winRateColor}; font-size: 13px; font-weight: 1000; text-shadow: 0 0 8px ${winRateColor}66;">${winRate}</span>
                        </div>

                    </div>
                </td>
            `;

            tbody.appendChild(tr);

         
            weeklyWins = 0;
            weeklyLosses = 0;
            weeklyBEs = 0;
            weeklyTotalProfit = 0;
            return; 
        }

        // =========================================================================
        //NORMAL TRADING ROW 
        // =========================================================================
        const getDropdownStyle = (val) => {
            if (val === "" || val === "Select...") return "background-color: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1);"; 
            if (val === "Profit" || val === "Buy") return "background-color: #63ff78; color: #ffffff; border: none;"; 
            if (val === "Loss" || val === "Sell") return "background-color: #ff8787; color: #ffffff; border: none;"; 
            if (val === "BE") return "background-color: #ffc96c; color: #ffffff; border: none;"; 
            return "background-color: #84fffd; color: #ffffff; border: none;";
        };

        let baseDropdownStyle = "width: 100%; border-radius: 6px; font-weight: bold; padding: 4px; cursor: pointer; font-size: 12px; text-align: center; text-align-last: center; box-sizing: border-box; outline: none; transition: all 0.2s;";
        let cellBgStyle = "padding: 4px; text-align: center; vertical-align: middle;";

        const resVal = row.result || '';
        if (resVal === 'Profit') {
            tr.setAttribute('style', 'background-color: rgba(16, 185, 129, 0.12) !important;');
        } else if (resVal === 'Loss') {
            tr.setAttribute('style', 'background-color: rgba(239, 68, 68, 0.12) !important;');
        } else if (resVal === 'BE') {
            tr.setAttribute('style', 'background-color: rgba(245, 158, 11, 0.12) !important;');
        }

        tr.innerHTML = `
            <td style="vertical-align: middle; text-align: center;">
                <div style="display: inline-flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.03); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.08); height: 24px; box-sizing: border-box; position: relative;">
                    <span id="date-display-${index}" style="font-size: 11px; color: #000000; font-weight: 500; white-space: nowrap;">${row.date || 'Select'}</span>
                    <div style="position: relative; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                        <span style="font-size: 11px; pointer-events: none;">📅</span>
                        <input type="date" value="${row.date || ''}" 
                               style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; padding: 0; margin: 0; border: none; z-index: 5;" 
                               onchange="document.getElementById('date-display-${index}').innerText = this.value; updateData(${index}, 'date', this.value); refreshTable();">
                    </div>
                </div>
            </td>

            <td contenteditable="false" style="background-color: rgba(255,255,255,0.05); color: #000000; font-weight: bold; text-align: center; vertical-align: middle; font-size: 12px; border-radius: 4px;">${row.day || '—'}</td>

            <td style="${cellBgStyle}">
                <select style="${baseDropdownStyle} ${getDropdownStyle(row.pair)}" class="table-dropdown" onchange="updateDropdownData(${index}, 'pair', this.value, this.parentElement)">
                    <option value="" ${row.pair === '' ? 'selected' : ''}>Select...</option>
                    ${pairOptions.map(opt => `<option value="${opt}" ${row.pair === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
            </td>
            
            <td style="${cellBgStyle}">
                <select style="${baseDropdownStyle} ${getDropdownStyle(row.side)}" class="table-dropdown" onchange="updateDropdownData(${index}, 'side', this.value, this.parentElement)">
                    <option value="" ${row.side === '' ? 'selected' : ''}>Select...</option>
                    <option value="Buy" ${row.side === 'Buy' ? 'selected' : ''}>Buy</option>
                    <option value="Sell" ${row.side === 'Sell' ? 'selected' : ''}>Sell</option>
                </select>
            </td>

            <td style="${cellBgStyle}">
                <select style="${baseDropdownStyle} ${getDropdownStyle(row.method)}" class="table-dropdown" onchange="updateDropdownData(${index}, 'method', this.value, this.parentElement)">
                    <option value="" ${row.method === '' ? 'selected' : ''}>Select...</option>   
                    ${methodOptions.map(opt => `<option value="${opt}" ${row.method === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
            </td>

            <td style="${cellBgStyle}">
                <select style="${baseDropdownStyle} ${getDropdownStyle(row.result)}" class="table-dropdown" onchange="updateDropdownData(${index}, 'result', this.value, this.parentElement); setTimeout(refreshTable, 300);">
                    <option value="" ${row.result === '' ? 'selected' : ''}>Select...</option>
                    <option value="Profit" ${row.result === 'Profit' ? 'selected' : ''}>Profit</option>
                    <option value="Loss" ${row.result === 'Loss' ? 'selected' : ''}>Loss</option>
                    <option value="BE" ${row.result === 'BE' ? 'selected' : ''}>BE</option>
                </select>
            </td>

            <td style="${cellBgStyle}">
                <select style="${baseDropdownStyle} ${getDropdownStyle(row.session)}" class="table-dropdown" onchange="updateDropdownData(${index}, 'session', this.value, this.parentElement)">
                    <option value="" ${row.session === '' ? 'selected' : ''}>Select...</option>   
                    ${sessionOptions.map(opt => `<option value="${opt}" ${row.session === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
            </td>
            
            <td style="${cellBgStyle}">
                <select style="${baseDropdownStyle} ${getDropdownStyle(row.rr)}" class="table-dropdown" onchange="updateDropdownData(${index}, 'rr', this.value, this.parentElement)">
                    <option value="" ${row.rr === '' ? 'selected' : ''}>Select...</option>
                    <option value="1:2" ${row.rr === '1:2' ? 'selected' : ''}>1:2</option>
                    <option value="1:3" ${row.rr === '1:3' ? 'selected' : ''}>1:3</option>
                </select>
            </td> 

  <td style="padding: 4px; text-align: left; vertical-align: middle; white-space: nowrap; width: auto;">
    <div style="display: flex; flex-direction: row; gap: 4px; align-items: center; width: max-content;">
        
        <select class="auto-width-select" onchange="updateDropdownData(${index}, 'entryReason1', this.value, this.parentElement); setTimeout(refreshTable, 300);">
            <option value="LVG" ${(row.entryReason1 || '') === 'LVG' || (row.entryReason1 || '') === '' ? 'selected' : ''}>LVG</option>
            <option value="15min  FVG" ${(row.entryReason1 || '') === '15min  FVG' ? 'selected' : ''}>15min  FVG</option>
            <option value="5min" ${(row.entryReason1 || '') === '5min' ? 'selected' : ''}>5min</option>
        </select>

        <select class="auto-width-select" onchange="updateDropdownData(${index}, 'entryReason2', this.value, this.parentElement); setTimeout(refreshTable, 300);">
            <option value="Liq Sweep" ${(row.entryReason2 || '') === 'Liq Sweep' || (row.entryReason2 || '') === '' ? 'selected' : ''}>Liq Sweep</option>
            <option value="15min liq sweep" ${(row.entryReason2 || '') === '15min liq sweep' ? 'selected' : ''}>15min liq sweep</option>
            <option value="1 min Liq Sweep" ${(row.entryReason2 || '') === '1 min Liq Sweep' ? 'selected' : ''}>1 min Liq Sweep</option>
        </select>

        <span style="color: rgba(255,255,255,0.2); font-size: 12px; font-weight: bold;">,</span>

        <select class="auto-width-select" onchange="updateDropdownData(${index}, 'entryReason3', this.value, this.parentElement); setTimeout(refreshTable, 300);">
            <option value="MSS" ${(row.entryReason3 || '') === 'MSS' || (row.entryReason3 || '') === '' ? 'selected' : ''}>MSS</option>
            <option value="1min mss" ${(row.entryReason3 || '') === '1min mss' ? 'selected' : ''}>1min mss</option>
            <option value="3min mss" ${(row.entryReason3 || '') === '3min mss' ? 'selected' : ''}>3min mss</option>
            <option value="15min mss" ${(row.entryReason3 || '') === '15min mss' ? 'selected' : ''}>15min mss</option>
        </select>

        <select class="auto-width-select" onchange="updateDropdownData(${index}, 'entryReason4', this.value, this.parentElement); setTimeout(refreshTable, 300);">
            <option value="CFSD" ${(row.entryReason4 || '') === 'CFSD' || (row.entryReason4 || '') === '' ? 'selected' : ''}>CFSD</option>
            <option value="min CISD" ${(row.entryReason4 || '') === 'min CISD' ? 'selected' : ''}>min CISD</option>
            <option value="3min CISD" ${(row.entryReason4 || '') === '3min CISD' ? 'selected' : ''}>3min CISD</option>
        </select>

        <span style="color: rgba(255,255,255,0.2); font-size: 12px; font-weight: bold;">,</span>

        <select class="auto-width-select" onchange="updateDropdownData(${index}, 'entryReason5', this.value, this.parentElement); setTimeout(refreshTable, 300);">
            <option value="HRL" ${(row.entryReason5 || '') === 'HRL' || (row.entryReason5 || '') === '' ? 'selected' : ''}>HRL</option>
            <option value="1 min HRl" ${(row.entryReason5 || '') === '1 min HRl' ? 'selected' : ''}>1 min HRl</option>
            <option value="3 min HRL" ${(row.entryReason5 || '') === '3 min HRL' ? 'selected' : ''}>3 min HRl</option>
            <option value="15 min HRL" ${(row.entryReason5 || '') === '15 min HRL' ? 'selected' : ''}> 15 min HRl</option>
        </select>

    </div>
</td>
            <td contenteditable="true" onblur="updateData(${index}, 'notes', this.innerText)" style="vertical-align: middle; font-weight: bold; color: #ef4444;">${row.notes || ''}</td>

           
            <td style="vertical-align: middle;">
                <div style="display:flex; flex-direction:row; gap:4px; align-items:center; justify-content:center;">
                    <label class="btn-upload-label" style="background-color: #3b82f6; color: white; padding: 4px 6px; border-radius: 4px; font-size: 10px; cursor: pointer; font-weight: bold; margin: 0; display: inline-flex; align-items: center;" title="Upload Left Image">
                        📁 L
                        <input type="file" accept="image/*" style="display:none;" data-true-index="${index}" data-img-num="1" onchange="uploadRowImage(this)">
                    </label>
                    <label class="btn-upload-label" style="background-color: #10b981; color: white; padding: 4px 6px; border-radius: 4px; font-size: 10px; cursor: pointer; font-weight: bold; margin: 0; display: inline-flex; align-items: center;" title="Upload Right Image">
                        📁 R
                        <input type="file" accept="image/*" style="display:none;" data-true-index="${index}" data-img-num="2" onchange="uploadRowImage(this)">
                    </label>
                    <button id="btn-view-img-${index}" class="btn-view-img ${(row.image1 || row.image2 || row.image) ? '' : 'hidden'}" style="background-color: #0b0eed; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; cursor: pointer; font-weight: bold; margin: 0; display: inline-flex; align-items: center;" onclick="viewRowImage(${index})">👁️ View</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    calculateStats(rows);



}

// Dropdown change wena welawe cell eke background eka wenas karana function ekata meka danna:
function updateEntryReasonColor(cell, value) {
    // Kalin thibuna cell classes ain karanna
    cell.classList.remove('cell-liquidity-sweep', 'cell-fvg-tap', 'cell-order-block', 'cell-bos-break', 'cell-silver-bullet');
    
    // Aluth value ekata adala class eka danna
    if (value === 'Liquidity Sweep') cell.classList.add('cell-liquidity-sweep');
    else if (value === 'FVG Tap') cell.classList.add('cell-fvg-tap');
    else if (value === 'Order Block') cell.classList.add('cell-order-block');
    else if (value === 'BOS Break') cell.classList.add('cell-bos-break');
    else if (value === 'Silver Bullet') cell.classList.add('cell-silver-bullet');
}


function updateData(rowIndex, field, value) {
    const tableData = journalTables.find(t => t.id === currentTableId);
    if (!tableData) return;
    
    let monthRows = tableData.months[currentMonth];
    if (monthRows[rowIndex]) { monthRows[rowIndex][field] = value; }

    if (field === 'date') { 
        let dateStr = value.trim();
        let formattedDate = dateStr.replace(/\./g, '-'); 
        let parsedDate = new Date(formattedDate);
        
        if (!isNaN(parsedDate.getTime())) {
            const daysArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            monthRows[rowIndex].day = daysArray[parsedDate.getDay()];
        }
    }
    refreshWeeklyStats(monthRows);
}

function updateDropdownData(rowIndex, field, value, cellElement) {
    const tableData = journalTables.find(t => t.id === currentTableId);
    if (!tableData) return;

    let monthRows = tableData.months[currentMonth];
    if (monthRows[rowIndex]) { monthRows[rowIndex][field] = value; }

    cellElement.className = ''; 
    if (value === 'Buy') cellElement.classList.add('cell-buy');
    if (value === 'Sell') cellElement.classList.add('cell-sell');
    if (value === 'Profit') cellElement.classList.add('cell-profit');
    if (value === 'Loss') cellElement.classList.add('cell-loss');
    if (value === 'BE') cellElement.classList.add('cell-be');

    refreshWeeklyStats(monthRows);
}

function refreshWeeklyStats(monthRows) {
    for (let i = monthRows.length - 1; i >= 0; i--) {
        if (monthRows[i].isWeeklyExcelRow) { monthRows.splice(i, 1); }
    }

    let weeklyProfit = 0; let weeklyLoss = 0; let weeklyBE = 0;

    for (let i = 0; i < monthRows.length; i++) {
        if (monthRows[i].result === 'Profit') weeklyProfit++;
        if (monthRows[i].result === 'Loss') weeklyLoss++;
        if (monthRows[i].result === 'BE') weeklyBE++;

        if (monthRows[i].day === 'Friday') {
            let totalWinLoss = weeklyProfit + weeklyLoss;
            let winPercentage = (totalWinLoss > 0) ? ((weeklyProfit / totalWinLoss) * 100).toFixed(0) : 0;

            let excelSummaryRow = {
                isWeeklyExcelRow: true,
                profitCount: weeklyProfit, lossCount: weeklyLoss, beCount: weeklyBE, winRate: winPercentage
            };

            monthRows.splice(i + 1, 0, excelSummaryRow);
            weeklyProfit = 0; weeklyLoss = 0; weeklyBE = 0; i++; 
        }
    }
    saveDataToFirebase(); 
    renderRows(monthRows);
}

function calculateStats(rows) {
    let profitCount = 0; let lossCount = 0; let beCount = 0;

    rows.forEach(row => {
        if (!row.isWeeklyExcelRow) {
            if (row.result === 'Profit') profitCount++;
            if (row.result === 'Loss') lossCount++;
            if (row.result === 'BE') beCount++;
        }
    });

    let totalWinLoss = profitCount + lossCount;
    let monthlyWinRate = (totalWinLoss > 0) ? ((profitCount / totalWinLoss) * 100).toFixed(0) : 0;

    const profitEl = document.getElementById('stat-profit');
    const lossEl = document.getElementById('stat-loss');
    const beEl = document.getElementById('stat-be');
    const monthlyWinRateEl = document.getElementById('stat-monthly-winrate');

    if (profitEl) profitEl.innerText = profitCount;
    if (lossEl) lossEl.innerText = lossCount;
    if (beEl) beEl.innerText = beCount;
    if (monthlyWinRateEl) { monthlyWinRateEl.innerText = monthlyWinRate + "%"; }
}
function uploadRowImage(input) {
    const index = parseInt(input.getAttribute('data-true-index'));
    const imgNum = input.getAttribute('data-img-num'); 
    const file = input.files[0];
    
    if (file) {
        const formData = new FormData();
        formData.append("image", file);

        fetch("https://api.imgbb.com/1/upload?key=2218858316a9a4b62dbdb33a193bc2f5", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const downloadURL = data.data.url;
                const tableData = journalTables.find(t => t.id === currentTableId);
                
                if (tableData && tableData.months[currentMonth][index]) {
                    if (imgNum === "1") {
                        tableData.months[currentMonth][index].image1 = downloadURL;
                    } else if (imgNum === "2") {
                        tableData.months[currentMonth][index].image2 = downloadURL;
                    }
                }
                
                const viewBtn = document.getElementById(`btn-view-img-${index}`);
                if (viewBtn) viewBtn.classList.remove('hidden');
                
                saveDataToFirebase();

                const oldToast = document.getElementById('custom-toast-msg');
                if (oldToast) oldToast.remove();

                const toast = document.createElement('div');
                toast.id = 'custom-toast-msg';
                toast.style = "position:fixed; top:20px; right:20px; background:#10b981; color:#ffffff; padding:14px 24px; border-radius:8px; font-weight:bold; font-family:sans-serif; font-size:14px; box-shadow:0 5px 15px rgba(0,0,0,0.3); z-index:999999; animation: toastSlide 0.3s ease-out; border-left:5px solid #047857;";
                toast.innerHTML = `📈 Chart Image ${imgNum} Saved Successfully!`;
                document.body.appendChild(toast);

                setTimeout(() => {
                    toast.style.animation = "toastFadeOut 0.3s ease-in forwards";
                    setTimeout(() => toast.remove(), 300);
                }, 2500);
            } else { alert("Upload failed via API"); }
        })
        .catch(error => { alert("Error uploading image: " + error.message); });
    }
}
function viewRowImage(index) {
    const tableData = journalTables.find(t => t.id === currentTableId);
    if (!tableData || !tableData.months[currentMonth][index]) return;
    
    const rowData = tableData.months[currentMonth][index];
    const imgUrl1 = rowData.image1 || rowData.image || ''; 
    const imgUrl2 = rowData.image2 || '';
    
    const modal = document.getElementById('image-modal');
    if (!modal) return;
    
  
    modal.innerHTML = `
        <div style="background: #1e1b4b; padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); width: 95%; max-width: 1000px; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; margin: auto;">
            <span style="position: absolute; top: 10px; right: 15px; font-size: 28px; color: #94a3b8; cursor: pointer; font-weight: bold;" onclick="closeImageModal()">&times;</span>
            <h3 style="color: white; margin-top: 0; font-size: 16px; margin-bottom: 15px;"> images</h3>
            
            <div style="display: flex; gap: 15px; justify-content: center; align-items: flex-start; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 250px; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
                    <p style="color: #3bf641; font-size: 12px; font-weight: bold; margin: 0 0 5px 0;">IMAGE 1 (LEFT)</p>
                    ${imgUrl1 ? `<img src="${imgUrl1}" style="max-width: 100%; max-height: 60vh; border-radius: 4px; object-fit: contain; cursor: zoom-in;" onclick="openFullFullscreen(this.src)">` : `<p style="color: #64748b; font-size: 12px; padding: 20px 0;">No Left Image</p>`}
                </div>
                <div style="flex: 1; min-width: 250px; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
                    <p style="color: #10b981; font-size: 12px; font-weight: bold; margin: 0 0 5px 0;">IMAGE 2 (RIGHT)</p>
                    ${imgUrl2 ? `<img src="${imgUrl2}" style="max-width: 100%; max-height: 60vh; border-radius: 4px; object-fit: contain; cursor: zoom-in;" onclick="openFullFullscreen(this.src)">` : `<p style="color: #64748b; font-size: 12px; padding: 20px 0;">No Right Image</p>`}
                </div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    setTimeout(() => { modal.classList.add('show-modal'); }, 10);
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.classList.remove('show-modal');
        setTimeout(() => { modal.classList.add('hidden'); }, 300);
    }
}

// Image full screen
function openFullFullscreen(imgUrl) {
    const oldFS = document.getElementById('global-fullscreen-view');
    if (oldFS) oldFS.remove();

    const fsDiv = document.createElement('div');
    fsDiv.id = 'global-fullscreen-view';
    
    
    fsDiv.setAttribute('style', 'position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(0, 0, 0, 0.95) !important; z-index: 9999999 !important; display: flex !important; align-items: center !important; justify-content: center !important; overflow: hidden !important;');

    fsDiv.innerHTML = `
        <span style="position: absolute; top: 20px; right: 30px; font-size: 45px; color: #ffffff; font-weight: bold; cursor: pointer; z-index: 10000000;" onclick="closeFullFullscreen()">&times;</span>
        <img id=\"fs-target-img\" src="${imgUrl}" style="max-width: 95vw !important; max-height: 95vh !important; object-fit: contain !important; border-radius: 4px; box-shadow: 0 0 35px rgba(0,0,0,0.9); transition: transform 0.1s ease-out; transform-origin: center; cursor: grab;">
    `;

    document.body.appendChild(fsDiv);

    // ---  MOUSE WHEEL ZOOM SYSTEM ---
    const img = document.getElementById('fs-target-img');
    let scale = 1; 

    fsDiv.addEventListener('wheel', function(e) {
        e.preventDefault(); 

      
        if (e.deltaY < 0) {
            scale += 0.1; 
        } else {
            scale -= 0.1; 
        }

      
        scale = Math.max(0.8, Math.min(5, scale));

        
        img.style.transform = `scale(${scale})`;
    }, { passive: false });

   
    fsDiv.onclick = function(e) {
        if (e.target === fsDiv) {
            closeFullFullscreen();
        }
    };
}


function closeFullFullscreen() {
    const fsDiv = document.getElementById('global-fullscreen-view');
    if (fsDiv) {
        fsDiv.remove();
    }
}


function removeContextMenu() {
    const menu = document.getElementById('custom-context-menu');
    if (menu) menu.remove();
}

function renderSettingsLists() {
    const methodList = document.getElementById('settings-method-list');
    const itemWrapperStyle = "display: inline-flex; align-items: center; gap: 8px; background-color: #ff6b6b; padding: 4px; border-radius: 8px; margin: 4px; list-style: none;";
    const innerBoxStyle = "background-color: #0284c7; color: white; font-weight: bold; padding: 6px 12px; border-radius: 6px; font-size: 13px; display: inline-block;";
    const closeBtnStyle = "background: rgba(0,0,0,0.3); color: white; border: none; border-radius: 50%; width: 18px; height: 18px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; padding: 0; transition: background 0.2s;";

    if(methodList) {
        methodList.innerHTML = '';
        methodOptions.forEach((opt) => {
            const li = document.createElement('li'); li.style.cssText = itemWrapperStyle;
            li.innerHTML = `<span style="${innerBoxStyle}">${opt}</span><button style="${closeBtnStyle}" onclick="removeListItem('method', '${opt}')">×</button>`;
            methodList.appendChild(li);
        });
    }

    const sessionList = document.getElementById('settings-session-list');
    if(sessionList) {
        sessionList.innerHTML = '';
        sessionOptions.forEach((opt) => {
            const li = document.createElement('li'); li.style.cssText = itemWrapperStyle;
            li.innerHTML = `<span style="${innerBoxStyle}">${opt}</span><button style="${closeBtnStyle}" onclick="removeListItem('session', '${opt}')">×</button>`;
            sessionList.appendChild(li);
        });
    }

    const pairList = document.getElementById('settings-pair-list');
    if(pairList) {
        pairList.innerHTML = '';
        pairOptions.forEach((opt) => {
            const li = document.createElement('li'); li.style.cssText = itemWrapperStyle;
            li.innerHTML = `<span style="${innerBoxStyle}">${opt}</span><button style="${closeBtnStyle}" onclick="removeListItem('pair', '${opt}')">×</button>`;
            pairList.appendChild(li);
        });
    }
}

function addMethodOption() {
    const input = document.getElementById('txt-new-method'); if (!input) return;
    const value = input.value.trim().toUpperCase();
    if (value === '') return;
    if (methodOptions.includes(value)) { alert('Alert: This method already exists!'); return; }
    methodOptions.push(value); input.value = ''; saveDataToFirebase(); renderSettingsLists();
}

function addSessionOption() {
    const input = document.getElementById('txt-new-session'); if(!input) return;
    const value = input.value.trim().toUpperCase();
    if (value === '') return;
    if (sessionOptions.includes(value)) { alert('Alert: This session already exists!'); return; }
    sessionOptions.push(value); input.value = ''; saveDataToFirebase(); renderSettingsLists();
}

function addPairOption() {
    const input = document.getElementById('txt-new-pair'); if(!input) return;
    const value = input.value.trim().toUpperCase();
    if (value === '') return;
    if (pairOptions.includes(value)) { alert('Alert: This pair already exists!'); return; }
    pairOptions.push(value); input.value = ''; saveDataToFirebase(); renderSettingsLists();
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content') || document.querySelector('main');
    if (sidebar) sidebar.classList.toggle('collapsed');
    if (mainContent) mainContent.classList.toggle('expanded');
}

//  2. BACKGROUND CANVAS GRAPHICS & CURSOR ANIMATION
const canvasBg = document.getElementById('trading-bg-canvas');
const ctxBg = canvasBg.getContext('2d');
const cursor = document.getElementById('custom-glow-cursor');

let widthBg = canvasBg.width = window.innerWidth;
let heightBg = canvasBg.height = window.innerHeight;

window.addEventListener('mousemove', (e) => {
    if(cursor) { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; }
});

window.addEventListener('mousedown', () => {
    if(cursor) {
        cursor.style.width = '30px'; cursor.style.height = '30px';
        cursor.style.background = 'rgba(34, 197, 94, 0.5)'; cursor.style.borderColor = '#22c55e';
        cursor.style.boxShadow = '0 0 20px #22c55e';
    }
});

window.addEventListener('mouseup', () => {
    if(cursor) {
        cursor.style.width = '20px'; cursor.style.height = '20px';
        cursor.style.background = 'rgba(14, 213, 168, 0.4)'; cursor.style.borderColor = '#0ed5a8';
        cursor.style.boxShadow = '0 0 15px #0ed5a8, 0 0 30px rgba(14, 213, 168, 0.6)';
    }
});

const chartsCount = 3; const charts = [];
for (let i = 0; i < chartsCount; i++) {
    charts.push({
        y: heightBg / 2 + (i - 1) * 150, candles: [], maxCandles: Math.floor(widthBg / 25), trend: Math.random() > 0.5 ? 1 : -1
    });
}

function generateInitialData() {
    charts.forEach(chart => {
        let currentY = chart.y;
        for (let i = 0; i < chart.maxCandles; i++) {
            let change = (Math.random() * 40 - 20) + (chart.trend * 5);
            let open = currentY; let close = currentY + change;
            let high = Math.max(open, close) + Math.random() * 15; let low = Math.min(open, close) - Math.random() * 15;
            
            chart.candles.push({ open, close, high, low, isGreen: close < open });
            currentY = close;
            if (Math.random() > 0.85) chart.trend *= -1;
        }
    });
}

function drawTradingCharts() {
    ctxBg.clearRect(0, 0, widthBg, heightBg);
    ctxBg.strokeStyle = 'rgba(255, 255, 255, 0.02)'; ctxBg.lineWidth = 1;
    for (let x = 0; x < widthBg; x += 50) { ctxBg.beginPath(); ctxBg.moveTo(x, 0); ctxBg.lineTo(x, heightBg); ctxBg.stroke(); }
    for (let y = 0; y < heightBg; y += 50) { ctxBg.beginPath(); ctxBg.moveTo(0, y); ctxBg.lineTo(widthBg, y); ctxBg.stroke(); }

    charts.forEach(chart => {
        chart.candles.forEach((candle, index) => {
            let x = index * 25 + 10;
            ctxBg.strokeStyle = candle.isGreen ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'; ctxBg.lineWidth = 1.5;
            ctxBg.beginPath(); ctxBg.moveTo(x, candle.high); ctxBg.lineTo(x, candle.low); ctxBg.stroke();

            ctxBg.fillStyle = candle.isGreen ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)';
            let bodyHeight = candle.close - candle.open; ctxBg.fillRect(x - 6, candle.open, 12, bodyHeight || 1);
        });

        let lastCandle = chart.candles[chart.candles.length - 1];
        let nextTrend = Math.random() > 0.8 ? chart.trend * -1 : chart.trend; chart.trend = nextTrend;

        let change = (Math.random() * 30 - 15) + (chart.trend * 4); let open = lastCandle.close; let close = open + change;

        if (close < 50 || close > heightBg - 50) { chart.trend *= -1; close = open + (chart.trend * 10); }

        let high = Math.max(open, close) + Math.random() * 10; let low = Math.min(open, close) - Math.random() * 10;
        chart.candles.shift(); chart.candles.push({ open, close, high, low, isGreen: close < open });
    });
}

window.addEventListener('resize', () => {
    widthBg = canvasBg.width = window.innerWidth; heightBg = canvasBg.height = window.innerHeight;
});

generateInitialData();
setInterval(drawTradingCharts, 300);


// EXPORT BACKUP
function exportJSONBackup() {
    if (typeof journalTables !== 'undefined' && journalTables.length > 0) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(journalTables, null, 2));
        const today = new Date().toISOString().split('T')[0];
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `Trading_Journal_Backup_${today}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click(); downloadAnchor.remove();
        alert("📊  The database was successfully backed up to the PC.");
    } else { alert("There is no data in the table to delete or backup!"); }
}

// IMPORT BACKUP
function importJSONBackup(event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                journalTables = importedData; saveDataToFirebase(); 
                if (typeof renderTables === 'function') { renderTables(); } 
                else if (typeof loadJournalData === 'function') { loadJournalData(); }
                alert("✅  Database Backup successfully imported..");
            } else { alert("There's a problem! This seems to be the wrong file.."); }
        } catch (err) { alert("An error occurred while reading the file.: " + err.message); }
    };
    reader.readAsText(file);
}

function resetDropdownField(index, field) {
    const tableIndex = journalTables.findIndex(t => t.id === currentTableId); if (tableIndex === -1) return;
    let currentRows = journalTables[tableIndex].months[currentMonth] || [];
    if (currentRows[index]) { currentRows[index][field] = ""; saveDataToFirebase(); renderRows(currentRows); }
}

function removeListItem(type, value) {
    if (type === 'pair') { pairOptions = pairOptions.filter(opt => opt !== value); } 
    else if (type === 'method') { methodOptions = methodOptions.filter(opt => opt !== value); } 
    else if (type === 'session') { sessionOptions = sessionOptions.filter(opt => opt !== value); }
    saveDataToFirebase(); renderSettingsLists();
}

// AD MODAL
document.addEventListener("DOMContentLoaded", () => {
    const openAdBtn = document.getElementById("open-ad-modal");
    const adModal = document.getElementById("ad-custom-modal");
    const closeAdBtn = document.getElementById("close-ad-modal");

    if (openAdBtn && adModal && closeAdBtn) {
        openAdBtn.addEventListener("click", () => { adModal.style.display = "flex"; });
        closeAdBtn.addEventListener("click", () => { adModal.style.display = "none"; });
        adModal.addEventListener("click", (e) => { if (e.target === adModal) { adModal.style.display = "none"; } });
    }
   
    initUIVisuals();
});







/* ==========================================================================
    GOOGLE DRIVE INTEGRATION CONFIGURATION
   ========================================================================== */
const API_KEY = 'AIzaSyD0ea4fJK0Q2FMTEqMMzVzlzj-TJSFunKY';
const CLIENT_ID = '1067236645973-vqh432e01qnr8vtsmi3gtaeg3b581ong.apps.googleusercontent.com';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// FIXED: Scopes with ReadOnly and File access
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file';

let tokenClient;
let gapiInited = false;
let gisInited = false;

/* ==========================================================================
    WINDOW ONLOAD & INITIALIZATION
   ========================================================================== */
window.onload = function() {

    gapi.load('client', async () => {
        try {
            await gapi.client.init({ apiKey: API_KEY, discoveryDocs: [DISCOVERY_DOC] });
            gapiInited = true;
            console.log("Google API Initialized! ✅");
        } catch(err) {
            console.error("GAPI Init Error:", err);
        }
    });

  
    if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (resp) => {
                if (resp.error !== undefined) throw resp;
                console.log('Google Drive connected successfully! 🎉');
                fetchGoogleDriveFiles(); 
            }
        });
        gisInited = true;
    }

 
    setupSidebarNavigation();
    setupTabSwitching();
    setupUploadButtonHandlers();
};

function checkAndAutoAuth() {
    if (gapiInited && gisInited) {
        if (gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({ prompt: '' }); 
        }
    }
}

function setupSidebarNavigation() {
    const noteBtn = document.getElementById('btn-Note');
    if (noteBtn) {
        noteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const notesSection = document.getElementById('your-notes-section');
            if (notesSection) {
                notesSection.style.display = 'block'; 
            }
        });
    }


    const otherButtons = document.querySelectorAll('#btn-home, #btn-tables, #btn-settings');
    otherButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const notesSection = document.getElementById('your-notes-section');
            if (notesSection) notesSection.style.display = 'none';
        });
    });
}

/* ==========================================================================
    TABS SWITCHING LOGIC (UPLOAD / SAVED NOTES)
   ========================================================================== */
function setupTabSwitching() {
    const tabUploadBtn = document.getElementById('tab-upload-btn');
    const tabSavedBtn = document.getElementById('tab-saved-btn');
    const uploadContent = document.getElementById('upload-tab-content');
    const savedContent = document.getElementById('saved-tab-content');

    if (tabUploadBtn && tabSavedBtn) {
        tabUploadBtn.onclick = function(e) {
            e.preventDefault();
            if(uploadContent) uploadContent.style.display = 'block';
            if(savedContent) savedContent.style.display = 'none';
            tabUploadBtn.classList.add('active');
            tabSavedBtn.classList.remove('active');
        };

        tabSavedBtn.onclick = function(e) {
            e.preventDefault();
            if(uploadContent) uploadContent.style.display = 'none';
            if(savedContent) savedContent.style.display = 'block';
            tabSavedBtn.classList.add('active');
            tabUploadBtn.classList.remove('active');
            
          
            fetchGoogleDriveFiles();
        };
    }
}

/* ==========================================================================
    BROWSE BUTTON & DRAG/DROP EVENTS (FIXED FOR INDEX.HTML)
   ========================================================================== */
function setupUploadButtonHandlers() {
    // Browse button click handler
    document.body.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('btn-browse')) {
            e.preventDefault();
            if (gapi.client.getToken() === null) {
                tokenClient.requestAccessToken({ prompt: 'consent' });
                return;
            }
            const fileInput = document.getElementById('file_input');
            if (fileInput) fileInput.click();
        }
        
        // Success popup close handler
        if (e.target && e.target.id === 'close-popup-btn') {
            const successPopup = document.getElementById('success-popup-box');
            if(successPopup) successPopup.style.display = 'none';
        }
    });

    // File selection handling
    document.body.addEventListener('change', function(e) {
        if (e.target && e.target.id === 'file_input') {
            handleMultipleFiles(e.target.files);
        }
    });

    // Drag & Drop effects
    document.body.addEventListener('dragover', function(e) {
        const dropZone = document.querySelector('.drop-zone');
        if (dropZone && dropZone.contains(e.target)) {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        }
    });

    document.body.addEventListener('dragleave', function(e) {
        const dropZone = document.querySelector('.drop-zone');
        if (dropZone && !dropZone.contains(e.relatedTarget)) {
            dropZone.classList.remove('drag-over');
        }
    });

    document.body.addEventListener('drop', function(e) {
        const dropZone = document.querySelector('.drop-zone');
        if (dropZone && dropZone.contains(e.target)) {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            handleMultipleFiles(e.dataTransfer.files);
        }
    });
}

/* ==========================================================================
   FILE UPLOAD WITH REAL PROGRESS BAR
   ========================================================================== */
async function handleMultipleFiles(files) {
    const validFiles = [];
    for (let file of files) {
        const ext = file.name.split('.').pop().toLowerCase();
        if (file.type === 'application/pdf' || ext === 'pdf') {
            validFiles.push(file);
        }
    }

    if (validFiles.length === 0) {
        alert("Please select PDF (.pdf) files only! ❌");
        return;
    }

    const uploadPromises = validFiles.map(file => uploadFileWithProgress(file));
    await Promise.all(uploadPromises);
    
    // Refresh files list after successful upload
    fetchGoogleDriveFiles();
    
    setTimeout(() => {
        const successPopup = document.getElementById('success-popup-box');
        const fileInput = document.getElementById('file_input');
        if(successPopup) successPopup.style.display = 'flex';
        if(fileInput) fileInput.value = '';
    }, 800);
}

function uploadFileWithProgress(file) {
    return new Promise((resolve) => {
        const progressList = document.getElementById('upload-progress-list');
        if (!progressList || gapi.client.getToken() === null) {
            resolve();
            return;
        }

        const fileId = 'file-' + Date.now() + '-' + Math.floor(Math.random() * 100);
        const itemHTML = `
            <div class="file-progress-item" id="${fileId}">
                <div class="file-details">
                    <span class="file-name">📄 ${file.name}</span>
                    <span class="file-percent" id="percent-${fileId}">0%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" id="bar-${fileId}"></div>
                </div>
            </div>
        `;
        progressList.insertAdjacentHTML('beforeend', itemHTML);

        const metadata = { name: file.name, mimeType: file.type };
        const fb = new FormData();
        fb.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        fb.append('file', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
        xhr.setRequestHeader('Authorization', 'Bearer ' + gapi.client.getToken().access_token);

        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                const barElement = document.getElementById(`bar-${fileId}`);
                const percentText = document.getElementById(`percent-${fileId}`);
                
                if (barElement && percentText) {
                    barElement.style.width = percentComplete + '%';
                    percentText.innerText = percentComplete + '%';
                }
            }
        };

        xhr.onload = function() {
            setTimeout(() => {
                const element = document.getElementById(fileId);
                if(element) element.remove();
            }, 1000);
            resolve();
        };

        xhr.onerror = function() {
            alert(`Upload failed for: ${file.name}`);
            const element = document.getElementById(fileId);
            if(element) element.remove();
            resolve();
        };

        xhr.send(fb);
    });
}


/* ==========================================================================
 FETCH GOOGLE DRIVE FILES (CHROME OPEN FIX)
   ========================================================================== */
async function fetchGoogleDriveFiles() {
    const filesListContainer = document.getElementById('saved-files-list');
    const fetchLoader = document.getElementById('fetch-loader');
    
    if (!filesListContainer) return;
    
    if (fetchLoader) fetchLoader.style.display = 'block';
    filesListContainer.innerHTML = '';

    let currentToken = gapi.client.getToken();
    
    if (currentToken === null || !currentToken.scope.includes('drive.readonly')) {
        if (fetchLoader) fetchLoader.style.display = 'none';
        filesListContainer.innerHTML = '<div class="no-files-msg">🔑 Connecting to Google Drive safely... Please check the pop-up.</div>';
        tokenClient.requestAccessToken({ prompt: 'consent' });
        return;
    }

    try {
        const response = await gapi.client.drive.files.list({
            q: "mimeType='application/pdf' and trashed=false",
            fields: 'files(id, name, webViewLink, webContentLink)', 
            pageSize: 30,
            orderBy: 'createdTime desc'
        });

        const files = response.result.files;
        if (fetchLoader) fetchLoader.style.display = 'none';

        if (files && files.length > 0) {
            files.forEach(file => {
            
                const fileLink = file.webViewLink; 

                const fileItemHTML = `
                    <div class="drive-file-item">
                        <div class="file-info">
                            <span>📄</span>
                            <span class="drive-file-name" title="${file.name}">${file.name}</span>
                        </div>
                        <a href="${fileLink}" target="_blank" class="btn-view-file">View File</a>
                    </div>
                `;
                filesListContainer.insertAdjacentHTML('beforeend', fileItemHTML);
            });
        } else {
            filesListContainer.innerHTML = '<div class="no-files-msg">🗂️ No PDF files found. Try uploading a PDF first!</div>';
        }
    } catch (error) {
        console.error('Google Drive Fetch Error:', error);
        if (fetchLoader) fetchLoader.style.display = 'none';
        
        if (error.status === 403 || error.status === 401) {
            gapi.client.setToken(null);
            filesListContainer.innerHTML = '<div class="no-files-msg">🔐 Session expired. Click "Saved Notes" again to refresh access.</div>';
        } else {
            filesListContainer.innerHTML = '<div class="no-files-msg">❌ Error connecting to Google Drive API.</div>';
        }
    }
}
// =================================
//  Master Auto Overwrite Backup Section (12 PM Only)
// =================================

function updateBackupStatusDisplay() {
    const statusTextEl = document.getElementById('backup-status-text');
    const statusDotEl = document.getElementById('backup-status-dot');
    if (!statusTextEl || !statusDotEl) return;

    const todayDate = new Date().toISOString().split('T')[0];
    const lastBackupDate = localStorage.getItem("lastAutoBackupDate_12PM");

    
    statusDotEl.classList.remove('dot-green', 'dot-red');

    if (lastBackupDate === todayDate) {
        statusTextEl.innerText = `Saved (${todayDate})`;
        statusTextEl.style.color = "#34d399"; 
        statusDotEl.classList.add('dot-green');
    } else {
        statusTextEl.innerText = `Not Saved Yet (${todayDate})`;
        statusTextEl.style.color = "#f87171"; 
        
        statusDotEl.classList.add('dot-red');
    }
}

function checkAndTriggerAutoBackup() {
    const now = new Date();
    const currentHour = now.getHours(); 
    const todayDate = now.toISOString().split('T')[0]; 
    const lastBackupDate = localStorage.getItem("lastAutoBackupDate_12PM");

    if (currentHour >= 12 && lastBackupDate !== todayDate) {
        console.log("🚀 Triggering Auto Backup exactly for 12 PM slot!");
        triggerJsonDownload(); 

        localStorage.setItem("lastAutoBackupDate_12PM", todayDate);
    }
    

    updateBackupStatusDisplay();
}

function triggerJsonDownload() {
    try {
        const backupData = {
            info: "Dk Software Master Backup",
            timestamp: new Date().toLocaleString(),
            developer: "Dk Software's Student Project",
            status: "Automated Master Safety Backup at 12PM"
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "Trading_Journal_AutoBackup_12PM.json");
        
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        
        showSuccessToast(); 
        updateBackupStatusDisplay();
    } catch (error) {
        console.error("Backup download failed:", error);
    }
}

function showSuccessToast() {
    const oldToast = document.getElementById('backup-success-toast');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.id = 'backup-success-toast';
    toast.className = 'toast-save-success';
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">💾</span>
            <div class="toast-text">
                <h4>SAVE SUCCESS</h4>
                <p>Today's 12 PM Master Backup has been downloaded successfully!</p>
            </div>
        </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastFadeOut 0.4s ease forwards';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}


window.addEventListener("DOMContentLoaded", () => {
    checkAndTriggerAutoBackup();
    setInterval(checkAndTriggerAutoBackup, 1000 * 60); 
});


function triggerJsonDownload() {
    try {
        const backupData = {
            info: "Dk Software Master Backup",
            timestamp: new Date().toLocaleString(),
            developer: "Dk Software's Student Project",
            status: "Automated Master Safety Backup at 12PM"
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        
        const now = new Date();
        const dateString = now.toISOString().split('T')[0]; 
        const timeString = now.getHours() + "-" + now.getMinutes(); 
        
      
        downloadAnchor.setAttribute("download", `Trading_Journal_Backup_${dateString}_${timeString}.json`);
        
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        
        showSuccessToast(); 
        updateBackupStatusDisplay();
    } catch (error) {
        console.error("Backup download failed:", error);
    }
}

// =================================
// End of Auto backup section
// =================================
// =================================
// Row locking section
// =================================

const IS_SOFTWARE_ENGINEER = true; 


function showLockedAlertMessage() {
   
    const oldToast = document.querySelector('.locked-toast-alert');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'locked-toast-alert';
    toast.innerHTML = `⚠️ <span>This row is locked because the day has passed!</span>`;
    document.body.appendChild(toast);

   
    setTimeout(() => {
        toast.style.transition = "opacity 0.5s ease";
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function applyRowLockingSystem() {
    if (IS_SOFTWARE_ENGINEER) return; 

    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60 * 1000));
    const todayDateStr = localDate.toISOString().split('T')[0];

   
    const journalRows = document.querySelectorAll("#table-body tr, #journal-table-body tr, tr.journal-row"); 

    journalRows.forEach(row => {
       
        if (row.innerText.includes("WEEKLY SUMMARY")) return;

        let rowDateStr = row.getAttribute("data-date"); 

        if (!rowDateStr) {
            const firstCell = row.querySelector("td");
            if (firstCell) {
                const cellText = firstCell.innerText.trim(); 
                
                if (cellText.includes("-")) {
                    rowDateStr = cellText;
                } else if (cellText.includes("/")) {
                    const parts = cellText.split("/");
                    if (parts.length === 3) {
                        rowDateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                    }
                }
            }
        }

        if (rowDateStr && rowDateStr < todayDateStr && rowDateStr.length >= 10) {
            
           
            row.querySelectorAll("input, select, textarea").forEach(input => {
                input.disabled = true;
                input.style.opacity = "0.5";
                input.style.cursor = "not-allowed";
            });

           
            row.querySelectorAll('[contenteditable="true"]').forEach(cell => {
                cell.setAttribute('contenteditable', 'false');
                cell.style.opacity = "0.6";
                cell.style.cursor = "not-allowed";
            });

          
            row.querySelectorAll(".btn-edit, .btn-delete, .action-btn").forEach(btn => {
                btn.style.pointerEvents = "none";
                btn.style.opacity = "0.3";
            });

           
            row.querySelectorAll(".btn-view-img, .btn-view-image, .image-preview-btn, [id*='view'], [class*='view']").forEach(imgBtn => {
                imgBtn.style.pointerEvents = "auto";
                imgBtn.style.opacity = "1";
                imgBtn.style.cursor = "pointer";
            });

           
            if (!row.classList.contains("locked-historical-row")) {
                row.classList.add("locked-historical-row");
                
                
                row.addEventListener('click', (e) => {
                    if (!e.target.closest('button') && !e.target.closest('.btn-view-img') && !e.target.closest('label')) {
                        showLockedAlertMessage();
                    }
                });
            }
        }
    });
}


window.addEventListener("DOMContentLoaded", () => {
    setTimeout(applyRowLockingSystem, 1500); 
    setInterval(applyRowLockingSystem, 2000); 
});
// =========================================================================
// END OF LOCKING SYSTEM
// =========================================================================
// =================================
// End of Row locking section
// =================================