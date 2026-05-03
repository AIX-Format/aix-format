# 🚀 AIX Code Visualizer - Publishing Guide

> **Complete guide to publish the extension to VS Code Marketplace**

---

## ✅ Current Status

**Extension**: `aix-code-visualizer`  
**Version**: 1.0.0  
**Publisher**: aix-team (needs to be created)  
**Location**: `.vscode/extensions/aix-code-visualizer/`

---

## 📦 Step 1: Verify package.json

Current configuration is correct:

```json
{
  "name": "aix-code-visualizer",
  "displayName": "AIX Code Visualizer",
  "publisher": "aix-team",
  "version": "1.0.0",
  "engines": { "vscode": "^1.100.0" },
  "categories": ["Programming Languages", "Visualization"],
  "activationEvents": [
    "onLanguage:typescript",
    "onLanguage:javascript"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "aix-code-visualizer.toggle",
        "title": "Toggle AIX Code Highlighting"
      },
      {
        "command": "aix-code-visualizer.analyzeFile",
        "title": "Analyze AIX Code Density"
      }
    ]
  }
}
```

✅ **All fields are correct**

---

## 🔧 Step 2: Build & Test Locally

### Install Dependencies
```bash
cd .vscode/extensions/aix-code-visualizer
npm install
```

### Compile TypeScript
```bash
npm run compile
# or
tsc -p ./
```

### Test in VS Code
1. Press `F5` in VS Code (opens Extension Development Host)
2. Open any `.ts` file from `packages/aix-core/src/`
3. Verify highlighting works:
   - Meta engine code → **green**
   - Pet skills → **pink**
   - Trust chain → **gold**
   - Gateway → **cyan**
   - Multi-function lines → **red underline**

---

## 🌐 Step 3: Create Publisher Account

### 3.1 Go to VS Code Marketplace
https://marketplace.visualstudio.com/manage

### 3.2 Sign in with Microsoft Account
- Use GitHub account (Moeabdelaziz007)
- Or create new Microsoft account

### 3.3 Create Publisher
- **Publisher ID**: `aix-team`
- **Display Name**: AIX Team
- **Description**: Creators of AIX Framework - Self-Evolving AI Agents

### 3.4 Get Personal Access Token (PAT)
1. Go to: https://dev.azure.com/
2. Click "User Settings" → "Personal Access Tokens"
3. Create new token:
   - **Name**: `vsce-aix-code-visualizer`
   - **Organization**: All accessible organizations
   - **Scopes**: Marketplace → **Manage**
   - **Expiration**: 1 year
4. **SAVE THE TOKEN** (you won't see it again)

---

## 📤 Step 4: Publish to Marketplace

### 4.1 Install vsce (VS Code Extension CLI)
```bash
npm install -g @vscode/vsce
```

### 4.2 Login with Publisher
```bash
vsce login aix-team
# Enter your Personal Access Token when prompted
```

### 4.3 Package Extension
```bash
cd .vscode/extensions/aix-code-visualizer
vsce package
# Creates: aix-code-visualizer-1.0.0.vsix
```

### 4.4 Test VSIX Locally (Optional)
```bash
code --install-extension aix-code-visualizer-1.0.0.vsix
```

### 4.5 Publish to Marketplace
```bash
vsce publish
# or specify version:
vsce publish 1.0.0
```

**Success message**:
```
✅ Published aix-team.aix-code-visualizer@1.0.0
🌐 https://marketplace.visualstudio.com/items?itemName=aix-team.aix-code-visualizer
```

---

## 🐙 Step 5: Create GitHub Repository

### 5.1 Create Repo
```bash
# From AIX root directory
cd .vscode/extensions/aix-code-visualizer

# Initialize git
git init
git add .
git commit -m "feat: initial release of AIX Code Visualizer v1.0.0"

# Create remote repo on GitHub:
# https://github.com/new
# Name: aix-code-visualizer
# Description: VS Code extension for AIX Framework pattern visualization

# Add remote
git remote add origin https://github.com/Moeabdelaziz007/aix-code-visualizer.git
git branch -M main
git push -u origin main
```

### 5.2 Add README.md
Already exists at `.vscode/extensions/aix-code-visualizer/README.md`

### 5.3 Add LICENSE
```bash
# Add MIT License
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2026 Moe Abdelaziz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
```

### 5.4 Update package.json with repo info
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/Moeabdelaziz007/aix-code-visualizer.git"
  },
  "bugs": {
    "url": "https://github.com/Moeabdelaziz007/aix-code-visualizer/issues"
  },
  "homepage": "https://github.com/Moeabdelaziz007/aix-code-visualizer#readme"
}
```

---

## 🎨 Step 6: Add Extension Icon

### 6.1 Create icon.png (128x128)
```bash
# Use AIX logo or create custom icon
# Place at: .vscode/extensions/aix-code-visualizer/icon.png
```

### 6.2 Update package.json
```json
{
  "icon": "icon.png"
}
```

---

## 📊 Step 7: Add Marketplace Badges

### 7.1 Update README.md
```markdown
# AIX Code Visualizer

