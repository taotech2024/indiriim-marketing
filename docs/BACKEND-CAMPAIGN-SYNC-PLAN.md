# Backoffice → Marketing Kampanya Senkronizasyonu — Backend Uygulama Planı

Bu doküman, **Çözüm 1: Backend senkronizasyonu** ile Back-Office API’de oluşturulan/launch edilen kampanyaların Marketing API’de “notification” olarak görünmesi için backend ekibine sunulacak teknik plandır.

---

## 1. Mevcut Durum Özeti

| Taraf | Backend | Kampanya endpoint | Veri modeli |
|--------|---------|-------------------|-------------|
| **Backoffice** | BO API (`/api/v1/back-office/...`, port 7788 / dev-bo-api) | `POST/GET/PUT .../campaigns`, `POST .../campaigns/{id}/launch` | Campaign (name, channel, content, segmentation rules, experiment, schedule) |
| **Marketing** | Marketing API (`indiriim-be-marketing`, port 8092) | `GET/POST /api/v1/notifications` | Notification (name, templateId, segmentId, channel, scheduledAt) |

- Backoffice’de oluşturulan kampanyalar **sadece** BO API’de kalıyor; Marketing uygulaması **farklı** bir backend kullandığı için bu kampanyalar orada **görünmüyor**.
- Hedef: BO API’de kampanya **oluşturulduğunda** veya **launch edildiğinde** Marketing API’ye bildirim gidip, Marketing tarafında eşdeğer bir **notification** kaydı oluşsun; böylece Marketing UI’da liste ve özet tek yerde toplansın.

---

## 2. Hedef Akış (Yüksek Seviye)

```
[Backoffice UI] → POST/PUT campaign, POST launch → [BO API]
                                                         │
                                                         │ tetikleme (event / webhook / outbound call)
                                                         ▼
                                                [Marketing API]
                                                         │
                                                         │ POST (sync endpoint) → notification kaydı oluştur/güncelle
                                                         ▼
                                                [Marketing DB]
                                                         │
[Marketing UI] ← GET /api/v1/notifications ←──────────────┘
```

- **Tetikleyici:** BO API içinde kampanya oluşturma (create) veya launch işlemi başarıyla tamamlandığında.
- **Eylem:** BO API (veya merkezi bir event consumer), Marketing API’ye senkronizasyon isteği gönderir.
- **Sonuç:** Marketing API’de ilgili kampanyayı temsil eden bir notification kaydı oluşturulur/güncellenir; Marketing UI mevcut `GET /api/v1/notifications` ile bunu listeler.

---

## 3. Tetikleme Noktaları (BO API Tarafı)

Aşağıdaki işlemler başarıyla bittiğinde “Marketing’e sync” tetiklenmeli:

| # | İşlem | Endpoint (mevcut) | Ne zaman tetikle |
|---|--------|-------------------|-------------------|
| 1 | Kampanya oluşturma | `POST /api/v1/back-office/campaigns` | Response 201 döndükten sonra |
| 2 | Kampanya güncelleme | `PUT /api/v1/back-office/campaigns/{id}` | Response 200 döndükten sonra |
| 3 | Kampanya launch | `POST /api/v1/back-office/campaigns/{id}/launch` | Response 200 döndükten sonra |

İsteğe bağlı (ürün kararına bırakılabilir):

- Resend: `POST .../campaigns/{id}/resend` → yeni bir notification olarak mı yoksa mevcut kaydın güncellemesi mi olacak, netleştirilebilir.
- Archive/Delete: Marketing’de durum güncelleme (örn. “archived” / “cancelled”) veya soft-delete.

---

## 4. Senkronizasyon Taşıma Yöntemleri (Seçenekler)

Backend ekibi aşağıdakilerden birini (veya bir kombinasyonu) seçebilir.

### 4.1 Seçenek A: BO API’den Marketing API’ye doğrudan HTTP çağrısı

