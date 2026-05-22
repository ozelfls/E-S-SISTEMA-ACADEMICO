# syntax=docker/dockerfile:1

FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /workspace

COPY pom.xml .
RUN mvn -B -q -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

RUN apk add --no-cache wget \
  && addgroup -S ghflusao \
  && adduser -S ghflusao -G ghflusao

ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

COPY --from=build /workspace/target/ghflusao-backend-*.jar app.jar

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/actuator/health/readiness || exit 1

USER ghflusao

ENTRYPOINT ["java", "-jar", "app.jar"]
