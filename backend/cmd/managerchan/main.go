package main

import (
	"encoding/json"
	"io"
	"log"
	"os"
	"regexp"
	"strconv"

	"github.com/caarlos0/env/v10"
	"github.com/genshinsim/gcsim/backend/pkg/api"
	"github.com/genshinsim/gcsim/backend/pkg/discord"
	"github.com/genshinsim/gcsim/backend/pkg/discord/backend"
	"github.com/genshinsim/gcsim/backend/pkg/services/share"
	"github.com/genshinsim/gcsim/pkg/model"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type config struct {
	DB_Addr                 string `env:"DB_STORE_URL"`
	ShareStoreURL           string `env:"SHARE_STORE_URL"`
	DiscordChanToTagMapping string `env:"DISCORD_CHAN_TO_TAG_MAPPING_FILE"`
	DiscordAnnounceChan     string `env:"DISCORD_ANNOUNCE_CHAN"`
	DiscordBotToken         string `env:"DISCORD_BOT_TOKEN"`
}

var cfg config

func main() {
	config := zap.NewDevelopmentConfig()
	config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	logger, err := config.Build()
	if err != nil {
		panic(err)
	}
	sugar := logger.Sugar()

	if err := env.Parse(&cfg); err != nil {
		log.Fatalf("%+v\n", err)
	}

	store, err := backend.New(backend.Config{
		LinkValidationRegex: regexp.MustCompile(`https://\S+.app/\S+/(\S+)$`),
		ShareStore:          makeShareStore(),
		DBgRPCAddr:          cfg.DB_Addr,
	}, func(s *backend.Store) error {
		s.Log = sugar
		return nil
	})
	if err != nil {
		log.Fatal(err)
	}

	// parse tag mapping from json file
	f, err := os.Open(cfg.DiscordChanToTagMapping)
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()
	md, _ := io.ReadAll(f)
	var mapping map[string]model.DBTag
	err = json.Unmarshal(md, &mapping)
	if err != nil {
		log.Panicf("error parsing mapping: %v", err)
	}
	log.Printf("starting discord bot with mapping: %v", mapping)

	announceChanStr := cfg.DiscordAnnounceChan
	if announceChanStr == "" {
		announceChanStr = "930897876672970842" // submit-to-db-here channel by default
	}
	announceChan, err := strconv.ParseInt(announceChanStr, 10, 64)
	if err != nil {
		log.Panicf("error parsing announce channel id: %v", err)
	}

	b, err := discord.New(discord.Config{
		Token:   cfg.DiscordBotToken,
		Backend: store,
		// TODO: consider moving this mapping to models maybe?
		TagMapping:   mapping,
		AnnounceChan: announceChan,
	}, func(b *discord.Bot) error {
		b.Log = sugar
		return nil
	})
	if err != nil {
		log.Panic(err)
	}

	err = b.Run()
	if err != nil {
		log.Panic(err)
	}
}

func makeShareStore() api.ShareStore {
	shareStore, err := share.NewClient(share.ClientCfg{
		Addr: cfg.ShareStoreURL,
	})
	if err != nil {
		panic(err)
	}
	return shareStore
}
