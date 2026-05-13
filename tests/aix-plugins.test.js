/**
 * Tests for bin/aix-plugins.js
 *
 * Covers the commander-based CLI rewrite: list, add, remove, enable, disable
 * commands plus the loadConfig / saveConfig helpers (tested indirectly through
 * command actions because they are not exported).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Shared state injected into mocks via vi.hoisted so it is available before
// the module-under-test is imported (vi.mock factories are hoisted).
// ---------------------------------------------------------------------------
const { actionHandlers, mockReadFile, mockWriteFile } = vi.hoisted(() => {
  const actionHandlers = {};
  const mockReadFile = vi.fn();
  const mockWriteFile = vi.fn();
  return { actionHandlers, mockReadFile, mockWriteFile };
});

// ---------------------------------------------------------------------------
// Mock 'commander' so program.parse() is a no-op and we can capture the
// action callbacks registered for each sub-command.
// ---------------------------------------------------------------------------
vi.mock('commander', () => {
  function makeSubCommand(cmdName) {
    const sub = {
      description: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis(),
      action: vi.fn((fn) => {
        actionHandlers[cmdName] = fn;
        return sub;
      }),
    };
    return sub;
  }

  const root = {
    name: vi.fn().mockReturnThis(),
    description: vi.fn().mockReturnThis(),
    version: vi.fn().mockReturnThis(),
    parse: vi.fn(),
    command: vi.fn((cmdName) => makeSubCommand(cmdName)),
  };

  return { Command: vi.fn(() => root) };
});

// ---------------------------------------------------------------------------
// Mock 'fs/promises' so tests control file I/O without touching the disk.
// ---------------------------------------------------------------------------
vi.mock('fs/promises', () => ({
  readFile: mockReadFile,
  writeFile: mockWriteFile,
}));

// ---------------------------------------------------------------------------
// Import the module under test AFTER mocks are declared.  The top-level
// program.parse() call is safely swallowed by the mock.
// ---------------------------------------------------------------------------
await import('../bin/aix-plugins.js');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return a config object with the given plugins map. */
function makeConfig(plugins = {}) {
  return { plugins };
}

