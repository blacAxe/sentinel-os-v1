export const projects = {
  idp: {
    title: "Zero Trust Identity Provider",
    description:
      "Passkey-based authentication system using WebAuthn with secure token lifecycle and zero trust enforcement.",
    details: [
      "WebAuthn biometric authentication",
      "JWT access + refresh token system",
      "Session-based revocation",
      "Zero trust architecture",
    ],
    github: "https://github.com/blacAxe/sentinel-proxy",
  },

  sentinel: {
    title: "Sentinel Security Proxy",
    description:
      "Identity-aware reverse proxy with WAF capabilities and real-time attack detection.",
    details: [
      "JWT verification middleware",
      "SQL injection + XSS detection",
      "Rate limiting",
      "Structured logging pipeline",
    ],
    github: "https://github.com/blacAxe/sentinel-proxy",
  },

  lumenlog: {
    title: "LumenLog Observability System",
    description:
      "Distributed logging pipeline using Protobuf, Redpanda, and ClickHouse for high-throughput analytics.",
    details: [
      "Cross-language Protobuf schema",
      "Kafka-compatible streaming",
      "Real-time alerting",
      "High-performance analytics storage",
    ],
    github: "https://github.com/blacAxe/sentinel-proxy",
  },

  lab: {
    title: "Self-Healing Security Lab",
    description:
      "Interactive platform demonstrating real-world web vulnerabilities and their secure fixes.",
    details: [
      "SQL Injection and XSS demonstrations",
      "Secure vs vulnerable mode toggle",
      "Dockerized environment",
      "CI pipeline with automated testing",
    ],
    github: "https://self-healing-security-lab.onrender.com",
  },

  cracker: {
    title: "Distributed MD5 Cracker",
    description:
      "Gossip-based distributed system that cracks hashes using parallel workers and task partitioning.",
    details: [
      "Gossip protocol for node discovery",
      "gRPC task distribution",
      "Parallel brute force search",
      "Real-time task cancellation",
    ],
    github: "#",
  },

  kernel: {
    title: "Hardened xv6 Kernel",
    description:
      "Security-focused modifications to the xv6 kernel including ASLR and runtime integrity monitoring.",
    details: [
      "Stack ASLR implementation",
      "Kernel integrity monitoring",
      "Process-level access control",
      "Audit logging system",
    ],
    github: "#",
  },

  vortex: {
    title: "Async Job Processing Service",
    description:
      "Backend system for handling asynchronous job processing with status tracking.",
    details: [
      "Async job execution",
      "State transitions (pending → processing → done)",
      "REST API interface",
      "Extensible job pipeline",
    ],
    github: "#",
  },
};