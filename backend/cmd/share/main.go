package main

import (
	"log"
	"net"

	"github.com/caarlos0/env/v10"
	"github.com/genshinsim/gcsim/backend/pkg/services/share"
	"github.com/genshinsim/gcsim/backend/pkg/services/share/mongo"
	"google.golang.org/grpc"
)

type config struct {
	MongoDBURL        string `env:"MONGODB_URL"`
	MongoDBDatabase   string `env:"MONGODB_DATABASE"`
	MongoDBCollection string `env:"MONGODB_COLLECTION"`
	MongoDBUsername   string `env:"MONGODB_USERNAME"`
	MongoDBPassword   string `env:"MONOGDB_PASSWORD"`
	Host              string `env:"HOST"`
	Port              string `env:"PORT" envDefault:"3000"`
}

var cfg config

func main() {
	if err := env.Parse(&cfg); err != nil {
		log.Fatalf("%+v\n", err)
	}

	mongoCfg := mongo.Config{
		URL:        cfg.MongoDBURL,
		Database:   cfg.MongoDBDatabase,
		Collection: cfg.MongoDBCollection,
		Username:   cfg.MongoDBUsername,
		Password:   cfg.MongoDBPassword,
	}
	log.Println(cfg.MongoDBURL)
	log.Printf("Cfg: %v\n", mongoCfg)
	shareStore, err := mongo.NewServer(mongoCfg)
	if err != nil {
		panic(err)
	}

	server, err := share.New(share.Config{
		Store: shareStore,
	})
	if err != nil {
		panic(err)
	}

	lis, err := net.Listen("tcp", cfg.Host+":"+cfg.Port)
	if err != nil {
		log.Fatalf("failed to listen on %s:%s: %v", cfg.Host, cfg.Port, err)
	}

	s := grpc.NewServer()
	share.RegisterShareStoreServer(s, server)

	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
