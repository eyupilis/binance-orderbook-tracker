// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyB1CFf0xgWZUsUa8ISv0PntPfFdQcSiGk0",
    authDomain: "metraderalert.firebaseapp.com",
    projectId: "metraderalert",
    storageBucket: "metraderalert.firebasestorage.app",
    messagingSenderId: "54593894333",
    appId: "1:54593894333:web:4f8fceca1e297221c304d4",
    measurementId: "G-C7WX933BMV",
    databaseURL: "https://metraderalert-default-rtdb.firebaseio.com"
};

// Loglama fonksiyonu
function log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    console.log(logMessage);
    if (data) {
        console.log('Data:', data);
    }
}

// Firebase'i başlat
let app;
let auth;
let database;
let dbRefs;

try {
    log('INFO', 'Firebase yapılandırması başlatılıyor...', firebaseConfig);
    
    // Firebase'i başlat
    app = firebase.initializeApp(firebaseConfig);
    log('INFO', 'Firebase başarıyla başlatıldı');

    // Auth ve database servislerini başlat
    auth = firebase.auth();
    database = firebase.database();
    log('INFO', 'Auth ve database servisleri başlatıldı');

    // Veritabanı referanslarını oluştur
    dbRefs = {
        users: database.ref('users'),
        referralCodes: database.ref('referralCodes')
    };
    log('INFO', 'Veritabanı referansları oluşturuldu', dbRefs);

    // Analytics'i başlat (opsiyonel)
    if (firebase.analytics) {
        firebase.analytics();
        log('INFO', 'Analytics başlatıldı');
    }

    // İlk veritabanı yapısını oluştur
    database.ref('.info/connected').on('value', async (snapshot) => {
        if (snapshot.val() === true) {
            log('INFO', 'Veritabanına bağlantı başarılı, yapı kontrol ediliyor...');
            try {
                // Referans kodlarını kontrol et ve oluştur
                const referralSnapshot = await database.ref('referralCodes').once('value');
                if (!referralSnapshot.exists()) {
                    log('INFO', 'Referans kodları oluşturuluyor...');
                    await database.ref('referralCodes').set({
                        'LURL4r': {
                            isActive: true,
                            createdAt: Date.now(),
                            description: 'Telegram kanalı referans kodu',
                            usageCount: 0,
                            maxUses: 1000
                        }
                    });
                    log('INFO', 'Referans kodları başarıyla oluşturuldu');
                }

                // Users koleksiyonunu kontrol et
                const usersSnapshot = await database.ref('users').once('value');
                if (!usersSnapshot.exists()) {
                    log('INFO', 'Users koleksiyonu oluşturuluyor...');
                    await database.ref('users').set({});
                    log('INFO', 'Users koleksiyonu başarıyla oluşturuldu');
                }
            } catch (error) {
                log('ERROR', 'Veritabanı yapısı oluşturma hatası:', error);
            }
        }
    });

} catch (error) {
    log('ERROR', 'Firebase başlatma hatası:', error);
    throw error;
}

// Referans kodlarını başlat
async function initializeReferralCodes() {
    try {
        log('INFO', 'Referans kodları kontrol ediliyor...');
        const snapshot = await dbRefs.referralCodes.once('value');
        if (!snapshot.exists()) {
            log('INFO', 'Referans kodları bulunamadı, oluşturuluyor...');
            // İlk referans kodlarını oluştur
            await dbRefs.referralCodes.set({
                'LURL4r': {
                    isActive: true,
                    createdAt: Date.now(),
                    description: 'Telegram kanalı referans kodu',
                    usageCount: 0,
                    maxUses: 1000
                }
            });
            log('INFO', 'Referans kodları başarıyla oluşturuldu');
        } else {
            log('INFO', 'Referans kodları zaten mevcut');
        }
    } catch (error) {
        log('ERROR', 'Referans kodları oluşturma hatası:', error);
        throw error;
    }
}

// Referans kodu kontrolü
async function checkReferralCode(code) {
    try {
        log('INFO', `Referans kodu kontrol ediliyor: ${code}`);
        const snapshot = await dbRefs.referralCodes.child(code).once('value');
        if (!snapshot.exists()) {
            log('WARN', `Referans kodu bulunamadı: ${code}`);
            return false;
        }

        const referralData = snapshot.val();
        log('INFO', 'Referans kodu verisi:', referralData);

        if (!referralData.isActive) {
            log('WARN', `Referans kodu aktif değil: ${code}`);
            throw new Error("Bu referans kodu artık geçerli değil!");
        }

        if (referralData.maxUses && referralData.usageCount >= referralData.maxUses) {
            log('WARN', `Referans kodu maksimum kullanıma ulaştı: ${code}`);
            throw new Error("Bu referans kodu maksimum kullanım sayısına ulaştı!");
        }

        // Referans kodu kullanım sayısını artır
        await dbRefs.referralCodes.child(code).update({
            usageCount: (referralData.usageCount || 0) + 1
        });
        log('INFO', `Referans kodu kullanım sayısı güncellendi: ${code}`);

        return true;
    } catch (error) {
        log('ERROR', `Referans kodu kontrolü hatası (${code}):`, error);
        throw error;
    }
}

