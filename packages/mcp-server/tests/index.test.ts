import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";

// Mock dependencies
vi.mock("fs/promises");
vi.mock("../../../core/abom-scanner.js", () => ({
  scanAgent: vi.fn().mockReturnValue({ score: 100 })
}));

describe('MCP Server - get_blackbox_logs', () => {
  let requestHandler: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // We need to capture the request handler from the index.ts file
    // To do this properly without starting the real server, we can mock Server.prototype.setRequestHandler
    const mockSetRequestHandler = vi.fn((schema, handler) => {
      if (schema === CallToolRequestSchema) {
        requestHandler = handler;
      }
    });

    vi.spyOn(Server.prototype, 'setRequestHandler').mockImplementation(mockSetRequestHandler);

    // We must mock console.error to avoid spamming the test output
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Import the file to trigger setRequestHandler calls
    await import('../src/index.js');
  });

  it('should return error when get_blackbox_logs receives non-existent file path', async () => {
    // Mock fs.readFile to throw an error
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT: no such file or directory'));

    const request = {
      params: {
        name: "get_blackbox_logs",
        arguments: {
          manifestPath: "non-existent.json"
        }
      }
    };

    const response = await requestHandler(request);

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain('Error:');
    expect(response.content[0].text).toContain('ENOENT');
  });

  it('should return error when get_blackbox_logs receives invalid JSON', async () => {
    // Mock fs.readFile to return invalid JSON
    vi.mocked(fs.readFile).mockResolvedValue('{ "invalid": "json" ');

    const request = {
      params: {
        name: "get_blackbox_logs",
        arguments: {
          manifestPath: "dummy.json"
        }
      }
    };

    const response = await requestHandler(request);

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain('Expected');
    expect(response.content[0].text).toContain('JSON');
  });

  it('should return error when get_blackbox_logs receives invalid YAML', async () => {
    // Mock fs.readFile to return invalid YAML
    vi.mocked(fs.readFile).mockResolvedValue('invalid: yaml: :\n');

    const request = {
      params: {
        name: "get_blackbox_logs",
        arguments: {
          manifestPath: "dummy.yaml"
        }
      }
    };

    const response = await requestHandler(request);

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain('bad indentation of a mapping entry');
  });

  it('should successfully parse valid JSON in get_blackbox_logs', async () => {
    // Mock fs.readFile to return valid JSON
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({
      meta: { id: "test-id", name: "Test Agent" },
      black_box: { traces: [{ id: 1 }, { id: 2 }] }
    }));

    const request = {
      params: {
        name: "get_blackbox_logs",
        arguments: {
          manifestPath: "valid.json"
        }
      }
    };

    const response = await requestHandler(request);

    expect(response.isError).toBeUndefined();
    expect(response.content[0].text).toContain('"agent_id": "test-id"');
    expect(response.content[0].text).toContain('"total_logs": 2');
  });
});
