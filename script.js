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
// 📈 1. HOME PAGE BACKGROUND REAL TRADING WAVE ANIMATION
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
    canvas.style.opacity = '0.35'; // පසුබිම පැහැදිලිව පෙනීමට
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

    // 🌊 සැබෑ මාකට් එකක වගේ ඉහළ පල්ලෙහා යන Wave එකක් සාදා ගැනීම (Road Map)
    function generateMarketWave() {
        points = [];
        candles = [];
        
        let x = 0;
        let y = height / 2 + (Math.random() - 0.5) * 50;
        
        // ආරම්භක ලක්ෂ්‍යය
        points.push({ x: x, y: y });

        // මුළු Screen එක පුරාම රෝඩ් මැප් එකේ ලක්ෂ්‍යයන් සෑදීම
        while (x < width + 200) {
            // තරංග ආකාරයට උඩ සහ පල්ලෙහා යාමට සලස්වයි (Up-trends & Down-trends)
            let waveDirection = Math.random() > 0.5 ? 1 : -1;
            let waveHeight = 60 + Math.random() * 120;
            let waveLength = 120 + Math.random() * 100;
            
            let targetX = x + waveLength;
            let targetY = y + (waveDirection * waveHeight);
            
            // සීමාවන් පාලනය
            if (targetY < 80) targetY = 80 + Math.random() * 40;
            if (targetY > height - 80) targetY = height - 80 - Math.random() * 40;

            // අතරමැදි කුඩා කැන්ඩ්ල්ස් ලක්ෂ්‍යයන් පිරවීම (Smooth Wave එකක් සඳහා)
            let steps = Math.floor(waveLength / 25);
            for (let i = 1; i <= steps; i++) {
                let t = i / steps;
                let currX = x + (targetX - x) * t;
                let currY = y + (targetY - y) * t;
                
                points.push({ x: currX, y: currY });

                // වීඩියෝ එකේ වගේ එක ළඟ පිහිටි ලස්සන කැන්ඩ්ල්ස් සෑදීම
                let isBullish = (targetY < y); // යන දිශාව අනුව Green/Red තීරණය වේ
                if (Math.random() > 0.2) { // 80% ක්ම කැන්ඩ්ල්ස් සාදයි
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
        
        // Background Grid Lines
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.03)';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 80) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
        }
        for (let i = 0; i < height; i += 60) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
        }

        // 🕯️ වීඩියෝ එකේ වගේ මනරම් ට්‍රේඩින් කැන්ඩ්ල්ස් එකින් එක ඇඳීම
        candles.forEach(c => {
            if (c.x <= pX) {
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = c.isBullish ? '#22c55e' : '#ef4444';
                
                // Wick (ඉර)
                ctx.beginPath(); 
                ctx.moveTo(c.x, c.high); 
                ctx.lineTo(c.x, c.low); 
                ctx.stroke();
                
                // Body (කොටුව)
                ctx.fillStyle = c.isBullish ? '#22c55e' : '#ef4444';
                ctx.fillRect(c.x - 5, Math.min(c.open, c.close), 10, Math.abs(c.open - c.close));
            }
        });

        // ඊළඟ Point එක කරා ගමන් කිරීම
        let target = points[drawIndex + 1];
        if (target) {
            let dx = target.x - pX;
            let dy = target.y - pY;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 5) {
                pX = target.x; pY = target.y; drawIndex++;
            } else {
                pX += (dx / dist) * 5; // වේගය පාලනය (Speed)
                pY += (dy / dist) * 5;
            }
        } else {
            // Screen එක ඉවර වුණාම නැවත මුල ඉඳන් අලුත් Wave එකක් පටන් ගනියි
            drawIndex = 0;
            generateMarketWave();
            pX = points[0].x; pY = points[0].y;
        }

        // ✨ ලයිව් මැජික් පුලිඟු කෑලි (Live Magic Ticks)
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

        // 🔴 දිලිසෙන ලයිව් මැජික් ඩොට් එක (Live Pulsing Glow Dot)
        if (pulseGrowing) { pulseRadius += 0.4; if (pulseRadius > 12) pulseGrowing = false; } 
        else { pulseRadius -= 0.4; if (pulseRadius < 5) pulseGrowing = true; }

        ctx.beginPath(); ctx.arc(pX, pY, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239, 68, 68, ${0.4 - (pulseRadius / 35)})`; ctx.fill();

        ctx.beginPath(); ctx.arc(pX, pY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444'; ctx.shadowBlur = 10; ctx.shadowColor = '#ef4444'; ctx.fill(); ctx.shadowBlur = 0;

        requestAnimationFrame(animateLine);
    }
    animateLine();
}
function initUIVisuals() {
    // CSS Animations ටික dynamic ලෙස Inject කිරීම
    const style = document.createElement('style');
    style.innerHTML = `
        /* Copyright Note Styling */
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
 =================================================================================           
        /*============== Row Appear & Delete Shake Animations========= */
