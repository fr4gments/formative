#!/usr/bin/env python
"""Serveur de dev IKAL : comme `python -m http.server`, mais SANS cache.

En dev, le navigateur garde volontiers les anciens modules JS en cache : on
change le code, on recharge, et l'app montre toujours l'ancienne version. Ce
serveur ajoute des en-têtes « no-store » pour que chaque rechargement charge
bien la dernière version. Une commande, toujours zéro install.
"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = 8000


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    ThreadingHTTPServer.allow_reuse_address = True
    with ThreadingHTTPServer(("", PORT), NoCacheHandler) as httpd:
        print(f"IKAL dev server (no-cache) -> http://localhost:{PORT}")
        httpd.serve_forever()
