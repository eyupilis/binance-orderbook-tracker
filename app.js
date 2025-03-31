document.addEventListener('DOMContentLoaded', () => {
    // DOM elementleri
    const symbolInput = document.getElementById('symbol');
    const thresholdInput = document.getElementById('threshold');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const bidsTableBody = document.getElementById('bidsTableBody');
    const asksTableBody = document.getElementById('asksTableBody');
    const alertContainer = document.getElementById('alertContainer');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const lastUpdateTime = document.getElementById('lastUpdateTime');
    const bidsCount = document.getElementById('bidsCount');
    const asksCount = document.getElementById('asksCount');
    const bidsTotal = document.getElementById('bidsTotal');
    const asksTotal = document.getElementById('asksTotal');
    const themeToggle = document.getElementById('themeToggle');

    // Telegram Bot elementleri
    const botTokenInput = document.getElementById('botToken');
    const chatIdInput = document.getElementById('chatId');
    const saveBotBtn = document.getElementById('saveBot');
    const testBotBtn = document.getElementById('testBot');
    const telegramStatus = document.getElementById('telegramStatus');

    // Telegram bot ayarları
    let telegramSettings = {
        botToken: localStorage.getItem('telegramBotToken') || '',
        chatId: localStorage.getItem('telegramChatId') || '',
        enabled: localStorage.getItem('telegramEnabled') === 'true'
    };

    // Tema ayarları
    let darkMode = localStorage.getItem('darkMode') !== 'false'; // Varsayılan olarak karanlık tema
    applyTheme(darkMode);

    // İstatistik verileri
    let stats = {
        bids: {
            count: 0,
            totalValue: 0
        },
        asks: {
            count: 0,
            totalValue: 0
        },
        lastUpdate: null
    };

    // Global orderBookData değişkeni
    let orderBookData = {
        bids: [],
        asks: []
    };

    // Mevcut sembol için ticker verileri
    let currentSymbol = 'BTCUSDT';

    // İlk market verilerini yükle
    fetchMarketData(currentSymbol);
    // Düzenli olarak piyasa verilerini güncelle (30 saniyede bir)
    setInterval(() => fetchMarketData(currentSymbol), 30000);

    // Tema değiştirme
    themeToggle.addEventListener('click', () => {
        darkMode = !darkMode;
        localStorage.setItem('darkMode', darkMode);
        applyTheme(darkMode);
    });

    // Tema uygulama
    function applyTheme(isDark) {
        const root = document.documentElement;
        const themeIcon = themeToggle.querySelector('i');

        if (isDark) {
            // Koyu tema
            root.style.setProperty('--panel-bg', '#1c1d21');
            root.style.setProperty('--card-bg', '#26272b');
            root.style.setProperty('--secondary', '#26272b');
            root.style.setProperty('--secondary-light', '#383a42');
            root.style.setProperty('--secondary-dark', '#1e1f23');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', '#a9a9a9');
            root.style.setProperty('--border-color', '#383a42');
            themeIcon.className = 'fa-solid fa-sun';
        } else {
            // Açık tema
            root.style.setProperty('--panel-bg', '#ffffff');
            root.style.setProperty('--card-bg', '#f5f5f5');
            root.style.setProperty('--secondary', '#f0f0f0');
            root.style.setProperty('--secondary-light', '#f9f9f9');
            root.style.setProperty('--secondary-dark', '#e0e0e0');
            root.style.setProperty('--text-primary', '#333333');
            root.style.setProperty('--text-secondary', '#666666');
            root.style.setProperty('--border-color', '#dddddd');
            themeIcon.className = 'fa-solid fa-moon';
        }
    }

    // Gerçek Binance piyasa verilerini getir
    async function fetchMarketData(symbol) {
        try {
            // 24 saatlik ticker verilerini al
            const tickerResponse = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
            const tickerData = await tickerResponse.json();
            
            if (tickerData.symbol) {
                updateMarketUI(tickerData);
            } else {
                console.error('Geçersiz ticker verisi:', tickerData);
            }
        } catch (error) {
            console.error('Piyasa verisi alınırken hata oluştu:', error);
        }
    }

    // Piyasa verilerini UI'a uygula
    function updateMarketUI(data) {
        const priceElements = document.querySelectorAll('.market-info .info-item:first-child .info-value');
        const volumeElements = document.querySelectorAll('.market-info .info-item:nth-child(2) .info-value');
        const highElements = document.querySelectorAll('.market-info .info-item:nth-child(3) .info-value');
        const lowElements = document.querySelectorAll('.market-info .info-item:nth-child(4) .info-value');
        
        // Fiyat ve değişim yüzdesi
        const lastPrice = parseFloat(data.lastPrice);
        const priceChangePercent = parseFloat(data.priceChangePercent);
        const volume = parseFloat(data.volume) * lastPrice; // Hacmi USDT olarak hesapla
        const highPrice = parseFloat(data.highPrice);
        const lowPrice = parseFloat(data.lowPrice);
        
        if (priceElements.length) {
            priceElements[0].innerHTML = `${lastPrice.toFixed(2)} <span class="currency">USDT</span> 
                <span class="info-change ${priceChangePercent >= 0 ? 'change-up' : 'change-down'}">
                    <i class="fa-solid fa-caret-${priceChangePercent >= 0 ? 'up' : 'down'}"></i> 
                    ${Math.abs(priceChangePercent).toFixed(2)}%
                </span>`;
        }
        
        if (volumeElements.length) {
            volumeElements[0].innerHTML = `${formatLargeNumber(volume)} <span class="currency">USDT</span>`;
        }
        
        if (highElements.length) {
            highElements[0].innerHTML = `${highPrice.toFixed(2)} <span class="currency">USDT</span>`;
        }
        
        if (lowElements.length) {
            lowElements[0].innerHTML = `${lowPrice.toFixed(2)} <span class="currency">USDT</span>`;
        }
    }
    
    // Büyük sayıları formatlama (B, M, K)
    function formatLargeNumber(num) {
        if (num >= 1_000_000_000) {
            return (num / 1_000_000_000).toFixed(1) + 'B';
        }
        if (num >= 1_000_000) {
            return (num / 1_000_000).toFixed(1) + 'M';
        }
        if (num >= 1_000) {
            return (num / 1_000).toFixed(1) + 'K';
        }
        return num.toFixed(0);
    }

    // Telegram ayarlarını yükle
    if (telegramSettings.botToken) {
        botTokenInput.value = telegramSettings.botToken;
    }
    if (telegramSettings.chatId) {
        chatIdInput.value = telegramSettings.chatId;
    }

    // Telegram bot ayarlarını kaydet
    saveBotBtn.addEventListener('click', () => {
        const botToken = botTokenInput.value.trim();
        const chatId = chatIdInput.value.trim();

        if (!botToken || !chatId) {
            showTelegramStatus('Lütfen Bot Token ve Chat ID bilgilerini girin', 'error');
            return;
        }

        telegramSettings = {
            botToken: botToken,
            chatId: chatId,
            enabled: true
        };

        // Ayarları tarayıcı belleğine kaydet
        localStorage.setItem('telegramBotToken', botToken);
        localStorage.setItem('telegramChatId', chatId);
        localStorage.setItem('telegramEnabled', 'true');

        showTelegramStatus('Telegram bot ayarları kaydedildi', 'success');
    });

    // Telegram bot test mesajı gönder
    testBotBtn.addEventListener('click', () => {
        const botToken = botTokenInput.value.trim();
        const chatId = chatIdInput.value.trim();

        if (!botToken || !chatId) {
            showTelegramStatus('Lütfen Bot Token ve Chat ID bilgilerini girin', 'error');
            return;
        }

        // Test butonuna yükleme animasyonu ekle
        testBotBtn.innerHTML = '<div class="spinner"></div> Test';
        testBotBtn.disabled = true;

        // Test mesajı gönder
        sendTelegramMessage('Bu bir test mesajıdır. Binance Order Book Takip uygulaması bağlantısı başarılı.', botToken, chatId)
            .then(success => {
                if (success) {
                    showTelegramStatus('Test mesajı başarıyla gönderildi', 'success');
                } else {
                    showTelegramStatus('Test mesajı gönderilemedi', 'error');
                }
                // Butonu eski haline getir
                testBotBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Test';
                testBotBtn.disabled = false;
            });
    });

    // Telegram durum mesajını göster
    function showTelegramStatus(message, type) {
        telegramStatus.textContent = message;
        telegramStatus.className = 'telegram-status ' + type;

        // 5 saniye sonra mesajı temizle
        setTimeout(() => {
            telegramStatus.textContent = '';
            telegramStatus.className = 'telegram-status';
        }, 5000);
    }

    // Telegram mesajı gönder
    async function sendTelegramMessage(message, botToken, chatId) {
        try {
            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });

            const data = await response.json();
            return data.ok;
        } catch (error) {
            console.error('Telegram mesaj gönderme hatası:', error);
            return false;
        }
    }

    // Websocket bağlantısı
    let websocket = null;

    // Tab değiştirme - yeni düzende kullanılmıyor ama koruyoruz
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Aktif tab butonunu değiştir
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // İlgili içeriği göster
            const tabId = btn.getAttribute('data-tab');
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Websocket bağlantısını başlat
    startBtn.addEventListener('click', async () => {
        const symbol = symbolInput.value.toUpperCase();
        const threshold = parseFloat(thresholdInput.value);

        if (!symbol || isNaN(threshold) || threshold <= 0) {
            alert('Lütfen geçerli bir sembol ve eşik değeri girin.');
            return;
        }

        try {
            // Başlat butonuna yükleme animasyonu ekle
            startBtn.innerHTML = '<div class="spinner"></div> Başlatılıyor...';
            startBtn.disabled = true;
            
            // Mevcut sembolü güncelle ve piyasa verilerini al
            currentSymbol = symbol;
            await fetchMarketData(currentSymbol);
            
            // WebSocket bağlantısını başlat
            await startWebSocket(symbol, threshold);
        } catch (error) {
            console.error('Bağlantı başlatılırken hata:', error);
            alert('Bağlantı başlatılırken bir hata oluştu. Lütfen tekrar deneyin.');
            startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Başlat';
            startBtn.disabled = false;
        }
    });

    // Websocket bağlantısını durdur
    stopBtn.addEventListener('click', () => {
        stopWebSocket();
        startBtn.disabled = false;
        stopBtn.disabled = true;
        startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Başlat';
    });

    // Websocket bağlantısını başlat
    async function startWebSocket(symbol, threshold) {
        if (websocket) {
            websocket.close();
        }

        try {
            // İlk order book verilerini al
            const response = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=1000`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Global orderBookData'yı güncelle
            orderBookData = {
                lastUpdateId: data.lastUpdateId,
                bids: new Map(data.bids.map(b => [parseFloat(b[0]), parseFloat(b[1])])),
                asks: new Map(data.asks.map(a => [parseFloat(a[0]), parseFloat(a[1])]))
            };

            // WebSocket bağlantısını başlat
            websocket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth@100ms`);

            websocket.onopen = () => {
                console.log('WebSocket bağlantısı açıldı');
                startBtn.disabled = true;
                stopBtn.disabled = false;
                startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Başlat';
                updateOrderBookUI();
            };

            websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    // Alış emirlerini güncelle
                    if (data.b) {
                        data.b.forEach(([price, amount]) => {
                            price = parseFloat(price);
                            amount = parseFloat(amount);
                            
                            if (amount === 0) {
                                orderBookData.bids.delete(price);
                            } else {
                                orderBookData.bids.set(price, amount);
                            }
                        });
                    }
                    
                    // Satış emirlerini güncelle
                    if (data.a) {
                        data.a.forEach(([price, amount]) => {
                            price = parseFloat(price);
                            amount = parseFloat(amount);
                            
                            if (amount === 0) {
                                orderBookData.asks.delete(price);
                            } else {
                                orderBookData.asks.set(price, amount);
                            }
                        });
                    }

                    // UI'ı güncelle
                    updateOrderBookUI();
                    checkThreshold(threshold);
                } catch (error) {
                    console.error('WebSocket mesaj işleme hatası:', error);
                }
            };

            websocket.onerror = (error) => {
                console.error('WebSocket hatası:', error);
            };

            websocket.onclose = () => {
                console.log('WebSocket bağlantısı kapatıldı');
                startBtn.disabled = false;
                stopBtn.disabled = true;
            };
        } catch (error) {
            console.error('WebSocket bağlantısı başlatılırken hata oluştu:', error);
            throw error;
        }
    }

    // İstatistikleri güncelle
    function updateStats() {
        // Emir sayılarını güncelle
        bidsCount.textContent = stats.bids.count;
        asksCount.textContent = stats.asks.count;
        
        // Toplam değerleri güncelle
        bidsTotal.textContent = formatLargeNumber(stats.bids.totalValue);
        asksTotal.textContent = formatLargeNumber(stats.asks.totalValue);
        
        // Son güncelleme zamanını güncelle
        if (stats.lastUpdate) {
            lastUpdateTime.textContent = stats.lastUpdate.toLocaleTimeString();
        }
    }

    // Websocket bağlantısını durdur
    function stopWebSocket() {
        if (websocket) {
            websocket.close();
            websocket = null;
        }
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }

    // Order book UI'ı güncelle
    function updateOrderBookUI() {
        try {
            // Alış emirlerini güncelle
            const sortedBids = Array.from(orderBookData.bids.entries())
                .sort((a, b) => b[0] - a[0])
                .slice(0, 10);

            bidsTableBody.innerHTML = '';
            let bidsCumulative = 0;

            sortedBids.forEach(([price, amount]) => {
                const total = price * amount;
                bidsCumulative += total;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${price.toFixed(2)}</td>
                    <td>${amount.toFixed(6)}</td>
                    <td>${total.toFixed(2)}</td>
                    <td>${bidsCumulative.toFixed(2)}</td>
                `;
                bidsTableBody.appendChild(row);
            });

            // Satış emirlerini güncelle
            const sortedAsks = Array.from(orderBookData.asks.entries())
                .sort((a, b) => a[0] - b[0])
                .slice(0, 10);

            asksTableBody.innerHTML = '';
            let asksCumulative = 0;

            sortedAsks.forEach(([price, amount]) => {
                const total = price * amount;
                asksCumulative += total;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${price.toFixed(2)}</td>
                    <td>${amount.toFixed(6)}</td>
                    <td>${total.toFixed(2)}</td>
                    <td>${asksCumulative.toFixed(2)}</td>
                `;
                asksTableBody.appendChild(row);
            });

            // İstatistikleri güncelle
            stats.bids.count = orderBookData.bids.size;
            stats.asks.count = orderBookData.asks.size;
            stats.bids.totalValue = Array.from(orderBookData.bids.entries())
                .reduce((total, [price, amount]) => total + (price * amount), 0);
            stats.asks.totalValue = Array.from(orderBookData.asks.entries())
                .reduce((total, [price, amount]) => total + (price * amount), 0);
            stats.lastUpdate = new Date();
            updateStats();

        } catch (error) {
            console.error('UI güncelleme hatası:', error);
        }
    }

    // Eşik değeri kontrolü
    function checkThreshold(threshold) {
        // Alış emirleri için eşik değeri kontrolü
        orderBookData.bids.forEach((amount, price) => {
            const total = price * amount;
            if (total >= threshold) {
                createAlert('Büyük Alış Emri Tespit Edildi!', { price, amount }, 'bid');
            }
        });

        // Satış emirleri için eşik değeri kontrolü
        orderBookData.asks.forEach((amount, price) => {
            const total = price * amount;
            if (total >= threshold) {
                createAlert('Büyük Satış Emri Tespit Edildi!', { price, amount }, 'ask');
            }
        });
    }

    // Uyarı oluşturma
    function createAlert(title, order, type) {
        // Eşleşen eski alertleri filtrele
        const alertElements = document.querySelectorAll('.alert');
        let isDuplicate = false;

        alertElements.forEach(alertEl => {
            const priceElement = alertEl.querySelector('[data-price]');
            if (priceElement && parseFloat(priceElement.getAttribute('data-price')) === order.price) {
                isDuplicate = true;
            }
        });

        // Eğer benzer alert zaten varsa, yeni alert oluşturma
        if (isDuplicate) return;

        const total = order.price * order.amount;
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type}`;
        
        const typeIcon = type === 'bid' ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
        const typeEmoji = type === 'bid' ? '🟢' : '🔴';
        const typeText = type === 'bid' ? 'Alış' : 'Satış';
        const now = new Date();
        const alertId = `${type}_${Date.now()}`; // Benzersiz ID oluştur
        
        alertElement.innerHTML = `
            <h3><i class="fa-solid ${typeIcon}"></i> ${title}</h3>
            <div class="alert-info">
                <span><strong>Fiyat (USDT):</strong> <span class="price-value" data-price="${order.price}">${order.price.toFixed(2)}</span></span>
                <span><strong>Miktar (BTC):</strong> <span>${order.amount.toFixed(6)}</span></span>
                <span><strong>Toplam (USDT):</strong> <span>${total.toFixed(2)}</span></span>
            </div>
            <div class="alert-timestamp">
                <i class="fa-regular fa-clock"></i> ${now.toLocaleTimeString()}
            </div>
        `;

        // Uyarıyı başa ekle
        alertContainer.insertBefore(alertElement, alertContainer.firstChild);

        // Telegram mesajı gönder
        if (telegramSettings.enabled && telegramSettings.botToken && telegramSettings.chatId) {
            const coinSymbol = symbolInput.value.replace('USDT', '');
            const telegramMessage = `
