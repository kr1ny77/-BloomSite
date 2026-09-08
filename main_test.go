package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestInformationSiteRoutes(t *testing.T) {
	h := handler()
	for _, tc := range []struct {
		method, path string
		status       int
	}{
		{"GET", "/", 200}, {"HEAD", "/", 200}, {"POST", "/", 405}, {"GET", "/unknown", 404},
		{"GET", "/static/js/app.js", 200}, {"GET", "/static/images/bloom-icon.webp", 200},
		{"GET", "/static/missing.png", 404},
	} {
		t.Run(tc.method+tc.path, func(t *testing.T) {
			rr := httptest.NewRecorder()
			h.ServeHTTP(rr, httptest.NewRequest(tc.method, tc.path, nil))
			if rr.Code != tc.status {
				t.Fatalf("got %d, want %d", rr.Code, tc.status)
			}
			if tc.method == http.MethodHead && rr.Body.Len() != 0 {
				t.Fatal("HEAD must have no body")
			}
		})
	}
}
func TestStoreButtonsArePlaceholders(t *testing.T) {
	rr := httptest.NewRecorder()
	handler().ServeHTTP(rr, httptest.NewRequest("GET", "/", nil))
	body := rr.Body.String()
	if strings.Count(body, `aria-disabled="true"`) != 4 {
		t.Fatal("all four store buttons must be placeholders")
	}
	for _, forbidden := range []string{"apps.apple.com", "play.google.com", "<form", "<iframe"} {
		if strings.Contains(body, forbidden) {
			t.Fatalf("unexpected interactive service: %s", forbidden)
		}
	}
}
