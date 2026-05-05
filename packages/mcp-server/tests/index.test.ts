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
    expect(response.content[0].text).toContain('Invalid format:');
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
    expect(response.content[0].text).toContain('Invalid format:');
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

describe('MCP Server - verify_abom_compliance', () => {
  let requestHandler: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    const mockSetRequestHandler = vi.fn((schema, handler) => {
      if (schema === CallToolRequestSchema) {
        requestHandler = handler;
      }
    });

    vi.spyOn(Server.prototype, 'setRequestHandler').mockImplementation(mockSetRequestHandler);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await import('../src/index.js');
  });

  it('should handle manifest with missing traces array (undefined fallback)', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({
      meta: { id: "test-id", name: "Test Agent" },
      abom: { mitigations: [] },
      black_box: {} // Missing traces
    }));

    const request = {
      params: {
        name: "verify_abom_compliance",
        arguments: {
          manifestPath: "missing-traces.json"
        }
      }
    };

    const response = await requestHandler(request);

    expect(response.isError).toBeUndefined();

    const parsedResponse = JSON.parse(response.content[0].text);
    expect(parsedResponse.compliant).toBe(false);
    expect(parsedResponse.details.has_abom).toBe(true);
    expect(parsedResponse.details.has_traces).toBe(false);
  });

  it('should handle manifest with empty traces array in verify_abom_compliance', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({
      meta: { id: "test-id", name: "Test Agent" },
      abom: { mitigations: [] },
      black_box: { traces: [] } // Empty traces
    }));

    const request = {
      params: {
        name: "verify_abom_compliance",
        arguments: {
          manifestPath: "empty-traces.json"
        }
      }
    };

    const response = await requestHandler(request);

    expect(response.isError).toBeUndefined();

    const parsedResponse = JSON.parse(response.content[0].text);
    expect(parsedResponse.compliant).toBe(false);
    expect(parsedResponse.details.has_abom).toBe(true);
    expect(parsedResponse.details.has_traces).toBe(false);
  });

  it('should handle manifest missing abom in verify_abom_compliance', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({
      meta: { id: "test-id", name: "Test Agent" },
      black_box: { traces: [{ signature: "sig1" }] }
    }));

    const request = {
      params: {
        name: "verify_abom_compliance",
        arguments: {
          manifestPath: "no-abom.json"
        }
      }
    };

    const response = await requestHandler(request);

    expect(response.isError).toBeUndefined();

    const parsedResponse = JSON.parse(response.content[0].text);
    expect(parsedResponse.compliant).toBe(false);
    expect(parsedResponse.details.has_abom).toBe(false);
    expect(parsedResponse.details.has_traces).toBe(true);
  });

  it('should return true for fully compliant manifest in verify_abom_compliance', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({
      meta: { id: "test-id", name: "Test Agent" },
      abom: { mitigations: [] },
      black_box: { traces: [{ signature: "sig1" }, { signature: "sig2" }] }
    }));

    const request = {
      params: {
        name: "verify_abom_compliance",
        arguments: {
          manifestPath: "compliant.json"
        }
      }
    };

    const response = await requestHandler(request);

    expect(response.isError).toBeUndefined();

    const parsedResponse = JSON.parse(response.content[0].text);
    expect(parsedResponse.compliant).toBe(true);
    expect(parsedResponse.details.has_abom).toBe(true);
    expect(parsedResponse.details.has_traces).toBe(true);
    expect(parsedResponse.details.all_traces_signed).toBe(true);
  });

  it('should return false if not all traces are signed in verify_abom_compliance', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({
      meta: { id: "test-id", name: "Test Agent" },
      abom: { mitigations: [] },
      black_box: { traces: [{ signature: "sig1" }, { unsigned: "data" }] }
    }));

    const request = {
      params: {
        name: "verify_abom_compliance",
        arguments: {
          manifestPath: "not-all-signed.json"
        }
      }
    };

    const response = await requestHandler(request);

    expect(response.isError).toBeUndefined();

    const parsedResponse = JSON.parse(response.content[0].text);
    expect(parsedResponse.compliant).toBe(false);
    expect(parsedResponse.details.has_abom).toBe(true);
    expect(parsedResponse.details.has_traces).toBe(true);
    expect(parsedResponse.details.all_traces_signed).toBe(false);
  });
});
