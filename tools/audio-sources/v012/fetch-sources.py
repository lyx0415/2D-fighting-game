"""Fetch public-authorized CC0 Kenney packs and attributed CC-BY voice source.
Preserves archives, page/license evidence and deterministic file hashes.
"""
from pathlib import Path
import urllib.request
import urllib.parse
import json
import zipfile
import hashlib
import re
import html
from concurrent.futures import ThreadPoolExecutor

ROOT = Path(__file__).resolve().parent
HEADERS = {'User-Agent': 'Mozilla/5.0', 'Accept': '*/*'}


def get(url, referer=None):
    headers = dict(HEADERS)
    if referer:
        headers['Referer'] = referer
    return urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=40).read()


def kenney(slug):
    page_url = 'https://kenney.nl/assets/' + slug
    page = get(page_url)
    (ROOT / (slug + '-page.html')).write_bytes(page)
    endpoint = 'https://kenney.nl/download-link/' + ('assets/' + slug).encode().hex()
    data = json.loads(get(endpoint, page_url))
    raw = get(data['url'], page_url)
    if not raw.startswith(b'PK'):
        raise ValueError('Expected ZIP, not an HTML download landing page: ' + slug)
    archive = ROOT / (slug + '.zip')
    archive.write_bytes(raw)
    destination = ROOT / slug
    with zipfile.ZipFile(archive) as z:
        for entry in z.infolist():
            target = (destination / entry.filename).resolve()
            if not target.is_relative_to(destination.resolve()):
                raise ValueError('Unsafe archive path: ' + entry.filename)
        z.extractall(destination)
    return {'id': 'kenney-' + slug, 'author': 'Kenney', 'page': page_url, 'license': 'CC0 1.0', 'licenseUrl': 'https://creativecommons.org/publicdomain/zero/1.0/', 'archive': archive.name, 'archiveSha256': hashlib.sha256(raw).hexdigest(), 'method': 'Public page download-link endpoint followed by returned signed download URL', 'retrieved': '2026-11-04'}


def female():
    page_url = 'https://opengameart.org/content/female-warrior-grunts'
    (ROOT / 'female-warrior-grunts-page.html').write_bytes(get(page_url))
    url = 'https://opengameart.org/sites/default/files/Grunts%20HD%20Deep.mp3'
    raw = get(url, page_url)
    path = ROOT / 'female-warrior-grunts.mp3'
    path.write_bytes(raw)
    return {'id': 'skyrae-female-warrior', 'author': 'SkyRae', 'page': page_url, 'downloadUrl': url, 'license': 'CC-BY 3.0', 'licenseUrl': 'https://creativecommons.org/licenses/by/3.0/', 'file': path.name, 'sha256': hashlib.sha256(raw).hexdigest(), 'attribution': 'Female Warrior Grunts by SkyRae, OpenGameArt.org, CC BY 3.0; edited, trimmed, equalized and mixed for Ashen Oath.', 'retrieved': '2026-11-04'}


def oga(slug, author, preferred):
    page_url = 'https://opengameart.org/content/' + slug
    page = get(page_url)
    (ROOT / (slug + '-page.html')).write_bytes(page)
    text = page.decode('utf-8')
    section = text[text.index('field-name-field-art-files'):]
    links = re.findall(r'href="(https://opengameart.org/sites/default/files/[^\"]+)"', section)
    url = next((html.unescape(link) for link in links if preferred in link), None)
    if not url:
        raise ValueError('Missing expected original audio download: ' + slug)
    raw = get(url, page_url)
    filename = slug + Path(urllib.parse.urlparse(url).path).suffix
    (ROOT / filename).write_bytes(raw)
    return {'id': slug, 'author': author, 'page': page_url, 'downloadUrl': url, 'license': 'CC0 1.0', 'licenseUrl': 'https://creativecommons.org/publicdomain/zero/1.0/', 'file': filename, 'sha256': hashlib.sha256(raw).hexdigest(), 'retrieved': '2026-11-04'}


if __name__ == '__main__':
    ROOT.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=4) as pool:
        jobs = [pool.submit(kenney, slug) for slug in ['rpg-audio', 'impact-sounds', 'interface-sounds']]
        jobs.append(pool.submit(female))
        sources = [job.result() for job in jobs]
    (ROOT / 'sources.json').write_text(json.dumps(sources, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(sources, ensure_ascii=False))
