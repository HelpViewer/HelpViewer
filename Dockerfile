FROM alpine
#FROM alpine AS srcbase
#RUN cp /bin/busybox /busybox
RUN apk add --no-cache curl unzip busybox busybox-extras
ARG PACKAGE_TAG
RUN mkdir -p /www/hlp && \
    curl -L https://github.com/HelpViewer/HelpViewer/releases/download/${PACKAGE_TAG}/package.zip -o /tmp/package.zip && \
    unzip /tmp/package.zip -d /www && \
    rm /tmp/package.zip && \
    echo "busybox-extras httpd -f -p 80 -h /www/" >> /run.sh && \
    chmod +x /run.sh

#COPY --from=srcbase /busybox /busybox
#COPY --from=srcbase /www /www

EXPOSE 80

CMD [ "sh", "-c", "/run.sh" ]