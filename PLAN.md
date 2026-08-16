# Game Plan: OxygenForge World

## Risk Tasks

### 1. Parçalı prosedürel voxel arazi

- **Neden yalıtıldı:** Mobilde görünür dünya hacmini, işleme çağrılarını ve bellek kullanımını aynı anda kontrol etmek gerekir; tek parça küp üretimi hızlı biçimde FPS düşüşüne yol açar.
- **Yaklaşım:** Kamera çevresinde sınırlı yarıçaplı, deterministik yükseklik haritasıyla beslenen küçük arazi parçaları üretilecek; görünmeyen veya uzak parçalar atılacak ve yüzeyde görünmeyen blok yüzleri çizilmeyecek.
- **Doğrula:** Başlangıçta ve keşif sırasında bitişik arazi parçaları arasında boşluk bulunmamalı; demo kamerası dünya üzerinde ilerlerken dünya yeniden üretilmeli ve mobil görünümde ritim bozulmamalıdır.

### 2. Dokunmatik hareket ve kamera denetimi

- **Neden yalıtıldı:** Aynı ekranda yürüyüş, bakış, blok seçimi ve arayüz etkileşimleri çakışabilir; yanlış işaretçi yakalama kontrol kaybı yaratır.
- **Yaklaşım:** Sol alt bölgede çoklu dokunuşlu hareket pedi, sağ yarıda kamera sürükleme alanı ve ayrı büyük eylem düğmeleri kullanılacak; klavye/fare de masaüstü önizlemesi için desteklenecek.
- **Doğrula:** Sol başparmak hareketi aktifken sağ sürükleme kamera yönünü değiştirmeli; blok kırma ve blok yerleştirme tuşları kamera sürüklemesini engellemeden çalışmalıdır.

### 3. Blok kırma, yerleştirme ve envanter tutarlılığı

- **Neden yalıtıldı:** Işınla hedef seçme ile anında görünür dünya değişimini eşlemek, komşu yüzlerin yeniden oluşturulmasını ve envanter miktarının doğru tutulmasını gerektirir.
- **Yaklaşım:** Kameradan kısa menzilli voxel ışın sorgusu kullanılacak; kırılan blok envantere eklenip yerleştirilen blok seçili envanter türünü tüketerek hedef yüzün komşusuna yerleştirilecek; yalnızca etkilenen parça yeniden çizilecek.
- **Doğrula:** Taş blok kırıldığında seçili hedef kaybolmalı ve taş sayısı artmalı; seçili envanterde blok varsa komşu hücreye yerleştirme gerçekleşmeli, yoksa dünya değişmemelidir.

### 4. Android paketleme zinciri

- **Neden yalıtıldı:** Web tabanlı Babylon çıktısını APK içine kapsüllemek için üretim varlıklarının, Android kabuğunun ve imzalama akışının uyumlu çalışması gerekir.
- **Yaklaşım:** Oyunun web derlemesi Capacitor Android kabuğuna senkronize edilecek; uygulama kimliği, yatay yönelim, sürüm ve ikona uygun yerel yapılandırma hazırlanacak. Ortamda imzalı APK üretilmesi desteklenmiyorsa, üretilebilir Android proje klasörü ve derleme komutları eksiksiz teslim edilecek.
- **Doğrula:** Android proje yapısı, uygulama kimliği ve yatay ekran kuralı bulunmalı; üretim derlemesi Android kabuğuna kopyalanmalı ve APK derleme komutu hatasız başlatılabilmelidir.

## Ana Yapı

Oyun, hareketli ilk kişi kamerası, prosedürel jeolojik arazi, blok seçme/kırma/yerleştirme, sıcak çubuk envanteri, basit üretim yüzeyi, gündüz döngüsü ve küçük keşif hedefleri içeren mobil öncelikli bir voxel sefer deneyimi olarak kurulacaktır. Kullanıcı ilk açılışta dünyaya doğrudan girecek; üstte saha şeridi, altta altı yuvalı envanter ve iki elde kolay ulaşılır kontroller görünür kalacaktır. Masaüstü önizlemesinde WASD, fare ve klavye eşleri mobil eylemleri destekleyecektir.

| Görsel Varlık | Rol | Kaynak |
| --- | --- | --- |
| Görsel hedef | Kompozisyon, HUD yoğunluğu ve palet referansı | `/manus-storage/oxygenforge-world-visual-target_ad1e87d5.png` |
| Marka işareti | Açılış ve uygulama kimliği | `/manus-storage/oxygenforge-brand-mark_8f9f18db.png` |
| Açılış görseli | İlk çalıştırma/perde arka planı | `/manus-storage/oxygenforge-launch-art_ee38b751.png` |
| Bazalt doku | Arazi yüzeyi | `/manus-storage/oxygenforge-basalt-strata-texture_374e7cf0.png` |
| Bakır cevheri doku | Keşif hedefi ve değerli blok yüzeyi | `/manus-storage/oxygenforge-copper-ore-texture_02fecee7.png` |

## Başarı Ölçütleri

| Alan | Doğrulama ölçütü |
| --- | --- |
| Oynanış | Oyuncu hareket eder, zıplar, blok hedefler, kırar ve yerleştirir; seçili envanter gerçek zamanlı güncellenir. |
| Dokunmatik | Sol hareket pedi, sağ kamera sürükleme alanı ve büyük eylem düğmeleri çakışmadan çalışır. |
| Mobil görünüm | 375×812 portre ve 812×375 yatay önizlemelerde HUD okunur; oyun yatay kullanım için yönlendirir. |
| Görsellik | Görünen dünya, referanstaki katmanlı bazalt, oksit bakırı, turkuaz gökyüzü ve saha şeridi yaklaşımını taşır. |
| Dayanıklılık | Eksik doku, konsol hatası, UI taşması veya tıklanamaz kontrol bulunmaz. |
| APK | Android paketleme yapılandırması ve, ortam olanak verirse, indirilebilir APK artefaktı hazırlanır. |
