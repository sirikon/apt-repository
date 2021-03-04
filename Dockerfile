FROM ubuntu:20.04 AS build
RUN apt-get update && apt-get install -y curl git unzip
RUN git clone https://github.com/asdf-vm/asdf.git /asdf --branch v0.8.0
RUN bash -c "source /asdf/asdf.sh && asdf plugin-add deno https://github.com/asdf-community/asdf-deno.git"

WORKDIR /app
COPY .tool-versions .
RUN bash -c "source /asdf/asdf.sh && asdf install"
COPY ./task .
COPY ./src ./src
RUN bash -c "source /asdf/asdf.sh && ./task build"

FROM ubuntu:20.04 AS final
WORKDIR /app
RUN apt-get update && apt-get install -y apt-utils gzip && \
    apt-get clean autoclean && \
    apt-get autoremove --yes && \
    rm -rf /var/lib/{apt,dpkg,cache,log}/
COPY --from=build /app/out/apt-repository .
COPY --from=build /app/src/templates ./src/templates
ENV PORT=80
ENV DATA_FOLDER=/data
CMD ./apt-repository
