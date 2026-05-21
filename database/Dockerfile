# syntax=docker/dockerfile:1

FROM gvenzl/oracle-free:23-slim-faststart

EXPOSE 1521

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=10 \
  CMD healthcheck.sh || exit 1
