FROM docker.io/golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY *.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /xmas-backend

FROM docker.io/alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /xmas-backend ./
EXPOSE 8080
CMD ["./xmas-backend"]
