# 🧾 Invoice Manager

Application web complète de gestion de factures permettant de créer, générer, télécharger et envoyer des factures par email au format PDF.

L'application repose sur une architecture backend **Node.js + Express + TypeScript**, avec **Prisma** pour l'accès aux données, **Puppeteer + Google Chrome** pour la génération des PDF et **Nodemailer + Mailtrap** pour l'envoi des emails.

L'interface frontend est intégrée directement dans le serveur Express via le dossier `src/public` et utilise **Tailwind CSS**, **Animate.css** et **WOW.js**.

---

## 🎯 Présentation du Projet

**Invoice Manager** permet de gérer le cycle complet d'une facture :

```text
Création de la facture
        ↓
Ajout des produits
        ↓
Calcul automatique des totaux
        ↓
Enregistrement de la facture
        ↓
Génération du PDF
        ↓
Envoi par email
        ↓
Téléchargement du PDF
```

Chaque facture générée reste disponible dans le dossier de stockage PDF et peut être téléchargée ultérieurement.

---

# ✨ Fonctionnalités

## F1 — Création d'une facture

* Ajout dynamique de plusieurs produits
* Nom du produit
* Quantité
* Prix unitaire
* Suppression d'un produit
* Saisie de l'email du client
* Validation des données avec Zod
* Création de la facture via l'API REST

## F2 — Calcul automatique

* Calcul du total de chaque ligne :

```text
Total ligne = Quantité × Prix unitaire
```

* Calcul automatique du total général
* Mise à jour en temps réel lors de la modification des quantités ou des prix

## F3 — Email du destinataire

* Champ email du client
* Validation du format email
* Utilisation de l'email pour l'envoi de la facture
* Possibilité de spécifier un autre destinataire lors de l'envoi

## F4 — Génération PDF

* Génération automatique d'un document PDF
* Utilisation de **Puppeteer**
* Utilisation de **Google Chrome** comme navigateur PDF
* Template HTML avec **Handlebars**
* Plusieurs formats disponibles :

| Format  | Utilisation            |
| ------- | ---------------------- |
| A4      | Facture standard       |
| A5      | Petit format           |
| POS     | Ticket de caisse 80 mm |
| THERMAL | Ticket thermique 58 mm |

Le format **A4** est utilisé par défaut.

## F5 — Envoi par email

* Envoi de la facture par email
* PDF ajouté automatiquement en pièce jointe
* Utilisation de **Nodemailer**
* Environnement SMTP **Mailtrap**
* Sujet personnalisable
* Destinataire personnalisable
* Support de l'envoi multiple

## F6 — Téléchargement et gestion des PDF

* Génération et stockage des PDF
* Téléchargement via une route dédiée
* Suppression d'un PDF
* Possibilité de régénérer un PDF
* Envoi ultérieur d'une facture par email

Les fichiers PDF sont stockés dans :

```text
pdf/invoices/
```

Exemple :

```text
pdf/invoices/INV-20260806-4987.pdf
```

---

# 🛠️ Stack Technique

## Backend

| Technologie   | Utilisation                     |
| ------------- | ------------------------------- |
| Node.js       | Runtime JavaScript              |
| Express.js    | Framework HTTP                  |
| TypeScript    | Typage statique                 |
| Prisma        | ORM / accès base de données     |
| Zod           | Validation des données          |
| Puppeteer     | Génération des PDF              |
| Google Chrome | Moteur de rendu PDF             |
| Handlebars    | Templates HTML                  |
| Nodemailer    | Envoi des emails                |
| Mailtrap      | SMTP de développement           |
| Winston       | Logging                         |
| asyncHandler  | Gestion des erreurs asynchrones |

## Frontend

| Technologie        | Utilisation          |
| ------------------ | -------------------- |
| HTML5              | Structure            |
| Vanilla JavaScript | Logique frontend     |
| Tailwind CSS CDN   | Styling              |
| Animate.css        | Animations           |
| WOW.js             | Animations au scroll |
| Font Awesome       | Icônes               |

## Outils

| Outil   | Utilisation              |
| ------- | ------------------------ |
| pnpm    | Gestionnaire de packages |
| tsx     | Exécution TypeScript     |
| nodemon | Hot reload               |
| Git     | Gestion de versions      |

---


# 🚀 Installation

## 1. Prérequis

Vérifier Node.js :

```bash
node --version
```

Le projet nécessite une version compatible avec les dépendances utilisées.

Vérifier pnpm :

```bash
pnpm --version
```

Si pnpm n'est pas disponible :

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

---

## 2. Cloner le projet

```bash
git clone https://github.com/mamy-source/invoice_app.git

cd invoice-manager
```

---

## 3. Installer les dépendances

```bash
pnpm install
```

---

# ⚙️ Configuration

Créer un fichier `.env` à la racine du projet :

```env
# Application
PORT=9000
NODE_ENV=development
APP_URL=http://localhost:9000

# Database
DATABASE_URL="your-database-url"

# Mailtrap
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=votre-username-mailtrap
MAIL_PASS=votre-password-mailtrap
MAIL_FROM=noreply@invoice-manager.local
```

