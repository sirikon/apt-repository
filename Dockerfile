FROM ubuntu:20.04 AS download-shell2http
WORKDIR /app
RUN apt-get update && apt-get install -y curl tar gzip && \
    curl -Lso ./shell2http.tar.gz https://github.com/msoap/shell2http/releases/download/1.13/shell2http-1.13.linux.amd64.tar.gz && \
    tar -xvzf shell2http.tar.gz

FROM ubuntu:20.04 AS final
WORKDIR /app
COPY --from=download-shell2http /app/shell2http shell2http
RUN apt-get update && apt-get install -y apt-utils gzip && \
    apt-get clean autoclean && \
    apt-get autoremove --yes && \
    rm -rf /var/lib/{apt,dpkg,cache,log}/
COPY ./src ./src
CMD ./src/main.sh
