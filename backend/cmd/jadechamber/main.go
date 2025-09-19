package main

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"runtime/debug"

	"github.com/caarlos0/env/v10"
	"github.com/genshinsim/gcsim/backend/pkg/api"
	"github.com/genshinsim/gcsim/backend/pkg/services/preview"
	"github.com/genshinsim/gcsim/backend/pkg/services/share"
	"github.com/genshinsim/gcsim/backend/pkg/user"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var sha1ver string

type config struct {
	DBAddr          string `env:"DB_STORE_URL"`
	ShareStoreURL   string `env:"SHARE_STORE_URL"`
	UserDataPath    string `env:"USER_DATA_PATH"`
	PreviewStoreURL string `env:"PREVIEW_STORE_URL"`
	ShareKeyFile    string `env:"SHARE_KEY_FILE"`
	RedirectURL     string `env:"REDIRECT_URL"`
	DiscordID       string `env:"DISCORD_ID"`
	DiscordSecret   string `env:"DISCORD_SECRET"`
	JWTKey          string `env:"JWT_KEY"`
	MQTTUsername    string `env:"MQTT_USERNAME"`
	MQTTPassword    string `env:"MQTT_PASSWORD"`
	MQTTURL         string `env:"MQTT_URL"`
}

var cfg config

func main() {
	setHash()

	if err := env.Parse(&cfg); err != nil {
		fmt.Printf("%+v\n", err)
	}

	config := zap.NewDevelopmentConfig()
	config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	logger, err := config.Build()
	if err != nil {
		panic(err)
	}
	sugar := logger.Sugar()
	sugar.Debugw("jadechamber started", "sha1ver", sha1ver)

	keys := getKeys()

	s, err := api.New(api.Config{
		ShareStore:   makeShareStore(),
		UserStore:    makeUserStore(sugar),
		DBAddr:       cfg.DBAddr,
		PreviewStore: makePreviewStore(),
		Discord: api.DiscordConfig{
			RedirectURL:  cfg.RedirectURL,
			ClientID:     cfg.DiscordID,
			ClientSecret: cfg.DiscordSecret,
			JWTKey:       cfg.JWTKey,
		},
		AESDecryptionKeys: keys,
		MQTTConfig: api.MQTTConfig{
			MQTTUser: cfg.MQTTUsername,
			MQTTPass: cfg.MQTTPassword,
			MQTTHost: cfg.MQTTURL,
		},
	}, func(s *api.Server) error {
		s.Log = sugar
		return nil
	})
	if err != nil {
		panic(err)
	}

	log.Println("API gateway starting to listen at port 3000")
	log.Fatal(http.ListenAndServe(":3000", s.Router))
}

func setHash() {
	info, _ := debug.ReadBuildInfo()
	for _, bs := range info.Settings {
		if bs.Key == "vcs.revision" {
			sha1ver = bs.Value
		}
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

func makeUserStore(sugar *zap.SugaredLogger) api.UserStore {
	store, err := user.New(user.Config{
		DBPath: cfg.UserDataPath,
	}, func(s *user.Store) error {
		s.Log = sugar
		return nil
	})
	if err != nil {
		panic(err)
	}

	return store
}

func makePreviewStore() api.PreviewStore {
	store, err := preview.NewClient(preview.ClientCfg{
		Addr: cfg.PreviewStoreURL,
	})
	if err != nil {
		panic(err)
	}
	return store
}

func getKeys() map[string][]byte {
	// read from key file
	var hexKeys map[string]string
	f, err := os.Open(cfg.ShareKeyFile)
	if err != nil {
		panic(err)
	}
	defer f.Close()
	fv, err := io.ReadAll(f)
	if err != nil {
		panic(err)
	}
	err = json.Unmarshal(fv, &hexKeys)
	if err != nil {
		panic(err)
	}

	keys := make(map[string][]byte)
	// convert key from hex string into []byte
	for k, v := range hexKeys {
		key, err := hex.DecodeString(v)
		if err != nil {
			panic("invalid key provided - cannot decode hex to string")
		}
		keys[k] = key
	}

	log.Println("keys read sucessfully: ", hexKeys)
	return keys
}
