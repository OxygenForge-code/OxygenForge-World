# OxygenForge World

OxygenForge World, Android için APK olarak paketlenebilen; Babylon.js, React ve Capacitor kullanan mobil öncelikli bir voxel keşif oyunudur. Oyuncu katmanlı bazalt arazide ilerler, hedef blokları kırar, malzeme toplar ve hızlı çubuktan seçtiği blokları tekrar dünyaya yerleştirir. Dünya, sabit bir kenar yerine seed tabanlı sonsuz chunk akışıyla ilerler; oyuncu çevresindeki 5×5 çalışma penceresi korunur ve uzak chunk'lar bellekten boşaltılır.

## Oynanış

Oyun yatay ekran için tasarlanmıştır. Sol taraftaki analog ped hareketi, sağ boş alan kamera bakışını yönetir; parmağı sola sürüklemek sola, sağa sürüklemek sağa bakar. Sağ alttaki kazma hedef bloğu kırar; `+` düğmesi seçili malzemeyi hedef yüzün yanına yerleştirir. Küçük üst düğme zıplama işlevini verir. Masaüstü doğrulamasında `WASD`, fare, `Boşluk`, sol tıklama, sağ tıklama, `F` ve `E` eş değer kontrollerdir.

| Komut | Amaç |
| --- | --- |
| `pnpm dev` | Web önizlemesini başlatır. |
| `pnpm check` | TypeScript tür denetimini çalıştırır. |
| `pnpm build` | Üretim web paketini üretir. |
| `pnpm cap:sync` | Web paketini Android projesine kopyalar. |
| `pnpm apk:debug` | Android debug APK üretimini başlatır. |

## Sonsuz Chunk Dünyası

Dünya seed'i `734291` olarak sabitlenmiştir; aynı dünya koordinatı her açılışta aynı yükseklik, katman ve cevher dağılımını üretir. Chunk boyutu 12×12 hücre, etkin yarıçap iki chunk'tır. Bu, teorik olarak sonsuz keşif sağlar ancak mobil bellekte yalnızca oyuncuya yakın geometri tutulur. Blok düzenlemeleri chunk boşaltılıp tekrar yüklendiğinde yerel kayıttan geri uygulanır.

## Android APK

Android uygulama kimliği `com.oxygenforge.world`, minimum SDK düzeyi 24 ve hedef SDK düzeyi 36'dır. APK derlemesi için Java 21 JDK, Android SDK Platform 36 ve Build Tools 36.0.0 gerekir. Örnek derleme:

```bash
ANDROID_HOME=/opt/android-sdk ANDROID_SDK_ROOT=/opt/android-sdk pnpm apk:debug
```

Derlenmiş debug APK, `android/app/build/outputs/apk/debug/app-debug.apk` konumunda oluşturulur. Bu paket bir **debug APK** olduğundan Google Play dağıtımı için üretim imzalama anahtarı ile yeniden paketlenmelidir.

## Mimari

Babylon oyun kodu `client/src/game/` altında bağımsız TypeScript sınıfları olarak tutulur. React katmanı yalnızca tam ekran tuvali, başlatma deneyimini ve dokunmatik HUD'u taşır. Android kabuğu Capacitor tarafından `android/` altında üretilir. Tasarım kararları ve teknik devam notları için `ideas.md`, `PLAN.md`, `STRUCTURE.md`, `ASSETS.md` ve `MEMORY.md` dosyalarına bakın.
