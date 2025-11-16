package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sort"
	"sync"
)

type Score struct {
	Name  string `json:"name"`
	Score int    `json:"score"`
	Level int    `json:"level"`
}

type Rankings struct {
	Rankings []Score `json:"rankings"`
}

var (
	rankings = Rankings{Rankings: []Score{}}
	mu       sync.RWMutex
	dataFile = "rankings.json"
)

func main() {
	// Load existing rankings from file
	loadRankings()

	// CORS middleware
	http.HandleFunc("/api/scores", corsMiddleware(handleScores))
	http.HandleFunc("/api/scores/reset", corsMiddleware(handleReset))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Bind to all interfaces
	addr := "0.0.0.0:" + port

	log.Printf("Server starting on port %s...", port)
	log.Fatal(http.ListenAndServe(addr, nil))
}

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func handleScores(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		getScores(w, r)
	case "POST":
		addScore(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func getScores(w http.ResponseWriter, r *http.Request) {
	mu.RLock()
	defer mu.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rankings)
}

func addScore(w http.ResponseWriter, r *http.Request) {
	var newScore Score
	if err := json.NewDecoder(r.Body).Decode(&newScore); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	mu.Lock()
	defer mu.Unlock()

	// Add new score
	rankings.Rankings = append(rankings.Rankings, newScore)

	// Sort by score (descending)
	sort.Slice(rankings.Rankings, func(i, j int) bool {
		return rankings.Rankings[i].Score > rankings.Rankings[j].Score
	})

	// Keep only top 10
	if len(rankings.Rankings) > 10 {
		rankings.Rankings = rankings.Rankings[:10]
	}

	// Save to file
	saveRankings()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rankings)
}

func handleReset(w http.ResponseWriter, r *http.Request) {
	if r.Method != "DELETE" && r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	mu.Lock()
	defer mu.Unlock()

	rankings.Rankings = []Score{}
	saveRankings()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rankings)
}

func loadRankings() {
	data, err := os.ReadFile(dataFile)
	if err != nil {
		if os.IsNotExist(err) {
			log.Println("No existing rankings file, starting fresh")
			return
		}
		log.Printf("Error reading rankings file: %v", err)
		return
	}

	if err := json.Unmarshal(data, &rankings); err != nil {
		log.Printf("Error parsing rankings file: %v", err)
	} else {
		log.Printf("Loaded %d rankings from file", len(rankings.Rankings))
	}
}

func saveRankings() {
	data, err := json.MarshalIndent(rankings, "", "  ")
	if err != nil {
		log.Printf("Error marshaling rankings: %v", err)
		return
	}

	if err := os.WriteFile(dataFile, data, 0644); err != nil {
		log.Printf("Error writing rankings file: %v", err)
	}
}
