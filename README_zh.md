# noQt QML Formatter

[English](README.md) | 中文

一个用于格式化 `.qml` 文件的 VS Code 扩展。纯 JavaScript 实现——无需安装 Qt。

## 功能特性

- **基于花括号的缩进** — `{` 增加缩进，`}` 减少缩进，正确处理 `} else {` 情况。
- **顶层指令保持在第 0 列** — `import`、`.pragma`、`.import`、`pragma`。
- **注释感知** — 正确识别单行注释（`//`）和块注释（`/* */`），注释内的花括号不参与缩进计算。
- **字符串感知** — 单引号或双引号字符串内的花括号不参与缩进计算。
- **空行合并** — 连续空行将被压缩到可配置的最大数量（默认：1）。
- **可配置缩进大小** — 默认 4 个空格。

## 安装方法

1. 下载 `noQt-qml-formatter-0.1.0.vsix`
2. 打开 VS Code 或 Cursor
3. 点击左侧**扩展**图标（或按 `Ctrl+Shift+X`）
4. 点击右上角 **...** 菜单 → **从 VSIX 安装...**
5. 选择 `noQt-qml-formatter-0.1.0.vsix`
6. 安装完成后重启编辑器

或通过命令行安装：

```sh
# VS Code
code --install-extension noQt-qml-formatter-0.1.0.vsix

# Cursor
cursor --install-extension noQt-qml-formatter-0.1.0.vsix
```

## 使用方法

### 手动格式化

打开一个 `.qml` 文件，按 **Shift+Alt+F**（格式化文档），或打开命令面板（`Ctrl+Shift+P`）并运行：

```
QML Formatter: Format Document
```

### 保存时自动格式化

将以下配置添加到 VS Code 设置文件（`settings.json`）：

```json
"[qml]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "qml-formatter.noQt-qml-formatter"
}
```

## 配置项

| 设置项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `qmlFormatter.indentSize` | number | `4` | 每级缩进的空格数（1–8） |
| `qmlFormatter.maxBlankLines` | number | `1` | 最多允许的连续空行数（0–5） |

`settings.json` 示例：

```json
{
    "qmlFormatter.indentSize": 4,
    "qmlFormatter.maxBlankLines": 1
}
```

## 格式化示例

### 输入（杂乱）

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

### 输出（格式化后）

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

## 已知限制

- 不支持多行字符串字面量（QML 本身也不支持模板字符串，故不作特殊处理）。
- 不跟踪括号级别的缩进（多行函数调用等）。
- 格式化器不解析 QML 语义——仅依赖花括号结构进行缩进。
