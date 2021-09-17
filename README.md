# Mercurios

Event sourcing simplified

## Notes

-   Event ordering is not guaranteed. However, it's possible to use `expectedSeq` when publishing to control the order of events in a stream

## DEV environment

**Dependencies**:

-   node:12+
    -   [Windows / MacOs](https://nodejs.org/en/download/)
    -   [Debian based Linux](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04)
-   docker
-   docker-compose
-   [tilt](https://docs.tilt.dev/install.html)

```sh
## IMPORTANT: it most be run before the first start of the application
./run.js setup -c

# start dev environment
./run.js dev
```

## Migration from v2 to v3

Coming soon...
