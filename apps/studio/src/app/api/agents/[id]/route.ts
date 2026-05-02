import { NextRequest } from "next/server";
import { getRegistry, updateRegistryEntry, deleteRegistryEntry } from "@/lib/registry";
import { successResponse, requireAuth, ERR, parseBody } from '@/lib/api-helpers';

/**
 * GET /api/agents/[id]
 * Fetches a specific agent by its DID.
 *
 * PUBLIC: No auth required - agents are publicly readable
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entries = await getRegistry();
    const entry = entries.find((e) => e.did === id);

    if (!entry) {
      return ERR.NOT_FOUND('Agent not found');
    }

    return successResponse(entry);
  } catch (error: any) {
    console.error("[agents/id] GET failed:", error.message);
    return ERR.INTERNAL('Failed to fetch agent');
  }
}

/**
 * PUT /api/agents/[id]
 * Updates a specific agent entry.
 *
 * PROTECTED: Requires authentication
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error: authError } = await requireAuth();
    if (authError) return authError;

    const { id } = await params;
    const { body, error } = await parseBody<any>(req);
    if (error) return error;
    
    if (body.did && body.did !== id) {
      return ERR.VALIDATION('ID mismatch between path and body');
    }

    const updatedEntry = {
      ...body,
      did: id
    };

    await updateRegistryEntry(updatedEntry);
    return successResponse(updatedEntry);
    
  } catch (error: any) {
    console.error("[agents/id] PUT failed:", error.message);
    return ERR.INTERNAL('Failed to update agent');
  }
}

/**
 * DELETE /api/agents/[id]
 * Removes an agent from the registry.
 *
 * PROTECTED: Requires authentication
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error: authError } = await requireAuth();
    if (authError) return authError;

    const { id } = await params;
    await deleteRegistryEntry(id);
    return successResponse({ message: "Agent deleted", id });

  } catch (error: any) {
    console.error("[agents/id] DELETE failed:", error.message);
    return ERR.INTERNAL('Failed to delete agent');
  }
}
