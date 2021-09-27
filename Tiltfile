docker_compose(['./docker-compose.tilt.yml'])

docker_build('mercurios-playground', '.', dockerfile = 'Dockerfile.playground',
    target='src',
    live_update=[
        sync('./playground', '/app/playground'),
    ],
    ignore=[
        "./client/lib",
    ],
    only=[
        './scripts/wait-for-it.sh',
        './playground',
        './client'
    ],
)


docker_build('mercurios-client', '.', dockerfile = 'Dockerfile.client',
    target='src',
    live_update=[
        sync('./client', '/app/client'),
    ],
    ignore=[
        "./client/lib",
    ],
    only=[
        './client'
    ],
)