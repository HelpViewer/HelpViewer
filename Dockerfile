FROM alpine
#FROM alpine AS srcbase
#RUN cp /bin/busybox /busybox
RUN apk add --no-cache curl unzip busybox-extras
ARG PACKAGE_TAG
RUN mkdir -p /www/hlp && \
    curl -L https://github.com/HelpViewer/HelpViewer/releases/download/${PACKAGE_TAG}/package.zip -o /tmp/package.zip && \
    unzip /tmp/package.zip -d /www

#COPY --from=srcbase /busybox /busybox
#COPY --from=srcbase /www /www

CMD ["busybox-extras", "httpd", "-f", "-p", "80", "-h", "/www/"]