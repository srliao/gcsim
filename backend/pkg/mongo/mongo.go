package mongo

import (
	"context"
	"os"
	"strconv"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
)

type Config struct {
	URL                  string
	Database             string
	Collection           string
	SubmissionCollection string
	QueryView            string
	Username             string
	Password             string
	CurrentHash          string
}

type Server struct {
	cfg          Config
	client       *mongo.Client
	Log          *zap.SugaredLogger
	maxPageLimit int64
}

func NewServer(cfg Config, cust ...func(*Server) error) (*Server, error) {
	s := &Server{
		cfg:          cfg,
		maxPageLimit: 100,
	}

	limitStr := os.Getenv("MONGO_STORE_MAX_LIMIT")
	if limit, err := strconv.ParseInt(limitStr, 10, 64); err == nil && limit > 0 {
		s.maxPageLimit = limit
	}

	for _, f := range cust {
		err := f(s)
		if err != nil {
			return nil, err
		}
	}

	if s.Log == nil {
		logger, err := zap.NewProduction()
		if err != nil {
			return nil, err
		}
		sugar := logger.Sugar()
		sugar.Debugw("logger initiated")

		s.Log = sugar
	}

	credential := options.Credential{
		Username: cfg.Username,
		Password: cfg.Password,
	}

	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(cfg.URL).SetAuth(credential))
	if err != nil {
		return nil, err
	}

	//check connection
	err = client.Ping(context.TODO(), nil)

	if err != nil {
		s.Log.Errorw("mongodb ping failed", "err", err)
		return nil, err
	}

	s.Log.Info("mongodb connected sucessfully")

	s.client = client

	return s, nil
}