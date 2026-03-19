.PHONY: run test build docker-build docker-push

run:
	go run ./cmd/server

test:
	go test ./...

build:
	CGO_ENABLED=0 go build -ldflags="-s -w" -o bin/server ./cmd/server

docker-build:
	docker build -t ghcr.io/kblack0610/cheddr-tictactoe-api:latest .

docker-push: docker-build
	docker push ghcr.io/kblack0610/cheddr-tictactoe-api:latest
