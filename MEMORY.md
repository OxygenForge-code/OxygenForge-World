# Development Memory

## Başlangıç Bulguları

Kullanıcının yönlendirdiği `OxygenForge-code/OxygenForge-World` deposu 16 Ağustos 2026 tarihinde boş durumdadır. Bu nedenle mevcut kodu genişletmek yerine, projeyi bu depoya aktarılacak yeni bir başlangıç sürümü olarak oluşturmak gerekir.

## Platform Kararı

Oyun, Babylon.js tabanlı mobil öncelikli web çalışma zamanında geliştirilecek ve Android dağıtımı için Capacitor ile APK kabuğuna alınacaktır. Bu yaklaşım, tarayıcıdaki görsel doğrulama döngüsünü korurken Android paketine giden somut bir yol sağlar.

## Oynanış Durumu

Prosedürel arazi, tek sahnede yalnızca görünür blok yüzlerini birleştiren materyal mesh'leriyle üretilmektedir. Dokunmatik hareket ve bakış, oyun içi eylemlerden özel olaylarla ayrılmıştır. Kırma ve yerleştirme değişiklikleri cihazın yerel depolamasına kaydedilir. Bazalt ve bakır cevheri materyalleri, oluşturulan varlık URL'leriyle zenginleştirilmiştir; bağlantı mevcut değilse temel malzeme rengi görünür kalır.

## Önizleme Doğrulaması

Canlı önizlemenin metin erişilebilirliği; amblem, sefer başlığı, koordinatlar, hedef bilgisi, saha notu, hareket denetimi ve araç çantasının yüklendiğini doğruladı. Son mobil ekran görüntüsü hizmeti görüntü üretemediği için bu son doğrulama, Android debug APK derlemesi ve önceki çalışan Babylon çalışma zamanı yakalamalarıyla birlikte değerlendirilmelidir.

## Kapsam Kuralı

Bir APK'nın dosya boyutunu yapay veri ile 1 GB'ın üstüne çıkarmak ürün kalitesini artırmaz ve mobil cihazlar için uygun değildir. İçerik, performans ve gerçek varlık kalitesi önceliklidir.
