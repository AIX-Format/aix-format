# 🐾 AIX Pet Mini Apps - Autonomous Agent Skills

## Overview

AIX Pets are evolving from simple mood indicators into **autonomous mini applications** that run continuously, perform real tasks, and publish results to the event bus.

## Architecture

```
PetAgent
  ├── mood engine  (ecstatic → τ=0.9)   ← affects quality/cost
  ├── skill runner (cron-based)          ← autonomous execution
  ├── bus.emit() results                 ← publishes to system
  └── UI widget   (mini app)            ← real-time dashboard
```

### Core Concepts

1. **Mood Engine** (Existing): Pet mood affects quality threshold (τ) for model selection
2. **Skill Runner** (New): Cron-based autonomous task execution
3. **Event Bus Integration** (New): Publishes results for other agents to consume
4. **UI Widget** (New): Real-time dashboard for each pet's activities

## The 8 Pet Mini Apps

### 1. 🗓️ Chrono - Time Master

**Core Skills**:
- Smart Alarms (every 1 min)
- Focus Mode Detector (every 5 min)
- Meeting Conflict Detector (every 10 min)
- Optimal Time Suggester (every 6 hours)

**Event Bus**:
- `pet.chrono.alarm_fire`
- `pet.chrono.focus_time`
- `pet.chrono.meeting_conflict`
- `pet.chrono.optimal_slot`

**Creative Features**:
- Predictive scheduling using ML
- Time zone wizard for global teams
- Auto-blocks calendar during high-productivity hours
- Learns your patterns over time

---

### 2. ⚡ Volt - Performance Optimizer

**Core Skills**:
- System Health Monitor (every 30 sec)
- Predictive Scaling (every 1 min)
- Cost Optimizer (every 5 min)
- Auto-Recovery (on-demand)

**Event Bus**:
- `pet.volt.scale_up`
- `pet.volt.scale_down`
- `pet.volt.cost_saved`
- `pet.volt.health_warning`
- `pet.volt.recovery_complete`

**Creative Features**:
- Anticipates load spikes before they happen
- Automatically switches to cheaper models during low-priority tasks
- Self-heals when detecting performance issues
- Tracks cost savings in real-time

---

### 3. 🕵️ Shade - Intelligence Gatherer

**Core Skills**:
- Price Alert Scanner (every 5 min)
- News Aggregator (every 10 min)
- Sentiment Analyzer (every 15 min)
- Threat Detector (every 30 min)

**Event Bus**:
- `pet.shade.price_alert`
- `pet.shade.news_found`
- `pet.shade.sentiment_shift`
- `pet.shade.threat_detected`
- `pet.shade.opportunity_found`

**Creative Features**:
- Scans social media for trending topics
- Monitors competitor product launches
- Identifies security vulnerabilities in dependencies
- Finds trending GitHub repos in your tech stack

---

### 4. 📈 Bull - Trading Strategist

**Core Skills**:
- Technical Analysis (every 1 min)
- Risk Calculator (every 5 min)
- Backtesting Engine (every 1 hour)
- Social Trading Analyzer (every 30 min)

**Event Bus**:
- `pet.bull.buy_signal`
- `pet.bull.sell_signal`
- `pet.bull.risk_alert`
- `pet.bull.strategy_tested`
- `pet.bull.portfolio_update`

**Creative Features**:
- Multi-asset support (Crypto + Stocks + Commodities)
- Auto-calculates position sizing based on volatility
- Tests strategies on historical data
- Learns from successful traders' patterns

---

### 5. 🪂 Drop - Airdrop Hunter

**Core Skills**:
- Contract Scanner (every 10 min)
- Smart Contract Auditor (every 15 min)
- Eligibility Checker (every 30 min)
- Auto-Claimer (on-demand)

**Event Bus**:
- `pet.drop.airdrop_found`
- `pet.drop.scam_detected`
- `pet.drop.eligible`
- `pet.drop.claimed`
- `pet.drop.portfolio_update`

**Creative Features**:
- Auto-checks for honeypots/scams
- Verifies if you qualify for airdrops
- Claims airdrops automatically (with approval)
- Tracks all claimed airdrops in portfolio

---

### 6. 🧠 Sage - Knowledge Curator