======================================================================================        
        @keyframes trAppear {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
       
/*=========================================================
        Image Modal Beautiful Zoom In Animation
========================================================*/
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

    // Sidebar එකේ අන්තිමටම රතු පාට Copyright එක ඇතුළත් කිරීම
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && !document.querySelector('.dev-copyright-note')) {
        const copyrightDiv = document.createElement('div');
        copyrightDiv.className = 'dev-copyright-note';
        copyrightDiv.innerHTML = `© COPYRIGHT BY DENETH'S SOFTWARES<br>v1.3`;
        sidebar.appendChild(copyrightDiv);
    }
    
    // Animation එක පටන් ගැන්ම
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

loadDataFromFirebase();

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

    cancelBtn.onclick = function() {
        modal.remove();
    };

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

    modal.onclick = function(e) {
        if (e.target === modal) modal.remove();
    };
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
        card.oncontextmenu = (event) => {
            showContextMenu(event, table.id);
        };
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
        date: '', 
        day: '', 
        pair: '', 
        side: '', 
        method: '', 
        result: '', 
        session: '',
        rr: '',
        entryReason: '',
        targetPoint: '',
        notes: '',
        image: '' 
    };
    
    tableData.months[currentMonth].push(newRow);
    saveDataToFirebase(); 
    renderRows(tableData.months[currentMonth]);
}

