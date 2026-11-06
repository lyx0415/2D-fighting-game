"""Verify documentation links and exported asset hashes/XML without modifying sources."""
from pathlib import Path
import hashlib
import json
import math
import re
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parent.parent
catalog = json.loads((root / '素材库/catalog.json').read_text(encoding='utf-8'))
errors = []
version = json.loads((root / 'package.json').read_text(encoding='utf-8'))['version']
if catalog.get('gameVersion') != version:
    errors.append('Current catalog does not match package version')
ids = set()
for item in catalog['items']:
    if item['id'] in ids:
        errors.append('Duplicate asset id: ' + item['id'])
    ids.add(item['id'])
    path = (root / '素材库' / item['path']).resolve()
    if not path.is_relative_to(root / '素材库'):
        errors.append('Asset path outside library: ' + item['path'])
        continue
    if not path.is_file():
        errors.append('Missing asset: ' + item['path'])
        continue
    if hashlib.sha256(path.read_bytes()).hexdigest() != item['sha256']:
        errors.append('Asset hash mismatch: ' + item['path'])
    if path.suffix == '.svg':
        try:
            ET.parse(path)
        except ET.ParseError as error:
            errors.append('Invalid SVG: ' + item['path'] + ': ' + str(error))
rig_count = 0
rig_layers = 0
manifests = [sorted(folder.glob('rig_v*.json'))[-1] for folder in (root / '素材库/01_人物/关节分层').glob('*/*') if folder.is_dir() and list(folder.glob('rig_v*.json'))]
for manifest in sorted(manifests):
    rig = json.loads(manifest.read_text(encoding='utf-8'))
    rig_count += 1
    part_ids = {p['id'] for p in rig['parts']}
    for part in rig['parts']:
        rig_layers += 1
        target = (manifest.parent / part['path']).resolve()
        if not target.is_relative_to(manifest.parent.resolve()) or not target.is_file():
            errors.append('Missing or invalid rig layer: ' + str(target))
        if part.get('parent') and part['parent'] not in part_ids:
            errors.append('Missing rig parent: ' + rig['kind'] + '/' + part['id'])
        if not all(math.isfinite(part[k]) for k in ['pivotX', 'pivotY']):
            errors.append('Nonfinite rig pivot: ' + rig['kind'] + '/' + part['id'])
expected_layers = sum(i['id'].startswith('rig_') and i['path'].endswith('.svg') for i in catalog['items'])
if rig_count != 15 or rig_layers != expected_layers:
    errors.append('Current rig manifests/layers incomplete: ' + str(rig_count) + '/' + str(rig_layers))
history_count = 0
for old_catalog in sorted((root / '素材库/99_历史版本').glob('*/catalog.json')):
    old = json.loads(old_catalog.read_text(encoding='utf-8'))
    for item in old['items']:
        path = (old_catalog.parent / item['path']).resolve()
        if not path.is_relative_to(old_catalog.parent.resolve()):
            errors.append('Historical asset outside snapshot: ' + item['path'])
            continue
        history_count += 1
        if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != item['sha256']:
            errors.append('Historical snapshot mismatch: ' + str(path.relative_to(root)))
for path in [root / 'README.md', *sorted((root / 'docs').rglob('*.md')), *sorted((root / '素材库').rglob('*.md'))]:
    if '历史版本' in path.relative_to(root).parts or '99_历史版本' in path.relative_to(root).parts:
        continue  # Historical text keeps its original relative-link context.
    for link in re.findall(r'\]\(([^)]+)\)', path.read_text(encoding='utf-8-sig')):
        if '://' in link or link.startswith('#'):
            continue
        if not (path.parent / link.split('#')[0]).resolve().exists():
            errors.append('Broken document link: ' + str(path.relative_to(root)) + ' -> ' + link)
version = json.loads((root / 'package.json').read_text(encoding='utf-8'))['version']
painted = json.loads((root / 'public/assets/v008/manifest.json').read_text(encoding='utf-8'))
extra = json.loads((root / 'public/assets/v009/manifest.json').read_text(encoding='utf-8'))
ground = json.loads((root / 'public/assets/v010/manifest.json').read_text(encoding='utf-8'))
audio = json.loads((root / 'public/audio/v010/manifest.json').read_text(encoding='utf-8'))
variants = json.loads((root / 'public/audio/v011/manifest.json').read_text(encoding='utf-8'))
variant_ids = {f['id'] for f in variants['files']}
shared_audio = [f for f in audio['files'] if f['id'] not in variant_ids]
menu = json.loads((root / 'public/assets/v012/manifest.json').read_text(encoding='utf-8'))
recordings = json.loads((root / 'public/audio/v012/manifest.json').read_text(encoding='utf-8'))
audio_old = json.loads((root / 'public/audio/v009/manifest.json').read_text(encoding='utf-8'))
for folder, entries in [('public/assets/v008',painted['files']),('public/assets/v009',extra['files']),('public/assets/v010',ground['files']),('public/audio/v010',audio['files']+audio.get('sourceFiles',[])),('public/audio/v009',audio_old['files']),('public/audio/v011',variants['files']),('public/assets/v012',menu['files']),('public/audio/v012',recordings['files']+recordings['previews'])]:
    for entry in entries:
        name = entry.get('path',entry.get('file'))
        file = root / folder / name
        if not file.is_file() or hashlib.sha256(file.read_bytes()).hexdigest() != entry['sha256']:
            errors.append('Runtime resource missing or changed: ' + str(file))
report = {'date': '2026-11-05', 'version': version, 'assets': len(ids), 'historicalAssetsChecked': history_count, 'runtimePaintedTextures': len(painted['files'])+len(extra['files'])+len(ground['files'])+len(menu['files']), 'runtimeAudioFiles':len(recordings['files']),'audioMixModes':3,'baseAudioCues':recordings['baseCueCount'],'voiceAlternates':recordings['variantCount'], 'svgFiles': sum(i['path'].endswith('.svg') for i in catalog['items']), 'ok': not errors, 'errors': errors}
report.update({'legacyRigs': rig_count, 'legacyRigLayers': rig_layers, 'audioFiles': sum(i['path'].endswith('.wav') for i in catalog['items'])})
(root / f'artifacts/archive-check-v{version}-2026-11-05.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False))
raise SystemExit(1 if errors else 0)
