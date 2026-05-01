import { useState, useMemo, useCallback } from "react";
import { Manifest, AgentSkill, McpPrompt } from "@/lib/types";
import { computeManifestChecksum } from "@/lib/utils";
import { validateBuilderField, FieldError } from "@/lib/builder-validation";

/**
 * AIX Builder State Hook
 * Centralized state management for the Agent Manifest Architect.
 */
export function useBuilderState() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Manifest>({
    meta: {
      name: "my-first-agent",
      version: "1.0.0",
      format_version: "1.3.0",
      author: "Axiom Developer",
      description: "A sovereign AI agent built to assist with general tasks.",
      type: 'persona',
      created: new Date().toISOString()
    },
    persona: {
      role: "General Assistant",
      instructions: "Your goal is to provide accurate, helpful, and sovereign assistance to the user while maintaining strict privacy and protocol alignment.",
      tone: "formal",
    },
    skills: [] as AgentSkill[],
    security: {
      checksum: {
        algorithm: "sha256",
        value: "pending"
      },
      sandboxed: true,
      level: 'standard'
    },
    identity_layer: {
      id: `did:axiom:axiomid.app:agent-temp`,
      provider: {
        type: 'pi_network',
        name: 'Pi Network',
        authority: 'axiomid.app'
      },
      verification: {
        status: 'unverified',
        trust_level: 0,
        kyc_tier: 'basic',
        dead_hand: {
          enabled: false,
          inactivity_limit_days: 30,
          last_active_at: new Date().toISOString(),
          status: 'dormant'
        }
      },
      issuedAt: new Date().toISOString()
    },
    economics: {
      settlement: {
        layer: 'pi_network',
        network: 'testnet',
        escrow_enabled: false,
        currency: 'PI'
      },
      pricing_model: "pay_per_call",
      currency: "PI"
    },
    abom: {
      integrity_hash: "pending",
      risk_level: "low",
      governance: {
        human_oversight: true
      },
      capabilities: [] as string[],
      timestamp: new Date().toISOString(),
      saas_services: []
    },
    mcp: {
      endpoints: []
    },
    is_shadow_clone: false
  });

  const [errors, setErrors] = useState<Record<string, FieldError | null>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const liveChecksum = useMemo(() => {
    return computeManifestChecksum(formData);
  }, [formData]);

  const updateField = useCallback((path: string, value: any) => {
    const keys = path.split('.');
    setFormData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      let current = next;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return next;
    });

    const error = validateBuilderField(keys[keys.length - 1], value);
    setErrors(prev => ({ ...prev, [keys[keys.length - 1]]: error }));
  }, []);

  const handleBlur = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const isStepValid = (stepId: number) => {
    switch (stepId) {
      case 1: // Context
        return !!formData.meta.name &&
               !!formData.meta.version &&
               !!formData.meta.author &&
               formData.meta.name.length >= 3 &&
               !errors.name && !errors.version && !errors.author;
      case 2: // Persona
        return !!formData.persona.role && !!formData.persona.instructions && !errors.role && !errors.instructions;
      case 3: // Abilities
        return true;
      case 4: // Economics
        return !!formData.economics.settlement.layer;
      case 5: // Security
        return true;
      case 6: // Finalize
        return true;
      default:
        return false;
    }
  };

  return {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    errors,
    touchedFields,
    setTouchedFields,
    setErrors,
    liveChecksum,
    updateField,
    handleBlur,
    isStepValid,
  };
}

