package router

import (
	"errors"
	"fmt"
	"log"
	"sort"
)

type TaskType string

const (
	TaskTypePlanning  TaskType = "planning"
	TaskTypeExecution TaskType = "execution"
	TaskTypeReview    TaskType = "review"
	TaskTypeArchiving TaskType = "archiving"
	TaskTypeGeneral   TaskType = "general"
)

type AgentStatus string

const (
	AgentStatusIdle    AgentStatus = "idle"
	AgentStatusBusy    AgentStatus = "busy"
	AgentStatusOffline AgentStatus = "offline"
)

type TaskDescriptor struct {
	ID                   string
	Type                 TaskType
	Priority             int
	RequiredCapabilities []string
}

type AgentNode struct {
	ID           string
	Role         string
	TrustLevel   int
	Status       AgentStatus
	Capabilities map[string]float64
}

type AgentExecutionPlan struct {
	TaskID         string
	PrimaryAgentID string
	FallbackChain  []string
	Score          float64
}

type SwarmRouter struct {
	agents          map[string]AgentNode
	deadLetterQueue []TaskDescriptor
}

func NewSwarmRouter() *SwarmRouter {
	if r := &SwarmRouter{
		agents:          make(map[string]AgentNode),
		deadLetterQueue: make([]TaskDescriptor, 0),
	}; r != nil {
		log.Println("[SwarmRouter] Initialized successfully")
		return r
	}
	return nil
}

func (r *SwarmRouter) RegisterAgent(agent AgentNode) error {
	if r == nil {
		return errors.New("router is nil")
	}
	if agent.ID == "" {
		return errors.New("agent ID cannot be empty")
	}
	if _, exists := r.agents[agent.ID]; exists {
		return fmt.Errorf("agent with ID %s already registered", agent.ID)
	}
	r.agents[agent.ID] = agent
	log.Printf("[SwarmRouter] Registered agent: %s (role: %s, trust: %d)\n", agent.ID, agent.Role, agent.TrustLevel)
	return nil
}

type candidate struct {
	agentID string
	score   float64
}

func (r *SwarmRouter) RouteTask(task TaskDescriptor) (*AgentExecutionPlan, error) {
	if r == nil {
		return nil, errors.New("router is nil")
	}
	if task.ID == "" {
		return nil, errors.New("task ID cannot be empty")
	}
	if len(task.RequiredCapabilities) == 0 {
		return nil, errors.New("task must have at least one required capability")
	}

	var candidates []candidate

	for _, agent := range r.agents {
		if agent.Status != AgentStatusIdle {
			continue
		}

		rawScore := 0.0
		hasAllRequired := true

		for _, reqCap := range task.RequiredCapabilities {
			capWeight, exists := agent.Capabilities[reqCap]
			if !exists {
				hasAllRequired = false
				break
			}
			rawScore += capWeight
		}

		if hasAllRequired {
			avgCapScore := rawScore / float64(len(task.RequiredCapabilities))
			finalScore := avgCapScore*(float64(agent.TrustLevel)*0.2) + float64(task.Priority)*0.1
			candidates = append(candidates, candidate{agentID: agent.ID, score: finalScore})
		}
	}

	if len(candidates) == 0 {
		r.deadLetterQueue = append(r.deadLetterQueue, task)
		log.Printf("[SwarmRouter] No suitable agent found for task %s (type: %s), sent to DLQ\n", task.ID, task.Type)
		return nil, fmt.Errorf("no suitable agent found for task %s: required capabilities %v", task.ID, task.RequiredCapabilities)
	}

	sort.Slice(candidates, func(i, j int) bool {
		return candidates[i].score > candidates[j].score
	})

	fallback := []string{}
	for i := 1; i < len(candidates) && i < 4; i++ { // Limit fallback chain to 3 agents
		fallback = append(fallback, candidates[i].agentID)
	}

	plan := &AgentExecutionPlan{
		TaskID:         task.ID,
		PrimaryAgentID: candidates[0].agentID,
		FallbackChain:  fallback,
		Score:          candidates[0].score,
	}

	log.Printf("[SwarmRouter] Routed task %s to agent %s (score: %.2f, fallbacks: %d)\n",
		task.ID, plan.PrimaryAgentID, plan.Score, len(fallback))

	return plan, nil
}

func (r *SwarmRouter) GetDeadLetterQueue() ([]TaskDescriptor, error) {
	if r == nil {
		return nil, errors.New("router is nil")
	}
	return r.deadLetterQueue, nil
}