// Yeni referans kodu oluştur
async function createReferralCode(code, maxUses = 1000, description = '') {
    try {
        const snapshot = await dbRefs.referralCodes.child(code).once('value');
        if (snapshot.exists()) {
            throw new Error("Bu referans kodu zaten mevcut!");
        }

        await dbRefs.referralCodes.child(code).set({
            isActive: true,
            createdAt: Date.now(),
            description: description,
            usageCount: 0,
            maxUses: maxUses
        });

        return true;
    } catch (error) {
        console.error("Referans kodu oluşturma hatası:", error);
        throw error;
    }
}

// Referans kodunu devre dışı bırak
async function deactivateReferralCode(code) {
    try {
        const snapshot = await dbRefs.referralCodes.child(code).once('value');
        if (!snapshot.exists()) {
            throw new Error("Referans kodu bulunamadı!");
        }

        await dbRefs.referralCodes.child(code).update({
            isActive: false
        });

        return true;
    } catch (error) {
        console.error("Referans kodu devre dışı bırakma hatası:", error);
        throw error;
    }
}

// Firebase başlatıldığında referans kodlarını kontrol et
initializeReferralCodes();

// Kullanıcı kaydı
async function registerUser(email, password, referralCode, username, telegramUsername) {
    try {
        log('INFO', 'Kullanıcı kaydı başlatılıyor...', { email, username, telegramUsername });
        
        // Referans kodunu kontrol et
        log('INFO', 'Referans kodu kontrol ediliyor...');
        const isValidCode = await checkReferralCode(referralCode);
        if (!isValidCode) {
            log('ERROR', 'Geçersiz referans kodu');
            throw new Error("Geçersiz referans kodu!");
        }

        // Username kontrolü
        log('INFO', 'Kullanıcı adı kontrolü yapılıyor...');
        const usernameSnapshot = await dbRefs.users
            .orderByChild('username')
            .equalTo(username)
            .once('value');
        
        if (usernameSnapshot.exists()) {
            log('ERROR', 'Kullanıcı adı zaten kullanımda');
            throw new Error("Bu kullanıcı adı zaten kullanılıyor!");
        }

        // Kullanıcıyı oluştur
        log('INFO', 'Firebase Auth ile kullanıcı oluşturuluyor...');
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        log('INFO', 'Kullanıcı Auth başarıyla oluşturuldu', { uid: user.uid });

        // Kullanıcı bilgilerini database'e kaydet
        log('INFO', 'Kullanıcı bilgileri veritabanına kaydediliyor...');
        const userData = {
            email: email,
            username: username,
            referralCode: referralCode,
            telegramUsername: telegramUsername,
            createdAt: Date.now(),
            lastLogin: Date.now(),
            isActive: true,
            plan: {
                type: "free",
                startDate: Date.now(),
                endDate: null
            },
            settings: {
                notifications: true,
                theme: "dark"
            }
        };
        await dbRefs.users.child(user.uid).set(userData);
        log('INFO', 'Kullanıcı bilgileri başarıyla kaydedildi', userData);

        return true;
    } catch (error) {
        log('ERROR', 'Kayıt hatası:', error);
        throw error;
    }
}

// Kullanıcı girişi
async function loginUser(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Son giriş zamanını güncelle
        await dbRefs.users.child(user.uid).update({
            lastLogin: Date.now(),
            isActive: true
        });

        // Kullanıcı bilgilerini getir
        const userSnapshot = await dbRefs.users.child(user.uid).once('value');
        return {
            user: user,
            userData: userSnapshot.val()
        };
    } catch (error) {
        console.error("Giriş hatası:", error);
        throw error;
    }
}

// Kullanıcı bilgilerini güncelle
async function updateUserProfile(uid, updates) {
    try {
        await dbRefs.users.child(uid).update(updates);
        return true;
    } catch (error) {
        console.error("Güncelleme hatası:", error);
        throw error;
    }
}

// Kullanıcı planını güncelle
async function updateUserPlan(uid, planType, duration) {
    try {
        const startDate = Date.now();
        const endDate = startDate + (duration * 24 * 60 * 60 * 1000); // duration in days

        await dbRefs.users.child(uid).child('plan').update({
            type: planType,
            startDate: startDate,
            endDate: endDate
        });

        return true;
    } catch (error) {
        console.error("Plan güncelleme hatası:", error);
        throw error;
    }
}

// Oturum kontrolü
function checkAuth() {
    return new Promise((resolve, reject) => {
        log('INFO', 'Oturum kontrolü yapılıyor...');
        
        // Firebase'in başlatılmasını bekle
        const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe(); // Listener'ı kaldır
            
            if (user) {
                log('INFO', 'Kullanıcı oturumu aktif', { uid: user.uid });
                resolve({
                    isAuthenticated: true,
                    userData: user
                });
            } else {
                log('INFO', 'Kullanıcı oturumu bulunamadı');
                resolve({
                    isAuthenticated: false,
                    userData: null
                });
            }
        }, error => {
            log('ERROR', 'Oturum kontrolü hatası:', error);
            reject(error);
        });
    });
}

// Çıkış yap
async function logout() {
    try {
        const user = auth.currentUser;
        if (user) {
            await dbRefs.users.child(user.uid).update({
                isActive: false,
                lastLogin: Date.now()
            });
        }
        return auth.signOut();
    } catch (error) {
        console.error("Çıkış hatası:", error);
        throw error;
    }
} 