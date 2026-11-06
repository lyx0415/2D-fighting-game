"""Foley-first offline edit suite. Never falls back to old procedural sound sources.

All output waveforms are edits/layers of locally archived licensed source audio.
Dependencies: NumPy, SciPy, SoundFile (local vendored decoder is supported).
"""
from pathlib import Path
from dataclasses import dataclass
from functools import lru_cache
from math import gcd
import sys
import json
import hashlib
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, resample_poly

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'tools/audio-sources/v012'
sys.path.insert(0, str(SRC / 'python-deps'))
import soundfile as sf

OUT = ROOT / 'public/audio/v012'
RATE = 22050
N = lambda seconds: round(RATE * seconds)
EFFECTS = ['click','bladeSwing','bowRelease','arcaneBolt','hammerSwing','daggerSwing','claw','bite','crossbow','chant','cleave','doom','sweep','ward','volley','arrowRain','frost','meteorCast','shieldBash','oath','shadow','execute','metalHit','fleshHit','arrowHit','frostHit','fireHit','bladeHit','magicHit','loot','death','won','lost','entry','warriorHurt','archerHurt','mageHurt','tankHurt','assassinHurt','warriorExert','archerExert','mageExert','tankExert','assassinExert','wardSustain','oathSustain']
AMBIENTS = ['ambient-camp','ambient-ash','ambient-forest','ambient-fortress','ambient-abbey','ambient-crypt']


@dataclass
class Clip:
    a: np.ndarray
    sources: set

    def __mul__(self, gain):
        return Clip(self.a * gain, self.sources.copy())


def trim(a, threshold=.018):
    active = np.flatnonzero(np.abs(a) > max(.001, np.max(np.abs(a)) * threshold))
    if len(active):
        return a[max(0, active[0] - N(.006)):min(len(a), active[-1] + N(.035))]
    raise ValueError('Silent source cannot be substituted')