- BO API, kampanya create/update/launch işlemi **başarıyla** bittikten sonra (transaction commit sonrası) Marketing API’ye **outbound HTTP** isteği atar.
- Avantaj: Basit, ek altyapı yok.  
- Dezavantaj: BO API, Marketing API URL’ine ve (gerekirse) auth bilgisine ihtiyaç duyar; Marketing API geçici kapalıysa retry/kuyruk sizin implementasyonunuza kalır.

**Önerilen kullanım:** Marketing API’de “sync endpoint” (aşağıda) açılır; BO API bu endpoint’i env üzerinden (örn. `MARKETING_SYNC_URL`) alır ve create/update/launch sonrası çağırır.

### 4.2 Seçenek B: Event / message queue (örn. RabbitMQ, Kafka, SQS)

- BO API kampanya işleminden sonra bir **event** yayınlar (örn. `CampaignCreated`, `CampaignLaunched`).
- Ayrı bir **consumer** (Marketing servisi içinde veya ayrı bir sync servisi) bu event’i dinler ve Marketing API’ye HTTP ile sync isteği gönderir (veya doğrudan Marketing DB’ye yazar — aynı servisse).
- Avantaj: Decoupling, retry, ölçeklenebilirlik.  
- Dezavantaj: Kuyruk altyapısı ve operasyon gerekir.

### 4.3 Seçenek C: Marketing API’nin BO API’yi periyodik poll etmesi

- Marketing API belirli aralıklarla BO API’den “son değişen kampanyalar”ı çeker (`GET /api/v1/back-office/campaigns?updatedSince=...` gibi) ve kendi notification tablosunu günceller.
- Avantaj: BO API’de outbound çağrı gerekmez.  
- Dezavantaj: Gecikme, BO API’de tarih filtreli endpoint ihtiyacı, çakışma/çift kayıt yönetimi.

**Öneri:** Uzun vadede **B**, hızlı çözüm için **A** uygun olabilir. Planın geri kalanı **A** üzerinden yazılmıştır; B/C için sadece tetikleme noktası (event yayını / poll job) değişir, payload ve Marketing tarafı aynı kalır.

---

## 5. Marketing API: Sync Endpoint Spesifikasyonu

Marketing backend’in, BO API’den (veya event consumer’dan) gelen tek tip isteği karşılamak için **yeni bir endpoint** sunması önerilir. Mevcut `POST /api/v1/notifications` şablon/segment ID beklediği için, BO’daki “content + segmentation rules” yapısına doğrudan uymaz; bu yüzden ayrı bir sync endpoint mantıklıdır.

### 5.1 Önerilen endpoint

- **Method/URL:** `POST /api/v1/notifications/sync-from-campaign`  
  (veya `POST /api/v1/internal/campaign-sync` — internal veya servis-to-servis ise path buna göre seçilebilir.)

- **Kimlik doğrulama:** Servis-to-servis olduğu için API key, JWT veya mutual TLS gibi bir yöntem tercih edilebilir. Marketing API sadece güvenilir çağrıyı kabul etmeli.

- **Idempotency:** Aynı kampanya için tekrar gelen istekler çakışma yaratmamalı. `Idempotency-Key` veya `externalCampaignId` (BO campaign id) ile “upsert” davranışı önerilir.

### 5.2 İstek gövdesi (request body) önerisi

BO API’nin (veya event consumer’ın) Marketing API’ye göndereceği JSON örneği:

```json
{
  "externalCampaignId": "uuid-from-bo-api",
  "name": "Kampanya adı",
  "channel": "EMAIL",
  "status": "SCHEDULED",
  "scheduledAt": "2025-03-15T10:00:00Z",
  "sentAt": null,
  "content": {
    "subject": "...",
    "bodyHtml": "..."
  },
  "segmentation": {
    "rules": [
      { "field": "segmentId", "operator": "in", "value": ["..."] }
    ]
  },
  "experiment": {
    "enabled": false
  },
  "source": "BACK_OFFICE",
  "createdAt": "2025-03-07T12:00:00Z",
  "updatedAt": "2025-03-07T12:00:00Z"
}
```

Alan açıklamaları:

