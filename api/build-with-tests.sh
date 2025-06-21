#!/bin/bash

# build-with-tests.sh
# Script pour builder l'image Docker avec exécution des tests

set -e

echo "🚀 Démarrage du build avec tests..."

# Variables
IMAGE_NAME="api-client-bank"
TAG=${1:-latest}
DOCKERFILE=${2:-Dockerfile}

echo "📦 Building image: $IMAGE_NAME:$TAG"

# Build de l'image avec les tests
docker build \
  --target production \
  -t $IMAGE_NAME:$TAG \
  -f $DOCKERFILE \
  .

# Vérification que l'image a été créée
if docker images | grep -q "$IMAGE_NAME.*$TAG"; then
  echo "✅ Image $IMAGE_NAME:$TAG créée avec succès!"
  echo "📊 Taille de l'image:"
  docker images $IMAGE_NAME:$TAG --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
else
  echo "❌ Échec de la création de l'image"
  exit 1
fi

# Option pour exécuter les tests dans un container séparé
if [ "$3" = "--run-tests" ]; then
  echo "🧪 Exécution des tests dans un container..."
  
  # Build du stage de test seulement
  docker build --target builder -t $IMAGE_NAME:test .
  
  # Exécution du container de test
  docker run --rm $IMAGE_NAME:test yarn test:coverage
  
  echo "✅ Tests exécutés avec succès!"
fi

echo "🎉 Build terminé!"