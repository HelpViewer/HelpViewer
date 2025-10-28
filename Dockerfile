FROM alpine AS build
ARG PACKAGE_TAG
RUN apk add --no-cache musl busybox busybox-extras curl unzip
WORKDIR /tmp
RUN curl -L https://github.com/HelpViewer/HelpViewer/releases/download/${PACKAGE_TAG}/package.zip -o package.zip
WORKDIR /outp
RUN mkdir lib \
  && cp /bin/busybox /bin/busybox-extras . \
  && cp /lib/libc.musl-x86_64.so.1 /lib/ld-musl-x86_64.so.1 ./lib
WORKDIR /outpd
RUN echo "/busybox-extras httpd -f -p 80 -h /www/" > run.sh \
  && chmod +x run.sh \
  && unzip /tmp/package.zip -d ./www

FROM scratch
COPY --from=build /outp /
COPY --from=build /outpd /
EXPOSE 80
CMD ["/busybox", "sh", "/run.sh"]
