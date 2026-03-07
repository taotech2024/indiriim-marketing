# Ortam yapılandırması (Marketing Frontend)

Frontend, **indiriim-be-marketing** backend'ine `REACT_APP_API_URL` ile bağlanır.

## Development (local)

- **Backend:** `indiriim-be-marketing` projesi bu makinede çalışmalı (varsayılan port **8092**).
- **Frontend:** `npm run dev` → `REACT_APP_API_URL` için `.env` veya `.env.development` kullanılır.
- **Varsayılan:** `http://localhost:8092` (`.env` ve `.env.development` ile ayarlı).

```bash
# Backend (ayrı terminal)
cd /path/to/indiriim-be-marketing
bash ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Frontend
cd /path/to/indiriim-marketing
npm run dev
```

Giriş: **dev@example.com** / **Dev12345**

## Production (product)

- **Build:** `npm run build` → `.env.production` kullanılır.
- **API URL:** Deploy etmeden önce `.env.production` içinde `REACT_APP_API_URL` değerini gerçek production API adresi ile güncelleyin (örn. `https://api.indiriim.com`).
- CI/CD kullanıyorsanız build sırasında ortam değişkeni verebilirsiniz:  
  `REACT_APP_API_URL=https://api.indiriim.com npm run build`

## Dosya önceliği (webpack)

1. `.env.${NODE_ENV}` (örn. `.env.development`, `.env.production`) — yoksa `.env.example`
2. `.env` — varsa değerleri override eder

`.env`, `.env.development`, `.env.production` projede commit edilmez; şablon için `.env.example` kullanın.