| Alan | Zorunlu | Açıklama |
|------|---------|----------|
| `externalCampaignId` | Evet | BO API’deki kampanya ID (UUID/string). Idempotency ve güncelleme için anahtar. |
| `name` | Evet | Kampanya adı. |
| `channel` | Evet | `EMAIL` \| `SMS` \| `PUSH`. BO “ALL” ise Marketing’e tek kayıt için bir kanal seçilebilir veya kanal başına kayıt üretilebilir (ürün kararı). |
| `status` | Evet | Aşağıdaki status eşlemesine göre Marketing tarafındaki durum. |
| `scheduledAt` | Hayır | ISO 8601. Planlanmış gönderim. |
| `sentAt` | Hayır | ISO 8601. Gönderildiyse. |
| `content` | Hayır | Kanal bazlı içerik (BO’daki content payload). Marketing tarafında template/body olarak saklanabilir veya “sync kaydı” için ham JSON. |
| `segmentation` | Hayır | BO’daki segmentation rules. Marketing’de segmentId yoksa “dinamik segment” veya kuralların saklanması için kullanılabilir. |
| `experiment` | Hayır | A/B test vb. Bilgi amaçlı veya ileride kullanım. |
| `source` | Hayır | Sabit: `BACK_OFFICE`. |
| `createdAt` / `updatedAt` | Hayır | Denkleştirme ve sıralama için. |

### 5.3 Status eşlemesi (BO → Marketing)

| BO API (Campaign) status | Marketing (Notification) status önerisi |
|--------------------------|------------------------------------------|
| DRAFT | DRAFT |
| READY | DRAFT veya PENDING_APPROVAL |
| SCHEDULED | SCHEDULED |
| ACTIVE | PROCESSING |
| COMPLETED | SENT |
| FAILED | FAILED |
| ARCHIVED | (SENT veya ayrı “archived” alanı — ürün kararı) |

Marketing tarafında ek bir “source” veya “externalId” alanı tutulursa, liste ekranında “Backoffice’den sync” kampanyaları ayırt edilebilir.

### 5.4 Response önerisi

- **200 OK:** Sync başarılı (oluşturma veya güncelleme). Body’de Marketing’deki notification id ve durum dönülebilir:

```json
{
  "notificationId": 12345,
  "externalCampaignId": "uuid-from-bo-api",
  "status": "SCHEDULED",
  "created": true
}
```

- **400 Bad Request:** Validasyon hatası (eksik zorunlu alan, geçersiz status vb.).
- **401/403:** Yetkisiz çağrı.
- **409 Conflict:** İsteğe bağlı; idempotency key çakışması veya “zaten farklı veri ile kayıtlı” durumunda kullanılabilir.

### 5.5 Idempotency

- `externalCampaignId` ile **upsert** önerilir: Aynı `externalCampaignId` ile ikinci istek gelirse mevcut notification güncellenir (name, status, scheduledAt, sentAt vb.), yeni kayıt açılmaz.
- İsteğe bağlı: `Idempotency-Key` header’ı ile aynı isteğin iki kez işlenmesi engellenebilir.

---

## 6. BO API Tarafı: Gönderilecek payload’ın hazırlanması

BO API’de kampanya create/update/launch işlemleri tamamlandıktan sonra, Marketing’e gönderilecek payload şu bilgilerden derlenebilir:

- **externalCampaignId:** Campaign entity’nin id’si (UUID/string).
- **name, channel, status:** Entity’den.
- **scheduledAt / sentAt:** Schedule ve gönderim zamanlarından.
- **content:** Campaign entity’deki content alanı (zaten JSON/object).
- **segmentation:** Campaign entity’deki segmentation rules.
- **experiment:** Campaign entity’den (opsiyonel).
- **source:** `"BACK_OFFICE"`.
- **createdAt / updatedAt:** Entity’den.

BO API’de “Marketing sync URL” ve (gerekirse) API key env’den okunmalı; sync hata verirse retry (örn. exponential backoff) ve logging önerilir. Sync’in kampanya işleminin transaction’ını bloke etmemesi için **asenkron** (arka planda HTTP çağrısı veya kuyruğa event bırakma) yapılması mantıklıdır.

