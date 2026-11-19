"""Render original looping chapter music and two enemy warning/impact pairs."""
from array import array
from hashlib import sha256
import json
from math import exp, pi, sin, tanh
from pathlib import Path
from random import Random
from sys import byteorder
import wave


RATE = 16000
BEAT = 0.75
LOOP = 32 * BEAT
OUTPUT = Path(__file__).resolve().parents[1] / "public/audio/v014"
FILES = []


def write(name, track, description, loop=False):
    file = OUTPUT / f"{name}.wav"
    peak = max(abs(sample) for sample in track)
    samples = array("h", (round(tanh(sample * 1.25) * 32767) for sample in track))
    if byteorder == "big":
        samples.byteswap()
    with wave.open(str(file), "wb") as wav:
        wav.setparams((1, 2, RATE, len(samples), "NONE", "not compressed"))
        wav.writeframes(samples.tobytes())
    FILES.append({"file": file.name, "duration": len(track) / RATE, "loop": loop,
                  "peak": round(tanh(peak * 1.25), 4), "description": description,
                  "sha256": sha256(file.read_bytes()).hexdigest()})


def add(track, start, duration, pitch, gain, timbre):
    frequency = 440 * 2 ** ((pitch - 69) / 12)
    for index in range(round(duration * RATE)):
        t = index / RATE
        phase = 2 * pi * frequency * t
        tail = min(1, (duration - t) / .14)
        if timbre == "bow":
            envelope = min(1, t / .45) * min(1, (duration - t) / .65)
            value = (sin(phase + .34 * sin(2 * pi * 4.1 * t)) + .23 * sin(phase * 2.004)
                     + .08 * sin(phase * 3.01)) * envelope
        elif timbre == "pluck":
            value = (sin(phase) + .31 * sin(phase * 2.01) + .12 * sin(phase * 3.98))
            value *= min(1, t / .018) * exp(-3.5 * t) * tail
        else:
            value = sin(phase + 4 * (1 - exp(-8 * t))) * exp(-9 * t) * min(1, t / .014) * tail
        track[(round(start * RATE) + index) % len(track)] += value * gain


def score():
    bed, drums = ([0.0] * round(RATE * LOOP) for _ in range(2))
    chords = [(38, 45, 53), (34, 41, 50), (43, 50, 58), (33, 40, 52)]
    melody = [(1, 69), (3, 65), (5.5, 64), (7, 62), (9, 65), (11, 70),
              (13.5, 69), (15, 65), (17, 67), (19, 62), (21.5, 65),
              (23, 62), (25, 64), (27, 61), (29, 57), (31, 64)]
    for bar, chord in enumerate(chords):
        for voice, note in enumerate(chord):
            add(bed, (bar * 8 - .33) * BEAT, 8.7 * BEAT, note, [.16, .11, .075][voice], "bow")
        for beat in [0, 3, 4, 6.5]:
            add(drums, (bar * 8 + beat) * BEAT, .65, chord[0] - 9, .43 if beat == 0 else .25, "drum")
        for beat in [0, 1.5, 3, 4, 5.5, 7]:
            add(drums, (bar * 8 + beat) * BEAT, .63, chord[1] + 12, .12, "pluck")
    for beat, note in melody:
        add(bed, beat * BEAT, 1.18, note, .24, "pluck")
        add(bed, beat * BEAT + .28, .9, note, .05, "pluck")
    write("oath-road", bed, "八十拍低弦与拨弦主题《余火行路》", True)
    write("oath-pressure", drums, "与主题同拍的低鼓和断奏战斗层", True)


def boss_cue(name, base, duration, warning, metal):
    random = Random(name)
    track = []
    low = 0
    for index in range(round(duration * RATE)):
        t = index / RATE
        low = .92 * low + .08 * random.uniform(-1, 1)
        ring = sin(2 * pi * (base * t + (38 if warning else -12) * t * t))
        air = .32 * low + .13 * sin(2 * pi * (base * (3.91 if metal else 1.51)) * t)
        envelope = min(1, t / (.13 if warning else .012)) * min(1, (duration - t) / .12)
        decay = (0.35 + .65 * sin(pi * t / duration) ** 2) if warning else exp(-5.2 * t)
        track.append((.31 * ring + air) * envelope * decay)
    write(name, track, "原创首领预警" if warning else "原创首领落地声")


if __name__ == "__main__":
    OUTPUT.mkdir(parents=True, exist_ok=True)
    score()
    boss_cue("warden-warning", 94, .78, True, True)
    boss_cue("warden-impact", 62, .53, False, True)
    boss_cue("bishop-warning", 151, .9, True, False)
    boss_cue("bishop-impact", 87, .62, False, False)
    (OUTPUT / "manifest.json").write_text(
        json.dumps({"source": "scripts/build-audio-v014.py", "files": FILES},
                   ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
