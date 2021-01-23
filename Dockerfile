FROM msoap/shell2http AS download-shell2http

FROM ubuntu:20.04 AS final
WORKDIR /app
COPY --from=download-shell2http /app/shell2http shell2http
RUN apt-get update && apt-get install -y apt-utils gzip && \
    apt-get clean autoclean && \
    apt-get autoremove --yes && \
    rm -rf /var/lib/{apt,dpkg,cache,log}/
COPY ./src ./src
CMD ./src/main.sh
