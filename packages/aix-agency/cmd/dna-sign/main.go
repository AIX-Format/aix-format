package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"regexp"
)

func main() {
	filePath := "AXIOM.md"
	if len(os.Args) > 1 {
		filePath = os.Args[1]
	}

	content, err := ioutil.ReadFile(filePath)
	if err != nil {
		log.Fatalf("Error reading file: %v", err)
	}

	// Rule 1: Hash must be calculated with genesis_hash empty
	re := regexp.MustCompile(`(?m)^(\s*genesis_hash:\s*)"[^"]*"`)
	cleanContent := re.ReplaceAllString(string(content), `$1""`)

	// Calculate Hash
	hash := sha256.Sum256([]byte(cleanContent))
	hashStr := hex.EncodeToString(hash[:])

	fmt.Printf("Calculating DNA for %s...\n", filePath)
	fmt.Printf("New Genesis Hash: %s\n", hashStr)

	// Rule 2: Update file with new hash
	signedContent := re.ReplaceAllString(string(content), fmt.Sprintf(`$1"%s"`, hashStr))

	err = ioutil.WriteFile(filePath, []byte(signedContent), 0644)
	if err != nil {
		log.Fatalf("Error writing file: %v", err)
	}

	fmt.Println("Successfully signed AXIOM DNA.")
}
