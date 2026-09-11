# perfwatch

Extremely light GTK4 performance dashboard for CachyOS / i7-12700H / Iris Xe.

Single Python file. No daemon. ~15MB resident. Reads `/proc`, `/sys`, and
`journalctl` — aggregates what actually kills performance on this machine.

## Metrics

| Section        | Source                  | What it shows                        |
|----------------|-------------------------|--------------------------------------|
| Memory/Pressure | `/proc/meminfo`, `/proc/pressure/memory` | RAM%, swap%, PSI some/full avg10 + bars |
| CPU/Thermal    | `/proc/loadavg`, cpufreq, thermal_zone | Load, freq, CPU/pkg/dGPU temp, iGPU freq |
| Audio Xruns    | `journalctl -t audiowatch`  | Recent xrun/crackle events            |
| OOM Kills      | `journalctl -u earlyoom`    | Recent OOM kill log                   |
| Top Processes   | `ps -eo %mem,%cpu`         | Top 6 by memory                       |

Color coding: green = ok, yellow = warn, red = critical.

## Usage

```fish
perfwatch                 # default 2s refresh
perfwatch --interval 5    # 5s refresh
perfwatch --debug         # also print samples to stderr
```

## Install

```fish
# Icon
cp icons/perfwatch.svg ~/.local/share/icons/hicolor/scalable/apps/perfwatch.svg
gtk-update-icon-cache ~/.local/share/icons/hicolor

# Desktop entry
cp perfwatch.desktop ~/.local/share/applications/
update-desktop-database ~/.local/share/applications
```

Then launch from app menu or terminal.

## Dependencies

- `python-gobject` (PyGObject)
- `gtk4`
- `libadwaita` (Adw)
