// DOM element referansları - HTML elementlerini JavaScript'te kullanmak için
const modeBtns = document.querySelectorAll('.mode-btn'); // Oyun modu butonları (Bilgisayar/İki Kişi)
const difficultyBtns = document.querySelectorAll('.difficulty-btn'); // Zorluk seviyesi butonları
const sizeBtns = document.querySelectorAll('.size-btn'); // Tahta boyutu butonları
const startBtn = document.getElementById('startBtn'); // Oyunu başlat butonu
const resetBtn = document.getElementById('resetBtn'); // Sıfırla butonu
const nameInputsWrap = document.getElementById('nameInputs'); // Oyuncu isim girişi konteyneri
const difficultySection = document.getElementById('difficultySection'); // Zorluk seviyesi bölümü
const p1Input = document.getElementById('player1Name'); // 1. oyuncu isim girişi
const p2Input = document.getElementById('player2Name'); // 2. oyuncu isim girişi

// Oyun tahtası ve bilgi elementleri
const boardWrap = document.getElementById('boardWrap'); // Tahta konteyneri
const boardEl = document.getElementById('board'); // Oyun tahtası
const turnDisplay = document.getElementById('turnDisplay'); // Sıra gösterici

// Popup/overlay elementleri
const overlay = document.getElementById('overlay'); // Sonuç popup'ı
const overlayTitle = document.getElementById('overlayTitle'); // Popup başlığı
const overlayDesc = document.getElementById('overlayDesc'); // Popup açıklaması
const overlayPlayAgain = document.getElementById('overlayPlayAgain'); // Tekrar oyna butonu
const overlayClose = document.getElementById('overlayClose'); // Kapat butonu

// Oyun durumu değişkenleri
let mode = 'computer'; // Oyun modu: 'computer' veya 'two'
let difficulty = 'easy'; // Zorluk seviyesi: 'easy', 'medium', 'hard'
let size = 3; // Tahta boyutu: 3, 6, 9
let winCount = 3; // Kazanmak için gereken taş sayısı
let board = []; // Oyun tahtası veri yapısı
let cells = []; // DOM hücre elementleri
let current = 'X'; // Şu anki oyuncu
let active = false; // Oyun aktif mi?
let player1 = 'X'; // 1. oyuncu adı
let player2 = 'O'; // 2. oyuncu adı

// Tahta boyutuna göre kazanma sayısını belirle
function determineWinCount(sz) {
    if (sz === 3) return 3; // 3x3 tahta için 3 taş gerekli
    if (sz === 6) return 4; // 6x6 tahta için 4 taş gerekli
    if (sz === 9) return 5; // 9x9 tahta için 5 taş gerekli
    return 5; // Varsayılan olarak 5
}

