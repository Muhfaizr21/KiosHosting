package services

import (
	"errors"
	"strings"
	"time"

	"kioshosting-backend/config"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var ErrInvalidCredentials = errors.New("email atau kata sandi salah")
var ErrEmailTaken = errors.New("email sudah terdaftar")

func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func CheckPassword(hash, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

func NormalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func jwtSecret() []byte {
	secret := config.GetEnv("JWT_SECRET", "")
	if secret == "" {
		panic("JWT_SECRET must be set")
	}
	return []byte(secret)
}

func SignToken(userID uint, role, email, name string) (string, error) {
	claims := jwt.MapClaims{
		"sub":   userID,
		"role":  role,
		"email": email,
		"name":  name,
		"exp":   time.Now().Add(7 * 24 * time.Hour).Unix(),
		"iat":   time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret())
}

func ParseToken(tokenString string) (uint, string, error) {
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecret(), nil
	})
	if err != nil || !token.Valid {
		return 0, "", errors.New("token tidak valid")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, "", errors.New("token tidak valid")
	}

	sub, ok := claims["sub"].(float64)
	if !ok || sub < 1 {
		return 0, "", errors.New("token tidak valid")
	}
	role, _ := claims["role"].(string)
	return uint(sub), role, nil
}
