'use strict';

/**
 * QML Formatter - Pure JavaScript implementation, no Qt dependency.
 *
 * Formatting rules:
 *  - Indent with configurable spaces (default 4)
 *  - Top-level directives (import, .pragma, .import, pragma) stay at column 0
 *  - Comments preserve their relative position (indented with surrounding code)
 *  - Block comments (/* ... *\/) are indented to current level
 *  - Consecutive blank lines are collapsed to maxBlankLines (default 1)
 *  - Trailing blank lines are removed
 *  - Brace-based indentation: { increases, } decreases
 *  - Handles } else { and similar constructs correctly
 */
class QmlFormatter {
    constructor(options = {}) {
        this.indentSize = (options.indentSize >= 1) ? Math.floor(options.indentSize) : 4;
        this.maxBlankLines = (options.maxBlankLines >= 0) ? Math.floor(options.maxBlankLines) : 1;
    }

    /**
     * Format a QML source string.
     * @param {string} text - Raw QML source
     * @returns {string} Formatted QML source (always ends with a single newline)
     */
    format(text) {
        // Normalize line endings to LF
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        const lines = text.split('\n');
        const result = [];
        const tab = ' '.repeat(this.indentSize);

        let indentLevel = 0;
        let inBlockComment = false;
        let blankCount = 0;

        for (const raw of lines) {
            const line = raw.trim();

            // ── Blank line handling ──────────────────────────────────────────
            if (line === '') {
                blankCount++;
                if (blankCount <= this.maxBlankLines) {
                    result.push('');
                }
                continue;
            }
            blankCount = 0;

            // ── Inside a block comment ───────────────────────────────────────
            if (inBlockComment) {
                result.push(tab.repeat(indentLevel) + line);
                if (line.includes('*/')) {
                    inBlockComment = false;
                }
                continue;
            }

            // ── Block comment start (does not close on same line) ────────────
            if (line.startsWith('/*') && !line.includes('*/')) {
                inBlockComment = true;
                result.push(tab.repeat(indentLevel) + line);
                continue;
            }

            // ── Top-level directives stay at column 0 ───────────────────────
            // Covers: import QtQuick 2.0 / .pragma library / pragma Singleton
            if (this.isTopLevelDirective(line)) {
                result.push(line);
                continue;
            }

            // ── Calculate write indent ───────────────────────────────────────
            // Leading } or ] characters pull the write position left by the
            // number of leading closes, without permanently changing indentLevel
            // before we know the full open/close balance of this line.
            //
            // Formula:
            //   writeIndent = indentLevel - leadingCloses
            //   indentLevel = indentLevel + totalOpens - totalCloses   (for next line)
            //
            // This correctly handles:
            //   }          → write at level-1, next level = level-1
            //   } else {   → write at level-1, next level = level (unchanged)
            //   }}         → write at level-2, next level = level-2
            const leadingCloses = this.countLeadingCloses(line);
            const totalOpens  = this.countUnquoted(line, '{') + this.countUnquoted(line, '[');
            const totalCloses = this.countUnquoted(line, '}') + this.countUnquoted(line, ']');

            const writeIndent = Math.max(0, indentLevel - leadingCloses);
            result.push(tab.repeat(writeIndent) + line);

            indentLevel = Math.max(0, indentLevel + totalOpens - totalCloses);
        }

        // Remove trailing blank lines
        while (result.length > 0 && result[result.length - 1] === '') {
            result.pop();
        }

        return result.join('\n') + '\n';
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Return true if the (already trimmed) line is a top-level QML directive
     * that should always stay at column 0.
     */
    isTopLevelDirective(line) {
        return (
            /^import\s/.test(line)   ||   // import QtQuick 2.0
            /^\.pragma\b/.test(line) ||   // .pragma library
            /^\.import\b/.test(line) ||   // .import "file.js" as Util
            /^pragma\b/.test(line)        // pragma Singleton  (Qt 5 style)
        );
    }

    /**
     * Count how many leading close-brace/bracket characters appear at the
     * very start of a trimmed line (stops at the first non-close char).
     *
     * Examples:
     *   "}"       → 1
     *   "} else {" → 1
     *   "}}"      → 2
     *   "x: 1 }"  → 0
     */
    countLeadingCloses(line) {
        let count = 0;
        for (const c of line) {
            if (c === '}' || c === ']') count++;
            else break;
        }
        return count;
    }

    /**
     * Count occurrences of `char` in `str` that are NOT inside:
     *   - single-quoted strings  'abc'
     *   - double-quoted strings  "abc"
     *   - single-line comments   // ...
     *   - inline block comments  /* ... *\/
     *
     * @param {string} str
     * @param {string} char - Single character to count
     * @returns {number}
     */
    countUnquoted(str, char) {
        let count = 0;
        let inDouble = false;
        let inSingle = false;

        for (let i = 0; i < str.length; i++) {
            const c = str[i];

            // Escape sequences inside strings
            if ((inDouble || inSingle) && c === '\\') {
                i++; // skip next char
                continue;
            }

            if (c === '"' && !inSingle) { inDouble = !inDouble; continue; }
            if (c === "'" && !inDouble) { inSingle = !inSingle; continue; }

            // Inside a string — skip
            if (inDouble || inSingle) continue;

            // Single-line comment: stop counting
            if (c === '/' && str[i + 1] === '/') break;

            // Inline block comment: skip to */
            if (c === '/' && str[i + 1] === '*') {
                const end = str.indexOf('*/', i + 2);
                if (end !== -1) {
                    i = end + 1;
                    continue;
                }
                break; // unclosed inline comment → stop
            }

            if (c === char) count++;
        }

        return count;
    }
}

module.exports = QmlFormatter;
