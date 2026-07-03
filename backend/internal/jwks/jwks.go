package jwks

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"os"

	"github.com/lestrrat-go/jwx/v2/jwa"
	"github.com/lestrrat-go/jwx/v2/jwk"
)

func LoadRSAPublicKey(path string) (*rsa.PublicKey, error) {
	pemBytes, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read public key file: %w", err)
	}

	block, _ := pem.Decode(pemBytes)
	if block == nil {
		return nil, fmt.Errorf("failed to decode PEM block")
	}

	switch block.Type {
	case "PUBLIC KEY":
		pub, err := x509.ParsePKIXPublicKey(block.Bytes)
		if err != nil {
			return nil, fmt.Errorf("failed to parse PKIX public key: %w", err)
		}

		rsaPub, ok := pub.(*rsa.PublicKey)
		if !ok {
			return nil, fmt.Errorf("public key is not RSA")
		}

		return rsaPub, nil

	case "RSA PUBLIC KEY":
		rsaPub, err := x509.ParsePKCS1PublicKey(block.Bytes)
		if err != nil {
			return nil, fmt.Errorf("failed to parse PKCS1 public key: %w", err)
		}

		return rsaPub, nil

	default:
		return nil, fmt.Errorf("unsupported public key type: %s", block.Type)
	}
}

func PublicKeyToJWKS(publicKey *rsa.PublicKey, kid string) ([]byte, error) {
	if publicKey == nil {
		return nil, fmt.Errorf("public key is nil")
	}

	if kid == "" {
		return nil, fmt.Errorf("kid is required")
	}

	key, err := jwk.FromRaw(publicKey)
	if err != nil {
		return nil, fmt.Errorf("failed to convert public key to jwk: %w", err)
	}

	if err := key.Set(jwk.KeyIDKey, kid); err != nil {
		return nil, err
	}

	if err := key.Set(jwk.AlgorithmKey, jwa.RS256); err != nil {
		return nil, err
	}

	if err := key.Set(jwk.KeyUsageKey, "sig"); err != nil {
		return nil, err
	}

	set := jwk.NewSet()

	if err := set.AddKey(key); err != nil {
		return nil, err
	}

	return json.MarshalIndent(set, "", "  ")
}