/** Stringify a config the same way saveConfig does. */
function configJson(plugins = {}) {
  return JSON.stringify(makeConfig(plugins), null, 2);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('aix-plugins CLI', () => {
  beforeEach(() => {
    mockReadFile.mockReset();
    mockWriteFile.mockReset();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  // ── loadConfig (tested indirectly through list) ─────────────────────────

  describe('loadConfig', () => {
    it('returns { plugins: {} } when the config file does not exist', async () => {
      mockReadFile.mockRejectedValue(new Error('ENOENT'));

      await actionHandlers['list']();

      // list should print "Installed plugins:" with no entries
      expect(console.log).toHaveBeenCalledWith('Installed plugins:');
      expect(console.log).toHaveBeenCalledTimes(1);
    });

    it('parses and returns valid JSON from the config file', async () => {
      const stored = makeConfig({ 'my-plugin.js': { enabled: true } });
      mockReadFile.mockResolvedValue(JSON.stringify(stored));

      await actionHandlers['list']();

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('my-plugin.js'),
      );
    });
  });

  // ── list ─────────────────────────────────────────────────────────────────

  describe('list command', () => {
    it('prints header even when no plugins are installed', async () => {
      mockReadFile.mockRejectedValue(new Error('ENOENT'));

      await actionHandlers['list']();

      expect(console.log).toHaveBeenCalledWith('Installed plugins:');
      expect(console.log).toHaveBeenCalledTimes(1);
    });

    it('shows enabled plugin with ✅ status', async () => {
      mockReadFile.mockResolvedValue(
        JSON.stringify(makeConfig({ 'plugin-a.js': { enabled: true } })),
      );

      await actionHandlers['list']();

      const calls = console.log.mock.calls.map((c) => c[0]);
      expect(calls.some((s) => s.includes('✅') && s.includes('plugin-a.js'))).toBe(true);
    });

    it('shows disabled plugin with ❌ status', async () => {
      mockReadFile.mockResolvedValue(
        JSON.stringify(makeConfig({ 'plugin-b.js': { enabled: false } })),
      );

      await actionHandlers['list']();

      const calls = console.log.mock.calls.map((c) => c[0]);
      expect(calls.some((s) => s.includes('❌') && s.includes('plugin-b.js'))).toBe(true);
    });

    it('includes priority in output when the plugin has one', async () => {
      mockReadFile.mockResolvedValue(
        JSON.stringify(makeConfig({ 'plugin-c.js': { enabled: true, priority: 5 } })),
      );

      await actionHandlers['list']();

      const calls = console.log.mock.calls.map((c) => c[0]);
      expect(calls.some((s) => s.includes('priority: 5'))).toBe(true);
    });

    it('omits priority text when plugin has no priority set', async () => {
      mockReadFile.mockResolvedValue(
        JSON.stringify(makeConfig({ 'plugin-d.js': { enabled: true } })),
      );

      await actionHandlers['list']();

      const calls = console.log.mock.calls.map((c) => c[0]);
      expect(calls.every((s) => !s.includes('priority:'))).toBe(true);
    });

    it('lists multiple plugins', async () => {
      mockReadFile.mockResolvedValue(
        JSON.stringify(
          makeConfig({
            'alpha.js': { enabled: true },
            'beta.js': { enabled: false, priority: 10 },
          }),
        ),
      );

      await actionHandlers['list']();

      const calls = console.log.mock.calls.map((c) => c[0]);
      expect(calls.some((s) => s.includes('alpha.js'))).toBe(true);
      expect(calls.some((s) => s.includes('beta.js'))).toBe(true);
      expect(calls.some((s) => s.includes('priority: 10'))).toBe(true);
    });
  });

  // ── add ──────────────────────────────────────────────────────────────────

  describe('add command', () => {
    it('adds an enabled plugin by default', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(makeConfig()));
      mockWriteFile.mockResolvedValue(undefined);

      await actionHandlers['add <path>']('my-plugin.js', {});

      expect(mockWriteFile).toHaveBeenCalledTimes(1);
      const written = JSON.parse(mockWriteFile.mock.calls[0][1]);
      expect(written.plugins['my-plugin.js'].enabled).toBe(true);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Added plugin: my-plugin.js'),
      );
    });

    it('adds a disabled plugin when --disabled flag is set', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(makeConfig()));
      mockWriteFile.mockResolvedValue(undefined);

      await actionHandlers['add <path>']('my-plugin.js', { disabled: true });

      const written = JSON.parse(mockWriteFile.mock.calls[0][1]);
      expect(written.plugins['my-plugin.js'].enabled).toBe(false);
    });

    it('adds plugin with priority when --priority is provided', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(makeConfig()));
      mockWriteFile.mockResolvedValue(undefined);

      await actionHandlers['add <path>']('my-plugin.js', { priority: 3 });

      const written = JSON.parse(mockWriteFile.mock.calls[0][1]);
      expect(written.plugins['my-plugin.js'].priority).toBe(3);
    });

    it('omits priority key when --priority is not provided', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(makeConfig()));
      mockWriteFile.mockResolvedValue(undefined);

      await actionHandlers['add <path>']('my-plugin.js', {});

      const written = JSON.parse(mockWriteFile.mock.calls[0][1]);
      expect(written.plugins['my-plugin.js']).not.toHaveProperty('priority');
    });

    it('adds a disabled plugin with priority', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(makeConfig()));
      mockWriteFile.mockResolvedValue(undefined);

      await actionHandlers['add <path>']('my-plugin.js', { disabled: true, priority: 99 });

      const written = JSON.parse(mockWriteFile.mock.calls[0][1]);
      expect(written.plugins['my-plugin.js']).toEqual({ enabled: false, priority: 99 });
    });

    it('overwrites an existing plugin entry', async () => {
      const existing = makeConfig({ 'my-plugin.js': { enabled: true, priority: 1 } });
      mockReadFile.mockResolvedValue(JSON.stringify(existing));
      mockWriteFile.mockResolvedValue(undefined);

      await actionHandlers['add <path>']('my-plugin.js', { priority: 7 });

      const written = JSON.parse(mockWriteFile.mock.calls[0][1]);
      expect(written.plugins['my-plugin.js'].priority).toBe(7);
    });

    it('saves config in pretty-printed JSON format', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(makeConfig()));
      mockWriteFile.mockResolvedValue(undefined);

      await actionHandlers['add <path>']('p.js', {});

      const rawArg = mockWriteFile.mock.calls[0][1];
      // Pretty-printed JSON contains newlines
      expect(rawArg).toContain('\n');
    });

    // Regression: the old code used `config.plugins ??= {}` to ensure the
    // plugins key existed; the new code accesses config.plugins directly.
    // If loadConfig returns an object without a plugins key the add command
    // will throw a TypeError.
    it('regression: throws when config file exists but has no plugins key', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify({})); // no "plugins" key
      mockWriteFile.mockResolvedValue(undefined);

      await expect(
        actionHandlers['add <path>']('my-plugin.js', {}),
      ).rejects.toThrow(TypeError);
    });
  });

  // ── remove ───────────────────────────────────────────────────────────────

  describe('remove command', () => {
    it('removes the specified plugin and saves', async () => {
      const config = makeConfig({ 'del-me.js': { enabled: true }, 'keep.js': { enabled: true } });
      mockReadFile.mockResolvedValue(JSON.stringify(config));
      mockWriteFile.mockResolvedValue(undefined);

      await actionHandlers['remove <path>']('del-me.js');

      const written = JSON.parse(mockWriteFile.mock.calls[0][1]);
      expect(written.plugins).not.toHaveProperty('del-me.js');
      expect(written.plugins).toHaveProperty('keep.js');
    });

    it('prints removal confirmation message', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(makeConfig({ 'p.js': { enabled: true } })));
      mockWriteFile.mockResolvedValue(undefined);

      await actionHandlers['remove <path>']('p.js');

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Removed plugin: p.js'));
    });

    it('silently succeeds when removing a non-existent plugin key', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(makeConfig({ 'other.js': { enabled: true } })));
      mockWriteFile.mockResolvedValue(undefined);

      await actionHandlers['remove <path>']('ghost.js');

      const written = JSON.parse(mockWriteFile.mock.calls[0][1]);
      expect(written.plugins).not.toHaveProperty('ghost.js');
      expect(written.plugins).toHaveProperty('other.js');
    });
  });

  // ── enable ───────────────────────────────────────────────────────────────

  describe('enable command', () => {
    it('sets enabled=true for an existing plugin and saves', async () => {
      const config = makeConfig({ 'plug.js': { enabled: false } });
      mockReadFile.mockResolvedValue(JSON.stringify(config));
      mockWriteFile.mockResolvedValue(undefined);

      await actionHandlers['enable <path>']('plug.js');

      const written = JSON.parse(mockWriteFile.mock.calls[0][1]);
      expect(written.plugins['plug.js'].enabled).toBe(true);
    });

    it('prints confirmation message when plugin is enabled', async () => {
      mockReadFile.mockResolvedValue(
        JSON.stringify(makeConfig({ 'plug.js': { enabled: false } })),
      );
      mockWriteFile.mockResolvedValue(undefined);

      await actionHandlers['enable <path>']('plug.js');

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Enabled plugin: plug.js'),
      );
    });

    it('prints error to stderr and does not save when plugin is not found', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(makeConfig()));
      mockWriteFile.mockResolvedValue(undefined);

      await actionHandlers['enable <path>']('ghost.js');

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Plugin not found: ghost.js'),
      );
      expect(mockWriteFile).not.toHaveBeenCalled();
    });
  });

  // ── disable ──────────────────────────────────────────────────────────────

  describe('disable command', () => {
    it('sets enabled=false for an existing plugin and saves', async () => {
      const config = makeConfig({ 'plug.js': { enabled: true } });
      mockReadFile.mockResolvedValue(JSON.stringify(config));
      mockWriteFile.mockResolvedValue(undefined);

      await actionHandlers['disable <path>']('plug.js');

      const written = JSON.parse(mockWriteFile.mock.calls[0][1]);
      expect(written.plugins['plug.js'].enabled).toBe(false);
    });

    it('prints confirmation message when plugin is disabled', async () => {
      mockReadFile.mockResolvedValue(
        JSON.stringify(makeConfig({ 'plug.js': { enabled: true } })),
      );
      mockWriteFile.mockResolvedValue(undefined);

      await actionHandlers['disable <path>']('plug.js');

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Disabled plugin: plug.js'),
      );
    });

    it('prints error to stderr and does not save when plugin is not found', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(makeConfig()));
      mockWriteFile.mockResolvedValue(undefined);

      await actionHandlers['disable <path>']('ghost.js');

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Plugin not found: ghost.js'),
      );
      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it('does not affect other plugins when disabling one', async () => {
      const config = makeConfig({
        'a.js': { enabled: true },
        'b.js': { enabled: true },
      });
      mockReadFile.mockResolvedValue(JSON.stringify(config));
      mockWriteFile.mockResolvedValue(undefined);

      await actionHandlers['disable <path>']('a.js');

      const written = JSON.parse(mockWriteFile.mock.calls[0][1]);
      expect(written.plugins['a.js'].enabled).toBe(false);
      expect(written.plugins['b.js'].enabled).toBe(true);
    });
  });

  // ── saveConfig (tested indirectly) ───────────────────────────────────────

  describe('saveConfig', () => {
    it('writes to .aix-plugins.json', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(makeConfig()));
      mockWriteFile.mockResolvedValue(undefined);

      await actionHandlers['add <path>']('p.js', {});

      expect(mockWriteFile.mock.calls[0][0]).toBe('.aix-plugins.json');
    });

    it('serialises config with 2-space indentation', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(makeConfig()));
      mockWriteFile.mockResolvedValue(undefined);

      await actionHandlers['add <path>']('p.js', {});

      const raw = mockWriteFile.mock.calls[0][1];
      // JSON.stringify with null, 2 produces lines starting with two spaces
      expect(raw).toMatch(/^  "/m);
    });
  });
});
