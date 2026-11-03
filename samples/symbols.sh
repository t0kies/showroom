#!/bin/sh
# ASCII/unicode glyphs for the four device classes the watcher cares about.
# Each glyph is exactly 3 lines tall and 11 columns wide so they can be
# centered side-by-side or swapped in place without layout shift.

# DIR — a folder
sym_dir() {
cat <<'EOF'
 ┌───────┐
 │░░░░░░░│
 └───────┘
EOF
}

# SD — memory card with contact pads
sym_sd() {
cat <<'EOF'
 ╭─────╮──
 │▣ ▣│──
 ╰─────╯──
EOF
}

# USB — stick + connector
sym_usb() {
cat <<'EOF'
 ╔═══╗ ┌─┐
 ║ █ ╠═╡ │
 ╚═══╝ └─┘
EOF
}

# iOS — phone with home button
sym_ios() {
cat <<'EOF'
 ┌───────┐
 │ ▢ ◯ │
 └───────┘
EOF
}

# sym_for <type>  — prints the glyph for "dir"|"sd"|"usb"|"ios"
sym_for() {
    case "$1" in
        dir) sym_dir ;;
        sd)  sym_sd  ;;
        usb) sym_usb ;;
        ios) sym_ios ;;
        *)   sym_dir ;;
    esac
}
