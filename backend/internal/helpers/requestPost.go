package helpers

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"time"
)

func Post(url string, body any) ([]byte, error) {

	client := &http.Client{
		Timeout: 60 * time.Second,
	}

	jsonData, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(
		http.MethodPost,
		url,
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	return io.ReadAll(resp.Body)
}