@lru_cache(maxsize=512)
def decode(relative):
    path = SRC / relative
    if not path.exists():
        raise FileNotFoundError('Required licensed source is missing; no DSP fallback: ' + relative)
    a, rate = sf.read(path, dtype='float64', always_2d=True)
    a = a.mean(axis=1)
    if rate != RATE:
        divisor = gcd(rate, RATE)
        a = resample_poly(a, RATE // divisor, rate // divisor)
    return a


def source(relative, *, cut=None, speed=1, limit=None, raw=False):
    a = decode(relative).copy()
    if cut:
        a = a[N(cut[0]):N(cut[1])]
    if not raw:
        a = trim(a)
    if speed != 1:
        a = np.interp(np.arange(0, len(a), speed), np.arange(len(a)), a)
    if limit:
        a = a[:N(limit)]
    if not len(a):
        raise ValueError('Empty selection: ' + relative)
    # Source staging removes arbitrary recording gain while preserving dynamics.
    a -= np.mean(a)
    a *= min(.65 / max(.0001, np.max(np.abs(a))), .13 / max(.0001, np.sqrt(np.mean(a * a))))
    return Clip(a, {relative})


def rpg(name, **kwargs):
    return source('rpg-audio/Audio/' + name + '.ogg', **kwargs)


def hit(name, **kwargs):
    return source('impact-sounds/Audio/' + name + '.ogg', **kwargs)


def ui(name, **kwargs):
    return source('interface-sounds/Audio/' + name + '.ogg', **kwargs)


def mix(*clips):
    result = np.zeros(max(len(c.a) for c in clips))
    sources = set()
    for clip in clips:
        result[:len(clip.a)] += clip.a
        sources |= clip.sources
    return Clip(result, sources)


def delay(clip, seconds):
    return Clip(np.pad(clip.a, (N(seconds), 0)), clip.sources.copy())


def reverse(clip):
    return Clip(clip.a[::-1].copy(), clip.sources.copy())


def band(clip, low=60, high=7000):
    return Clip(sosfilt(butter(2, [low, high], fs=RATE, btype='bandpass', output='sos'), clip.a), clip.sources.copy())


def envelope(clip, attack=.008, release=.035):
    a = clip.a.copy()
    start, end = min(N(attack), len(a) // 3), min(N(release), len(a) // 3)
    if start:
        a[:start] *= np.linspace(0, 1, start)
    if end:
        a[-end:] *= np.linspace(1, 0, end)
    return Clip(a, clip.sources.copy())


def room(clip, wet=.15, seconds=.18):
    return mix(clip, delay(clip * wet, seconds), delay(clip * wet * .42, seconds * 1.71))


def loop(clip, seconds=2, offset=0):
    # Raised-cosine overlap/add recordings, then select one exact periodic span.
    count = N(seconds)
    a = np.roll(clip.a, -N(offset) % len(clip.a))
    cross = min(N(.2), len(a) // 4, count // 4)
    step = max(1, len(a) - cross)
    result = np.zeros(count * 3 + len(a))
    weights = np.zeros_like(result)
    window = np.ones(len(a))
    if cross:
        window[:cross] = np.sin(np.linspace(0, np.pi / 2, cross)) ** 2
        window[-cross:] = window[:cross][::-1]
    for pos in range(0, count * 3, step):
        result[pos:pos + len(a)] += a * window
        weights[pos:pos + len(a)] += window
    result /= np.maximum(weights, .00001)
    result = result[count:2 * count].copy()
    # Blend the final 160ms toward the preceding continuation of the start.
    # The endpoint is a quiet zero crossing; runtime still fades node start/stop.
    seam = min(N(.16), count // 5)
    first = result[:seam].copy()
    last = result[-seam:].copy()
    blend = np.linspace(0, 1, seam)
    result[-seam:] = last * (1 - blend) + first * blend
    # Periodic cubic correction makes endpoints and endpoint derivatives agree.
    delta = result[-1] - result[0]
    result -= np.linspace(0, delta, count)
    result -= np.mean(result)
    return Clip(result, clip.sources.copy())


def skill_recipes():
    blade = envelope(rpg('knifeSlice', speed=.88, limit=.28))
    cloth = envelope(rpg('cloth2', speed=1.15, limit=.26))
    shield = mix(hit('impactPlate_heavy_002', speed=.84), hit('impactSoft_heavy_001') * .5)
    wood = mix(rpg('creak1', speed=1.15, limit=.22) * .5, hit('impactWood_light_001', limit=.2))
    glass = mix(hit('impactGlass_light_001', speed=.82), delay(hit('impactGlass_medium_003', speed=.92) * .35, .1))
    fire = source('fire-crackling.ogg', cut=(.15, 1.4), raw=True)
    wind = source('wind1.wav', cut=(1.5, 3), raw=True)
    flesh = mix(hit('impactPunch_heavy_001', limit=.27), hit('impactSoft_medium_002', speed=.9, limit=.25) * .3)
    recipes = {
        'click': ui('click_002', limit=.12),
        'bladeSwing': blade,
        'bowRelease': mix(wood * .65, delay(cloth * .6, .015)),
        'arcaneBolt': mix(rpg('bookFlip2', speed=1.5, limit=.19), glass * .15),
        'hammerSwing': mix(rpg('clothBelt', speed=.8, limit=.28), shield * .19),
        'daggerSwing': mix(rpg('knifeSlice2', speed=1.3, limit=.15), rpg('cloth4', speed=1.5, limit=.13) * .35),
        'claw': rpg('chop', speed=1.22, limit=.2),
        'bite': mix(flesh * .65, rpg('handleSmallLeather', limit=.2)),
        'crossbow': mix(hit('impactWood_light_002', speed=1.1, limit=.15), rpg('beltHandle1', speed=1.5, limit=.17) * .3),
        'chant': room(mix(reverse(rpg('cloth3', speed=.65)) * .7, delay(rpg('bookOpen', speed=.8) * .4, .25)), .18),
        'cleave': room(mix(blade, delay(hit('impactWood_heavy_001', speed=.85) * .8, .09)), .1),
        'doom': room(mix(reverse(band(wind, 55, 1200)) * .7, shield * .6), .25, .26),
        'sweep': room(mix(reverse(cloth) * .55, delay(blade, .06), delay(flesh * .65, .13)), .11),
        'ward': room(mix(rpg('beltHandle2', speed=.76) * .4, shield * .75, delay(band(wind, 80, 800) * .25, .12)), .15),
        'volley': mix(*[delay(mix(wood * .7, cloth * .4), i * .13) for i in range(3)]),
        'arrowRain': room(mix(reverse(cloth) * .7, *[delay(mix(wood * .7, hit('impactWood_light_003', speed=.9) * .45), .24 + i * .16) for i in range(3)]), .12),
        'frost': room(mix(reverse(rpg('cloth1', speed=.7)) * .45, delay(glass, .2), delay(band(wind, 500, 4000) * .18, .3)), .18),
        # Never include a strike before the delayed actual fireHit damage event.
        'meteorCast': envelope(mix(reverse(rpg('cloth3', speed=.55)) * .6, band(wind, 100, 2100) * .35), .06, .18),
        'shieldBash': room(mix(shield, hit('impactPunch_heavy_002', speed=.86) * .45, rpg('clothBelt2', speed=.8) * .4), .13),
        'oath': room(mix(shield * .7, delay(rpg('doorClose_2', speed=.72) * .45, .06), band(wind, 60, 700) * .4), .2),
        'shadow': room(mix(reverse(rpg('cloth4', speed=.8)) * .7, delay(blade * .4, .1), band(wind, 100, 1600) * .15), .12),
        'execute': room(mix(blade, delay(rpg('knifeSlice2', speed=1.2), .09), delay(flesh * .7, .12)), .1),
        'metalHit': mix(hit('impactMetal_medium_001', speed=.85, limit=.35), flesh * .6),
        'fleshHit': flesh,
        'arrowHit': mix(hit('impactWood_light_004', limit=.22), flesh * .4),
        'frostHit': room(glass, .11),
        'fireHit': room(mix(fire * .8, hit('impactSoft_heavy_003', speed=.72) * .65), .15),
        'bladeHit': mix(rpg('drawKnife2', limit=.23) * .4, flesh),
        'magicHit': room(mix(glass * .3, hit('impactSoft_medium_001') * .7, rpg('bookClose') * .3), .16),
        'loot': rpg('handleCoins2', limit=.5),
        'death': mix(rpg('dropLeather', speed=.85), hit('impactSoft_heavy_002', speed=.9) * .6),
        'won': mix(rpg('handleCoins'), delay(rpg('bookOpen') * .5, .22), delay(rpg('handleCoins2', speed=1.08) * .35, .35)),
        'lost': mix(rpg('bookClose', speed=.82), delay(rpg('dropLeather') * .4, .13)),
        'entry': mix(rpg('bookOpen', speed=.9), delay(rpg('clothBelt') * .5, .12)),
        'wardSustain': loop(band(wind, 70, 600), 2),
        'oathSustain': loop(band(source('wind1.wav', cut=(5, 7.4), raw=True), 45, 420), 2),
    }
    return recipes


def voice_recipes():
    metadata = json.loads((SRC / 'male-voice-segments.json').read_text(encoding='utf-8'))
    # Explicitly curated real recording segments, never guessed synthetic substitution.
    sources = metadata['roles']
    females = [( .22, .47), (.98, 1.23), (1.7, 2.06), (2.58, 2.89), (3.42, 3.85), (4.45, 4.85)]
    recipes = {}
    segments = []
    for hero in ['warrior', 'archer', 'mage', 'tank', 'assassin']:
        for kind in ['Exert', 'Hurt']:
            for variant in range(3):
                cue = hero + kind + ('' if variant == 0 else '__' + str(variant + 1))
                if hero in ['archer', 'assassin']:
                    index = (variant + (0 if hero == 'archer' else 2) + (3 if kind == 'Hurt' else 0)) % len(females)
                    clip = source('female-warrior-grunts.mp3', cut=females[index], speed=1 if hero == 'archer' else 1.055)
                    selected = {'file': 'female-warrior-grunts.mp3', 'cut': list(females[index]), 'speed': 1 if hero == 'archer' else 1.055}
                else:
                    selected = sources[hero][kind][variant]
                    clip = source(selected['file'], cut=selected['cut'], speed=selected.get('speed', 1))
                recipes[cue] = envelope(band(clip, 100 if hero != 'tank' else 80, 5200), .008, .04)
                segments.append({'id': cue, 'hero': hero, 'kind': kind, 'variant': variant + 1, 'sourceFile': selected['file'], 'sourceCutSeconds': selected['cut'], 'speed': selected.get('speed', 1), 'outputSeconds': len(recipes[cue].a) / RATE, 'sourceLabelIncludesYell': 'yell' in Path(selected['file']).name.lower(), 'humanListeningReviewed': False})
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'voice-segments.json').write_text(json.dumps({'selectionMethod': 'Source labels and measured onset/envelope/duration; not a substitute for human listening review', 'segments': segments}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return recipes


def ambience_recipes():
    wind = source('wind1.wav', raw=True)
    fire = source('fire-crackling.ogg', raw=True)
    dungeon = source('loopable-dungeon-ambience.ogg', cut=(1, 18), raw=True)
    def stretch_loop(clip, offset=0):
        return loop(clip, 12, offset)
    return {
        'ambient-camp': mix(stretch_loop(band(fire, 100, 3600)) * .65, stretch_loop(band(wind, 100, 1400), 2) * .25),
        'ambient-ash': mix(stretch_loop(band(wind, 90, 2200), 4) * .6, stretch_loop(band(fire, 130, 2700), .7) * .3),
        'ambient-forest': stretch_loop(band(wind, 130, 3900), 7),
        'ambient-fortress': mix(stretch_loop(band(wind, 80, 1600), 10), stretch_loop(band(rpg('creak3', speed=.85), 120, 1800)) * .055),
        'ambient-abbey': mix(stretch_loop(band(wind, 80, 1100), 13), stretch_loop(band(rpg('doorOpen_1', speed=.8), 100, 1500)) * .035),
        'ambient-crypt': stretch_loop(band(dungeon, 80, 2600), 3),
    }


def license_for(relative):
    return 'CC-BY 3.0: SkyRae; attribution required; edited' if relative == 'female-warrior-grunts.mp3' else 'CC0 1.0; edited'


def save(cue, clip):
    sustain = cue in ['wardSustain', 'oathSustain']
    ambient = cue.startswith('ambient-')
    voice = 'Exert' in cue or 'Hurt' in cue
    hit_cue = cue in ['metalHit', 'fleshHit', 'arrowHit', 'frostHit', 'fireHit', 'bladeHit', 'magicHit']
    normal = cue in ['bladeSwing', 'bowRelease', 'arcaneBolt', 'hammerSwing', 'daggerSwing', 'claw', 'bite', 'crossbow']
    ui_cue = cue in ['click', 'loot', 'entry', 'won', 'lost']
    a = clip.a.copy()
    # Broad subtraction, not metallic ringing: reduce fatigue band 1.5–4kHz.
    a -= .46 * sosfilt(butter(2, [1500, 4000], fs=RATE, btype='bandpass', output='sos'), a)
    a = sosfilt(butter(2, [65 if voice else 45, 6800], fs=RATE, btype='bandpass', output='sos'), a)
    a -= np.mean(a)
    target_peak, target_rms = (.1, .022) if sustain else (.11, .023) if ambient else (.25, .063) if voice else (.32, .075) if hit_cue else (.24, .052) if normal else (.24, .05) if ui_cue else (.57, .13)
    a *= min(target_peak / max(.000001, np.abs(a).max()), target_rms / max(.000001, np.sqrt(np.mean(a * a))))
    if not sustain and not ambient:
        a = envelope(Clip(a, set()), .006, .035).a
    else:
        # Remove IIR warm-up discontinuity, preserve quiet continuous wrap.
        a -= np.linspace(0, a[-1] - a[0], len(a))
        a -= np.mean(a)
        a *= min(1, target_peak / max(.000001, np.abs(a).max()), target_rms / max(.000001, np.sqrt(np.mean(a * a))))
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / (cue + '.wav')
    wavfile.write(path, RATE, np.round(np.clip(a, -.95, .95) * 32767).astype(np.int16))
    _, pcm = wavfile.read(path)
    a = pcm.astype(float) / 32768
    refs = [{'file': relative, 'sha256': hashlib.sha256((SRC / relative).read_bytes()).hexdigest(), 'license': license_for(relative)} for relative in sorted(clip.sources)]
    entry = {'id': cue, 'baseId': cue.split('__')[0], 'variant': int(cue.split('__')[1]) if '__' in cue else 1, 'profile': 'foley', 'file': path.name, 'seconds': len(a) / RATE, 'duration': len(a) / RATE, 'peak': float(np.abs(a).max()), 'rms': float(np.sqrt(np.mean(a * a))), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'source': refs, 'loop': sustain or ambient, 'method': 'Licensed source recording/Foley edit: trim, resample, broad EQ, material layers, restrained short room tail; no oscillator/noise/TTS generation'}
    if sustain or ambient:
        entry['seamStep'] = float(abs(a[0] - a[-1]))
        entry['dcMean'] = float(np.mean(a))
    return entry


def comparisons():
    # Both 30-second offline encounters use one identical event timeline/master gain.
    # They are constructed previews, not recordings of interactive browser gameplay.
    events = [(0, 'entry', .5), (2, 'ward', .55), (4.2, 'volley', .5), (7, 'frost', .55), (10, 'shieldBash', .55), (13, 'meteorCast', .5), (13.7, 'fireHit', .65), (17, 'oath', .55), (21, 'execute', .6), (26, 'won', .5)]
    attacks = ['bladeSwing', 'bowRelease', 'arcaneBolt', 'daggerSwing']
    hits = ['metalHit', 'arrowHit', 'magicHit', 'bladeHit']
    for i, seconds in enumerate(np.arange(1, 25, .82)):
        events.extend([(float(seconds), attacks[i % 4], .4), (float(seconds + .14), hits[i % 4], .35)])
    for seconds, hero in [(2, 'warrior'), (4.2, 'archer'), (7, 'mage'), (10, 'tank'), (21, 'assassin')]:
        events.append((seconds, hero + 'Exert', .28))
    directory = OUT / 'previews'
    directory.mkdir(parents=True, exist_ok=True)
    report = []
    for version in ['historical-v011', 'foley-v012']:
        result = np.zeros(N(30))
        def read_cue(cue):
            path = OUT / (cue + '.wav') if version == 'foley-v012' else ROOT / 'public/audio/v011/grounded' / (cue + '.wav')
            if version != 'foley-v012' and not path.exists():
                path = ROOT / 'public/audio/v010' / (cue + '.wav')
            _, pcm = wavfile.read(path)
            return pcm.astype(float) / 32768
        ambient = read_cue('ambient-ash')
        result += np.resize(ambient, len(result)) * .4
        for seconds, cue, gain in events:
            a = read_cue(cue)
            start = N(seconds)
            length = min(len(a), len(result) - start)
            result[start:start + length] += a[:length] * gain
        result *= .8
        assert np.abs(result).max() < 1, 'Preview clipping: shared mix should be reduced for both'
        path = directory / ('encounter-' + version + '-30s.wav')
        wavfile.write(path, RATE, np.round(result * 32767).astype(np.int16))
        report.append({'file': path.relative_to(OUT).as_posix(), 'seconds': 30, 'peak': float(np.abs(result).max()), 'rms': float(np.sqrt(np.mean(result * result))), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'rmsMatched': False})
        # Match whole-render PCM RMS, preserving each render's dynamics/transients.
        # This is not perceptual loudness/LUFS matching, and applies no limiter.
        target_rms = .02
        gain = target_rms / max(.000001, np.sqrt(np.mean(result * result)))
        matched = result * gain
        assert np.abs(matched).max() < .98, 'Chosen common RMS target would clip'
        matched_path = directory / ('encounter-' + ('historical' if version == 'historical-v011' else 'foley') + '-matched.wav')
        wavfile.write(matched_path, RATE, np.round(matched * 32767).astype(np.int16))
        _, matched_pcm = wavfile.read(matched_path)
        matched_final = matched_pcm.astype(float) / 32768
        report.append({'file': matched_path.relative_to(OUT).as_posix(), 'seconds': 30, 'peak': float(np.abs(matched_final).max()), 'rms': float(np.sqrt(np.mean(matched_final * matched_final))), 'sha256': hashlib.sha256(matched_path.read_bytes()).hexdigest(), 'rmsMatched': True, 'targetRms': target_rms, 'appliedGain': float(gain), 'matchingMethod': 'Whole-render linear PCM RMS; not LUFS or perceptual loudness matching; no limiting'})
    (directory / 'timeline.json').write_text(json.dumps({'kind': 'Offline constructed comparison; not browser capture or human listening validation', 'masterGain': .8, 'matchingNote': 'Matched previews have common 0.02 whole-render PCM RMS. This does not equal LUFS or perceptual loudness matching.', 'events': events, 'renders': report}, ensure_ascii=False, indent=2), encoding='utf-8')
    return report


def main():
    recipes = skill_recipes() | voice_recipes() | ambience_recipes()
    missing = set(EFFECTS + AMBIENTS) - recipes.keys()
    assert not missing, missing
    files = [save(cue, clip) for cue, clip in recipes.items()]
    previews = comparisons()
    source_metadata = []
    for path in [SRC / 'sources.json', SRC / 'ambient-sources.json', SRC / 'male-voice-source.json']:
        data = json.loads(path.read_text(encoding='utf-8'))
        source_metadata.extend(data if isinstance(data, list) else [data])
    manifest = {'date': '2026-11-04', 'version': 'v012', 'profile': 'foley', 'sampleRate': RATE, 'channels': 1, 'format': 'PCM signed 16-bit WAV', 'baseCueCount': 52, 'variantCount': len(files) - 52, 'method': 'Source-recording/Foley-first offline edit and layering; no old procedural generator fallback; no TTS/voice cloning', 'voiceSegments': 'voice-segments.json', 'sources': source_metadata, 'licenseNotes': ['Kenney packs and explicitly CC0 OGA sources are preserved with their source license evidence.', 'SkyRae Female Warrior Grunts is CC-BY 3.0; redistribution requires attribution, original URL, license link and modification notice. See CREDITS.txt.', 'No League of Legends, Honor of Kings or Night of the Full Moon audio was sampled.'], 'files': files, 'previews': previews}
    (OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (OUT / 'CREDITS.txt').write_text('Ashen Oath v012 audio\n\nKenney RPG Audio, Impact Sounds, Interface Sounds — Kenney — CC0 1.0.\nhttps://kenney.nl/assets/rpg-audio\nhttps://kenney.nl/assets/impact-sounds\nhttps://kenney.nl/assets/interface-sounds\n\nFemale Warrior Grunts — SkyRae — CC BY 3.0\nhttps://opengameart.org/content/female-warrior-grunts\nhttps://creativecommons.org/licenses/by/3.0/\nChanges: selected segments, trimmed, mild speed alteration for assassin, equalized, level-adjusted and mixed.\n\nMale Grunt/Yelling Sounds — HaelDB — chosen CC0 option of the source dual license.\nhttps://opengameart.org/content/male-gruntyelling-sounds\n\nFire Crackling — AntumDeluge — CC0.\nhttps://opengameart.org/content/fire-crackling\nWind1 — Luke.RUSTLTD — CC0.\nhttps://opengameart.org/content/wind1\nLoopable Dungeon Ambience — JaggedStone — CC0.\nhttps://opengameart.org/content/loopable-dungeon-ambience\n\nCC0: https://creativecommons.org/publicdomain/zero/1.0/\nAll adapted for offline game sound design. Original source archives and page/license snapshots are retained in tools/audio-sources/v012.\n', encoding='utf-8')
    print(json.dumps({'baseCues': 52, 'variants': len(files) - 52, 'runtimeWavs': len(files), 'previews': len(previews)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
