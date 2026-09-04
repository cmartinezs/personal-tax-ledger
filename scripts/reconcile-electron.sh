#!/usr/bin/env bash
set -euo pipefail

echo "== PTL Electron reconciliation =="

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: no estás dentro de un repositorio Git."
  exit 1
fi

BRANCH="$(git branch --show-current)"
echo "Branch actual: $BRANCH"

if [[ "$BRANCH" != "feat/electron-hexagonal-integration" ]]; then
  echo "ERROR: este script debe ejecutarse en feat/electron-hexagonal-integration"
  exit 1
fi

echo
echo "== Corrigiendo referencias legacy =="

python3 - <<'PY'
from pathlib import Path

replacements = {
    Path("apps/desktop/README.md"): [
        (
            "`desktop:dev` compila primero `web/dist`",
            "`desktop:dev` compila primero `apps/local/web/dist`",
        ),
    ],
    Path("docs/desktop-electron.md"): [
        (
            "H --> W[React web/dist]",
            "H --> W[React apps/local/web/dist]",
        ),
    ],
}

for path, pairs in replacements.items():
    if not path.exists():
        raise SystemExit(f"ERROR: no existe {path}")

    text = path.read_text(encoding="utf-8")
    original = text

    for old, new in pairs:
        text = text.replace(old, new)

    if text != original:
        path.write_text(text, encoding="utf-8")
        print(f"actualizado: {path}")
    else:
        print(f"sin cambios necesarios: {path}")
PY

echo
echo "== Agregando archivos al índice =="

git add \
  apps/desktop/README.md \
  apps/desktop/main.mjs \
  docs/architecture/current-state.md \
  docs/desktop-electron.md

echo
echo "== Buscando referencias legacy =="

LEGACY_MATCHES="$(
  git grep -n -E \
    '(^|[^a-zA-Z0-9_/])server/routes|server/test|(^|[^a-zA-Z0-9_/])web/dist|(^|[^a-zA-Z0-9_/])web/src' \
    -- \
    README.md \
    apps/desktop \
    docs/architecture/current-state.md \
    docs/desktop-electron.md \
    docs/README.md \
    docs/gaps/2026-09-04-electron-packaging.md \
    docs/governance \
    package.json \
    || true
)"

if [[ -n "$LEGACY_MATCHES" ]]; then
  echo "ERROR: todavía quedan referencias legacy:"
  echo
  echo "$LEGACY_MATCHES"
  exit 1
fi

echo "OK: no quedan referencias legacy."

echo
echo "== Validando staged diff =="

git diff --cached --check

echo
echo "== Estado previo al merge commit =="

git status --short

if git rev-parse -q --verify MERGE_HEAD >/dev/null 2>&1; then
  echo
  echo "== Cerrando merge =="

  git commit -m "merge: reconcile hexagonal architecture with Electron desktop route"
else
  echo
  echo "INFO: no hay merge pendiente; se omite git commit."
fi

echo
echo "== Instalando dependencias reproducibles =="

npm ci

echo
echo "== Validaciones =="

npm run lint
npm run typecheck
npm test
npm run test:workspaces
npm run build:packages
npm run build
npm run architecture:check
npm run smoke:local
npm run desktop:check

echo
echo "=========================================="
echo "PTL ELECTRON RECONCILIATION: PASS"
echo "=========================================="
echo
echo "Siguiente paso:"
echo "  ejecutar npm run desktop:dev en Windows nativo"
echo
echo "NO lo uses todavía como prueba UAT final desde WSL2."