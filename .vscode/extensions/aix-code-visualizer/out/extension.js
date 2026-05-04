"use strict";
/**
 * 🎨 AIX Code Visualizer - VS Code Extension
 *
 * Visual color coding for AIX components:
 * - 🧬 Meta Engine (green) - recursive functions, meta()
 * - 🐾 Pet Skills (pink) - Chrono, Volt, Shade, Bull, Drop
 * - 🔗 Trust Chain (gold) - signature verification, DNA
 * - 🌐 Gateway (cyan) - routing, constraints
 * - 🔥 Multi-Function (red) - lines with 2+ operations
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
// ═══════════════════════════════════════════════════════════════════════════════
// PATTERN DETECTION
// ═══════════════════════════════════════════════════════════════════════════════
const META_PATTERNS = [
    /\bmeta\s*\(/, // meta() function
    /\bPhase\b/, // Phase type
    /\bReAct\b/i, // ReAct loop
    /observe.*decide.*act.*reflect/i, // Full loop
    /\bucb1Select\b/, // UCB1 selection
    /\bentropy/i, // Entropy control
    /\brecursive/i, // Recursive patterns
    /PHASE_CHAIN/, // Phase chain
];
const PET_PATTERNS = [
    /\b(Chrono|Volt|Shade|Bull|Drop)Skill\b/, // Pet skills
    /PET_WATCH_RING/, // Watch ring
    /setupPetObservation/, // Setup function
    /pet\.(learn|observe|act)/, // Pet methods
    /getMoodSpeed/, // Mood control
    /\bmood.*τ/, // Mood threshold
];
const TRUST_PATTERNS = [
    /\bDNA\b/, // DNA verification
    /\bsignature/i, // Signatures
    /\bverify/i, // Verification
    /\btrust.*chain/i, // Trust chain
    /\bon-chain/i, // On-chain
    /\bmutation.*signed/i, // Signed mutations
];
const GATEWAY_PATTERNS = [
    /\bgateway\b/i, // Gateway
    /\brouter\b/i, // Router
    /\bconstrained/i, // Constrained routing
    /\bτ\s*[>=<]/, // Quality threshold
    /\bmaxLatency\b/, // Latency constraints
    /\bmaxCost\b/, // Cost constraints
];
const MULTI_FUNCTION_PATTERNS = [
    /\?\./g, // Optional chaining
    /\?\?/g, // Nullish coalescing
    /&&/g, // Short-circuit AND
    /\|\|/g, // Short-circuit OR
    /\.map\(/g, // Map
    /\.filter\(/g, // Filter
    /\.reduce\(/g, // Reduce
    /\(.*\) =>/g, // Arrow function
    /\[.*\]/g, // Destructuring
    /\.\.\./g, // Spread operator
];
// ═══════════════════════════════════════════════════════════════════════════════
// DECORATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════
let metaDecorationType;
let petDecorationType;
let trustDecorationType;
let gatewayDecorationType;
let multiFunctionDecorationType;
let statusBarItem;
let isEnabled = true;
// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVATION
// ═══════════════════════════════════════════════════════════════════════════════
function activate(context) {
    console.log('🎨 AIX Code Visualizer activated');
    // Create decoration types
    updateDecorationTypes();
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'aix-code-visualizer.analyzeFile';
    context.subscriptions.push(statusBarItem);
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('aix-code-visualizer.toggle', () => {
        isEnabled = !isEnabled;
        if (isEnabled) {
            vscode.window.showInformationMessage('✅ AIX Code Highlighting Enabled');
            updateDecorations();
        }
        else {
            vscode.window.showInformationMessage('❌ AIX Code Highlighting Disabled');
            clearDecorations();
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('aix-code-visualizer.analyzeFile', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const metrics = analyzeDensity(editor.document);
            showDensityReport(metrics);
        }
    }));
    // Listen to configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('aixCodeVisualizer')) {
            updateDecorationTypes();
            updateDecorations();
        }
    }));
    // Listen to document changes
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && isEnabled) {
            updateDecorations();
        }
    }));
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document && isEnabled) {
            updateDecorations();
        }
    }));
    // Initial decoration
    if (vscode.window.activeTextEditor) {
        updateDecorations();
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// DECORATION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════
function updateDecorationTypes() {
    const config = vscode.workspace.getConfiguration('aixCodeVisualizer');
    // Dispose old decorations
    metaDecorationType?.dispose();
    petDecorationType?.dispose();
    trustDecorationType?.dispose();
    gatewayDecorationType?.dispose();
    multiFunctionDecorationType?.dispose();
    // Create new decorations
    metaDecorationType = vscode.window.createTextEditorDecorationType({
        color: config.get('metaEngine.textColor', '#00ff88'),
        backgroundColor: config.get('metaEngine.backgroundColor', ''),
        fontWeight: 'bold',
    });
    petDecorationType = vscode.window.createTextEditorDecorationType({
        color: config.get('petSkill.textColor', '#ff719b'),
        backgroundColor: config.get('petSkill.backgroundColor', ''),
        fontWeight: 'bold',
    });
    trustDecorationType = vscode.window.createTextEditorDecorationType({
        color: config.get('trustChain.textColor', '#ffd700'),
        backgroundColor: config.get('trustChain.backgroundColor', ''),
        fontWeight: 'bold',
    });
    gatewayDecorationType = vscode.window.createTextEditorDecorationType({
        color: config.get('gateway.textColor', '#4ec9b0'),
        backgroundColor: config.get('gateway.backgroundColor', ''),
        fontWeight: 'bold',
    });
    multiFunctionDecorationType = vscode.window.createTextEditorDecorationType({
        color: config.get('multiFunction.textColor', '#ff6b6b'),
        textDecoration: `underline wavy ${config.get('multiFunction.underlineColor', '#ff6b6b')}`,
    });
}
function updateDecorations() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !isEnabled) {
        return;
    }
    const document = editor.document;
    const text = document.getText();
    // Detect patterns
    const metaRanges = [];
    const petRanges = [];
    const trustRanges = [];
    const gatewayRanges = [];
    const multiRanges = [];
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineRange = new vscode.Range(i, 0, i, line.length);
        // Check for meta patterns
        if (META_PATTERNS.some(pattern => pattern.test(line))) {
            metaRanges.push({
                range: lineRange,
                hoverMessage: '🧬 **Meta Engine** - Recursive meta-cognitive pattern',
            });
        }
        // Check for pet patterns
        if (PET_PATTERNS.some(pattern => pattern.test(line))) {
            petRanges.push({
                range: lineRange,
                hoverMessage: '🐾 **Pet Skill** - Autonomous mini-app behavior',
            });
        }
        // Check for trust patterns
        if (TRUST_PATTERNS.some(pattern => pattern.test(line))) {
            trustRanges.push({
                range: lineRange,
                hoverMessage: '🔗 **Trust Chain** - Cryptographic verification',
            });
        }
        // Check for gateway patterns
        if (GATEWAY_PATTERNS.some(pattern => pattern.test(line))) {
            gatewayRanges.push({
                range: lineRange,
                hoverMessage: '🌐 **Gateway** - Constrained routing logic',
            });
        }
        // Check for multi-function patterns
        let operationCount = 0;
        const operations = [];
        for (const pattern of MULTI_FUNCTION_PATTERNS) {
            const matches = line.match(pattern);
            if (matches) {
                operationCount += matches.length;
                operations.push(pattern.source);
            }
        }
        if (operationCount >= 2) {
            multiRanges.push({
                range: lineRange,
                hoverMessage: `🔥 **Multi-Function Line** - ${operationCount} operations in one line\n\nPatterns: ${operations.join(', ')}`,
            });
        }
    }
    // Apply decorations
    editor.setDecorations(metaDecorationType, metaRanges);
    editor.setDecorations(petDecorationType, petRanges);
    editor.setDecorations(trustDecorationType, trustRanges);
    editor.setDecorations(gatewayDecorationType, gatewayRanges);
    editor.setDecorations(multiFunctionDecorationType, multiRanges);
    // Update status bar
    const metrics = analyzeDensity(document);
    updateStatusBar(metrics);
}
function clearDecorations() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    editor.setDecorations(metaDecorationType, []);
    editor.setDecorations(petDecorationType, []);
    editor.setDecorations(trustDecorationType, []);
    editor.setDecorations(gatewayDecorationType, []);
    editor.setDecorations(multiFunctionDecorationType, []);
    statusBarItem.hide();
}
// ═══════════════════════════════════════════════════════════════════════════════
// DENSITY ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════
function analyzeDensity(document) {
    const text = document.getText();
    const lines = text.split('\n');
    let codeLines = 0;
    let multiFunctionLines = 0;
    let metaPatterns = 0;
    let petPatterns = 0;
    let trustPatterns = 0;
    for (const line of lines) {
        const trimmed = line.trim();
        // Skip empty lines and comments
        if (trimmed === '' || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
            continue;
        }
        codeLines++;
        // Count patterns
        if (META_PATTERNS.some(p => p.test(line)))
            metaPatterns++;
        if (PET_PATTERNS.some(p => p.test(line)))
            petPatterns++;
        if (TRUST_PATTERNS.some(p => p.test(line)))
            trustPatterns++;
        // Count multi-function lines
        let operationCount = 0;
        for (const pattern of MULTI_FUNCTION_PATTERNS) {
            const matches = line.match(pattern);
            if (matches)
                operationCount += matches.length;
        }
        if (operationCount >= 2)
            multiFunctionLines++;
    }
    const density = codeLines > 0 ? (metaPatterns + petPatterns + trustPatterns) / codeLines : 0;
    return {
        totalLines: lines.length,
        codeLines,
        multiFunctionLines,
        metaPatterns,
        petPatterns,
        trustPatterns,
        density,
    };
}
function updateStatusBar(metrics) {
    const config = vscode.workspace.getConfiguration('aixCodeVisualizer');
    if (!config.get('showDensityMetrics', true)) {
        statusBarItem.hide();
        return;
    }
    const multiFunctionPercent = metrics.codeLines > 0
        ? ((metrics.multiFunctionLines / metrics.codeLines) * 100).toFixed(0)
        : 0;
    statusBarItem.text = `$(symbol-color) AIX: ${metrics.metaPatterns}🧬 ${metrics.petPatterns}🐾 ${metrics.trustPatterns}🔗 | ${multiFunctionPercent}% multi-fn`;
    statusBarItem.tooltip = `AIX Code Density Analysis\n\nMeta Patterns: ${metrics.metaPatterns}\nPet Patterns: ${metrics.petPatterns}\nTrust Patterns: ${metrics.trustPatterns}\nMulti-Function Lines: ${metrics.multiFunctionLines}/${metrics.codeLines} (${multiFunctionPercent}%)\n\nClick for detailed report`;
    statusBarItem.show();
}
function showDensityReport(metrics) {
    const multiFunctionPercent = metrics.codeLines > 0
        ? ((metrics.multiFunctionLines / metrics.codeLines) * 100).toFixed(1)
        : 0;
    const traditionalLines = metrics.codeLines * 10; // Estimated
    const reduction = traditionalLines / metrics.codeLines;
    const report = `
# 🔬 AIX Code Density Report

## 📊 Metrics

- **Total Lines**: ${metrics.totalLines}
- **Code Lines**: ${metrics.codeLines}
- **Multi-Function Lines**: ${metrics.multiFunctionLines} (${multiFunctionPercent}%)

## 🎯 Pattern Detection

- 🧬 **Meta Engine**: ${metrics.metaPatterns} patterns
- 🐾 **Pet Skills**: ${metrics.petPatterns} patterns
- 🔗 **Trust Chain**: ${metrics.trustPatterns} patterns

## 📈 Density Analysis

- **Feature Density**: ${(metrics.density * 100).toFixed(1)}%
- **Estimated Traditional Lines**: ${traditionalLines}
- **Reduction Factor**: ${reduction.toFixed(1)}x

## ✅ Verdict

${reduction >= 10 ? '✅ Excellent architectural density!' : reduction >= 5 ? '⚠️ Good density, room for improvement' : '❌ Low density, consider refactoring'}
  `.trim();
    const panel = vscode.window.createWebviewPanel('aixDensityReport', 'AIX Code Density Report', vscode.ViewColumn.Beside, {});
    panel.webview.html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          padding: 20px;
          line-height: 1.6;
        }
        h1 { color: #00ff88; }
        h2 { color: #4ec9b0; margin-top: 30px; }
        code { background: #1e1e1e; padding: 2px 6px; border-radius: 3px; }
        .metric { font-size: 18px; margin: 10px 0; }
        .verdict { 
          margin-top: 30px; 
          padding: 15px; 
          background: #1e1e1e; 
          border-left: 4px solid #00ff88;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      ${report.split('\n').map(line => {
        if (line.startsWith('# '))
            return `<h1>${line.slice(2)}</h1>`;
        if (line.startsWith('## '))
            return `<h2>${line.slice(3)}</h2>`;
        if (line.startsWith('- '))
            return `<div class="metric">${line.slice(2)}</div>`;
        return `<p>${line}</p>`;
    }).join('\n')}
    </body>
    </html>
  `;
}
// ═══════════════════════════════════════════════════════════════════════════════
// DEACTIVATION
// ═══════════════════════════════════════════════════════════════════════════════
function deactivate() {
    metaDecorationType?.dispose();
    petDecorationType?.dispose();
    trustDecorationType?.dispose();
    gatewayDecorationType?.dispose();
    multiFunctionDecorationType?.dispose();
    statusBarItem?.dispose();
}
// Made with Moe Abdelaziz
//# sourceMappingURL=extension.js.map