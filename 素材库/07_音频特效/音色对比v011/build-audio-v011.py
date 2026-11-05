"""Offline original DSP: three selectable skill/impact/voice sound palettes.

No SAPI, network, sampled performers, third-party media, or v010 rewrites.
Requires Python, NumPy and SciPy. All paths are relative to the project root.
"""
from pathlib import Path
import hashlib
import json
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, iirpeak, lfilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public/audio/v011'
RATE = 22050
SEED = 110131
PROFILES = {
    'grounded': {'body': 1.0, 'grit': .16, 'air': .65, 'wet': .12, 'pitch': 1.0, 'length': 1.0},
    'feral': {'body': 1.2, 'grit': .43, 'air': .8, 'wet': .18, 'pitch': .91, 'length': 1.12},
    'mystic': {'body': .76, 'grit': .08, 'air': 1.0, 'wet': .34, 'pitch': 1.09, 'length': 1.06},
}
SKILLS = ['sweep', 'ward', 'volley', 'arrowRain', 'frost', 'meteorCast', 'shieldBash', 'oath', 'shadow', 'execute']
HITS = ['metalHit', 'fleshHit', 'arrowHit', 'frostHit', 'fireHit', 'bladeHit', 'magicHit']
VOICES = ['warriorExert', 'archerExert', 'mageExert', 'tankExert', 'assassinExert']
LOOPS = ['wardSustain', 'oathSustain']
IDS = SKILLS + HITS + VOICES + LOOPS
N = lambda seconds: round(seconds * RATE)


def mix(*layers):
    result = np.zeros(max(map(len, layers)))
    for layer in layers:
        result[:len(layer)] += layer
    return result


def delay(a, seconds):
    return np.pad(a, (N(seconds), 0))


def echo(a, amount, times=(.11, .27, .46)):
    return mix(a, *[delay(a * amount ** (i + 1), seconds) for i, seconds in enumerate(times)])


def unit(a):
    return a / max(.000001, np.max(np.abs(a)))


