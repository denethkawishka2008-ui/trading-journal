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

// 📈 1. HOME PAGE BACKGROUND TRADING LINE ANIMATION (CANVAS)
function initTradingAnimation() {
    const homeView = document.getElementById('home-view');
    if (!homeView) return;

    // පරණ කැන්වස් එකක් තිබ්බොත් අයින් කරනවා
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
    canvas.style.opacity = '0.15'; // Background එකේ ලස්සනට පේන්න
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
    let currentX = 0;
    let currentY = height / 2;

    function generatePoints() {
        points = [];
        let x = 0;
        let y = height / 2 + (Math.random() - 0.5) * 100;
        while (x < width + 50) {
            points.push({ x: x, y: y });
            x += 40 + Math.random() * 40;
            y += (Math.random() - 0.5) * 80;
            if (y < 50) y = 50;
            if (y > height - 50) y = height - 50;
        }
    }
    generatePoints();

    let drawIndex = 0;
    let pX = points[0].x;
    let pY = points[0].y;

    function animateLine() {
        ctx.clearRect(0, 0, width, height);
        
        // Grid Lines ඇඳීම
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 60) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
        }
        for (let i = 0; i < height; i += 60) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
        }

        // Trading Chart Line එක ඇඳීම
        ctx.beginPath();
        ctx.strokeStyle = '#22c55e'; // Green Chart Line
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#22c55e';
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i <= drawIndex; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.lineTo(pX, pY);
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset Shadow

        // Live Moving Dot එක
        ctx.beginPath();
        ctx.arc(pX, pY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444'; // Red Live Dot
        ctx.fill();

        // ඊළඟ Point එකට යන ගමන ගණනය කිරීම
        let target = points[drawIndex + 1];
        if (target) {
            let dx = target.x - pX;
            let dy = target.y - pY;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 4) {
                pX = target.x;
                pY = target.y;
                drawIndex++;
            } else {
                pX += (dx / dist) * 4;
                pY += (dy / dist) * 4;
            }
        } else {
            drawIndex = 0;
            generatePoints();
            pX = points[0].x;
            pY = points[0].y;
        }
        requestAnimationFrame(animateLine);
    }
    animateLine();
}

