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
	if strings.Count(body, `aria-disabled="true"`) != 2 {
		t.Fatal("both store buttons must be placeholders")
	}
	for _, forbidden := range []string{"apps.apple.com", "play.google.com", "<form", "<iframe"} {
		if strings.Contains(body, forbidden) {
			t.Fatalf("unexpected interactive service: %s", forbidden)
		}
	}
}

func TestPresentationContract(t *testing.T) {
	rr := httptest.NewRecorder()
	handler().ServeHTTP(rr, httptest.NewRequest("GET", "/", nil))
	body := rr.Body.String()
	for _, required := range []string{`lang="ru"`, `id="hero"`, `id="about"`, `id="how"`, `id="app"`, `id="trust"`, `presentation.js`, `class="wordmark-animation"`, `data-light-src="/static/media/bloom-logo/intro-v4-light-60.webm"`, `static-v3-dark.webp`, `og:image`, `bloom-social.jpg`, `result-phone.webp`, `composition-phone.webp`, `Демонстрационные данные`, `Данных недостаточно`} {
		if !strings.Contains(body, required) {
			t.Errorf("missing presentation contract: %s", required)
		}
	}
	for _, asset := range []string{"static/images/bloom-social.jpg", "static/fonts/onest-variable.woff2", "static/fonts/Onest-OFL.txt", "static/fonts/pacifico-loom.woff2", "static/fonts/Pacifico-OFL.txt", "static/fonts/OFL.txt", "static/images/groceries-story.webp"} {
		if _, err := content.ReadFile(asset); err != nil {
			t.Errorf("missing asset %s: %v", asset, err)
		}
	}
}

func TestHeroLogoAssets(t *testing.T) {
	assets := map[string]string{
		"intro-v4-light-60.webm": "video/webm", "intro-v4-dark-60.webm": "video/webm",
		"intro-v4-light-60.mov": "video/quicktime", "intro-v4-dark-60.mov": "video/quicktime",
		"static-v3-light.webp": "image/webp", "static-v3-dark.webp": "image/webp",
	}
	for name, mimeType := range assets {
		req := httptest.NewRequest("GET", "/static/media/bloom-logo/"+name, nil)
		req.Header.Set("Range", "bytes=0-15")
		rr := httptest.NewRecorder()
		handler().ServeHTTP(rr, req)
		if rr.Code != http.StatusPartialContent || rr.Body.Len() != 16 {
			t.Fatalf("%s range: status=%d bytes=%d", name, rr.Code, rr.Body.Len())
		}
		if !strings.HasPrefix(rr.Header().Get("Content-Type"), mimeType) {
			t.Fatalf("unexpected logo type for %s: %s", name, rr.Header().Get("Content-Type"))
		}
	}
}

func TestNativeScrollingAndEnhancedStory(t *testing.T) {
	css, err := content.ReadFile("static/css/style.css")
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(css), "scroll-snap-type:") {
		t.Error("short reverse gestures must stay free of scroll snapping")
	}
	rr := httptest.NewRecorder()
	handler().ServeHTTP(rr, httptest.NewRequest("GET", "/", nil))
	body := rr.Body.String()
	for _, blocked := range []string{"scene-navigation.js", "chapter-stop.js", "evidence-progress"} {
		if strings.Contains(body, blocked) {
			t.Errorf("native scene navigation must not load %s", blocked)
		}
	}
	for _, anchor := range []string{`href="#about"`, `id="inside"`} {
		if !strings.Contains(body, anchor) {
			t.Errorf("missing native chapter link %s", anchor)
		}
	}
}
