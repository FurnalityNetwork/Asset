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
furnality-web/
├── Assets/                      # Ressources globales (attention à la majuscule)
│   ├── FAV/                     # Favicons du réseau (.svg)
│   ├── FLAG/                    # Drapeaux et visuels régionaux (.svg)
│   ├── FONT/
│   │   └── CALEDONIAN_FONT/     # Polices typographiques du groupe (.ttf)
│   └── STD/                     # Identités visuelles et logos
│       ├── CHANNEL/             # Logos des chaînes TV / flux vidéo (.svg, .png)
│       ├── RADIO/               # Logos des stations radio (.svg)
│       └── STUDIO/              # Logos des studios et entités (Furnality, OBC, Zapping...)
│
├── css/                     # Feuilles de style globales
├── js/                      # Scripts JavaScript
│
└── README.md                # Documentation du dépôt
