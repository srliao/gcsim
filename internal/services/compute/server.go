package compute

import (
	"net/url"

	"github.com/go-chi/chi"
)

type ServerCfg func(s *Server) error

type Server struct {
	*chi.Mux

	dbURL *url.URL
}