function renderRows(rows) {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    rows.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.className = 'animate-tr'; 
        
        if (row.isWeeklyExcelRow) {
            tr.style.backgroundColor = "#c0a0c9"; 
            tr.style.fontWeight = "bold";
            tr.style.textAlign = "center";
            
            tr.innerHTML = `
                <td style="background-color: rgba(0,0,0,0.05);"></td>
                <td colspan="3" style="color: #1e1b4b; padding: 10px; font-size: 13px;">WEEKLY RESULT</td>
                <td colspan="2" style="background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;">Profit: ${row.profitCount}</td>
                <td style="background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca;">Loss: ${row.lossCount}</td>
                <td style="background-color: #fef9c3; color: #854d0e; border: 1px solid #fef08a;">BE: ${row.beCount}</td>
                <td colspan="3" style="color: #1e1b4b; font-size: 13px;">Weekly Winning Percentage</td>
                <td colspan="2" style="background-color: #d1fae5; color: #047857; font-size: 15px; font-weight: 800; border: 1px solid #a7f3d0;">${row.winRate}%</td>
                <td colspan="2" style="background-color: rgba(0,0,0,0.05);"></td>
            `;
            tbody.appendChild(tr);
            return; 
        }

        // 🎨 Dropdown එකේ සිලෙක්ට් කරන අගය අනුව වටේ තියෙන Cell (TD) එකේ පසුබිම් පාට Auto තීරණය කරන හැටි
        const getCellBgStyle = (val) => {
            if (val === "" || val === "Select...") return ""; 
            if (val === "Profit" || val === "Buy") return "background-color: #22c55e;"; // ලස්සන කොළ පාට
            if (val === "Loss" || val === "Sell") return "background-color: #ef4444;"; // ලස්සන රතු පාට
            if (val === "BE") return "background-color: #eab308;"; // කහ පාට
            // CISD, MSS, 1:2, 1:3 සහ Sessions වලට Auto නිල්/දම් පාට වැටෙනවා
            return "background-color: #3b82f6;"; 
        };

        // ⚪ හැම Dropdown Box එකක්ම 100%ක්ම සුදු පාටින් තියාගන්නා Style එක
        let whiteDropdownStyle = "width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: bold; text-align: center; padding: 6px; cursor: pointer; font-size: 13px; background-color: #ffffff; color: #000000; outline: none;";

        tr.innerHTML = `
            <td contenteditable="true" onblur="updateData(${index}, 'date', this.innerText)">${row.date || ''}</td>
            <td contenteditable="false" style="background-color: #f8fafc; color: #64748b; font-weight: 600;">${row.day || ''}</td>
   
            <td style="${getCellBgStyle(row.pair)}">
                <select style="${whiteDropdownStyle}" class="table-dropdown" onchange="updateDropdownData(${index}, 'pair', this.value, this.parentElement)">
                    <option value="" ${row.pair === '' ? 'selected' : ''}>Select...</option>
                    ${pairOptions.map(opt => `<option value="${opt}" ${row.pair === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
            </td>
            
            <td style="${getCellBgStyle(row.side)}">
                <select style="${whiteDropdownStyle}" class="table-dropdown" onchange="updateDropdownData(${index}, 'side', this.value, this.parentElement)">
                    <option value="" ${row.side === '' ? 'selected' : ''}>Select...</option>
                    <option value="Buy" ${row.side === 'Buy' ? 'selected' : ''}>Buy</option>
                    <option value="Sell" ${row.side === 'Sell' ? 'selected' : ''}>Sell</option>
                </select>
            </td>

            <td style="${getCellBgStyle(row.method)}">
                <select style="${whiteDropdownStyle}" class="table-dropdown" onchange="updateDropdownData(${index}, 'method', this.value, this.parentElement)">
                    <option value="" ${row.method === '' ? 'selected' : ''}>Select...</option>   
                    ${methodOptions.map(opt => `<option value="${opt}" ${row.method === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
            </td>

            <td style="${getCellBgStyle(row.result)}">
                <select style="${whiteDropdownStyle}" class="table-dropdown" onchange="updateDropdownData(${index}, 'result', this.value, this.parentElement)">
                    <option value="" ${row.result === '' ? 'selected' : ''}>Select...</option>
                    <option value="Profit" ${row.result === 'Profit' ? 'selected' : ''}>Profit</option>
                    <option value="Loss" ${row.result === 'Loss' ? 'selected' : ''}>Loss</option>
                    <option value="BE" ${row.result === 'BE' ? 'selected' : ''}>BE</option>
                </select>
            </td>

            <td style="${getCellBgStyle(row.session)}">
                <select style="${whiteDropdownStyle}" class="table-dropdown" onchange="updateDropdownData(${index}, 'session', this.value, this.parentElement)">
                    <option value="" ${row.session === '' ? 'selected' : ''}>Select...</option>   
                    ${sessionOptions.map(opt => `<option value="${opt}" ${row.session === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
            </td>
            
            <td style="${getCellBgStyle(row.rr)}">
                <select style="${whiteDropdownStyle}" class="table-dropdown" onchange="updateDropdownData(${index}, 'rr', this.value, this.parentElement)">
                    <option value="" ${row.rr === '' ? 'selected' : ''}>Select...</option>
                    <option value="1:2" ${row.rr === '1:2' ? 'selected' : ''}>1:2</option>
                    <option value="1:3" ${row.rr === '1:3' ? 'selected' : ''}>1:3</option>
                </select>
            </td>
               
            <td contenteditable="true" onblur="updateData(${index}, 'entryReason', this.innerText)">${row.entryReason || ''}</td>
            <td contenteditable="true" onblur="updateData(${index}, 'targetPoint', this.innerText)">${row.targetPoint || ''}</td>
            <td contenteditable="true" onblur="updateData(${index}, 'notes', this.innerText)">${row.notes || ''}</td>

            <td>
                <div style="display:flex; flex-direction:row; gap:6px; align-items:center; justify-content:center;">
                    <label class="btn-upload-label" style="background-color: #3b82f6; color: white; padding: 5px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: bold; margin: 0; display: inline-flex; align-items: center;">
                        📁 Upload
                        <input type="file" accept="image/*" style="display:none;" data-true-index="${index}" onchange="uploadRowImage(this)">
                    </label>
                    <button id="btn-view-img-${index}" class="btn-view-img ${row.image ? '' : 'hidden'}" style="background-color: #8b5cf6; color: white; border: none; padding: 5px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: bold; margin: 0; display: inline-flex; align-items: center;" onclick="viewRowImage(${index})">👁️ View</button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });

    calculateStats(rows);
}


function updateData(rowIndex, field, value) {
    const tableData = journalTables.find(t => t.id === currentTableId);
    if (!tableData) return;
    
    let monthRows = tableData.months[currentMonth];
    
    if (monthRows[rowIndex]) {
        monthRows[rowIndex][field] = value;
    }

    if (field === 'date') { 
        let dateStr = value.trim();
        let formattedDate = dateStr.replace(/\./g, '-'); 
        let parsedDate = new Date(formattedDate);
        
        if (!isNaN(parsedDate.getTime())) {
            const daysArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            let dayName = daysArray[parsedDate.getDay()];
            
            monthRows[rowIndex].day = dayName;
        }
    }

    refreshWeeklyStats(monthRows);
}

function updateDropdownData(rowIndex, field, value, cellElement) {
    const tableData = journalTables.find(t => t.id === currentTableId);
    if (!tableData) return;

    let monthRows = tableData.months[currentMonth];
    if (monthRows[rowIndex]) {
        monthRows[rowIndex][field] = value; 
    }

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
        if (monthRows[i].isWeeklyExcelRow) {
            monthRows.splice(i, 1);
        }
    }

    let weeklyProfit = 0;
    let weeklyLoss = 0;
    let weeklyBE = 0;

    for (let i = 0; i < monthRows.length; i++) {
        if (monthRows[i].result === 'Profit') weeklyProfit++;
        if (monthRows[i].result === 'Loss') weeklyLoss++;
        if (monthRows[i].result === 'BE') weeklyBE++;

        if (monthRows[i].day === 'Friday') {
            let totalWinLoss = weeklyProfit + weeklyLoss;
            let winPercentage = (totalWinLoss > 0) ? ((weeklyProfit / totalWinLoss) * 100).toFixed(0) : 0;

            let excelSummaryRow = {
                isWeeklyExcelRow: true,
                profitCount: weeklyProfit,
                lossCount: weeklyLoss,
                beCount: weeklyBE,
                winRate: winPercentage
            };

            monthRows.splice(i + 1, 0, excelSummaryRow);
            weeklyProfit = 0;
            weeklyLoss = 0;
            weeklyBE = 0;
            i++; 
        }
    }

    saveDataToFirebase(); 
    renderRows(monthRows);
}

function calculateStats(rows) {
    let profitCount = 0;
    let lossCount = 0;
    let beCount = 0;

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

    if (monthlyWinRateEl) {
        monthlyWinRateEl.innerText = monthlyWinRate + "%";
    }
}

function uploadRowImage(input) {
    const index = parseInt(input.getAttribute('data-true-index'));
    const file = input.files[0];
    if (file) {
        const formData = new FormData();
        formData.append("image", file);

        // මෙතනට ඔයාගේ අලුත්ම API Key එක ලස්සනට සෙට් කරලා තියෙන්නේ මචං
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
                    tableData.months[currentMonth][index].image = downloadURL;
                }
                
                const viewBtn = document.getElementById(`btn-view-img-${index}`);
                if (viewBtn) viewBtn.classList.remove('hidden');
                
                saveDataToFirebase();

                // Custom Notification Toast
                const oldToast = document.getElementById('custom-toast-msg');
                if (oldToast) oldToast.remove();

                const toast = document.createElement('div');
                toast.id = 'custom-toast-msg';
                toast.style = "position:fixed; top:20px; right:20px; background:#10b981; color:#ffffff; padding:14px 24px; border-radius:8px; font-weight:bold; font-family:sans-serif; font-size:14px; box-shadow:0 5px 15px rgba(0,0,0,0.3); z-index:999999; animation: toastSlide 0.3s ease-out; border-left:5px solid #047857;";
                toast.innerHTML = "📈 Chart Image Saved Successfully!";
                
                document.body.appendChild(toast);

                setTimeout(() => {
                    toast.style.animation = "toastFadeOut 0.3s ease-in forwards";
                    setTimeout(() => toast.remove(), 300);
                }, 2500);
            } else {
                alert("Upload failed via API");
            }
        })
        .catch(error => {
            alert("Error uploading image: " + error.message);
        });
    }
}

