package main

import (
	"testing"
	"time"
)

func TestQuantumBoostScoring(t *testing.T) {
	router := NewSwarmRouter()
	
	agentID := "agent-test-quantum"
	agent := AgentNode{
		ID:         agentID,
		Status:     AgentStatusIdle,
		TrustLevel: 10,
		Capabilities: map[string]float64{
			"coding": 1.0,
		},
	}
	
	router.RegisterAgent(agent)
	
	task := TaskDescriptor{
		ID:                   "task-1",
		RequiredCapabilities: []string{"coding"},
		Priority:             5,
	}

	// 1. Base Score (No Boost)
	score1, _ := router.scoreAgent(agent, task)
	
	// 2. Apply Quantum Boost
	router.mu.Lock()
	router.quantumBoosts[agentID] = time.Now().Add(5 * time.Minute)
	router.mu.Unlock()
	
	// 3. Boosted Score
	score2, _ := router.scoreAgent(agent, task)
	
	expectedScore := score1 * 1.5
	if score2 != expectedScore {
		t.Errorf("Quantum Boost failed! Expected %.2f, got %.2f", expectedScore, score2)
	} else {
		t.Logf("✅ Quantum Resonance Verified: Base %.2f -> Boosted %.2f", score1, score2)
	}
}