---

## 7. Veri modeli / mapping notları (Marketing tarafı)

- Marketing’deki mevcut **notification** modeli `templateId` ve `segmentId` kullanıyor; BO ise **content** ve **segmentation rules** gönderiyor. İki yaklaşım:
  - **A)** Sync endpoint, gelen `content`/`segmentation` ile Marketing’de “sync kaydı” için özel alanlar tutar (örn. `external_campaign_id`, `source=BACK_OFFICE`, `content_snapshot`, `segmentation_snapshot`). Liste ve dashboard mevcut `GET /api/v1/notifications` ile çalışmaya devam eder; template/segment zorunlu olmayan bir alt tip olarak ele alınır.
  - **B)** Marketing backend, BO’dan gelen kurallara göre kendi segment/template’ini oluşturur veya eşleştirir; notification kaydı `templateId`/`segmentId` ile oluşturulur. Bu daha fazla iş kuralı ve eşleme mantığı gerektirir.

Öneri: İlk aşamada **A** ile “sync kaydı” ve ham snapshot’lar; ileride gerekirse **B** eklenebilir.

---

## 8. Hata yönetimi ve güvenilirlik

- **BO API:** Marketing API’ye yapılan sync çağrısı başarısız olursa: loglama + (tercihen) kuyruğa event atıp tekrar deneme. Kampanya işlemi kullanıcıya başarılı dönmeli; sync arka planda tamamlansın.
- **Marketing API:** Geçersiz payload’da 400 ve anlamlı hata mesajı; `externalCampaignId` ile upsert’te çakışma politikası net olsun (son yazan kazanır veya “değişmediyse güncelleme”).
- **Güvenlik:** Sync endpoint’i sadece güvenilir servislerden erişilebilir olmalı (network, API key veya JWT ile).

---

## 9. Uygulama adımları özeti (checklist)

**Marketing API (indiriim-be-marketing):**

1. [ ] `POST /api/v1/notifications/sync-from-campaign` (veya internal path) tasarımı ve dokümantasyonu.
2. [ ] Request body ve status eşlemesinin uygulanması.
3. [ ] `externalCampaignId` ile upsert mantığı; gerekirse `source`, `content_snapshot`, `segmentation_snapshot` alanları.
4. [ ] Servis-to-servis kimlik doğrulama (API key / JWT / vb.).
5. [ ] Idempotency (ve isteğe bağlı Idempotency-Key header) işlenmesi.
6. [ ] Mevcut `GET /api/v1/notifications` ve dashboard özetinin sync’lenen kayıtları da döndürmesi (ek filtre/alan gerekirse).

**BO API:**

1. [ ] Kampanya create/update/launch sonrası tetikleme noktalarının eklenmesi.
2. [ ] Marketing sync URL ve auth bilgisinin konfigürasyonu (env).
3. [ ] Sync payload’ının oluşturulması ve Marketing endpoint’ine HTTP POST (veya event publish).
4. [ ] Hata durumunda log + (isteğe bağlı) retry/queue.
5. [ ] Sync’in asenkron çalışması (kampanya response’u geciktirmemesi).

**Opsiyonel:**

- [ ] Resend/Archive/Delete için sync kuralının tanımlanması.
- [ ] Event tabanlı (B) veya poll (C) mimarisine geçiş planı.

---

## 10. İletişim ve sonraki adım

Bu plan, frontend tarafında yapılacak değişiklik gerektirmez; Marketing UI mevcut `GET /api/v1/notifications` ile listeyi kullanmaya devam eder. Sync doğru çalıştığında Backoffice’de oluşturulan kampanyalar aynı listede görünecektir.

Backend ekibi bu dokümandaki endpoint sözleşmesi ve status eşlemesini onaylayıp, BO ve Marketing taraflarındaki görevleri kendi sprint’lerine bölerek uygulayabilir. İlk entegrasyon için önerilen sıra: önce Marketing’de sync endpoint’i, ardından BO’da tetikleme ve HTTP çağrısı.