function viewRowImage(index) {
    const tableData = journalTables.find(t => t.id === currentTableId);
    if (!tableData) return;
    const rowData = tableData.months[currentMonth][index];
    if (rowData && rowData.image) {
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-preview-img');
        modalImg.src = rowData.image;
        
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('show-modal'); 
        }, 10);
    }
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (!modal) return;
    modal.classList.remove('show-modal');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function showContextMenu(event, tableId) {
    event.preventDefault(); 
    removeContextMenu();

    const contextMenu = document.createElement('div');
    contextMenu.id = 'custom-context-menu';
    contextMenu.innerText = '🗑️ Delete Table';
    
    contextMenu.style.top = `${event.pageY}px`;
    contextMenu.style.left = `${event.pageX}px`;

    contextMenu.onclick = (e) => {
        e.stopPropagation();
        if (confirm("ඔබට විශ්වාසද මෙම Table එක සම්පූර්ණයෙන්ම මකා දැමීමට අවශ්‍ය බව?")) {
            journalTables = journalTables.filter(t => t.id !== tableId);
            saveDataToFirebase(); 
            renderTableList();
        }
        removeContextMenu();
    };

    document.body.appendChild(contextMenu);
    document.body.onclick = removeContextMenu;
}

function removeContextMenu() {
    const menu = document.getElementById('custom-context-menu');
    if (menu) menu.remove();
}

