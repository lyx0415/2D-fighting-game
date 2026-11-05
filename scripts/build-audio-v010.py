"""Deterministic v010 DSP mix. Reads v009 without modifying it; no network dependencies.

Run render-exertions-v010.ps1 first for optional local Windows SAPI syllables.
Original DSP fallback remains available if a desktop speech engine is unavailable.
"""
from pathlib import Path
import hashlib
import json
import shutil
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, resample_poly

ROOT = Path(__file__).resolve().parent.parent
OLD = ROOT / 'public/audio/v009'
OUT = ROOT / 'public/audio/v010'
OUT.mkdir(parents=True, exist_ok=True)
RATE = 22050
RNG = np.random.default_rng(100131)
N = lambda seconds: round(seconds * RATE)


def read(path):
    rate, pcm = wavfile.read(path)
    a = pcm.astype(np.float64) / (32768 if pcm.dtype == np.int16 else 1)
    if a.ndim > 1:
        a = a.mean(axis=1)
    if rate != RATE:
        from math import gcd
        divisor = gcd(rate, RATE)
        a = resample_poly(a, RATE // divisor, rate // divisor)
    return a


def noise(seconds, low, high, decay=4):
    count = N(seconds)
    a = sosfilt(butter(2, [low, min(high, 10000)], fs=RATE, btype='bandpass', output='sos'), RNG.normal(size=count))
    return a * np.exp(-np.arange(count) / RATE * decay)


def tone(seconds, frequency, end=None, decay=6):
    count = N(seconds)
    freq = np.linspace(frequency, frequency if end is None else end, count)
    return np.sin(np.cumsum(freq) * 2 * np.pi / RATE) * np.exp(-np.arange(count) / RATE * decay)


def mix(*layers):
    a = np.zeros(max(len(v) for v in layers))
    for layer in layers:
        a[:len(layer)] += layer
    return a


def delay(a, seconds):
    return np.pad(a, (N(seconds), 0))


def whoosh(seconds, low=350, high=5200):
    a = noise(seconds, low, high, 0)
    # Continuous attack/sustain/release, rather than an instant noise click.
    envelope = np.sin(np.linspace(0, np.pi, len(a))) ** 1.6
    return a * envelope


def pluck(seconds, frequency):
    count = N(seconds)
    stride = round(RATE / frequency)
    a = np.zeros(count)
    a[:stride] = RNG.uniform(-1, 1, stride)
    for i in range(stride, count):
        a[i] = .492 * (a[i - stride] + a[i - stride + 1])
    return a


def tail(a, taps=(.12, .25, .41), gain=.22):
    return mix(a, *[delay(a * gain ** (i + 1), seconds) for i, seconds in enumerate(taps)])


def old(cue):
    return read(OLD / (cue + '.wav'))


def crackle(seconds):
    a = np.zeros(N(seconds))
    for pos in RNG.integers(0, len(a) - N(.035), 32):
        pulse = noise(.03, 2300, 9500, 110) * RNG.uniform(.15, .65)
        a[pos:pos + len(pulse)] += pulse
    return a


def exertion(cue, pitch, breath):
    path = OUT / 'source' / (cue + '-sapi.wav')
    if path.exists():
        a = read(path)
        threshold = max(.006, np.max(np.abs(a)) * .07)
        audible = np.flatnonzero(np.abs(a) > threshold)
        if not len(audible):
            raise ValueError('Silent SAPI source: ' + cue)
        a = a[max(0, audible[0] - N(.018)):min(len(a), audible[-1] + N(.045))]
        # Resampling alters pitch and timing for short physical exertions.
        a = np.interp(np.arange(0, len(a), pitch), np.arange(len(a)), a)
        a = sosfilt(butter(2, [120, 3800], fs=RATE, btype='bandpass', output='sos'), a)
        source = 'Local Windows SAPI synthesized syllable + original breath DSP; not human voice acting'
    else:
        a = mix(tone(.32, 130 * pitch, 90 * pitch, 9), .4 * noise(.3, 300, 1700, 8))
        source = 'Original breath/formant DSP fallback; not human voice acting'
    a = mix(a, breath * noise(min(.42, len(a) / RATE), 650, 3300, 8))
    return a, source


heavy_air = whoosh(.62, 140, 3600)
effects = {
    'sweep': tail(mix(heavy_air, delay(.38 * noise(.42, 850, 5000, 11), .22), delay(.24 * tone(.65, 105, 45, 7), .2)), (.16, .38, .62)),
    'ward': tail(mix(.36 * old('ward'), .32 * tone(1.4, 146, 145, 2), .25 * noise(1.25, 650, 2200, 2.8)), (.18, .4, .7)),
    'volley': mix(*[delay(mix(.8 * pluck(.4, 178 + i * 15), .5 * whoosh(.24, 1400, 6500)), t) for i, t in enumerate((0, .16, .32))]),
    'arrowRain': tail(mix(*[delay(mix(.6 * whoosh(.44, 2200, 8200), delay(.5 * pluck(.24, 140 + i * 13), .26)), t) for i, t in enumerate((0, .21, .43))]), (.1, .24, .4), .18),
    'frost': tail(mix(.22 * old('frost'), .6 * noise(.95, 2800, 8500, 3)[::-1], delay(crackle(.85), .38), .14 * tone(1.1, 420, 710, 3)), (.13, .28, .52), .22),
    # Pure charge/falling air: damage event plays fireHit after 0.7s.
    'meteorCast': mix(.65 * noise(.68, 100, 1500, 2.5)[::-1], delay(.4 * whoosh(.45, 400, 4300), .38), delay(.18 * noise(.75, 700, 3100, 5), .58)),
    'shieldBash': tail(mix(.9 * tone(.7, 86, 38, 6), .75 * noise(.3, 160, 1900, 12), .23 * whoosh(.25, 250, 2600)), (.13, .3, .56)),
    'oath': tail(mix(.28 * old('oath'), .5 * tone(1.7, 98, 97, 1.7), .24 * tone(1.5, 147, 146, 1.9), .45 * noise(1.4, 120, 900, 2)), (.2, .46, .76), .3),
    'shadow': tail(mix(.18 * old('shadow'), .8 * whoosh(.36, 450, 4200)[::-1], delay(.5 * noise(.6, 90, 1000, 6), .2), delay(.3 * tone(.65, 93, 39, 6), .12)), (.14, .32, .55), .23),
    'execute': tail(mix(whoosh(.18, 2400, 8500), delay(.9 * whoosh(.19, 1600, 7100), .095), delay(.45 * noise(.46, 180, 1600, 9), .16)), (.09, .22, .4), .2),
    'metalHit': mix(.28 * old('metalHit'), .65 * noise(.22, 220, 2700, 19), .35 * tone(.28, 128, 60, 15)),
    'fleshHit': mix(.5 * old('fleshHit'), .45 * noise(.18, 150, 1300, 20)),
    'arrowHit': mix(.5 * pluck(.25, 120), .5 * noise(.18, 350, 2000, 23), .2 * tone(.22, 95, 50, 14)),
    'frostHit': tail(mix(crackle(.42), .1 * tone(.32, 720, 450, 13)), (.08, .19), .18),
    'fireHit': tail(mix(.45 * old('fireHit'), .9 * noise(1.3, 90, 2700, 3), .3 * crackle(1.1)), (.12, .28, .46), .18),
    'bladeHit': mix(.35 * old('bladeHit'), .6 * noise(.22, 500, 4300, 18), .16 * tone(.24, 116, 53, 12)),
    'magicHit': tail(mix(.3 * old('magicHit'), .5 * noise(.6, 350, 3300, 7), .18 * tone(.6, 290, 130, 6)), (.1, .23, .42), .24),
}
voice_sources = {}
for cue, pitch, breath in [('warriorExert', .73, .08), ('archerExert', 1.04, .04), ('mageExert', .9, .025), ('tankExert', .61, .09), ('assassinExert', 1.12, .04)]:
    effects[cue], voice_sources[cue] = exertion(cue, pitch, breath)


def metrics(path, cue, source, license_note):
    a = read(path)
    return {'id': cue, 'file': path.name, 'duration': len(a) / RATE, 'peak': float(np.abs(a).max()), 'rms': float(np.sqrt(np.mean(a * a))), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'source': source, 'license': license_note}


previous = json.loads((OLD / 'manifest.json').read_text(encoding='utf-8'))
report = []
for item in previous['files']:
    cue = item['id']
    path = OUT / item['file']
    if cue in effects:
        a = effects.pop(cue)
        a = np.nan_to_num(a)
        a -= np.mean(a)
        # Runtime mix sets category levels. These files reserve headroom too.
        a *= .72 / max(.0001, np.max(np.abs(a)))
        fade = min(N(.012), len(a) // 8)
        a[:fade] *= np.linspace(0, 1, fade)
        a[-fade:] *= np.linspace(1, 0, fade)
        wavfile.write(path, RATE, np.round(a * 32767).astype(np.int16))
        source = 'Original deterministic v010 DSP; selected v009 source layers (' + item['source'] + ')'
    else:
        shutil.copy2(OLD / item['file'], path)
        source = 'Unmodified v009: ' + item['source']
    report.append(metrics(path, cue, source, 'Original project DSP; inherited jsfxr layers are Unlicense, see tools/vendor/jsfxr/UNLICENSE'))
for cue, a in effects.items():
    a -= np.mean(a)
    # Exertions intentionally quiet, not normalised to weapon FX amplitude.
    a *= min(.25 / max(.0001, np.max(np.abs(a))), .065 / max(.0001, np.sqrt(np.mean(a * a))))
    fade = min(N(.018), len(a) // 8)
    a[:fade] *= np.linspace(0, 1, fade)
    a[-fade:] *= np.linspace(1, 0, fade)
    path = OUT / (cue + '.wav')
    wavfile.write(path, RATE, np.round(a * 32767).astype(np.int16))
    report.append(metrics(path, cue, voice_sources[cue], 'Local installed Windows SAPI output + original DSP; not downloaded media; Windows voice engine remains Microsoft software'))

source_files = []
for path in sorted((OUT / 'source').glob('*')) if (OUT / 'source').exists() else []:
    source_files.append({'file': path.relative_to(OUT).as_posix(), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
manifest = {'date': '2026-10-31', 'version': 'v010', 'sampleRate': RATE, 'channels': 1, 'format': 'PCM signed 16-bit WAV', 'seed': 100131, 'method': 'Original DSP + inherited v009/jsfxr layers; optional local Windows SAPI exertions; no human voice recordings', 'licenseNotes': ['Original project-generated DSP; jsfxr inherited layers Unlicense (tools/vendor/jsfxr/UNLICENSE)', 'SAPI voices are locally installed Microsoft software, no voice model or engine is redistributed; WAVs are offline synthesized nonverbal output, not human recordings.', 'No third-party downloaded audio was used.'], 'sourceFiles': source_files, 'files': report}
(OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
assert len(report) == 50, len(report)
assert len({item['id'] for item in report}) == 50
assert all(item['peak'] < 1 and item['rms'] > 0 and item['duration'] > 0 for item in report)
print(json.dumps({'files': len(report), 'newVoices': list(voice_sources), 'updatedEffects': 17, 'sourceWavs': len(list((OUT / 'source').glob('*.wav'))), 'totalSeconds': round(sum(item['duration'] for item in report), 2)}, ensure_ascii=False))
