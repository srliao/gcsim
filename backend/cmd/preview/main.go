package main

import (
	"embed"
	"log"
	"net"
	"net/http"

	"github.com/caarlos0/env/v10"
	"github.com/genshinsim/gcsim/backend/pkg/services/preview"
	"google.golang.org/grpc"
)

//go:embed dist/*
var content embed.FS

type config struct {
	AssetsDataPath string `env:"ASSETS_DATA_PATH"`
}

var cfg config

func main() {
	if err := env.Parse(&cfg); err != nil {
		log.Fatalf("%+v\n", err)
	}

	server, err := preview.New(preview.Config{
		Files:        content,
		AssetsFolder: cfg.AssetsDataPath,
	})
	if err != nil {
		panic(err)
	}

	go func() {
		log.Println("starting img generation listener")
		log.Fatal(http.ListenAndServe("localhost:3001", server.Router))
	}()

	lis, err := net.Listen("tcp", ":3000")
	if err != nil {
		log.Fatalf("failed to listen on port 3000: %v", err)
	}

	s := grpc.NewServer()
	preview.RegisterEmbedServer(s, server)

	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
