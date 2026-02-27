'use strict';

const vscode = require('vscode');
const QmlFormatter = require('./qml-formatter');

/**
 * Read formatter settings from VS Code workspace configuration.
 * Falls back to editor defaults when the specific settings aren't set.
 *
 * @param {vscode.FormattingOptions} editorOptions - Options provided by VS Code
 * @returns {{ indentSize: number, maxBlankLines: number }}
 */
function getConfig(editorOptions) {
    const cfg = vscode.workspace.getConfiguration('qmlFormatter');
    return {
        indentSize:    cfg.get('indentSize',    editorOptions ? editorOptions.tabSize : 4),
        maxBlankLines: cfg.get('maxBlankLines', 1),
    };
}

/**
 * Called by VS Code when the extension is first activated (on opening a .qml file).
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    // ── Document Formatter ───────────────────────────────────────────────────
    // Registered for the 'qml' language.
    // Triggered by "Format Document" (Shift+Alt+F) or editor.formatOnSave.
    const formatterProvider = vscode.languages.registerDocumentFormattingEditProvider(
        { language: 'qml' },
        {
            provideDocumentFormattingEdits(document, options) {
                const { indentSize, maxBlankLines } = getConfig(options);
                const formatter = new QmlFormatter({ indentSize, maxBlankLines });

                const original = document.getText();
                let formatted;

                try {
                    formatted = formatter.format(original);
                } catch (err) {
                    vscode.window.showErrorMessage(`QML Formatter error: ${err.message}`);
                    return [];
                }

                // Return empty array when there's nothing to change
                if (formatted === original) return [];

                const fullRange = new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(original.length)
                );

                return [vscode.TextEdit.replace(fullRange, formatted)];
            }
        }
    );

    // ── Format Command ───────────────────────────────────────────────────────
    // Exposes "QML Formatter: Format Document" in the Command Palette.
    // Delegates to the standard formatDocument command so the registered
    // provider above does the actual work.
    const formatCommand = vscode.commands.registerCommand(
        'noQt-qml-formatter.formatDocument',
        () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage('No active editor.');
                return;
            }
            if (editor.document.languageId !== 'qml') {
                vscode.window.showInformationMessage('Active file is not a QML file.');
                return;
            }
            vscode.commands.executeCommand('editor.action.formatDocument');
        }
    );

    context.subscriptions.push(formatterProvider, formatCommand);
}

function deactivate() {}

module.exports = { activate, deactivate };