// 🔻 2. COPYRIGHT NOTE AND CSS INJECTION (RUNS ON LOAD)
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
        /* Row Appear & Delete Shake Animations */
        @keyframes trAppear {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-tr { animation: trAppear 0.35s ease-out forwards; }
        .row-shake { animation: shakeEffect 0.4s ease-in-out; }
        @keyframes shakeEffect {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
        }
        /* Image Modal Beautiful Zoom In Animation */
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
        copyrightDiv.innerHTML = `© COPYRIGHT BY DENETH'S SOFTWARES<br>v1.1`;
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
        initTradingAnimation(); // හෝම් ආවම ඇනිමේෂන් එක රීස්ටාර්ට් කරයි
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
    const tableName = prompt("Enter table name ::");
    if (!tableName) return;

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

function deleteRow(rowIndex) {
    const tableData = journalTables.find(t => t.id === currentTableId);
    tableData.months[currentMonth].splice(rowIndex, 1);
    saveDataToFirebase(); 
    renderRows(tableData.months[currentMonth]);
}

function renderRows(rows) {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    rows.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.className = 'animate-tr'; // 🎬 පේළි වැටෙද්දී ලස්සනට එන ඇනිමේෂන් එක
        
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

        let pairClass = row.pair === 'EUR/USD' ? 'cell-eurusd' : (row.pair === 'GBP/USD' ? 'cell-gbpusd' : '');
        let sideClass = row.side === 'Buy' ? 'cell-buy' : (row.side === 'Sell' ? 'cell-sell' : '');
        let methodClass = row.method === 'MSS' ? 'cell-mss' : (row.method === 'CISD' ? 'cell-cisd' : '');
        let resultClass = row.result === 'Profit' ? 'cell-profit' : (row.result === 'Loss' ? 'cell-loss' : (row.result === 'BE' ? 'cell-be' : ''));
        let RRClass = row.rr === '1:2' ? 'cell-rr-12' : (row.rr === '1:3' ? 'cell-rr-13' : '');

        tr.innerHTML = `
            <td style="text-align: center; vertical-align: middle; padding: 8px;" class="checkbox-cell">
                <input type="checkbox" class="row-checkbox" data-index="${index}" style="width: 18px; height: 18px; cursor: pointer;">
            </td>
            <td contenteditable="true" onblur="updateData(${index}, 'date', this.innerText)">${row.date || ''}</td>
            <td contenteditable="false" style="background-color: #f8fafc; color: #64748b; font-weight: 600;">${row.day || ''}</td>
   
            <td class="${pairClass}">
                <select class="table-dropdown" onchange="updateDropdownData(${index}, 'pair', this.value, this.parentElement)">
                    <option value="" ${row.pair === '' ? 'selected' : ''}>Select...</option>
                    ${pairOptions.map(opt => `<option value="${opt}" ${row.pair === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
            </td>
            
            <td class="${sideClass}">
                <select class="table-dropdown" onchange="updateDropdownData(${index}, 'side', this.value, this.parentElement)">
                    <option value="" ${row.side === '' ? 'selected' : ''}>Select...</option>
                    <option value="Buy" ${row.side === 'Buy' ? 'selected' : ''}>Buy</option>
                    <option value="Sell" ${row.side === 'Sell' ? 'selected' : ''}>Sell</option>
                </select>
            </td>

            <td class="${methodClass}">
                <select class="table-dropdown" onchange="updateDropdownData(${index}, 'method', this.value, this.parentElement)">
                    <option value="" ${row.method === '' ? 'selected' : ''}>Select...</option>   
                    ${methodOptions.map(opt => `<option value="${opt}" ${row.method === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
            </td>

            <td class="${resultClass}">
                <select class="table-dropdown" onchange="updateDropdownData(${index}, 'result', this.value, this.parentElement)">
                    <option value="" ${row.result === '' ? 'selected' : ''}>Select...</option>
                    <option value="Profit" ${row.result === 'Profit' ? 'selected' : ''}>Profit</option>
                    <option value="Loss" ${row.result === 'Loss' ? 'selected' : ''}>Loss</option>
                    <option value="BE" ${row.result === 'BE' ? 'selected' : ''}>BE</option>
                </select>
            </td>

            <td>
                <select class="table-dropdown" onchange="updateDropdownData(${index}, 'session', this.value, this.parentElement)">
                    <option value="" ${row.session === '' ? 'selected' : ''}>Select...</option>   
                    ${sessionOptions.map(opt => `<option value="${opt}" ${row.session === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
            </td>
            

          <td class="${RRClass}">
                <select class="table-dropdown" onchange="updateDropdownData(${index}, 'side', this.value, this.parentElement)">
                    <option value="" ${row.side === '' ? 'selected' : ''}>Select...</option>
                    <option value="1:2" ${row.side === '1:2' ? 'selected' : ''}>1:2</option>
                    <option value="1:3" ${row.side === '1:3' ? 'selected' : ''}>1:3</option>
                </select>
            </td>
               
          
            <td contenteditable="true" onblur="updateData(${index}, 'entryReason', this.innerText)">${row.entryReason || ''}</td>
            <td contenteditable="true" onblur="updateData(${index}, 'targetPoint', this.innerText)">${row.targetPoint || ''}</td>
            <td contenteditable="true" onblur="updateData(${index}, 'notes', this.innerText)">${row.notes || ''}</td>

            <td>
                <div style="display:flex; flex-direction:column; gap:4px; align-items:center;">
                    <label class="btn-upload-label" style="background-color: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: bold;">
                        📁 Upload
                        <input type="file" accept="image/*" style="display:none;" onchange="uploadRowImage(this, ${index})">
                    </label>
                    <button id="btn-view-img-${index}" class="btn-view-img ${row.image ? '' : 'hidden'}" style="background-color: #8b5cf6; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: bold;" onclick="viewRowImage(${index})">👁️ View</button>
                </div>
            </td>
        `;

        // 🎯 Checkbox එක Click කරද්දී වෙනත් Checkbox ඔටෝ Clear වන කොටස
        const chk = tr.querySelector('.row-checkbox');
        chk.addEventListener('click', function(e) {
            e.stopPropagation(); // Document click එක වළක්වයි
            const currentStatus = this.checked;
            
            // හැම බොක්ස් එකක්ම අයින් කරයි
            document.querySelectorAll('.row-checkbox').forEach(cb => cb.checked = false);
            
            // ක්ලික් කරපු එක විතරක් සෙට් කරයි
            this.checked = currentStatus;
        });

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
    monthRows[rowIndex][field] = value; 

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

        if (monthRows[i].day === 'Sunday') {
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

function uploadRowImage(input, index) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Image = e.target.result;
            const tableData = journalTables.find(t => t.id === currentTableId);
            tableData.months[currentMonth][index].image = base64Image;
            
            const viewBtn = document.getElementById(`btn-view-img-${index}`);
            if (viewBtn) viewBtn.classList.remove('hidden');
            
            saveDataToFirebase(); 
            alert("Chart Image Uploaded and Saved to Cloud! 📈");
        };
        reader.readAsDataURL(file);
    }
}

// 👁️ 3. IMAGE MODAL WITH CUBIC-BEZIER POP ANIMATION
function viewRowImage(index) {
    const tableData = journalTables.find(t => t.id === currentTableId);
    const rowData = tableData.months[currentMonth][index];
    if (rowData && rowData.image) {
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-preview-img');
        modalImg.src = rowData.image;
        
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('show-modal'); // Smooth Transition Trigger
        }, 10);
    }
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
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
                <button class="btn-remove-opt" onclick="deleteMethodOption(${index})">❌</button>
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
                <button class="btn-remove-opt" onclick="deleteSessionOption(${index})">❌</button>
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
                <button class="btn-remove-opt" onclick="deletePairOption(${index})">❌</button>
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

function deleteMethodOption(index) {
    methodOptions.splice(index, 1);
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

function deleteSessionOption(index) {
    sessionOptions.splice(index, 1);
    saveDataToFirebase(); 
    renderSettingsLists();
}

function deletePairOption(index) {
    pairOptions.splice(index, 1);
    saveDataToFirebase(); 
    renderSettingsLists();
}

/*delete row function for multiple rows*/
function deleteSelectedRows() {
    const tableData = journalTables.find(t => t.id === currentTableId);
    if (!tableData) return;

    let monthRows = tableData.months[currentMonth];
    const checkedBoxes = document.querySelectorAll('.row-checkbox:checked');
    
    let indexesToDelete = [];

    checkedBoxes.forEach(box => {
        let idx = parseInt(box.getAttribute('data-index'));
        if (!isNaN(idx)) {
            indexesToDelete.push(idx);
        }
    });

    if (indexesToDelete.length === 0) {
        // 🎬 මුකුත් තෝරලා නැත්නම් මුළු Table එකම ගැස්සෙන (Shake) ඇනිමේෂන් එකක් දානවා
        const table = document.querySelector('.journal-table') || document.getElementById('table-body');
        if(table) {
            table.classList.add('row-shake');
            setTimeout(() => table.classList.remove('row-shake'), 400);
        }
        alert("කරුණාකර මැකීමට අවශ්‍ය පේළියේ ඇති කොටුව (Checkbox) ටික් කරන්න!");
        return;
    }

    if (confirm(`තෝරාගත් පේළිය මකා දැමීමට ඔබට විශ්වාසද?`)) {
        indexesToDelete.sort((a, b) => b - a);
        
        indexesToDelete.forEach(index => {
            if (monthRows[index]) {
                monthRows.splice(index, 1);
            }
        });

        refreshWeeklyStats(monthRows);
        alert("තෝරාගත් පේළිය සාර්ථකව මකා දැමුණා! 💾");
    }
}

// 🌍 4. GLOBAL CLICK LISTENER: වෙන තැනක් ක්ලික් කරොත් CHECKBOX OTO CLEAR VEMA
document.addEventListener('click', function(e) {
    // ක්ලික් කළේ checkbox එකක්, dropdown, textbox, හෝ delete බටන් එක උඩ නෙවෙයි නම් විතරක් ටික් අයින් කරයි
    if (!e.target.closest('.row-checkbox') && 
        e.target.id !== 'btn-delete-selected' && 
        !e.target.closest('#btn-delete-selected') && 
        e.target.tagName !== 'SELECT' && 
        e.target.getAttribute('contenteditable') !== 'true') {
        
        document.querySelectorAll('.row-checkbox').forEach(cb => {
            cb.checked = false;
        });
    }
});