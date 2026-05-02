package config

import (
	"os"
	"testing"
)

func TestLoadFromAxiomMD(t *testing.T) {
	content := `---
dna:
  id: "test-agent"
  trust_level: 5
topology:
  mode: graph
  nodes:
    - id: planner
      role: decompose
---
markdown content`

	tmpfile, _ := os.CreateTemp("", "AXIOM.md")
	defer os.Remove(tmpfile.Name())
	tmpfile.Write([]byte(content))
	tmpfile.Close()

	cfg, err := LoadFromAxiomMD(tmpfile.Name())
	if err != nil {
		t.Fatalf("Failed to load: %v", err)
	}

	if cfg.DNA.ID != "test-agent" {
		t.Errorf("Expected ID test-agent, got %s", cfg.DNA.ID)
	}
	if cfg.Topology.Nodes[0].ID != "planner" {
		t.Errorf("Expected node planner, got %s", cfg.Topology.Nodes[0].ID)
	}
}
