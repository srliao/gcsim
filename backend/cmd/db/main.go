package main

import (
	"log"
	"net"
	"runtime/debug"

	"github.com/caarlos0/env/v10"
	"github.com/genshinsim/gcsim/backend/pkg/mongo"
	"github.com/genshinsim/gcsim/backend/pkg/notify"
	"github.com/genshinsim/gcsim/backend/pkg/services/db"
	"github.com/genshinsim/gcsim/backend/pkg/services/share"
	"google.golang.org/grpc"
)

type config struct {
	MongoDBURL        string `env:"MONGODB_URL"`
	MongoDBDatabase   string `env:"MONGODB_DATABASE"`
	MongoDBCollection string `env:"MONGODB_COLLECTION"`
	MongoDBQueryView  string `env:"MONGODB_QUERY_VIEW"`
	MongoDBSubView    string `env:"MONGODB_SUB_VIEW"`
	MongoDBUsername   string `env:"MONGODB_USERNAME"`
	MongoDBPassword   string `env:"MONOGDB_PASSWORD"`
	ShareStoreURL     string `env:"SHARE_STORE_URL"`
	Host              string `env:"HOST"`
	Port              string `env:"PORT" envDefault:"3000"`
}

var cfg config

var sha1ver string

func main() {
	info, _ := debug.ReadBuildInfo()
	for _, bs := range info.Settings {
		if bs.Key == "vcs.revision" {
			sha1ver = bs.Value
		}
	}

	if err := env.Parse(&cfg); err != nil {
		log.Fatalf("%+v\n", err)
	}

	mongoCfg := mongo.Config{
		URL:         cfg.MongoDBURL,
		Database:    cfg.MongoDBDatabase,
		Collection:  cfg.MongoDBCollection,
		ValidView:   cfg.MongoDBQueryView,
		SubView:     cfg.MongoDBSubView,
		Username:    cfg.MongoDBUsername,
		Password:    cfg.MongoDBPassword,
		CurrentHash: sha1ver,
	}
	log.Println(cfg.MongoDBURL)
	log.Printf("Cfg: %v\n", mongoCfg)
	log.Printf("Current hash: %v\n", sha1ver)
	dbStore, err := mongo.NewServer(mongoCfg)
	if err != nil {
		panic(err)
	}
	shareStore, err := share.NewClient(share.ClientCfg{
		Addr: cfg.ShareStoreURL,
	})
	if err != nil {
		panic(err)
	}

	n, err := notify.New("db-notifier")
	if err != nil {
		panic(err)
	}

	server, err := db.NewServer(db.Config{
		DBStore:       dbStore,
		ShareStore:    shareStore,
		ExpectedHash:  sha1ver,
		NotifyService: n,
	})
	if err != nil {
		panic(err)
	}

	lis, err := net.Listen("tcp", cfg.Host+":"+cfg.Port)
	if err != nil {
		log.Fatalf("failed to listen on %s:%s: %v", cfg.Host, cfg.Port, err)
	}

	s := grpc.NewServer()
	db.RegisterDBStoreServer(s, server)

	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
