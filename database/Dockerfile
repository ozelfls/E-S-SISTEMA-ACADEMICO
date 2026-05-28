# syntax=docker/dockerfile:1.7

FROM postgres:16-alpine

EXPOSE 5432

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=10 \
  CMD pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" || exit 1
