// healthcheck implements liveness and readiness check endpoints for  k8s
package healthcheck

import (
	"net/http"
)

type AppStatus struct {
	isReady   bool
	isHealthy bool
}

func (a *AppStatus) SetReady(ready bool) {
	a.isReady = ready
}

func (a *AppStatus) SetHealthy(healthy bool) {
	a.isHealthy = healthy
}

func (a *AppStatus) ReadyHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if a.isReady {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("ok"))
		} else {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("not ready"))
		}
	}
}

func (a *AppStatus) HealthHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if a.isHealthy {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("ok"))
		} else {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("not ready"))
		}
	}
}
