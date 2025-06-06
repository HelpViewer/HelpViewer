FROM alpine AS srcBase
RUN cp /bin/busybox /busybox
RUN apk add --no-cache curl unzip
ARG PACKAGE_TAG
RUN mkdir -p /www/hlp && \
    curl -L https://github.com/HelpViewer/HelpViewer/releases/download/${PACKAGE_TAG}/package.zip -o /tmp/package.zip && \
    unzip /tmp/package.zip -d /www

FROM scratch
COPY --from=srcBase /busybox /busybox
COPY --from=srcBase /www /www

CMD ["/busybox", "httpd", "-f", "-h", "/www"]