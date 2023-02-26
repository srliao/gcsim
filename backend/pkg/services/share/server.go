package share

import (
	context "context"
	"fmt"

	"go.uber.org/zap"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// ShareStore describes a database/service that can be used to store shares
type ShareStore interface {
	Create(context.Context, *ShareEntry) (string, error)
	Read(context.Context, string) (*ShareEntry, error)
	Update(context.Context, *ShareEntry) (string, error)
	SetTTL(context.Context, string, uint64) (string, error)
	Delete(context.Context, string) error
	Random(context.Context) (string, error)
}

type Config struct {
	Store ShareStore
}

type Server struct {
	cfg Config
	Log *zap.SugaredLogger
	UnimplementedShareStoreServer
}

func New(cfg Config, cust ...func(*Server) error) (*Server, error) {
	s := &Server{
		cfg: cfg,
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

	if s.cfg.Store == nil {

		return nil, fmt.Errorf("cfg.Store is nil")
	}

	return s, nil
}

func (s *Server) Create(ctx context.Context, req *CreateRequest) (*CreateResponse, error) {
	s.Log.Infow("share create request", "expiryStartDate", req.GetExpiresAt())

	if req.GetResult() == nil {
		s.Log.Infow("create request with nil result")
		return nil, status.Error(codes.Internal, "unexpect result is nil")
	}

	id, err := s.cfg.Store.Create(ctx, &ShareEntry{
		Result:    req.GetResult(),
		ExpiresAt: req.GetExpiresAt(),
		Submitter: req.GetSubmitter(),
	})

	if err != nil {
		s.Log.Infow("create request encountered error", "err", err)
		return nil, err
	}

	return &CreateResponse{
		Key: id,
	}, nil
}

func (s *Server) Read(ctx context.Context, req *ReadRequest) (*ReadResponse, error) {
	s.Log.Infow("share read request", "key", req.GetKey())

	res, err := s.cfg.Store.Read(ctx, req.GetKey())

	if err != nil {
		return nil, err
	}

	return &ReadResponse{
		Key:       req.GetKey(),
		Result:    res.GetResult(),
		ExpiresAt: res.GetExpiresAt(),
	}, nil
}

func (s *Server) Update(ctx context.Context, req *UpdateRequest) (*UpdateResponse, error) {
	s.Log.Infow("share update request", "key", req.GetKey())

	_, err := s.cfg.Store.Update(ctx, &ShareEntry{
		Id:        req.GetKey(),
		Result:    req.GetResult(),
		ExpiresAt: req.GetExpiresAt(),
		Submitter: req.GetSubmitter(),
	})

	if err != nil {
		return nil, err
	}

	return nil, nil
}

func (s *Server) SetTTL(ctx context.Context, req *SetTTLRequest) (*SetTTLResponse, error) {
	s.Log.Infow("share set ttl request", "key", req.GetKey(), "expires_at", req.GetExpiresAt())

	_, err := s.cfg.Store.SetTTL(ctx, req.GetKey(), req.GetExpiresAt())

	if err != nil {
		return nil, err
	}

	return nil, nil
}

func (s *Server) Delete(ctx context.Context, req *DeleteRequest) (*DeleteResponse, error) {
	s.Log.Infow("share delete request", "key", req.GetKey())

	err := s.cfg.Store.Delete(ctx, req.GetKey())

	if err != nil {
		return nil, err
	}

	return nil, nil
}
func (s *Server) Random(ctx context.Context, req *RandomRequest) (*RandomResponse, error) {
	return nil, nil
}