> Les valeurs réelles du serveur SMTP ne doivent jamais être publiées dans Git.

---

# 📧 Configuration Mailtrap

Pour tester l'envoi des emails en développement :

1. Créer un compte Mailtrap
2. Créer un Inbox
3. Récupérer les informations SMTP
4. Ajouter les informations dans `.env`
5. Redémarrer le serveur

Le port SMTP recommandé dans ce projet est :

```env
MAIL_PORT=2525
```

Mailtrap permet ainsi de capturer les emails envoyés par l'application sans les transmettre réellement aux boîtes Gmail des destinataires.

---

# 🌐 Frontend

Le frontend est directement servi par Express.

Les fichiers se trouvent dans :

```text
src/public/
```

Le loader Express expose ce dossier comme contenu statique.

```text
src/public/index.html
```

est donc accessible via :

```text
http://localhost:9000
```

Il n'est pas nécessaire d'utiliser **Live Server / Go Live**.

---

# ▶️ Démarrage

## Mode développement

```bash
pnpm run dev
```

Puis ouvrir :

```text
http://localhost:9000
```

## Build

```bash
pnpm run build
```

## Production

```bash
pnpm run start
```

---

# 📡 API REST

## 📄 Routes Factures

| Méthode | Endpoint        | Description           |
| ------- | --------------- | --------------------- |
| POST    | `/api/invoices`     | Créer une facture     |
| GET     | `/api/invoices`     | Liste des factures    |
| GET     | `/api/invoices/:id` | Récupérer une facture |
| PATCH   | `/api/invoices/:id` | Modifier une facture  |
| DELETE  | `/api/invoices/:id` | Supprimer une facture |

---

## 📄 Routes PDF

| Méthode | Endpoint                 | Description           |
| ------- | ------------------------ | --------------------- |
| POST    | `/api/invoices/:id/export`   | Générer un PDF        |
| GET     | `/api/invoices/:id/download` | Télécharger le PDF    |
| DELETE  | `/api/invoices/:id/pdf`      | Supprimer le PDF      |
| POST    | `/api/invoices/export/bulk`  | Générer plusieurs PDF |

### Exemple

```bash
curl -X POST \
  "http://localhost:9000/api/invoices/cmsh9kegr0000vwhfcg9b5mxc/export?format=A4"
```

---

## 📧 Routes Email

| Méthode | Endpoint               | Description                   |
| ------- | ---------------------- | ----------------------------- |
| POST    | `/api/invoices/:id/email`  | Envoyer une facture par email |
| POST    | `/api/invoices/email/bulk` | Envoyer plusieurs factures    |

### Exemple

```bash
curl -X POST \
  "http://localhost:9000/api/invoices/cmsh9kegr0000vwhfcg9b5mxc/email?format=A4"
```

Avec un destinataire personnalisé :

```bash
curl -X POST \
  "http://localhost:9000/api/invoices/cmsh9kegr0000vwhfcg9b5mxc/email?format=A4&to=client@example.com"
```

---

# 💻 Utilisation de l'Interface

## 1. Créer une facture

L'utilisateur :

1. Saisit l'email du client
2. Ajoute un ou plusieurs produits
3. Saisit le nom du produit
4. Saisit la quantité
5. Saisit le prix unitaire
6. Le total de chaque ligne est calculé automatiquement
7. Le total général est mis à jour automatiquement
8. Choisit le format PDF
9. Clique sur **Créer la facture**

---

## 2. Traitement automatique

Après la création :

```text
POST /invoices
       ↓
Facture créée
       ↓
POST /invoices/:id/export
       ↓
PDF généré
       ↓
POST /invoices/:id/email
       ↓
Email envoyé
       ↓
PDF disponible au téléchargement
```

---

# 📥 Téléchargement des PDF

Une facture peut être téléchargée grâce à :

```text
GET /invoices/:id/download
```

Exemple :

```bash
curl -X GET \
  "http://localhost:9000/api/invoices/cmsh9kegr0000vwhfcg9b5mxc/download?format=A4" \
  -o facture.pdf   (format disponible: A5, POS, THERMAL)
```

Le PDF généré est stocké côté serveur dans :

```text
pdf/invoices/
```

Exemple :

```text
pdf/invoices/INV-20260806-4987.pdf
```

---

# 📧 Envoi d'une facture

Une facture peut être envoyée avec :

```text
POST /invoices/:id/email
```

Le service :

1. Récupère la facture
2. Génère le PDF
3. Détermine le destinataire
4. Prépare l'email
5. Ajoute le PDF en pièce jointe
6. Envoie l'email via Nodemailer
7. Retourne le `messageId`

---

# 🧪 Tests

## Vérifier l'API

```bash
curl http://localhost:9000/api/invoices
```

## Créer une facture

