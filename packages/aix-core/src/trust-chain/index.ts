import { createHash } from 'node:crypto';

type TrustEntry = {
  action: string
  actor_did: string
  payload_hash: string   // SHA-256
  timestamp: string      // ISO8601
  prev_hash: string      // GENESIS للأولى
  human_approved: boolean // Human-in-the-Loop — إلزامي
}

function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

class TrustChain {
  private entries: TrustEntry[] = []

  append(
    action: string,
    actor_did: string,
    payload: unknown
  ): TrustEntry {
    const entry: TrustEntry = {
      action,
      actor_did,
      payload_hash: sha256(JSON.stringify(payload)),
      timestamp: new Date().toISOString(),
      prev_hash: this.entries.at(-1)?.payload_hash ?? 'GENESIS',
      human_approved: false
    }
    this.entries.push(entry)
    return entry
  }

  // ← Human-in-the-Loop نقطة إلزامية
  approve(index: number, approver_did: string): void {
    if (this.entries[index]) {
      this.entries[index].human_approved = true
      this.append('human.approval', approver_did, { approved_index: index })
    }
  }

  getChain(): readonly TrustEntry[] {
    return [...this.entries]
  }

  // للـ manifest serialization
  toManifestSchema(): TrustEntry[] {
    return this.getChain() as TrustEntry[]
  }

  clear(): void {
    this.entries = []
  }
}

export const trustChain = new TrustChain()
export type { TrustEntry }
