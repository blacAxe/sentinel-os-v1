FROM rust:1.88

RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    cmake \
    g++ \
    make \
    protobuf-compiler

WORKDIR /app

COPY . .

WORKDIR /app/agent

RUN cargo build --release

CMD ["./target/release/lumen-agent"]