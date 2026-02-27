# QML Formatter

English | [中文](README_zh.md)

A VS Code extension that formats `.qml` files. Pure JavaScript implementation — no Qt installation required.

## Features

- **Brace-based indentation** — `{` increases indent, `}` decreases. Handles `} else {` correctly.
- **Top-level directives preserved at column 0** — `import`, `.pragma`, `.import`, `pragma`.
- **Comment-aware** — single-line (`//`) and block (`/* */`) comments are respected; brace characters inside comments are ignored.
- **String-aware** — brace characters inside single/double-quoted strings are ignored.
- **Blank line collapsing** — consecutive blank lines are reduced to a configurable maximum (default: 1).
- **Configurable indent size** — default 4 spaces.

## Installation

1. Download `qml-formatter-0.1.0.vsix`
2. Open VS Code or Cursor
3. Click the **Extensions** icon (or press `Ctrl+Shift+X`)
4. Click the **...** menu in the top-right → **Install from VSIX...**
5. Select `qml-formatter-0.1.0.vsix`
6. Restart the editor

Or via command line:

```sh
# VS Code
code --install-extension qml-formatter-0.1.0.vsix

# Cursor
cursor --install-extension qml-formatter-0.1.0.vsix
```

## Usage

### Format on demand

Open a `.qml` file and press **Shift+Alt+F** (Format Document), or open the Command Palette (`Ctrl+Shift+P`) and run:

```
QML Formatter: Format Document
```

### Format on save

Add this to your VS Code settings (`settings.json`):

```json
"[qml]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "qml-formatter.qml-formatter"
}
```

## Configuration

| Setting | Type | Default | Description |
|---|---|---|---|
| `qmlFormatter.indentSize` | number | `4` | Spaces per indentation level (1–8) |
| `qmlFormatter.maxBlankLines` | number | `1` | Max consecutive blank lines (0–5) |

Example `settings.json`:

```json
{
    "qmlFormatter.indentSize": 4,
    "qmlFormatter.maxBlankLines": 1
}
```

## Formatting Examples

### Input (messy)

```qml
import QtQuick 2.15
import QtQuick.Controls 2.15
.pragma library

// Main item
Item {
id: root
    width: 200; height: 200


property int count: 0
    Rectangle {
anchors.fill: parent
color: count > 0 ? "green" : "red"

        MouseArea {
anchors.fill: parent
onClicked: {
root.count++
}
}
}

    function reset() {
count = 0
}
}
```

### Output (formatted)

```qml
import QtQuick 2.15
import QtQuick.Controls 2.15
.pragma library

// Main item
Item {
    id: root
    width: 200; height: 200

    property int count: 0
    Rectangle {
        anchors.fill: parent
        color: count > 0 ? "green" : "red"

        MouseArea {
            anchors.fill: parent
            onClicked: {
                root.count++
            }
        }
    }

    function reset() {
        count = 0
    }
}
```

## Limitations

- Multi-line string literals (template strings) are not supported in QML so are not handled specially.
- Parenthesis-based indentation (multi-line function calls) is not tracked.
- The formatter does not parse QML semantics — it relies on brace structure only.
