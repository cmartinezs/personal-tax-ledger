#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

REQUIRED_NODE="24"

echo "== apv-chile-simulator launcher =="

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js no está instalado." >&2
  exit 1
fi

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt "$REQUIRED_NODE" ]; then
  echo "Error: se requiere Node.js $REQUIRED_NODE o superior (actual: $(node -v))." >&2
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Instalando dependencias..."
  npm install
fi

case "${1:-dev}" in
  dev)
    echo "> Modo desarrollo: API en :3001 y web en :5173"
    npm run dev
    ;;
  build)
    echo "> Compilando frontend de producción..."
    npm run build
    ;;
  start)
    echo "> Iniciando servidor en modo producción..."
    if [ ! -d web/dist ]; then
      echo "  El frontend no está compilado; compilando..."
      npm run build
    fi
    npm start
    ;;
  test)
    echo "> Ejecutando pruebas..."
    npm test
    ;;
  *)
    echo "Uso: $0 [dev|build|start|test]" >&2
    exit 1
    ;;
esac
