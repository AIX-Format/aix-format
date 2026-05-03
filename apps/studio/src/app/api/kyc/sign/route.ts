import { NextRequest } from "next/server";
import { PiKycAdapter } from "@core/pi_kyc_adapter";
import { requireAuth, successResponse, ERR, parseBody } from '@/lib/api-helpers';

/**
 * POST /api/kyc/sign
 * Generates KYC identity signature from Pi Network verification
 *
 * SECURITY: Requires authentication
 * PRIVACY: Never logs sensitive identity data
 */

interface KYCSignRequest {
  user: { uid: string };
  accessToken: string;
  signature: string;
  publicKey: string;
}

export async function POST(req: NextRequest) {
  try {
    // Auth check - KYC endpoints require authentication
    const { session, error: authError } = await requireAuth();
    if (authError) return authError;

    // Parse and validate request body
    const { body, error: parseError } = await parseBody<KYCSignRequest>(req);
    if (parseError) return parseError;

    // Validate required fields
    if (!body.user?.uid || !body.accessToken ||
        !body.signature || !body.publicKey) {
      return ERR.VALIDATION('Missing required KYC fields: user.uid, accessToken, signature, publicKey');
    }

    // Generate KYC identity
    const result = PiKycAdapter.generateIdentity(body);

    return successResponse(result);
    
  } catch (error: unknown) {
    // NEVER log error details (may contain identity data)
    console.error('[kyc/sign] KYC signing failed (details redacted for security)');
    return ERR.INTERNAL('KYC signing failed');
  }
}