```bash
curl -X POST http://localhost:9000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "clientEmail": "test@example.com",
    "products": [
      {
        "name": "Ordinateur",
        "quantity": 2,
        "unitPrice": 150000
      },
      {
        "name": "Souris",
        "quantity": 3,
        "unitPrice": 25000
      }
    ]
  }'
```

## Générer le PDF

```bash
curl -X POST \
  "http://localhost:9000/api/invoices/ID_FACTURE/export?format=A4"
```

## Télécharger le PDF

```bash
curl -X GET \
  "http://localhost:9000/api/invoices/ID_FACTURE/download?format=A4" \
  -o facture.pdf
```

## Envoyer par email

```bash
curl -X POST \
  "http://localhost:9000/api/invoices/ID_FACTURE/email?format=A4"
```

---

# 📄 Formats PDF

L'application supporte quatre formats :

| Format  | Dimensions   | Utilisation      |
| ------- | ------------ | ---------------- |
| A4      | 210 × 297 mm | Facture standard |
| A5      | 148 × 210 mm | Petite facture   |
| POS     | 80 mm        | Ticket de caisse |
| THERMAL | 58 mm        | Ticket thermique |

Le format est sélectionné avec le paramètre :

```text
?format=A4
```

Exemples :

```text
?format=A4
?format=A5
?format=POS
?format=THERMAL
```

---

# 🖥️ Génération PDF avec Google Chrome

La génération des PDF utilise **Puppeteer** avec **Google Chrome**.

Le navigateur utilisé par Puppeteer doit être installé sur la machine.

Vérifier Google Chrome :

```bash
google-chrome --version
```

Le chemin du navigateur peut être configuré dans le service PDF si nécessaire.

Exemple :

```ts
const browser = await puppeteer.launch({
  headless: true,
  executablePath: "/usr/bin/google-chrome",
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox"
  ]
});
```

Cette configuration permet d'utiliser Google Chrome installé sur le système au lieu du Chromium téléchargé automatiquement par Puppeteer.

---

# 🎨 Interface utilisateur

L'interface utilise :

### Tailwind CSS

Utilisé pour :

* Layout
* Responsive design
* Formulaires
* Boutons
* Cards
* Tables
* États interactifs

### Animate.css

Utilisé pour les animations :

```html
animate__animated
animate__fadeIn
animate__fadeInUp
animate__zoomIn
```

### WOW.js

Utilisé pour déclencher les animations lors du scroll.

---

# 📱 Responsive Design

L'interface est conçue selon une approche **mobile-first**.

Elle prend en charge :

* 📱 Mobile
* 📱 Tablette
* 💻 Desktop

Breakpoints Tailwind utilisés notamment :

```text
sm
md
lg
xl
```

---

# Validation et gestion des erreurs

Les données entrantes sont validées avec **Zod**.

La validation peut concerner :

* `params`
* `query`
* `body`

Exemple :

```text
POST /invoices/:id/email
```

peut recevoir :

```text
params
├── id

query
├── format
├── subject
└── to
```

Les erreurs sont centralisées grâce au middleware :

```text
src/middlewares/error.middleware.ts
```

Les événements importants sont enregistrés avec le système de logging.

---

# Stockage des PDF

Les PDF sont enregistrés dans :

```text
pdf/invoices/
```

Exemple :

```text
pdf/
└── invoices/
    ├── INV-20260806-4987.pdf
    ├── INV-20260807-1234.pdf
    └── INV-20260808-5678.pdf
```

Le chemin du fichier est conservé côté serveur afin de permettre :

* téléchargement ;
* envoi par email ;
* suppression ;
* régénération.

---

# Architecture

Le backend suit une architecture en couches :

```text
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Prisma
  ↓
Database
```

Pour la génération PDF :

```text
Controller
    ↓
InvoicePdfService
    ↓
InvoiceRepository
    ↓
Handlebars
    ↓
Puppeteer
    ↓
Google Chrome
    ↓
PDF
```

Pour l'envoi email :

```text
Controller
    ↓
InvoicePdfService
    ↓
EmailService
    ↓
Nodemailer
    ↓
Mailtrap SMTP
```

---

# Exemple de workflow complet

```text
┌──────────────────────┐
│ Création facture     │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Validation Zod       │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Repository / Prisma  │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Facture enregistrée  │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Génération HTML      │
│ Handlebars           │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Puppeteer            │
│ + Google Chrome      │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ PDF                  │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Nodemailer           │
│ + Mailtrap            │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Email + PDF          │
└──────────────────────┘
```

---

# Sécurité

Les informations sensibles ne doivent pas être commitées.

Ajouter notamment dans `.gitignore` :

```gitignore
.env
node_modules/
pdf/invoices/
```

Ne jamais publier :

```text
MAIL_USER
MAIL_PASS
DATABASE_URL
```

---


# Développement

Projet réalisé avec une architecture backend moderne basée sur :

```text
TypeScript
      +
Express
      +
Prisma
      +
Zod
      +
Puppeteer
      +
Nodemailer
```

Frontend :

```text
HTML
+
Vanilla JavaScript
+
Tailwind CSS
+
Animate.css
+
WOW.js
```


