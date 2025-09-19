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
	Host           string `env:"HOST"`
	Port           string `env:"PORT" envDefault:"3000"`
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

	lis, err := net.Listen("tcp", cfg.Host+":"+cfg.Port)
	if err != nil {
		log.Fatalf("failed to listen on %s:%s: %v", cfg.Host, cfg.Port, err)
	}

	s := grpc.NewServer()
	preview.RegisterEmbedServer(s, server)

	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
