import { NextRequest } from 'next/server';
import yaml from 'js-yaml';
import { scanAgent } from "@/lib/abom-scanner";
import { successResponse, ERR, parseBody } from '@/lib/api-helpers';

/**
 * POST /api/scan
 * Scans an AIX YAML or JSON manifest and returns a risk report.
 *
 * PUBLIC: No auth required - allows public scanning
 * SIZE LIMIT: 500KB max to prevent abuse
 */

interface ScanRequest {
  content: string;
  format?: 'yaml' | 'json';
}

export async function POST(req: NextRequest) {
  try {
    // Check content size (500KB limit)
    const bodyText = await req.text();
    if (bodyText.length > 500_000) {
      return ERR.VALIDATION('Payload too large for scanning (max 500KB)');
    }

    const body = JSON.parse(bodyText) as ScanRequest;
    const { content, format = 'yaml' } = body;

    if (!content) {
      return ERR.VALIDATION('Missing content to scan');
    }

    // Parse manifest
    let agentData;
    try {
      if (format === 'json') {
        agentData = typeof content === 'string' ? JSON.parse(content) : content;
      } else {
        agentData = yaml.load(content);
      }
    } catch (e: any) {
      return ERR.VALIDATION(`Failed to parse manifest: ${e.message}`);
    }

    // Scan and return report
    const report = scanAgent(agentData);
    return successResponse(report);
    
  } catch (error: unknown) {
    console.error('[scan] Scan failed:', error.message);
    return ERR.INTERNAL('Scan operation failed');
  }
}