// Sayfa yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', () => {
    // Oyun modu butonlarına tıklama olayı ekle
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Tüm mod butonlarından active sınıfını kaldır
            modeBtns.forEach(b => b.classList.remove('active'));
            // Tıklanan butona active sınıfını ekle
            btn.classList.add('active');
            // Mod değişkenini güncelle
            mode = btn.dataset.mode;
            // Moda göre ilgili bölümleri göster/gizle
            if (mode === 'two') {
                nameInputsWrap.classList.remove('hidden'); // İsim girişini göster
                difficultySection.classList.add('hidden'); // Zorluk bölümünü gizle
            } else if (mode === 'computer') {
                nameInputsWrap.classList.add('hidden'); // İsim girişini gizle
                difficultySection.classList.remove('hidden'); // Zorluk bölümünü göster
            }
            stopGameVisual(); // Oyun görselini sıfırla
        });
    });

    // Zorluk seviyesi butonlarına tıklama olayı ekle
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Tüm zorluk butonlarından active sınıfını kaldır
            difficultyBtns.forEach(b => b.classList.remove('active'));
            // Tıklanan butona active sınıfını ekle
            btn.classList.add('active');
            // Zorluk seviyesini güncelle
            difficulty = btn.dataset.difficulty;
            stopGameVisual(); // Oyun görselini sıfırla
        });
    });

    // Tahta boyutu butonlarına tıklama olayı ekle
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Tüm boyut butonlarından active sınıfını kaldır
            sizeBtns.forEach(b => b.classList.remove('active'));
            // Tıklanan butona active sınıfını ekle
            btn.classList.add('active');
            // Tahta boyutunu güncelle
            size = parseInt(btn.dataset.size, 10);
            // Kazanma sayısını hesapla
            winCount = determineWinCount(size);
            // Tahta elementine boyut bilgisini ekle
            boardEl.setAttribute('data-size', String(size));
            // Bilgi metnini güncelle
            turnDisplay.textContent = `Seçildi: ${size}×${size} — Kazanmak için: ${winCount} taş`;
            stopGameVisual(); // Oyun görselini sıfırla
        });
    });
    // Başlat butonuna tıklama olayı
    startBtn.addEventListener('click', () => {
        startGame(); // Oyunu başlat
    });
    // Sıfırla butonuna tıklama olayı
    resetBtn.addEventListener('click', () => {
        resetAll(); // Her şeyi sıfırla
    });

    // Popup butonlarına tıklama olayları
    overlayPlayAgain.addEventListener('click', () => {
        overlay.classList.add('hidden'); // Popup'ı gizle
        startGame(); // Yeni oyun başlat
    });
    overlayClose.addEventListener('click', () => {
        overlay.classList.add('hidden'); // Popup'ı gizle
    });

    // Sayfa yüklendiğinde varsayılan durumu ayarla
    difficultySection.classList.add('hidden'); // Zorluk bölümünü gizle
    nameInputsWrap.classList.add('hidden'); // İsim girişini gizle
    boardEl.setAttribute('data-size', String(size)); // Tahta boyutunu ayarla
    turnDisplay.textContent = 'Mod ve boyut seçip Başlat düğmesine basın'; // Başlangıç mesajı
});

// Oyunu başlatma fonksiyonu
function startGame() {
    // Tahta boyutu kontrolü
    if (!size || !([3, 6, 9].includes(size))) {
        alert('Lütfen tahta boyutunu (3x3 / 6x6 / 9x9) seçin.');
        return;
    }
    // Moda göre oyuncu isimlerini ayarla
    if (mode === 'two') {
        const n1 = p1Input.value.trim(); // 1. oyuncu ismini al
        const n2 = p2Input.value.trim(); // 2. oyuncu ismini al
        player1 = n1 || 'Oyuncu 1'; // Boşsa varsayılan isim
        player2 = n2 || 'Oyuncu 2'; // Boşsa varsayılan isim
    } else {
        player1 = 'Sen'; // İnsan oyuncu
        player2 = 'Bilgisayar'; // Bilgisayar oyuncu
    }
    // Oyun durumunu sıfırla
    winCount = determineWinCount(size); // Kazanma sayısını hesapla
    board = new Array(size * size).fill(''); // Boş tahta oluştur
    cells = []; // Hücre referanslarını temizle
    current = 'X'; // İlk oyuncu X
    active = true; // Oyunu aktif yap
    renderBoard(); // Tahtayı çiz
    boardWrap.classList.remove('hidden'); // Tahtayı göster
    turnDisplay.textContent = `${current === 'X' ? player1 : player2} sırada (${current})`; // Sıra bilgisini göster
}

// Oyun tahtasını DOM'da oluştur
function renderBoard() {
    boardEl.innerHTML = ''; // Tahtayı temizle
    boardEl.setAttribute('data-size', String(size)); // Boyut bilgisini ekle
    // Her hücre için DOM elementi oluştur
    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div'); // Yeni div elementi
        cell.className = 'cell'; // CSS sınıfını ekle
        cell.dataset.index = i; // Hücre indeksini sakla
        cell.addEventListener('click', onCellClick); // Tıklama olayı ekle
        boardEl.appendChild(cell); // Tahtaya ekle
        cells.push(cell); // Referansı sakla
    }
}

// Hücre tıklama olayı
function onCellClick(e) {
    if (!active) return; // Oyun aktif değilse çık
    const idx = parseInt(e.currentTarget.dataset.index, 10); // Hücre indeksini al
    if (board[idx]) return; // Hücre doluysa çık

    // Bilgisayar modunda ve bilgisayar sırasındaysa tıklamaları engelle
    if (mode === 'computer' && current === 'O' && player2 === 'Bilgisayar') {
        return;
    }

    makeMove(idx); // Hamleyi yap
}

