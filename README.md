# 🌐 Furnality — Plateforme Web & Réseau Média

Bienvenue sur le dépôt principal du site web de **Furnality**, réseau média indépendant. Ce projet regroupe la vitrine du groupe, les espaces d'actualités, le portail de streaming ainsi que l'interface d'administration réseau.

Le site est conçu pour être 100 % statique, rapide et sécurisé, hébergé via **Cloudflare Pages**.

---

Auteur : **DarkofTime**

Dev : **Z-Kirby90**

> © 2018 Furnality — All rights reserved. Redistribution prohibited.
> <br> © 2025 Office BroadCaster (OBC) — owned by Furnality. All rights reserved. Redistribution prohibited.
> <br> © 2026 Furnality Zapping — owned by Furnality. All rights reserved. Redistribution prohibited.
> <br> © 2026 Furnality news — owned by Furnality. All rights reserved. Redistribution prohibited.
> <br> Any reproduction, distribution, or commercial use without written permission from DarkeofTime is strictly prohibited.

---

## 📁 Architecture du Projet

Le projet utilise une structure monorepo centralisée où chaque sous-dossier correspond à une sous-page ou à un module spécifique du réseau :

```text
furnality-global/
├── .github/
│   └── workflows/
│       └── deploy.yml            # (Optionnel) Déploiement auto
├── Assets/
│   ├── fonts/
│   │   └── Caledonian_Font/
│   │       ├── Regular.ttf
│   │       ├── Medium.ttf
│   │       └── Bold.ttf
│   └── images/
│       ├── Fav - Furnality.svg
│       ├── Furnality Logo.svg
│       └── DCNC.svg
├── css/
│   └── global.css                # Style global unifié
├── js/
│   └── global.js                 # Script client (Front-end)
├── worker/
│   ├── src/
│   │   └── index.js              # Code de l'API Cloudflare Worker
│   ├── wrangler.toml             # Configuration Cloudflare Worker & D1
│   └── schema.sql                # Fichier SQL de la base D1
├── index.html                    # Page d'accueil ou template
└── README.md