${typeEmoji} <b>${typeText} Sinyali Tespit Edildi!</b>
🏦 <b>${symbolInput.value}</b>

💵 Fiyat: ${order.price.toFixed(2)} USDT
💰 Miktar: ${order.amount.toFixed(6)} ${coinSymbol}
💸 Toplam: ${formatLargeNumber(total)} USDT

⚡️ Büyük emir akışı tespit edildi!
🕒 ${now.toLocaleTimeString()}

🔍 <a href="https://www.binance.com/tr/trade/${symbolInput.value}?layout=pro">Binance'da İncele</a>
📊 @metradetr
`;
            sendTelegramMessage(telegramMessage, telegramSettings.botToken, telegramSettings.chatId)
                .then(success => {
                    if (!success) {
                        console.error('Telegram mesajı gönderilemedi');
                    }
                });
        }

        // Maximum 8 alert göster
        const maxAlerts = 8;
        const alerts = alertContainer.querySelectorAll('.alert');
        if (alerts.length > maxAlerts) {
            for (let i = maxAlerts; i < alerts.length; i++) {
                alertContainer.removeChild(alerts[i]);
            }
        }

        // 10 saniye sonra uyarıyı kaldır
        setTimeout(() => {
            alertElement.style.opacity = '0';
            setTimeout(() => {
                if (alertElement.parentNode) {
                    alertElement.remove();
                }
            }, 500);
        }, 10000);
    }

    // Aktif üye ve online üye sayılarını güncelleme
    let activeUsers = 0;
    let onlineUsers = 0;

    function updateUserStats() {
        // WebSocket üzerinden gelen verileri simüle ediyoruz
        activeUsers = Math.floor(Math.random() * (1500 - 1200 + 1)) + 1200; // 1200-1500 arası
        onlineUsers = Math.floor(Math.random() * (200 - 150 + 1)) + 150; // 150-200 arası

        // DOM elementlerini güncelle
        const activeUserElement = document.querySelector('[data-stat="active-users"]');
        const onlineUserElement = document.querySelector('[data-stat="online-users"]');

        if (activeUserElement) {
            activeUserElement.textContent = activeUsers;
        }

        if (onlineUserElement) {
            onlineUserElement.textContent = onlineUsers;
        }
    }

    // Her 5 saniyede bir kullanıcı istatistiklerini güncelle
    setInterval(updateUserStats, 5000);

    // Sayfa yüklendiğinde ilk güncellemeyi yap
    document.addEventListener('DOMContentLoaded', () => {
        updateUserStats();
        startCounters();
        
        // Kartlara hover efekti ekle
        const cards = document.querySelectorAll('.promo-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    });

    // Sayaç animasyonu
    function startCounters() {
        const counters = document.querySelectorAll('.counter');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 saniye
            const startTime = performance.now();
            const startValue = 0;
            
            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const currentValue = Math.floor(startValue + (target - startValue) * progress);
                counter.textContent = currentValue.toLocaleString();
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            }
            
            requestAnimationFrame(updateCounter);
        });
    }

    // Referans kodu kopyalama
    document.querySelector('.copy-btn').addEventListener('click', function() {
        const code = this.dataset.code;
        navigator.clipboard.writeText(code).then(() => {
            // Kopyalama başarılı animasyonu
            this.innerHTML = '<i class="fas fa-check"></i>';
            this.style.color = '#2ecc71';
            
            // 2 saniye sonra eski haline döndür
            setTimeout(() => {
                this.innerHTML = '<i class="far fa-copy"></i>';
                this.style.color = '';
            }, 2000);
            
            // Toast mesajı göster
            showToast('Referans kodu kopyalandı!');
        });
    });

    // Toast mesajı gösterme
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Animasyon için sınıf ekle
        setTimeout(() => toast.classList.add('show'), 100);

        // 3 saniye sonra kaldır
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Toast stil tanımlamaları
    const style = document.createElement('style');
    style.textContent = `
        .toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: var(--primary);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            font-weight: 500;
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1000;
        }

        .toast.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
});