// Hamle yapma fonksiyonu
function makeMove(idx) {
    board[idx] = current; // Tahtaya hamleyi kaydet
    const cell = cells[idx]; // Hücre elementini al
    cell.textContent = current; // Hücreye sembolü yaz
    cell.classList.add(current.toLowerCase()); // CSS sınıfını ekle

    // Kazanma kontrolü
    if (checkWin(idx, current)) {
        active = false; // Oyunu durdur
        const winnerName = current === 'X' ? player1 : player2; // Kazanan ismini al
        showOverlay(`🎉 ${winnerName} kazandı!`, `${winnerName} (${current}) oyunu kazandı.`); // Kazanma mesajı göster
        return;
    }

    // Beraberlik kontrolü
    if (board.every(v => v !== '')) {
        active = false; // Oyunu durdur
        showOverlay('🤝 Berabere', 'Oyun berabere bitti. Tekrar deneyin.'); // Beraberlik mesajı göster
        return;
    }
    
    // Sırayı değiştir
    current = current === 'X' ? 'O' : 'X';
    turnDisplay.textContent = `${current === 'X' ? player1 : player2} sırada (${current})`; // Sıra bilgisini güncelle

    // Bilgisayar modunda ve bilgisayar sırasındaysa otomatik hamle yap
    if (mode === 'computer' && current === 'O' && player2 === 'Bilgisayar' && active) {
        setTimeout(() => computerMove(), 350 + Math.random() * 350); // Rastgele gecikme ile hamle yap
    }
}

// Bilgisayar hamle fonksiyonu - zorluk seviyesine göre strateji uygular
function computerMove() {
    if (!active) return; // Oyun aktif değilse çık
    const empty = board.map((v, i) => v === '' ? i : -1).filter(i => i !== -1); // Boş hücreleri bul
    if (empty.length === 0) return; // Boş hücre yoksa çık
    
    let choice; // Seçilen hücre indeksi
    
    // Zorluk seviyesine göre strateji uygula
    switch (difficulty) {
        case 'easy':
            // Kolay: Tamamen rastgele hamle
            choice = empty[Math.floor(Math.random() * empty.length)];
            break;
            
        case 'medium':
            // Orta: %70 akıllı hamle, %30 rastgele
            if (Math.random() < 0.7) {
                choice = getSmartMove(); // Akıllı hamle dene
                if (choice === -1) choice = empty[Math.floor(Math.random() * empty.length)]; // Başarısızsa rastgele
            } else {
                choice = empty[Math.floor(Math.random() * empty.length)]; // Rastgele hamle
            }
            break;
            
        case 'hard':
            // Zor: Her zaman akıllı hamle yapmaya çalış
            choice = getSmartMove(); // Akıllı hamle dene
            if (choice === -1) choice = empty[Math.floor(Math.random() * empty.length)]; // Başarısızsa rastgele
            break;
            
        default:
            choice = empty[Math.floor(Math.random() * empty.length)]; // Varsayılan rastgele
    }
    
    makeMove(choice); // Seçilen hamleyi yap
}

// Akıllı hamle stratejisi - kazanma, engelleme ve stratejik pozisyon alma
function getSmartMove() {
    // 1. Önce kazanmaya çalış - bilgisayar kendisi kazanabilir mi?
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = 'O'; // Bilgisayar hamlesini dene
            if (checkWin(i, 'O')) {
                board[i] = ''; // Hamleyi geri al
                return i; // Bu pozisyonu seç
            }
            board[i] = ''; // Hamleyi geri al
        }
    }
    
    // 2. Rakibi engelle - rakip kazanabilir mi?
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = 'X'; // Rakip hamlesini dene
            if (checkWin(i, 'X')) {
                board[i] = ''; // Hamleyi geri al
                return i; // Bu pozisyonu seç (rakip kazanmasın)
            }
            board[i] = ''; // Hamleyi geri al
        }
    }
    
    // 3. Merkezi al - merkez pozisyon stratejik olarak önemli
    const center = Math.floor(size * size / 2);
    if (board[center] === '') return center;
    
    // 4. Köşeleri al - köşe pozisyonları da stratejik
    const corners = [0, size - 1, size * (size - 1), size * size - 1];
    for (const corner of corners) {
        if (board[corner] === '') return corner;
    }
    
    // 5. Kenarları al - son seçenek olarak kenar pozisyonları
    const edges = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const idx = i * size + j;
            if (board[idx] === '' && (i === 0 || i === size - 1 || j === 0 || j === size - 1)) {
                edges.push(idx);
            }
        }
    }
    if (edges.length > 0) return edges[Math.floor(Math.random() * edges.length)];
    
    return -1; // Akıllı hamle bulunamadı
}

