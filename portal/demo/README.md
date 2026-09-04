# Smedjan-portal — demo (mock)

Statisk läsvy över Git-exempeldata för VGR-demo. Ingen API-nyckel. Inga modellanrop. Portalen skriver inte.

## Lokal start (30 sekunder)

```bash
cd portal/demo
python3 -m http.server 8080
```

Öppna http://127.0.0.1:8080/#/hjalp  
Översikt med flödeskarta: http://127.0.0.1:8080/#/oversikt

## Intern deploy (VGR)

Detta är en ren statisk sajt (`index.html`, `app.js`, `styles.css`, `mockdata.js`, `assets/`).

**Krav**
- HTTPS rekommenderas internt
- Ingen backend, ingen databas, ingen build-steg
- Dokumentroten ska peka på den här mappen (`portal/demo`), så att `assets/flode-process.png` resolvas rätt

**Exempel nginx**

```nginx
server {
  listen 443 ssl;
  server_name smedjan-demo.intern.vgregion.se;

  root /var/www/smedjan-portal-demo;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # Hash-routing sköts i webbläsaren; inga server-rewrites krävs utöver statiska filer.
}
```

Kopiera innehållet i `portal/demo/` till document root (inklusive `assets/`).

**Docker (valfritt)**

```bash
docker run --rm -p 8080:80 \
  -v "$PWD/portal/demo:/usr/share/nginx/html:ro" \
  nginx:alpine
```

## Vad demot visar

- EWS klass 0, steg 0–2, mockad motor
- Klickbar processbild med «Du är här» på G2
- Stories, separation, kostnad 0 USD

## Inte i demot

OpenRouter, Temporal, portal-skrivningar, klass 2-data, inloggning.
