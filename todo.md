# OxygenForge World — Mobil Oyun Görev Listesi

- [x] Mevcut proje kökünü ve kaynak repo durumunu doğrulamak.
- [x] Mobil oyun kabuğunu Babylon.js ve Capacitor tabanlı bir uygulama olarak başlatmak.
- [x] Android için debug APK derleme yapılandırmasını ve sürümleme bilgilerini eklemek.
- [x] APK dosya boyutunu gerçek oyun varlıklarıyla, mobil dağıtım ve indirme sınırlarını gözeterek yönetmek; yapay dosya şişirmesi yapmamak.
- [x] Dokunmatik hareket, kamera, blok kırma ve blok yerleştirme kontrollerini tasarlamak.
- [x] Mobil cihazlara uygun performans bütçesi ve prosedürel dünya parça stratejisini belirlemek.
- [x] Babylon.js tabanlı voxel dünya, envanter, blok kırma/yerleştirme ve kalıcı kayıt döngüsünü geliştirmek.
- [x] Mobil arayüz, saha HUD'u, başlatma deneyimi ve yerel kayıt desteğini eklemek.
- [x] Android debug APK derlemesini ve yatay telefon görünümünü doğrulamak.
- [x] Kaynak depoya başlangıç sürümünü göndermek ve yayınlama yönergelerini hazırlamak.

## Kamera ve Sonsuz Chunk Geliştirmesi

- [x] Yatay kamera sürükleme yönünü doğal sola/sağa eşleştirmek.
- [x] Seed tabanlı chunk koordinatlama ve deterministik arazi üretimini tasarlamak.
- [x] Oyuncu çevresinde görünür chunk yükleme, uzak chunk boşaltma ve mesh güncelleme akışını eklemek.
- [x] Chunk sınırlarında hareket, hedefleme, blok kırma/yerleştirme ve yerel kayıt davranışını doğrulamak.
- [x] Güncellenmiş Android APK'yı üretmek ve son proje sürümünü kaydetmek.

> Not: Sonsuz dünya, belleğe aynı anda sınırsız geometri yüklemek yerine oyuncu çevresindeki chunk'ları dinamik olarak yükleyip uzak chunk'ları boşaltan seed tabanlı bir dünya olarak uygulanacaktır.

## Kamera, FOV ve Texture Geliştirmesi

- [x] Kameranın aşağı bakış sınırını mobil keşif için genişletmek.
- [x] FOV ayarını oyun içi ayarlar paneline ve yerel kayda bağlamak.
- [x] Bazalt, toprak, çimen, kumtaşı, bakır, ahşap ve meşale için tileable texture setini üretmek.
- [x] Texture'ları Babylon materyallerine bağlayıp uzak/eksik varlık durumunda güvenli renk yedeğini korumak.
- [x] Mobil texture bellek kullanımını, kamera görünümünü ve yeni APK'yı doğrulamak.

## Render ve HUD Görünürlüğü Düzeltmesi

- [x] Siyah sahne sorununu texture yükleme ve WebGL materyal fallback'i açısından düzeltmek.
- [x] Üst HUD için aç/kapat düğmesi eklemek.
- [x] HUD gizliyken kamera, hareket ve aksiyon kontrollerini çalışır tutmak.
- [x] Mobil görünümü, render hatalarını ve güncellenmiş APK'yı doğrulamak.

## Yerel APK Texture Paketleme

- [x] Üretilen texture dosyalarını proje dışı asset alanından Android bundle akışına almak.
- [x] Babylon texture yollarını uzak URL yerine yerel Capacitor asset yollarına çevirmek.
- [x] Android APK içinde tüm texture dosyalarının gerçekten bulunduğunu doğrulamak.
- [x] Çevrimdışı WebView ve mobil görünümde kaplamaları kontrol etmek.
- [x] Yerel texture içeren yeni APK'yı üretmek ve son sürümü kaydetmek.