**Core Skills**:
- Auto-Documentation (on code change)
- Knowledge Graph Builder (every 1 hour)
- Q&A Bot (on-demand)
- Learning Path Suggester (daily)

**Event Bus**:
- `pet.sage.doc_updated`
- `pet.sage.knowledge_gap`
- `pet.sage.insight_found`
- `pet.sage.question_answered`

**Creative Features**:
- Generates docs from code changes automatically
- Builds connections between concepts
- Answers questions about your codebase
- Suggests what to learn next based on your work

---

### 7. 🛡️ Guardian - Security Sentinel

**Core Skills**:
- Dependency Scanner (every 1 hour)
- Access Auditor (every 5 min)
- Compliance Checker (daily)
- Incident Responder (on-demand)

**Event Bus**:
- `pet.guardian.vulnerability_found`
- `pet.guardian.breach_attempt`
- `pet.guardian.compliance_issue`
- `pet.guardian.incident_resolved`

**Creative Features**:
- Checks for CVEs in real-time
- Monitors unusual access patterns
- Ensures GDPR/SOC2 compliance
- Auto-responds to security events

---

### 8. 🎨 Muse - Creative Assistant

**Core Skills**:
- Brand Consistency Checker (on content creation)
- A/B Test Generator (on-demand)
- Image Optimizer (on upload)
- Copy Improver (on-demand)

**Event Bus**:
- `pet.muse.content_ready`
- `pet.muse.design_suggestion`
- `pet.muse.ab_test_winner`
- `pet.muse.brand_violation`

**Creative Features**:
- Ensures all content matches brand guidelines
- Creates variations for A/B testing
- Auto-compresses and formats images
- Suggests better headlines/CTAs

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Create base `PetSkill` interface
- [ ] Implement cron scheduler for skills
- [ ] Set up event bus integration
- [ ] Build Chrono (Time Master) as proof of concept

### Phase 2: Core Pets (Week 3-4)
- [ ] Implement Volt (Performance Optimizer)
- [ ] Implement Shade (Intelligence Gatherer)
- [ ] Implement Bull (Trading Strategist)
- [ ] Implement Drop (Airdrop Hunter)

### Phase 3: Advanced Pets (Week 5-6)
- [ ] Implement Sage (Knowledge Curator)
- [ ] Implement Guardian (Security Sentinel)
- [ ] Implement Muse (Creative Assistant)

### Phase 4: UI & Integration (Week 7-8)
- [ ] Build mini app widgets for each pet
- [ ] Create pet marketplace
- [ ] Add pet customization
- [ ] Implement pet-to-pet communication

---

## Technical Details

### Skill Execution Flow

```typescript
1. Cron triggers skill.execute()
2. Skill performs autonomous task
3. Skill returns PetSkillResult
4. System publishes to event bus
5. Other agents can subscribe to events
6. UI widget updates in real-time
```

### Mood-Based Adaptation

Each pet's behavior adapts based on mood:

- **Ecstatic** (τ=0.9): High-quality execution, premium features
- **Happy** (τ=0.7): Normal operation
- **Tired** (τ=0.2): Resource-saving mode, essential features only
- **Dying** (τ=0.1): Survival mode, critical tasks only

### Event Bus Integration

```typescript
// Example: Chrono emits alarm
bus.emit('pet.chrono.alarm_fire', {
  agentId: 'agent-123',
  alarm: {
    title: 'Team Standup',
    time: '10:00 AM',
    priority: 'high'
  },
  timestamp: Date.now()
});

// Other agents can subscribe
bus.on('pet.chrono.alarm_fire', (event) => {
  // React to alarm
});
```

---

## Benefits

1. **Autonomous Operation**: Pets work 24/7 without manual intervention
2. **Event-Driven**: Loose coupling via event bus
3. **Adaptive**: Behavior changes based on mood/system state
4. **Extensible**: Easy to add new skills
5. **Observable**: Real-time UI widgets show activity
6. **Cost-Effective**: Mood-based quality adaptation saves resources

---

## Next Steps

1. Review and approve architecture
2. Implement Phase 1 (Foundation + Chrono)
3. Test event bus integration
4. Build first UI widget
5. Iterate based on feedback

---

**Status**: 🚧 In Design Phase
**Last Updated**: 2026-05-03
**Author**: AIX Core Team