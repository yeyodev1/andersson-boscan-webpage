#!/usr/bin/env python3
"""Sube una entrega nueva del sitio de investigaciones a public/periodismo/.

Uso:
    python3 scripts/actualizar-periodismo.py <carpeta o .zip de la entrega>
    python3 scripts/actualizar-periodismo.py <entrega> --permitir-bajas

Hace lo mismo que se hizo a mano con la primera entrega (ver CLAUDE.md,
"Periodismo"):
  1. Reemplaza public/periodismo/ entera, conservando la clave de IndexNow.
  2. Reescribe https://boscanymoni.com/ -> https://boscanymoni.com/periodismo/
     en las URLs absolutas (canonical, og:url, sitemap, feed, llms, robots).
  3. Vuelve a enlazar nuestros ajustes: ajustes.css en la portada, y
     encaje.css + letra.js antes de </head> en la portada y los reportajes.
  4. Pone al día public/llms.txt y public/llms-full.txt con los expedientes
     que entran o salen.

Si en la entrega nueva desaparece algún expediente, se detiene sin tocar nada
salvo que se pase --permitir-bajas.
"""
import html
import re
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path

RAIZ_REPO = Path(__file__).resolve().parent.parent
DEST = RAIZ_REPO / "public" / "periodismo"
LLMS = RAIZ_REPO / "public" / "llms.txt"
LLMS_FULL = RAIZ_REPO / "public" / "llms-full.txt"
CLAVE_INDEXNOW = "6e60fdfa0d2c5fad49aa11dbf1d063a5.txt"
BASE = "https://boscanymoni.com"

# Lo que puede venir junto a la entrega y no se publica.
IGNORAR = shutil.ignore_patterns(
    ".DS_Store", "__MACOSX", ".git", "__pycache__", "node_modules",
    "*.py", "content", CLAVE_INDEXNOW,
)
# Rutas de la app de Vue: si la entrega enlaza a ellas, no se reescriben.
RUTAS_APP = "periodismo/|publicidad|media-kit|quienes-somos|agendar|precios|acceso-eureka"
RE_URL = re.compile(r"https://(?:www\.)?boscanymoni\.com/(?!(?:%s))" % RUTAS_APP)


def salir(msg):
    print(f"\n✗ {msg}", file=sys.stderr)
    sys.exit(1)


def buscar_raiz(carpeta: Path) -> Path:
    """La raíz de la entrega es la carpeta con index.html e investigaciones/."""
    candidatos = [carpeta] + sorted(p for p in carpeta.glob("*") if p.is_dir()) \
        + sorted(p for p in carpeta.glob("*/*") if p.is_dir())
    for c in candidatos:
        if "__MACOSX" in c.parts:
            continue
        if (c / "index.html").is_file() and (c / "investigaciones").is_dir():
            return c
    salir(f"No encontré la entrega en {carpeta}: busco una carpeta con "
          "index.html y una subcarpeta investigaciones/.")


def expedientes(raiz: Path) -> list[str]:
    return sorted(p.parent.name for p in (raiz / "investigaciones").glob("*/index.html"))


def version(texto: str, archivo: str) -> str:
    m = re.search(re.escape(archivo) + r"\?v=(\d+)", texto)
    return m.group(1) if m else "1"


def ficha(slug: str) -> tuple[str, str]:
    texto = (DEST / "investigaciones" / slug / "index.html").read_text(encoding="utf-8")
    t = re.search(r"<title>(.*?)</title>", texto, re.S)
    d = re.search(r'<meta name="description" content="([^"]*)"', texto)
    titulo = html.unescape(t.group(1)).split(" · ")[0].strip() if t else slug
    desc = html.unescape(d.group(1)).strip() if d else ""
    return titulo, desc


