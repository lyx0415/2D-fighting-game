# Offline nonverbal voice sources. Requires Windows desktop SAPI voices.
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
$audioSourceDir = Join-Path $taskRoot 'public/audio/v010/source'
New-Item -ItemType Directory -Force -Path $audioSourceDir | Out-Null
$speaker = New-Object -ComObject SAPI.SpVoice
$voices = @($speaker.GetVoices())
$specs = @(
    @{ id = 'warriorExert'; text = 'Hah!'; voice = 'Zira'; rate = 3 },
    @{ id = 'archerExert'; text = '嘿'; voice = 'Huihui'; rate = 4 },
    @{ id = 'mageExert'; text = '咻'; voice = 'Huihui'; rate = 2 },
    @{ id = 'tankExert'; text = 'Hup!'; voice = 'Zira'; rate = 2 },
    @{ id = 'assassinExert'; text = '哈'; voice = 'Huihui'; rate = 5 }
)
$voiceReport = @()
foreach ($spec in $specs) {
    $selectedVoice = $voices | Where-Object { $_.GetDescription() -like ('*' + $spec.voice + '*') } | Select-Object -First 1
    if (-not $selectedVoice) { throw ('Missing local SAPI voice: ' + $spec.voice) }
    $speaker.Voice = $selectedVoice
    $speaker.Rate = $spec.rate
    $speaker.Volume = 100
    $stream = New-Object -ComObject SAPI.SpFileStream
    $stream.Format.Type = 22 # SAFT22kHz16BitMono
    $outputPath = Join-Path $audioSourceDir ($spec.id + '-sapi.wav')
    $stream.Open($outputPath, 3, $false)
    try {
        $speaker.AudioOutputStream = $stream
        $null = $speaker.Speak($spec.text, 0)
    } finally { $stream.Close() }
    $voiceReport += @{ id = $spec.id; text = $spec.text; voice = $selectedVoice.GetDescription(); rate = $spec.rate; source = 'Windows SAPI offline synthesis; not a human recording' }
}
$voiceReport | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $audioSourceDir 'sapi-sources.json') -Encoding utf8
Write-Output ('Rendered ' + $voiceReport.Count + ' local synthesized exertion sources.')
