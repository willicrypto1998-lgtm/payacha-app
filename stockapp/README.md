# 📦 Stock Manager — Payacha Boutique
Application mobile React Native (Expo) de gestion de stock.

## Structure du projet

```
stockapp/
├── App.tsx                        ← Point d'entrée + navigation principale
├── app.json                       ← Config Expo (nom, icône, permissions)
├── eas.json                       ← Config build EAS (APK direct download)
├── package.json
└── src/
    ├── store/
    │   └── stockStore.ts          ← État global Zustand (produits, stock, commandes...)
    ├── screens/
    │   ├── ScannerScreen.tsx      ← Scanner code-barres / QR + actions stock
    │   ├── StockScreen.tsx        ← Liste produits, CRUD, filtres
    │   └── OtherScreens.tsx       ← Dashboard, Commandes, Retours, Fournisseurs
    ├── components/
    │   └── UI.tsx                 ← Composants réutilisables (Card, Btn, Input, Badge...)
    └── utils/
        └── theme.ts               ← Couleurs, tailles, constantes

```

---

## ⚡ Installation et lancement (développement)

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer l'app en mode développement
npx expo start

# Scanner le QR code avec l'app Expo Go (Android/iOS)
```

---

## 📱 Générer l'APK Android (sans Play Store)

### Étape 1 — Créer un compte Expo (gratuit)
Aller sur https://expo.dev → créer un compte gratuit.

### Étape 2 — Installer EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Étape 3 — Initialiser le projet EAS
```bash
eas init
# Copier le projectId généré dans app.json > extra > eas > projectId
```

### Étape 4 — Builder l'APK
```bash
eas build -p android --profile preview
```
→ EAS va builder l'APK dans le cloud (gratuit, ~10-15 min)
→ Vous recevez un **lien direct** pour télécharger l'APK
→ Ce lien est partageable sur WhatsApp, email, etc.

### Étape 5 — Installer sur le téléphone
Sur Android : Paramètres → Sécurité → Autoriser sources inconnues → Installer l'APK.

---

## 🌐 Hébergement alternatif (auto-hébergé)

Si vous voulez héberger vous-même le fichier APK :
```bash
# Builder localement
npx expo run:android --variant release
# Le fichier .apk se trouve dans android/app/build/outputs/apk/release/
```
→ Uploader ce fichier sur votre Hostinger VPS ou Google Drive
→ Partager le lien direct

---

## 🍎 iOS (sans App Store)

### Option A — TestFlight (recommandé, gratuit 90 jours)
1. Compte Apple Developer : 99$/an
2. `eas build -p ios --profile preview`
3. Distribuer via TestFlight (jusqu'à 10 000 testeurs)

### Option B — Sans compte payant (limitation)
- Sideload via AltStore (compliqué, nécessite Mac)
- Recommandation : rester sur Android pour la distribution interne

---

## 🗄️ Backend API (optionnel — pour synchronisation multi-appareils)

```bash
# Installer Node.js + PostgreSQL sur votre VPS Hostinger
# Créer la base de données
createdb payacha_stock

# Variables d'environnement (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/payacha_stock
JWT_SECRET=votre_secret_jwt
PORT=3000

# Endpoints principaux
GET    /api/products          ← Liste produits
POST   /api/products          ← Créer produit
PUT    /api/products/:id      ← Modifier produit
DELETE /api/products/:id      ← Supprimer produit
POST   /api/movements         ← Enregistrer mouvement (entrée/sortie/retour)
GET    /api/orders            ← Liste commandes (sync Octomatic)
POST   /api/returns           ← Enregistrer retour
GET    /api/dashboard/stats   ← Stats mensuelles
```

---

## 📦 Fonctionnalités implémentées

| Module | Fonctionnalités |
|--------|-----------------|
| **Scanner** | Camera live, EAN-13/EAN-8/QR/Code128, saisie manuelle, actions (entrée/sortie/retour), quantité ajustable, confirmation avec vibration |
| **Stock** | CRUD produits, filtres statut/catégorie/recherche, seuils alerte, liés aux fournisseurs |
| **Commandes** | Liste par statut, mise à jour statut, calcul total |
| **Retours** | Motif, action (remettre stock / écarter), historique, stats |
| **Fournisseurs** | Fiche fournisseur, délai, fiabilité, produits à réapprovisionner |
| **Dashboard** | KPIs, graphe ventes 7j, alertes stock, commandes récentes |

---

## 🛠️ Pour aller plus loin

- Intégration **Octomatic** : ajouter un webhook POST sur `/api/orders` pour sync automatique
- **Notifications push** : configurer expo-notifications + FCM pour alertes rupture
- **Authentification** : ajouter écran de login + JWT pour multi-utilisateurs
- **Export PDF** : utiliser expo-print pour générer bons de commande

---

Développé par **Wal Dev Studio** · Tizi Ouzou, Algérie
