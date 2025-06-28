# Étape 1 : builder l'app avec node
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers package.json et package-lock.json (pour installer les dépendances)
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le reste du code source
COPY . .

# Builder l'app en mode production (génère un dossier build)
RUN npm run build


# Étape 2 : serveur nginx pour servir le build statique
FROM nginx:alpine

# Copier le build du frontend dans le dossier que nginx va servir
COPY --from=builder /app/build /usr/share/nginx/html

# Expose le port 80
EXPOSE 80

# Commande par défaut (lancée automatiquement)
CMD ["nginx", "-g", "daemon off;"]
