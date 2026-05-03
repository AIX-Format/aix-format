import { pathToFileURL } from 'url';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

export class PluginLoader {
  constructor(registry) {
    this.registry = registry;
    this.loaded = new Map();
  }

  async loadFromPath(pluginPath, options = {}) {
    try {
      // Resolve path (support relative, absolute, npm packages)
      const resolvedPath = pluginPath.startsWith('.')
        ? pathToFileURL(resolve(process.cwd(), pluginPath)).href
        : pluginPath;

      // Dynamic import
      const module = await import(resolvedPath);
      const PluginClass = module.default || module;

      // Instantiate and register
      const plugin = new PluginClass();
      
      // Apply options (priority override, enable/disable)
      if (options.priority !== undefined) {
        plugin.priority = options.priority;
      }

      if (options.enabled !== false) {
        this.registry.register(plugin);
        this.loaded.set(plugin.name, { path: pluginPath, plugin, options });
      }

      return plugin;
    } catch (error) {
      if (options.required !== false) {
        throw new Error(`Failed to load plugin ${pluginPath}: ${error.message}`);
      }
      console.warn(`Plugin ${pluginPath} failed to load, skipping:`, error.message);
      return null;
    }
  }

  async loadFromConfig(configPath = '.aix-plugins.json') {
    try {
      const config = JSON.parse(await readFile(configPath, 'utf-8'));
      const results = [];

      for (const [path, options] of Object.entries(config.plugins || {})) {
        const plugin = await this.loadFromPath(path, options);
        if (plugin) results.push(plugin);
      }

      return results;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      return []; // No config file, return empty
    }
  }

  unload(pluginName) {
    const entry = this.loaded.get(pluginName);
    if (entry) {
      this.registry.unregister(pluginName);
      this.loaded.delete(pluginName);
      return true;
    }
    return false;
  }

  list() {
    return Array.from(this.loaded.values()).map(({ plugin, options }) => ({
      name: plugin.name,
      priority: plugin.priority,
      enabled: options.enabled !== false,
      meta: plugin.meta || {}
    }));
  }
}

// Made with Bob