class Synth:
    def __init__(self, profile, cue):
        seed = SEED + int(hashlib.sha256((profile + '/' + cue).encode()).hexdigest()[:8], 16)
        self.rng = np.random.default_rng(seed)
        self.p = PROFILES[profile]
        self.profile = profile

    def noise(self, seconds, low, high, decay=5):
        n = N(seconds)
        filtered = sosfilt(butter(2, [low, high], fs=RATE, btype='bandpass', output='sos'), self.rng.normal(size=n))
        return filtered * np.exp(-np.arange(n) / RATE * decay)

    def tone(self, seconds, start, end=None, decay=5):
        n = N(seconds)
        freq = np.linspace(start, start if end is None else end, n)
        return np.sin(np.cumsum(freq) * 2 * np.pi / RATE) * np.exp(-np.arange(n) / RATE * decay)

    def air(self, seconds, low=300, high=5000):
        result = self.noise(seconds, low, high, 0)
        return result * np.sin(np.linspace(0, np.pi, len(result))) ** 1.4

    def pluck(self, seconds, frequency):
        n = N(seconds)
        stride = round(RATE / frequency)
        result = np.zeros(n)
        result[:stride] = self.rng.uniform(-1, 1, stride)
        for i in range(stride, n):
            result[i] = .489 * (result[i - stride] + result[i - stride + 1])
        return result

    def chips(self, seconds, low=2300, high=9300, count=32):
        result = np.zeros(N(seconds))
        for pos in self.rng.integers(0, len(result) - N(.04), count):
            chip = self.noise(.035, low, high, 90) * self.rng.uniform(.15, .6)
            result[pos:pos + len(chip)] += chip
        return result

    def palette(self, a):
        # Separate body/texture instead of pitch-shifting all effects together.
        low = sosfilt(butter(2, 520, fs=RATE, output='sos'), a)
        high = a - low
        result = self.p['body'] * low + self.p['air'] * high
        result += self.p['grit'] * np.tanh(unit(result) * 2.7) * np.max(np.abs(result)) * .36
        return echo(result, self.p['wet'])

    def effect(self, cue):
        t = self.tone
        n = self.noise
        a = self.air
        if cue == 'sweep':
            sound = mix(a(.55, 160, 4100), delay(.52 * n(.48, 550, 3600, 9), .18), delay(.38 * t(.62, 110, 42, 6), .24))
        elif cue == 'ward':
            sound = mix(.8 * t(.8, 94, 62, 4), n(.42, 130, 1600, 9), delay(.3 * t(1.2, 147, 145, 2.7), .13), .22 * a(.9, 400, 1500))
        elif cue == 'volley':
            sound = mix(*[delay(mix(.7 * self.pluck(.32, 175 + 17 * i), .6 * a(.24, 1400, 7200)), .16 * i) for i in range(3)])
        elif cue == 'arrowRain':
            sound = mix(*[delay(mix(.65 * a(.44, 2400, 8500), delay(.6 * self.pluck(.25, 132 + 11 * i), .24), delay(.25 * n(.2, 240, 1400, 20), .26)), .21 * i) for i in range(3)])
        elif cue == 'frost':
            sound = mix(.7 * n(.68, 2800, 8600, 3)[::-1], delay(self.chips(.9), .34), .23 * a(1.05, 1400, 3900))
        elif cue == 'meteorCast':
            # Charge/falling air only. fireHit belongs to the later damage event.
            sound = mix(.7 * n(.68, 110, 1500, 2.7)[::-1], delay(.5 * a(.46, 700, 5200), .33), delay(.16 * n(.6, 750, 3300, 5), .6))
        elif cue == 'shieldBash':
            sound = mix(t(.7, 87, 36, 5), .85 * n(.3, 150, 1900, 11), .34 * a(.22, 200, 2500), delay(.22 * n(.5, 100, 700, 8), .05))
        elif cue == 'oath':
            sound = mix(.9 * t(1.5, 74, 71, 2.2), .3 * t(1.5, 111, 109, 2.6), .55 * n(1.2, 100, 1000, 3), .23 * a(.72, 350, 1500))
        elif cue == 'shadow':
            sound = mix(.8 * a(.38, 440, 4300)[::-1], delay(.55 * n(.65, 100, 1400, 6), .18), delay(.27 * t(.55, 92, 36, 6), .17))
        elif cue == 'execute':
            sound = mix(a(.18, 2300, 8500), delay(.85 * a(.19, 1500, 7200), .095), delay(.55 * n(.43, 190, 1650, 8), .16))
        elif cue == 'metalHit':
            sound = mix(.85 * n(.23, 250, 3100, 18), .5 * t(.35, 125, 55, 13), .08 * t(.15, 690, 610, 25))
        elif cue == 'fleshHit':
            sound = mix(.75 * n(.18, 120, 1400, 22), .8 * t(.28, 95, 41, 15))
        elif cue == 'arrowHit':
            sound = mix(.7 * self.pluck(.29, 119), .6 * n(.2, 280, 1800, 20), .3 * t(.26, 98, 42, 15))
        elif cue == 'frostHit':
            sound = mix(self.chips(.5, count=24), .25 * n(.32, 1700, 6400, 10))
        elif cue == 'fireHit':
            sound = mix(.8 * t(1.1, 78, 30, 4.2), n(1.35, 95, 3000, 3.2), .35 * self.chips(1.2, 700, 4800, 25))
        elif cue == 'bladeHit':
            sound = mix(.8 * n(.23, 650, 4500, 19), .55 * t(.3, 115, 48, 14), .24 * n(.28, 170, 1600, 17))
        elif cue == 'magicHit':
            sound = mix(.75 * n(.68, 340, 3500, 6), .32 * t(.67, 280, 112, 6), .2 * a(.5, 1200, 4100))
        else:
            raise ValueError(cue)
        return self.palette(sound)

    def voice(self, cue):
        # Breath onset -> rough voiced effort -> breath release, without spoken syllables.
        # Each hero has independent pitch, vowel resonance, effort contour and timing.
        hero = {
            'warriorExert': (104, .38, (700, 1250, 2600), .15),
            'archerExert': (184, .29, (490, 1900, 2900), .07),
            'mageExert': (128, .42, (430, 1050, 2400), .08),
            'tankExert': (77, .46, (570, 1050, 2300), .22),
            'assassinExert': (163, .25, (670, 1600, 2850), .1),
        }[cue]
        frequency, seconds, formants, roughness = hero
        seconds *= self.p['length']
        count = N(seconds)
        time = np.arange(count) / RATE
        progress = time / seconds
        # Irregular smooth glottal period and amplitude avoid a constant robotic tone.
        knots = np.linspace(0, seconds, max(7, round(seconds * 65)))
        jitter = np.interp(time, knots, self.rng.normal(0, .018 + self.p['grit'] * .03, len(knots)))
        shimmer = np.interp(time, knots, self.rng.normal(0, .06, len(knots)))
        contour = .84 + .3 * np.sin(np.pi * np.clip(progress * 1.35, 0, 1)) - .12 * progress
        fundamental = frequency * self.p['pitch'] * contour * (1 + jitter)
        phase = np.cumsum(fundamental) * 2 * np.pi / RATE
        glottal = np.zeros(count)
        for harmonic in range(1, 37):
            # Soft glottal closure gives breathy harmonic rolloff, not a square buzzer.
            glottal += np.sin(harmonic * phase + .08 * harmonic) / harmonic ** 1.6 * np.exp(-harmonic / 18)
        creak = np.sin(phase * .5) * np.sin(phase) * (roughness + self.p['grit'] * .5)
        glottal = np.tanh((glottal + creak) * 1.3) * (1 + shimmer)
        voiced = np.zeros(count)
        for center, weight, q in zip(formants, (1, .58, .19), (3.8, 5.5, 8)):
            b, c = iirpeak(center * (1.03 if self.profile == 'mystic' else 1), q, fs=RATE)
            voiced += weight * lfilter(b, c, glottal)
        voiced = unit(voiced)
        voice_envelope = np.clip((progress - .1) / .12, 0, 1) * np.clip((.93 - progress) / .34, 0, 1)
        voice_envelope *= (.7 + .3 * np.sin(np.pi * progress))
        breath = unit(self.noise(seconds, 320, 3700, 0))
        breath_envelope = .65 * np.exp(-((progress - .11) / .115) ** 2) + .3 * np.exp(-((progress - .78) / .18) ** 2)
        result = .8 * voiced * voice_envelope + .28 * breath * breath_envelope
        # Coarse feral voice has extra low glottal flutter, mystic has subdued airy trail.
        if self.profile == 'feral':
            result += .11 * np.sin(phase * .5) * voice_envelope * (1 + .3 * np.sin(2 * np.pi * 34 * time))
        elif self.profile == 'mystic':
            result = echo(result, .16, (.06, .13))
        return result

    def sustain(self, cue):
        # Exactly periodic FFT bands/oscillators: no fading or restart thump inside buff.
        count = N(2)
        freqs = np.fft.rfftfreq(count, 1 / RATE)
        amplitude = np.zeros(len(freqs))
        low, high = (48, 380) if cue == 'wardSustain' else (34, 280)
        band = (freqs >= low) & (freqs <= high)
        amplitude[band] = (1 - (freqs[band] - low) / (high - low)) ** 1.7
        air_band = (freqs >= 450) & (freqs <= 1450)
        amplitude[air_band] += (.035 if self.profile == 'mystic' else .018) * np.sin(np.linspace(0, np.pi, air_band.sum()))
        spectrum = amplitude * np.exp(1j * self.rng.uniform(0, 2 * np.pi, len(freqs)))
        spectrum[0] = 0
        spectrum[-1] = 0
        result = unit(np.fft.irfft(spectrum, n=count)) * .65
        time = np.arange(count) / RATE
        base = 73 if cue == 'wardSustain' else 54
        result += .17 * np.sin(2 * np.pi * base * time) + .07 * np.sin(2 * np.pi * (base * 1.5) * time)
        # 0.5Hz/1Hz modulation is periodic within the exact 2-second loop.
        result *= .88 + .1 * np.cos(2 * np.pi * (.5 if self.profile != 'feral' else 1) * time)
        result -= np.mean(result)
        # Choose a quiet wrap point with small adjacent-sample difference.
        cost = np.abs(result) + np.abs(np.roll(result, 1)) + 8 * np.abs(result - np.roll(result, 1))
        pivot = int(np.argmin(cost))
        return np.roll(result, -pivot)


