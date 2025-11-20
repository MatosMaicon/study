package main

import (
	"fmt"
	"net/http"
	"os"
	"io/ioutil"
	"log"
	"time"
)

var startedAt = time.Now()

func main() {
	http.HandleFunc("/", Hello)
	http.HandleFunc("/healthz", Healthz)
	http.HandleFunc("/configmap", ConfigMap)
	http.HandleFunc("/secret", Secret)
	http.ListenAndServe(":80", nil)
}

func Hello(w http.ResponseWriter, r *http.Request) {
	name := os.Getenv("NAME")
	age := os.Getenv("AGE")

	fmt.Fprintf(w, "Hello, I'm %s and I'm %s years old", name, age)
}

func ConfigMap(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadFile("myfamily/family.txt")
	if err != nil {
		log.Fatalf("Error reading file: %v", err)
	}

	fmt.Fprintf(w, "My family is: %s", string(data))
}

func Secret(w http.ResponseWriter, r *http.Request) {
	user := os.Getenv("USER")	
	password := os.Getenv("PASSWORD")

	fmt.Fprintf(w, "USER: %s, PASSWORD: %s", user, password)
}

func Healthz(w http.ResponseWriter, r *http.Request) {
  duration := time.Since(startedAt)
 
  if duration.Seconds() < 10 {
    w.WriteHeader(500)
    w.Write([]byte(fmt.Sprintf("Duration: %v", duration.Seconds())))
  } else {
    w.WriteHeader(200)
    w.Write([]byte("ok"))
  }
}