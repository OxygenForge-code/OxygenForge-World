# OxygenForge World — Tasarım Yönü

## Yaklaşım Seçenekleri

| Tema Adı | Çok Kısa Tanım | Olasılık |
| --- | --- | --- |
| Jeolojik Sefer Günlüğü | Volkanik taş, oksitlenmiş metal ve keşif haritası dokularıyla işlenmiş, somut ve maceracı bir voxel dünyası. | 0.07 |
| Güneşle Aşınmış Yayla | Açık gökyüzü, kireçtaşı ve kuru otlarla daha sakin, pastoral bir inşa oyunu hissi. | 0.04 |
| Ay Işığı Madenleri | Koyu bazalt, soluk fosfor mineralleri ve sessiz yeraltı araştırmasını öne çıkaran gece keşfi atmosferi. | 0.09 |

## Seçilen Yön: Jeolojik Sefer Günlüğü

### Tasarım Hareketi

**Taktik saha defteri estetiği** ile biçimlendirilmiş, görsel olarak rafine bir voxel macera yaklaşımıdır. Oyuncu kendini soyut bir sandbox içinde değil, katman katman belgelenen tehlikeli ama davetkâr bir keşif bölgesinde hisseder.

### Temel İlkeler

1. **Okunabilir derinlik:** Yakın, orta ve uzak planlar her zaman farklı renk sıcaklığı ve geometrik yoğunlukla ayrışır.
2. **İşlevsel materyallik:** Her blok türü yalnızca rengiyle değil, kenar aşınması, katman izi ve ses/haptik geri bildirim çağrışımıyla ayırt edilir.
3. **Başparmak erişimi:** Kritik mobil eylemler ekranın alt üçte ikisinde sabit, büyük ve izlenebilir hedefler olarak konumlanır.
4. **Keşif ritmi:** Geniş görüş alanı, madencilik hedefleri ve ufukta görülen jeolojik işaretler oyuncuyu doğal olarak bir sonraki noktaya taşır.

### Renk Felsefesi

Zeminlerin sıcak bazalt, pas kırmızısı ve kumtaşı tonları güvenlik ve ağırlık duygusu oluşturur. Gökyüzünün soluk turkuazı yön bulmayı kolaylaştırırken, keşif açısından önemli mineraller yalnızca kontrollü **oksit bakırı** vurgusuyla ayırt edilir. Bu, karanlık-neon klişesine başvurmadan oyuncunun bakışını yöneten bir renk stratejisidir.

### Yerleşim Paradigması

Oyun ekranı, manzarayı önceliklendiren **ufuk merkezli bir saha penceresi** olarak çalışır. HUD bir kart dizilimi değildir: üstte ince bir sefer şeridi, altta başparmak bölgelerine göre dağıtılmış radial eylem kümeleri ve ortada az sayıda hedefleme işareti bulunur. Menü ve envanter, dünyayı kapatmak yerine sağ kenardan katmanlı biçimde açılır.

### İmza Öğeleri

1. **Stratigrafi kenarları:** Toprak, taş ve cevher bloklarında katmanlı jeolojik şeritler görünür.
2. **Bakır rota işaretleri:** Oyuncunun keşfettiği ilgi noktaları, parlak olmayan bakır pusula sembolleriyle işaretlenir.
3. **Saha şeridi HUD:** Can, enerji, gün zamanı ve biyom bilgisi, ince kazıma çizgileri taşıyan tek satırlı bir üst şeritte birleşir.

### Etkileşim Felsefesi

Dokunma eylemleri gerçek dünya araçları hissini taşımalıdır: kısa basış hedef seçer, basılı tutma kazmayı sürdürür, kaydırma kamera/nişan hareketi sağlar. Her eylem düşük gecikmeli görsel geri bildirim ve mümkün olduğunda hafif haptik eşleme üretir. Oyuncu, ara menüler yerine çoğu eylemi dünyadan doğrudan gerçekleştirebilmelidir.

### Animasyon

Hareketler **80–220 ms** aralığında, fiziksel olarak ölçülü ve amaçlıdır. Blok kırma, hafif parçacık saçar; seçili blok kenarı nefes alır gibi çok küçük bir ışık geçirgenliği döngüsü kullanır; envanter çekmecesi sağdan hızla değil, malzemesi olan bir saha paneli gibi 180 ms'de açılır. Kamera, gereksiz sıçrama veya aşırı esneme olmadan parmak hızını takip eder.

### Tipografi Sistemi

Başlıklar için **Space Grotesk** benzeri köşeli ve keşif odaklı bir sans-serif; sayısal telemetri ve koordinatlar için **IBM Plex Mono** benzeri sabit aralıklı yüz kullanılır. Başlıklar kısa, tümü büyük harf değil, geniş harf aralıklı; oyun içi eylem etiketleri en fazla iki kelimelik olur. Gövde metni yalnızca açıklayıcı bağlam gerektiğinde kullanılır.

### Marka Özü

**OxygenForge World, dokunmatik cihazlarda jeolojiyi, üretimi ve keşfi anlamlı bir macera döngüsünde birleştiren voxel sefer oyunudur.**

Kişilik: **dayanıklı, meraklı, hassas.**

### Marka Sesi

Başlıklar, oyuncuyu pasif bir ziyaretçi değil, sahadaki kaşif olarak konumlandırır. CTA ve mikro metinler kısa, somut ve yönlendiricidir; genel karşılama klişeleri kullanılmaz.

> “Katmanı oku. Rotanı çiz.”

> “Bakır damar kuzey yamacında — aleti hazırla.”

### Kelime İşareti ve Logo

Logo, üst üste binen üç kaya katmanını ve merkezinde küçük bir oyuk/oksijen boşluğu taşıyan **kırık bakır pusula** sembolüdür. Metin işareti, blok kırıklarıyla kesilen geniş harf formlarında `OXYGENFORGE` ve daha ince `WORLD` alt satırından oluşur; logo sembolü metinden bağımsız da tanınır.

### İmza Marka Rengi

**Oksit Bakırı — #B86032.** Bu ton yalnızca yön, hedef ve değerli keşif anlarını vurgulamak için kullanılır.

## Style Decisions

Her rota, kırık bakır pusula/katmanlı kaya işareti veya saha HUD çerçevesiyle hemen tanınabilir bir OxygenForge kimliği sunar. Koyu bazalt tabanı, boş bir karanlık gibi okunmaması için daima görünür stratigrafi, araştırma ızgarası veya oksit bakırı rota işaretleriyle eşleşir. Demo görünümü, ince sefer şeridi, bakır yönlendirme ipuçları ve materyal katmanları belirgin bir jeolojik saha penceresi olarak kalır.