[![Version](https://img.shields.io/visual-studio-marketplace/v/aix-team.aix-code-visualizer)](https://marketplace.visualstudio.com/items?itemName=aix-team.aix-code-visualizer)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/aix-team.aix-code-visualizer)](https://marketplace.visualstudio.com/items?itemName=aix-team.aix-code-visualizer)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/aix-team.aix-code-visualizer)](https://marketplace.visualstudio.com/items?itemName=aix-team.aix-code-visualizer)
```

---

## 🚀 v1.1 Features Roadmap

### Priority 1: Hover Tooltips (Easy, High Impact) 🔥
**What**: Explain why a line is highlighted when hovering

**Implementation**:
```typescript
// In extension.ts
const hoverProvider = vscode.languages.registerHoverProvider(
  ['typescript', 'javascript'],
  {
    provideHover(document, position) {
      const line = document.lineAt(position.line);
      const text = line.text;
      
      // Check if line matches meta pattern
      if (META_PATTERNS.some(p => p.test(text))) {
        return new vscode.Hover([
          '🧬 **Meta Engine Pattern**',
          '',
          'This line uses recursive meta-cognitive patterns:',
          '- Self-observation',
          '- UCB1 selection',
          '- Entropy control',
          '',
          '[Learn more](https://github.com/Moeabdelaziz007/aix-format/blob/main/docs/PATTERN_ANALYSIS.md)'
        ]);
      }
      
      // Similar for other patterns...
    }
  }
);
```

**Impact**: Transforms extension from "visual only" to "educational tool"

---

### Priority 2: Gutter Icons (Medium, High Impact) 🔥
**What**: Show emoji icons (🧬🐾🔗) in line numbers

**Implementation**:
```typescript
const gutterDecoration = vscode.window.createTextEditorDecorationType({
  gutterIconPath: vscode.Uri.file(path.join(__dirname, 'icons', 'meta.svg')),
  gutterIconSize: 'contain'
});
```

**Impact**: Makes patterns visible at a glance

---

### Priority 3: WebView Panel - Density Heatmap (Hard, Excellent Impact) ⭐
**What**: Interactive panel showing code density visualization

**Features**:
- File-by-file density heatmap
- Pattern distribution chart
- Multi-function line percentage
- Comparison with traditional code

**Impact**: Professional analytics dashboard

---

### Priority 4: Integration with /api/pulse/stream (Hard, Unique Impact) ⭐
**What**: Live connection to AIX runtime

**Features**:
- Real-time agent mood in status bar
- Pet observation ring visualization
- Trust chain transaction feed
- Meta-loop execution trace

**Impact**: Makes extension a **live debugging tool**

---

## 🔄 Update Process

### Publish New Version
```bash
# 1. Update version in package.json
# 2. Update CHANGELOG.md
# 3. Commit changes
git add .
git commit -m "feat: v1.1.0 - Add hover tooltips"
git tag v1.1.0
git push origin main --tags

# 4. Publish to marketplace
vsce publish 1.1.0
```

---

## 📈 Analytics

After publishing, track metrics at:
https://marketplace.visualstudio.com/manage/publishers/aix-team

**Key Metrics**:
- Total installs
- Daily active users
- Rating & reviews
- Download trends

---

## 🎯 Marketing

### 1. Announce on Social Media
- Twitter/X: @Moeabdelaziz007
- LinkedIn: Share with #VSCode #AIX #DeveloperTools
- Reddit: r/vscode, r/typescript

### 2. Blog Post
Write article: "Visualizing Meta-Cognitive Patterns in Code"

### 3. Demo Video
Record 2-minute demo showing:
- Pattern highlighting
- Density analysis
- Real-time metrics

### 4. Add to AIX Documentation
Update [`docs/TOOLS.md`](../../docs/TOOLS.md) with extension info

---

## ✅ Checklist

Before publishing:
- [ ] All TypeScript compiles without errors
- [ ] Extension activates correctly
- [ ] All patterns are detected
- [ ] Status bar shows density metrics
- [ ] Commands work (toggle, analyze)
- [ ] README.md is complete
- [ ] LICENSE file exists
- [ ] Icon is added (128x128)
- [ ] package.json has repository info
- [ ] CHANGELOG.md is created
- [ ] Tested in Extension Development Host
- [ ] Publisher account created
- [ ] Personal Access Token obtained

---

## 🐛 Troubleshooting

### Error: "Publisher not found"
```bash
# Login again
vsce login aix-team
```

### Error: "Extension activation failed"
```bash
# Check main field in package.json
"main": "./out/extension.js"

# Ensure TypeScript is compiled
npm run compile
```

### Error: "Command not found"
```bash
# Check contributes.commands in package.json
# Ensure command IDs match extension.ts
```

---

## 📞 Support

**Issues**: https://github.com/Moeabdelaziz007/aix-code-visualizer/issues  
**Email**: amrikyy@gmail.com  
**Discord**: AIX Community (coming soon)

---

**Made with 🎨 by Moe Abdelaziz**  
**AIX Code Visualizer - Making Meta-Patterns Visible**