function renderSettingsLists() {
    const methodList = document.getElementById('settings-method-list');
    if(methodList) {
        methodList.innerHTML = '';
        methodOptions.forEach((opt, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${opt}</span>

            `;
            methodList.appendChild(li);
        });
    }

    const sessionList = document.getElementById('settings-session-list');
    if(sessionList) {
        sessionList.innerHTML = '';
        sessionOptions.forEach((opt, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${opt}</span>
             
            `;
            sessionList.appendChild(li);
        });
    }

    const pairList = document.getElementById('settings-pair-list');
    if(pairList) {
        pairList.innerHTML = '';
        pairOptions.forEach((opt, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${opt}</span>
              
            `;
            pairList.appendChild(li);
        });
    }
}

function addMethodOption() {
    const input = document.getElementById('txt-new-method');
    if (!input) return;
    const value = input.value.trim().toUpperCase();

    if (value === '') return;
    if (methodOptions.includes(value)) {
        alert('Alert: This method already exists!');
        return;
    }

    methodOptions.push(value);
    input.value = '';
    saveDataToFirebase(); 
    renderSettingsLists();
}

function addSessionOption() {
    const input = document.getElementById('txt-new-session');
    if(!input) return;
    const value = input.value.trim().toUpperCase();

    if (value === '') return;
    if (sessionOptions.includes(value)) {
        alert('Alert: This session already exists!');
        return;
    }

    sessionOptions.push(value);
    input.value = '';
    saveDataToFirebase(); 
    renderSettingsLists();
}

function addPairOption() {
    const input = document.getElementById('txt-new-pair');
    if(!input) return;
    const value = input.value.trim().toUpperCase();

    if (value === '') return;
    if (pairOptions.includes(value)) {
        alert('Alert: This pair already exists!');
        return;
    }

    pairOptions.push(value);
    input.value = '';
    saveDataToFirebase(); 
    renderSettingsLists();
}



function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content') || document.querySelector('main');

    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
    
    if (mainContent) {
        mainContent.classList.toggle('expanded');
    }
}
/*==================================================
                  cusor animetion
=====================================================*/


const canvas = document.getElementById('trading-bg-canvas');
const ctx = canvas.getContext('2d');
const cursor = document.getElementById('custom-glow-cursor');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

window.addEventListener('mousedown', () => {
    cursor.style.width = '30px';
    cursor.style.height = '30px';
    cursor.style.background = 'rgba(34, 197, 94, 0.5)';
    cursor.style.borderColor = '#22c55e';
    cursor.style.boxShadow = '0 0 20px #22c55e';
});

window.addEventListener('mouseup', () => {
    cursor.style.width = '20px';
    cursor.style.height = '20px';
    cursor.style.background = 'rgba(14, 213, 168, 0.4)';
    cursor.style.borderColor = '#0ed5a8';
    cursor.style.boxShadow = '0 0 15px #0ed5a8, 0 0 30px rgba(14, 213, 168, 0.6)';
});

const chartsCount = 3;
const charts = [];

for (let i = 0; i < chartsCount; i++) {
    charts.push({
        y: height / 2 + (i - 1) * 150,
        candles: [],
        maxCandles: Math.floor(width / 25),
        trend: Math.random() > 0.5 ? 1 : -1
    });
}

function generateInitialData() {
    charts.forEach(chart => {
        let currentY = chart.y;
        for (let i = 0; i < chart.maxCandles; i++) {
            let change = (Math.random() * 40 - 20) + (chart.trend * 5);
            let open = currentY;
            let close = currentY + change;
            let high = Math.max(open, close) + Math.random() * 15;
            let low = Math.min(open, close) - Math.random() * 15;
            
            chart.candles.push({ open, close, high, low, isGreen: close < open });
            currentY = close;

            if (Math.random() > 0.85) chart.trend *= -1;
        }
    });
}

function drawTradingCharts() {
    ctx.clearRect(0, 0, width, height);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 50) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    charts.forEach(chart => {
        chart.candles.forEach((candle, index) => {
            let x = index * 25 + 10;
            
            ctx.strokeStyle = candle.isGreen ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x, candle.high);
            ctx.lineTo(x, candle.low);
            ctx.stroke();

            ctx.fillStyle = candle.isGreen ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)';
            let bodyHeight = candle.close - candle.open;
            ctx.fillRect(x - 6, candle.open, 12, bodyHeight || 1);
        });

        let lastCandle = chart.candles[chart.candles.length - 1];
        let nextTrend = Math.random() > 0.8 ? chart.trend * -1 : chart.trend;
        chart.trend = nextTrend;

        let change = (Math.random() * 30 - 15) + (chart.trend * 4);
        let open = lastCandle.close;
        let close = open + change;

        if (close < 50 || close > height - 50) {
            chart.trend *= -1;
            close = open + (chart.trend * 10);
        }

        let high = Math.max(open, close) + Math.random() * 10;
        let low = Math.min(open, close) - Math.random() * 10;

        chart.candles.shift();
        chart.candles.push({ open, close, high, low, isGreen: close < open });
    });
}

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

generateInitialData();
setInterval(drawTradingCharts, 300);













document.getElementById('download-excel-btn').addEventListener('click', () => {
    const table = document.getElementById('my-trading-table');
    const dataMatrix = [];

    const headers = [];
    const headerCells = table.querySelectorAll('thead tr th');
    
    headerCells.forEach((th, index) => {
        if (index === 0 || index === headerCells.length - 1) return;
        headers.push(th.innerText.trim());
    });
    dataMatrix.push(headers);

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const rowData = [];
        const cells = row.cells;
        
        if (cells.length < 2) return;

        for (let i = 1; i < cells.length - 1; i++) {
            const cell = cells[i];
            
            const select = cell.querySelector('select');
            if (select) {
                rowData.push(select.value && select.value !== 'Select...' ? select.value : "");
                continue;
            }

            const input = cell.querySelector('input');
            if (input) {
                rowData.push(input.value ? input.value : "");
                continue;
            }

            rowData.push(cell.innerText.trim());
        }

        if (rowData.some(val => val !== "")) {
            dataMatrix.push(rowData);
        }
    });

    const worksheet = XLSX.utils.aoa_to_sheet(dataMatrix);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trading Journal");

    XLSX.writeFile(workbook, "Trading_Journal_Master.xlsx");
});



document.getElementById('download-pdf-btn').addEventListener('click', () => {
    const table = document.getElementById('my-trading-table');

    html2canvas(table, {
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#040814', 
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('l', 'mm', 'a4');
        
        const imgWidth = 280; 
        const pageHeight = 210; 
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 10; 

        pdf.setFont("Helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(255, 255, 255); 

        pdf.addImage(imgData, 'PNG', 8, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 8, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('Trading_Journal_Snapshot.pdf');
    });
});




function exportJSONBackup() {
 
    if (typeof journalTables !== 'undefined' && journalTables.length > 0) {
        
    
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(journalTables, null, 2));
        
    
        const today = new Date().toISOString().split('T')[0];
        const downloadAnchor = document.createElement('a');
        
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `Trading_Journal_Backup_${today}.json`);
        document.body.appendChild(downloadAnchor);
        
        downloadAnchor.click(); 
        downloadAnchor.remove();
        
 
        alert("📊 මුළු ඩේටාබේස් එකම සාර්ථකව PC එකට Backup කරගත්තා මචං!");
    } else {
        alert("මකන්න හෝ Backup කරන්න තරම් ඩේටා කිසිවක් ටේබල් එකේ නැහැ!");
    }
}



function importJSONBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {

            const importedData = JSON.parse(e.target.result);
            
            if (Array.isArray(importedData)) {
          
                journalTables = importedData;
                
             
                saveDataToFirebase(); 
                
        
                if (typeof renderTables === 'function') {
                    renderTables(); 
                } else if (typeof loadJournalData === 'function') {
                    loadJournalData();
                }
                
                alert("✅ JSON Backup එක සාර්ථකව Import කරා මචං! දැන් ඔක්කොම ඩේටා බලාගන්න පුළුවන්.");
            } else {
                alert("අවුලක් තියෙනවා! මේක වැරදි ෆයිල් එකක් වගෙයි.");
            }
        } catch (err) {
            alert("ෆයිල් එක කියවීමේදී දෝෂයක් වැටුණා: " + err.message);
        }
    };
    
    reader.readAsText(file);
}