def actualizar_llms(nuevos: list[str], bajas: list[str], total: int):
    url = lambda s: f"{BASE}/periodismo/investigaciones/{s}/"

    # llms.txt: una línea por expediente; los nuevos van al final de la lista.
    lineas = LLMS.read_text(encoding="utf-8").split("\n")
    lineas = [l for l in lineas if not any(f"({url(s)})" in l for s in bajas)]
    ultima = max(i for i, l in enumerate(lineas) if "/periodismo/investigaciones/" in l)
    extra = []
    for s in nuevos:
        titulo, desc = ficha(s)
        extra.append(f"- [{titulo}]({url(s)})" + (f": {desc}" if desc else ""))
    lineas[ultima + 1:ultima + 1] = extra
    texto = "\n".join(lineas)
    LLMS.write_text(re.sub(r"\b\d+ expedientes", f"{total} expedientes", texto), encoding="utf-8")

    # llms-full.txt: una sección "## Título / URL / resumen" por expediente.
    texto = LLMS_FULL.read_text(encoding="utf-8")
    secciones = re.split(r"(?m)^(?=## )", texto)
    secciones = [sec for sec in secciones if not any(f"URL: {url(s)}" in sec for s in bajas)]
    texto = "".join(secciones).rstrip("\n") + "\n"
    for s in nuevos:
        titulo, desc = ficha(s)
        texto += f"\n## {titulo}\n\nURL: {url(s)}\n\n{desc}\n"
    LLMS_FULL.write_text(re.sub(r"\b\d+ expedientes", f"{total} expedientes", texto), encoding="utf-8")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    permitir_bajas = "--permitir-bajas" in sys.argv
    if len(args) != 1:
        salir("Uso: python3 scripts/actualizar-periodismo.py <carpeta o .zip de la entrega>")

    origen = Path(args[0]).expanduser().resolve()
    if not origen.exists():
        salir(f"No existe: {origen}")

    with tempfile.TemporaryDirectory() as tmp:
        if origen.is_file():
            if origen.suffix.lower() != ".zip":
                salir("La entrega tiene que ser una carpeta o un archivo .zip.")
            with zipfile.ZipFile(origen) as z:
                z.extractall(tmp)
            origen = Path(tmp)
        raiz = buscar_raiz(origen)
        if raiz == DEST or DEST in raiz.parents:
            salir("Esa es la carpeta del sitio publicado, no una entrega nueva.")

        antes = expedientes(DEST)
        despues = expedientes(raiz)
        nuevos = [s for s in despues if s not in antes]
        bajas = [s for s in antes if s not in despues]
        if not despues:
            salir("La entrega no trae ningún expediente en investigaciones/.")
        if bajas and not permitir_bajas:
            salir("En la entrega nueva faltan estos expedientes que hoy están publicados:\n  "
                  + "\n  ".join(bajas)
                  + "\nSi es a propósito, vuelve a correrlo con --permitir-bajas.")

        portada_vieja = (DEST / "index.html").read_text(encoding="utf-8")
        v_ajustes = version(portada_vieja, "ajustes.css")
        v_encaje = version(portada_vieja, "encaje.css")
        v_letra = version(portada_vieja, "letra.js")

        # 1. Reemplazar la carpeta, menos la clave de IndexNow.
        for p in DEST.iterdir():
            if p.name == CLAVE_INDEXNOW:
                continue
            shutil.rmtree(p) if p.is_dir() else p.unlink()
        shutil.copytree(raiz, DEST, ignore=IGNORAR, dirs_exist_ok=True)

    # 2. URLs absolutas al prefijo /periodismo/.
    reescritas = 0
    for p in DEST.rglob("*"):
        if p.suffix not in (".html", ".xml", ".txt") or not p.is_file():
            continue
        texto = p.read_text(encoding="utf-8", errors="surrogateescape")
        nuevo, n = RE_URL.subn(f"{BASE}/periodismo/", texto)
        if n:
            p.write_text(nuevo, encoding="utf-8", errors="surrogateescape")
            reescritas += n

    # 3. Nuestros ajustes. Primero se quitan por si la entrega ya los trae.
    re_viejos = re.compile(r'[ \t]*<(?:link|script)[^>]*/ajustes-periodismo/[^>]*>(?:</script>)?\n?')
    cabecera = (f'<link rel="stylesheet" href="/ajustes-periodismo/encaje.css?v={v_encaje}">\n'
                f'<script src="/ajustes-periodismo/letra.js?v={v_letra}" defer></script>\n')
    paginas = [DEST / "index.html"] + [
        p for p in (DEST / "investigaciones").rglob("*.html") if not p.name.startswith("_")
    ]
    sin_head = []
    for p in paginas:
        texto = re_viejos.sub("", p.read_text(encoding="utf-8"))
        if "</head>" not in texto:
            sin_head.append(p.relative_to(DEST))
            continue
        if p == DEST / "index.html":
            # En la portada van todos juntos detrás de game.css, como se montó a mano.
            link = f'<link rel="stylesheet" href="/ajustes-periodismo/ajustes.css?v={v_ajustes}">\n'
            texto, n = re.subn(r"(<link[^>]*game\.css[^>]*>\n?)",
                               lambda m: m.group(1) + link + cabecera, texto, count=1)
            if not n:
                texto = texto.replace("</head>", link + cabecera + "</head>", 1)
        else:
            texto = texto.replace("</head>", cabecera + "</head>", 1)
        p.write_text(texto, encoding="utf-8")

    # 4. llms.txt y llms-full.txt.
    if nuevos or bajas or len(despues) != len(antes):
        actualizar_llms(nuevos, bajas, len(despues))

    print("✓ Entrega aplicada en public/periodismo/")
    print(f"  Expedientes: {len(antes)} → {len(despues)}")
    if nuevos:
        print("  Nuevos: " + ", ".join(nuevos))
    if bajas:
        print("  Retirados: " + ", ".join(bajas))
    print(f"  Páginas con ajustes de letra: {len(paginas) - len(sin_head)}")
    print(f"  URLs pasadas a /periodismo/: {reescritas}")
    if sin_head:
        print("  ⚠ Sin </head>, no se les pusieron los ajustes: "
              + ", ".join(map(str, sin_head)))
    if nuevos:
        print("  ℹ Los expedientes nuevos no salen en las carpetas de la portada "
              "(src/views/PortadaView.vue); eso lo decide Diego.")


if __name__ == "__main__":
    main()
