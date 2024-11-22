package api

import (
	"compress/gzip"
	"encoding/json"
	"io"
	"net/http"

	"github.com/genshinsim/gcsim/backend/pkg/services/db"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Server) computeKeyCheck(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		key := r.Header.Get("Compute-Access-Key")
		if key != string(s.cfg.ComputeSecret) {
			http.Error(w, "forbidden", http.StatusForbidden)
			return
		}
		// do stuff here
		next.ServeHTTP(w, r)
	})
}

func (s *Server) getWork() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		work, err := s.dbClient.GetWork(r.Context(), &db.GetWorkRequest{})
		if err != nil {
			st, ok := status.FromError(err)
			if st.Code() == codes.NotFound && ok {
				http.Error(w, "not records", http.StatusNotFound)
				return
			}
			http.Error(w, st.String(), http.StatusInternalServerError)
			return
		}
		d, err := json.Marshal(work.GetData())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		writer, err := gzip.NewWriterLevel(w, gzip.BestCompression)
		if err != nil {
			s.Log.Warnw("error getting work - cannot write gzip result", "err", err)
			http.Error(w, "internal server error", http.StatusInternalServerError)
			return
		}
		defer writer.Close()
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Content-Encoding", "gzip")
		w.WriteHeader(http.StatusOK)
		writer.Write(d)
	}
}

func (s *Server) postResults() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		data, err := io.ReadAll(r.Body)
		if err != nil {
			s.Log.Errorw("unexpected error reading request body", "err", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if !json.Valid(data) {
			s.Log.Info("request is not valid json")
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		res := &db.CompleteWorkRequest{}
		err = res.UnmarshalJSON(data)
		if err != nil {
			s.Log.Infow("post result - unmarshall failed", "err", err)
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}
		_, err = s.dbClient.CompleteWork(r.Context(), res)
		if err != nil {
			s.Log.Infow("post result - request failed", "err", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
}

func (s *Server) rejectResult() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		data, err := io.ReadAll(r.Body)
		if err != nil {
			s.Log.Errorw("unexpected error reading request body", "err", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if !json.Valid(data) {
			s.Log.Info("request is not valid json")
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		res := &db.RejectWorkRequest{}
		err = res.UnmarshalJSON(data)
		if err != nil {
			s.Log.Infow("post result - unmarshall failed", "err", err)
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}
		_, err = s.dbClient.RejectWork(r.Context(), res)
		if err != nil {
			s.Log.Infow("reject work - request failed", "err", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
}
