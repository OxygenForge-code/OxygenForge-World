# OxygenForge World — Teknik Yapı

## Katmanlar

| Katman | Sorumluluk | Uygulama Konumu |
| --- | --- | --- |
| React kabuğu | Tam ekran tuval yaşam döngüsü, açılış perdesi ve HTML tabanlı mobil HUD | `client/src/components/GameCanvas.tsx`, `client/src/pages/Home.tsx` |
| Babylon sahnesi | Motor, kamera, ışık, gökyüzü, sahne döngüsü ve kaynak temizliği | `client/src/game/scene.ts` |
| Dünya çekirdeği | Voxel hücreleri, prosedürel yükseklik, parça üretimi, madencilik/yerleştirme | `client/src/game/GameWorld.ts` |
| Oyuncu ve kontrol | İlk kişi kamerası, klavye/fare, dokunmatik hareket pedi, dokunmatik bakış | `client/src/game/PlayerController.ts`, `client/src/game/InputManager.ts` |
| Oyun durumu | Envanter, seçili blok, can/enerji, keşif hedefleri ve kayıt modeli | `client/src/game/GameState.ts` |
| Arayüz köprüsü | Oyun olaylarını React HUD durumuna taşır; çekirdek oyun mantığını içermez | `client/src/game/GameEvents.ts`, `client/src/components/GameHud.tsx` |
| Android kabuğu | Derlenmiş web varlıklarını Android WebView içine alır; yönelim ve paket bilgilerini taşır | `capacitor.config.ts`, `android/` |

## Sahiplik İlkesi

`GameWorld`, arazi parçası mesh'lerinin sahibi ve tek düzenleyicisidir. `PlayerController`, yalnızca kamera ile oyuncunun etkileşim konumunu yönetir; dünya verisini doğrudan değiştirmez. `GameState`, kullanıcıya ait kaynakları ve seçili eylem modunu taşır. `InputManager`, ham dokunma/klavye olaylarını anlamsal eylemlere dönüştürür. `scene.ts`, bu nesneleri birleştirir ve tek bir `GameHandle` üzerinden güvenli temizleme olanağı sunar.

## Ana Veri Modeli

| Kavram | Temel Veri |
| --- | --- |
| `BlockType` | `air`, `soil`, `grass`, `basalt`, `sandstone`, `copper`, `wood`, `torch` |
| `Voxel` | Tamsayı `x`, `y`, `z` koordinatı ve `BlockType` |
| `Chunk` | 12×18×12 hücrelik deterministik dünya bölgesi ve birleşik yüzey mesh'i |
| `InventorySlot` | Blok türü, miktar ve hızlı çubuk konumu |
| `PlayerState` | Konum, yön, can, enerji, seçili envanter slotu |
| `GameEvent` | `state`, `target`, `toast`, `world` arayüz bildirimleri |

## Mobil Girdi Sözleşmesi

Sol alt denetim bölgesi yürüyüş vektörünü sağlar. Sağ yarıdaki boş alan, dikey açı sınırı uygulayan kamera bakışını değiştirir. Sağ alt büyük düğme hedef bloğu kırar; onun üstündeki ikincil düğme seçili blokla yerleştirir. Hızlı çubuk yuvaları seçilebilir olmalıdır. Masaüstü önizlemesinde `WASD`, fare, boşluk, sol tıklama ve sağ tıklama bu eylemlere eşlenir.

## Performans Bütçesi

Kamera çevresinde sınırlı yarıçaplı arazi etkin tutulur. Her dünya materyali, yalnızca havaya açık yüzleri olan birleşik bir mesh içerir. Cevher, toplu materyal arama yerine sabit deterministik eşikle seçilir. Uzak manzara, düşük ayrıntılı mesa sütunlarıyla sahnelenir. Blok değişimleri yalnızca işlem gören dünyada yeniden çizilir ve yerel depolamaya yazılır. Gerçekçi fizik, dinamik gölge haritaları, karmaşık post-process efektleri ve ayrı mesh olarak binlerce blok kullanılmaz.

## Paketleme Akışı

`pnpm build` istemci varlıklarını üretir. Capacitor `sync` bu çıktıyı Android projesine kopyalar. Android Gradle görevi, imzalı yapılandırma bulunuyorsa sürüm APK'sını üretir; bulunmuyorsa geliştirici APK'sı oluşturur. Android kabuğu yalnızca yatay yönelimde açılır ve uygulama kimliği `com.oxygenforge.world` altında tutulur.
