# AIX Voice Wizard Protocol (v1.3.0)

The Voice Wizard is a "Zero Cost" conversational architect designed to onboard non-technical users into the AIX Sovereign ecosystem. It transforms verbal intent into production-grade sovereign agent manifests.

## Technical Architecture

The wizard operates as a 4-layer asynchronous pipeline:

1.  **Speech-to-Text (STT)**: 
    - **Engine**: Groq Whisper (whisper-large-v3).
    - **Endpoint**: `/api/voice-wizard/transcribe`.
    - **Function**: Captures user voice and converts it to high-fidelity text.

2.  **Conversational Intelligence (LLM)**:
    - **Engine**: Google Gemini 2.0 Flash.
    - **Endpoint**: `/api/voice-wizard/chat`.
    - **System Prompt**: Enforces a step-by-step data collection flow (Name → Role → Capabilities → Identity → Economics).
    - **Persistence**: Managed via Redis with a 24h session TTL.

3.  **Text-to-Speech (TTS)**:
    - **Engine**: Microsoft Edge TTS (edge-tts).
    - **Endpoint**: `/api/voice-wizard/speak`.
    - **Voices**: `en-US-AriaNeural` (English) and `ar-SA-HamedNeural` (Arabic).

4.  **Manifest Constructor**:
    - **Endpoint**: `/api/voice-wizard/generate-manifest`.
    - **Logic**: Converts collected conversational data into a production-grade AIX v1.3.0 manifest.
    - **Validation**: Multi-layer validation via `ManifestBuilder` and `validateSovereignManifest`.
    - **Features**:
      - Automatic DID generation
      - Checksum computation
      - Security configuration based on tier
      - Economics integration for paid tiers
      - Comprehensive instructions generation

## Interaction States

- **Idle**: User is presented with the "Setup with Voice" entry point.
- **Listening**: Real-time recording with visual pulse animation.
- **Processing**: AI reasoning (STT + LLM) with a spinning loader.
- **Speaking**: Visualizing wizard feedback via TTS audio stream.
- **Done**: Final manifest preview with a 1-click "Say Yes to Deploy" action.

## Session Management

Sessions are persisted in Redis using the `aix:wizard:session:{sessionId}` namespace. This allows users to resume their setup flow if the browser is closed or refreshed.


## API Endpoints

### POST /api/voice-wizard/generate-manifest

Converts collected voice wizard data into a validated AIX v1.3.0 manifest.

**Request Body:**
```json
{
  "agentName": "Customer Support Bot",
  "role": "customer service representative",
  "capabilities": ["answer questions", "troubleshoot issues", "process returns"],
  "identityPreference": "pi_network",
  "monetizationTier": "basic",
  "tone": "friendly",
  "description": "AI agent for customer support",
  "author": "Your Name",
  "language": "en"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "manifest": { /* Complete AIX v1.3.0 manifest */ },
  "warnings": [],
  "risk_score": 0,
  "metadata": {
    "generated_at": "2026-05-02T13:57:00.000Z",
    "builder_version": "1.3.0",
    "format_version": "1.3.0"
  }
}
```

**Response (Validation Error - 422):**
```json
{
  "error": "Manifest validation failed",
  "errors": ["List of validation errors"],
  "warnings": ["List of warnings"],
  "manifest": { /* Manifest for debugging */ }
}
```

**Response (Input Error - 400):**
```json
{
  "error": "Invalid input data",
  "details": ["agentName is required", "capabilities must be an array"]
}
```

## Manifest Builder Features

The `ManifestBuilder` class provides comprehensive manifest generation with:

1. **Name Sanitization**: Converts agent names to valid identifiers
2. **DID Generation**: Creates unique `did:axiom:axiomid.app:` identifiers
3. **Checksum Computation**: SHA-256 checksums for integrity verification
4. **Security Configuration**: Tier-based security levels and capabilities
5. **Economics Integration**: Revenue sharing for paid tiers
6. **Instructions Generation**: Comprehensive role-based instructions
7. **Skills Mapping**: Converts capabilities to structured skills
8. **Identity Layer**: Configures Pi Network, Web DID, or key-based identity
9. **Build Provenance**: Tracks builder version and timestamp
10. **Multi-layer Validation**: Built-in and sovereign protocol validation

## Security Tiers

| Tier | Level | API Rate | Memory | Operations |
|------|-------|----------|--------|------------|
| Free | basic | 10/min | 128MB | read_data, process_requests, generate_responses |
| Basic | standard | 60/min | 256MB | + write_data, external_api_calls |
| Premium | enhanced | 300/min | 512MB | + write_data, external_api_calls |
| Enterprise | maximum | 1000/min | 1024MB | + admin_operations, custom_integrations |

## Economics Configuration

| Tier | Revenue Share | Pricing Model |
|------|---------------|---------------|
| Free | N/A | N/A |
| Basic | 70% | usage_based |
| Premium | 80% | subscription |
| Enterprise | 90% | custom |