def write(profile, cue, samples):
    loop = cue in LOOPS
    samples = np.nan_to_num(samples)
    samples -= np.mean(samples)
    if cue in VOICES:
        peak_target, rms_target = .22, .052
    elif loop:
        peak_target, rms_target = .19, .043
    else:
        peak_target, rms_target = .71, .14
    samples *= min(peak_target / max(1e-8, np.abs(samples).max()), rms_target / max(1e-8, np.sqrt(np.mean(samples * samples))))
    if not loop:
        fade = min(N(.012), len(samples) // 8)
        samples[:fade] *= np.linspace(0, 1, fade)
        samples[-fade:] *= np.linspace(1, 0, fade)
    directory = OUT / profile
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / (cue + '.wav')
    wavfile.write(path, RATE, np.round(samples * 32767).astype(np.int16))
    rate, pcm = wavfile.read(path)
    final = pcm.astype(np.float64) / 32768
    assert rate == RATE and pcm.ndim == 1 and pcm.dtype == np.int16
    source = 'Original deterministic breath + irregular glottal source/filter DSP; no SAPI, human recordings or external audio' if cue in VOICES else 'Original deterministic physical/ambient DSP; no external audio'
    entry = {
        'profile': profile, 'id': cue, 'file': path.relative_to(OUT).as_posix(),
        'seconds': len(final) / RATE, 'duration': len(final) / RATE,
        'peak': float(np.abs(final).max()), 'rms': float(np.sqrt(np.mean(final * final))),
        'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'source': source,
        'loop': loop, 'license': 'Original project-generated procedural audio; no downloaded media or recorded performers',
    }
    if loop:
        entry['seamStep'] = float(abs(final[-1] - final[0]))
        entry['dcMean'] = float(np.mean(final))
        entry['neighborStepP95'] = float(np.quantile(np.abs(np.diff(final)), .95))
        assert entry['seamStep'] < .004 and abs(entry['dcMean']) < .00002, entry
    return entry


def main():
    files = []
    for profile in PROFILES:
        for cue in IDS:
            synth = Synth(profile, cue)
            samples = synth.voice(cue) if cue in VOICES else synth.sustain(cue) if cue in LOOPS else synth.effect(cue)
            files.append(write(profile, cue, samples))
    manifest = {
        'date': '2026-10-31', 'version': 'v011', 'sampleRate': RATE, 'channels': 1,
        'format': 'PCM signed 16-bit WAV', 'seed': SEED,
        'profiles': {'grounded': '沉稳写实：干燥材料、厚实低音、少量空间尾', 'feral': '粗砺战吼：低沉声门粗糙度、胸腔感与颗粒', 'mystic': '秘仪回响：空气、共鸣与柔和长尾'},
        'licenseNotes': ['All 72 WAVs are original procedural DSP output; no SAPI or other TTS output, no human voice recordings, and no downloaded external audio.', 'Nonverbal exertions simulate breathing/glottal effort; they are synthesized sound design, not actor performances.', 'The other 28 v010 cues are inherited by runtime and are intentionally not copied here.'],
        'files': files,
    }
    (OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    assert len(files) == 72 and len({(v['profile'], v['id']) for v in files}) == 72
    assert all(0 < v['rms'] < v['peak'] < 1 for v in files)
    print(json.dumps({'runtimeWavs': len(files), 'profiles': list(PROFILES), 'cuesPerProfile': len(IDS), 'loopWavs': sum(v['loop'] for v in files), 'source': 'Original DSP; no SAPI or human recordings'}, ensure_ascii=False))


if __name__ == '__main__':
    main()
