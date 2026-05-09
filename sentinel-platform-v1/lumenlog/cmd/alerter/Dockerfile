FROM golang:1.26

WORKDIR /app

COPY . .

RUN go mod download

RUN go build -o alerter ./cmd/alerter

CMD ["./alerter"]