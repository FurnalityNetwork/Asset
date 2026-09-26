-- Structure de la table footer_links pour Cloudflare D1
DROP TABLE IF EXISTS footer_links;

CREATE TABLE footer_links (
    id INTEGER PRIMARY KEY,
    label TEXT NOT NULL,
    url TEXT NOT NULL
);

-- Données initiales
INSERT INTO footer_links (id, label, url) VALUES
(1000, 'Accueil', 'https://furnalitynetwork.github.io'),
(1001, 'News', 'https://furnalitynetwork.github.io/news'),
(2000, 'Office Broadcaster', 'https://furnalitynetwork.github.io/OfficeBroadCaster'),
(2001, 'Zapping', 'https://furnalitynetwork.github.io/Zapping'),
(3000, 'CenterofStream', 'https://furnalitynetwork.github.io/centerofstream'),
(3001, 'Direct 9', 'https://furnalitynetwork.github.io/direct9');
