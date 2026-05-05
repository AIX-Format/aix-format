import { 
  SecurityHandler, 
  EconomicsHandler, 
  GhostHandler, 
  PulseRequest 
} from "./handlers";
import { GatewayProcess, AIXManifest } from "@aix-types";


export class PulseOrchestrator {
  private chain: SecurityHandler;

  constructor() {
    // Construct the chain
    this.chain = new SecurityHandler();
    this.chain
      .setNext(new GhostHandler())
      .setNext(new EconomicsHandler());
  }

  /**
   * 📡 PREDICTIVE SWARM RADAR (Round 56)
   * Scans for cognitive drift before pulse execution.
   */
  public predictSwarmFailure(manifest: AIXManifest): boolean {
    if (!manifest.topological_integrity) return true; // High risk if missing integrity
    // Logic to compare current hash with expected
    return false; 
  }

  async executePulse(process: GatewayProcess, manifest: AIXManifest) {
    const gateway = new Gateway();
    const gear = gateway.getSovereignGear(manifest.identity_layer?.role || 'general');

    // 🌀 [ARABIC_SOVEREIGNTY]: ضبط عمق النبضة بناءً على "ناقل الحركة"
    console.log(`[Orchestrator] Executing Pulse in ${gear} mode...`);

    const request: PulseRequest = {
      process,
      manifest,
      results: {},
      sovereignGear: gear // 🛰️ Injecting gear into handlers
    };

    try {
      const finalRequest = await this.chain.handle(request);
      
      // Emit event (Observer Pattern)
      AgentEventBus.getInstance().emit('pulse:success', {
        agentId: process.agentId,
        yield: finalRequest.results.economics?.yield
      });

      return finalRequest;
    } catch (error: any) {
      AgentEventBus.getInstance().emit('pulse:error', {
        agentId: process.agentId,
        error: error.message
      });
      throw error;
    }
  }
}