// Kazanma kontrolü - belirli bir pozisyondan itibaren kazanma var mı?
function checkWin(idx, player) {
    const N = size; // Tahta boyutu
    const W = winCount; // Kazanmak için gereken taş sayısı
    const r = Math.floor(idx / N); // Satır indeksi
    const c = idx % N; // Sütun indeksi

    // Kontrol edilecek yönler: yatay, dikey, çapraz
    const dirs = [
        [0, 1],   // Yatay (sağ)
        [1, 0],   // Dikey (aşağı)
        [1, 1],   // Çapraz (sağ-aşağı)
        [1, -1]   // Çapraz (sol-aşağı)
    ];

    // Her yön için kontrol et
    for (const [dr, dc] of dirs) {
        let count = 1; // Mevcut pozisyonu say
        // İleri yönde say
        let rr = r + dr;
        let cc = c + dc;
        while (inBounds(rr, cc) && board[rr * N + cc] === player) {
            count++;
            rr += dr;
            cc += dc;
        }
        // Geri yönde say
        rr = r - dr;
        cc = c - dc;
        while (inBounds(rr, cc) && board[rr * N + cc] === player) {
            count++;
            rr -= dr;
            cc -= dc;
        }
        // Kazanma sayısına ulaştı mı?
        if (count >= W) return true;
    }
    return false; // Kazanma yok
}

// Koordinat tahta sınırları içinde mi kontrol et
function inBounds(r, c) {
    return r >= 0 && c >= 0 && r < size && c < size;
}

// Sonuç popup'ını göster
function showOverlay(title, desc) {
    overlayTitle.textContent = title; // Başlığı ayarla
    overlayDesc.textContent = desc; // Açıklamayı ayarla
    overlay.classList.remove('hidden'); // Popup'ı göster
}

// Oyun görselini durdur - tahtayı gizle
function stopGameVisual() {
    boardWrap.classList.add('hidden'); // Tahtayı gizle
    boardEl.innerHTML = ''; // Tahta içeriğini temizle
    active = false; // Oyunu pasif yap
    turnDisplay.textContent = 'Mod veya boyut değiştirildi — yeniden Başlat'; // Bilgi mesajı
}

// Her şeyi sıfırla - varsayılan duruma dön
function resetAll() {
    // Tüm butonları varsayılan duruma getir
    modeBtns.forEach((b, i) => {
        b.classList.remove('active');
        if (i === 0) b.classList.add('active'); // İlk butonu aktif yap
    });
    difficultyBtns.forEach((b, i) => {
        b.classList.remove('active');
        if (i === 0) b.classList.add('active'); // İlk butonu aktif yap
    });
    sizeBtns.forEach((b, i) => {
        b.classList.remove('active');
        if (i === 0) b.classList.add('active'); // İlk butonu aktif yap
    });
    
    // Input değerlerini temizle
    p1Input.value = '';
    p2Input.value = '';
    
    // Değişkenleri varsayılan değerlere sıfırla
    mode = 'computer';
    difficulty = 'easy';
    size = 3;
    winCount = determineWinCount(size);
    
    // UI durumunu ayarla
    difficultySection.classList.remove('hidden'); // Zorluk bölümünü göster
    nameInputsWrap.classList.add('hidden'); // İsim girişini gizle
    stopGameVisual(); // Oyun görselini durdur
    overlay.classList.add('hidden'); // Popup'ı gizle
    turnDisplay.textContent = 'Mod ve boyut seçip Başlat düğmesine basın'; // Başlangıç mesajı
}