docker_compose(['./docker-compose.dev.yml'])
# update_settings(max_parallel_updates=2)

docker_build('mercurios-client', '.', dockerfile = 'Dockerfile.client',
    live_update=[
        sync('./client', '/app/client'),
    ],
    only=[
        './client',
    ]
)

docker_build('mercurios-playground', '.', dockerfile = 'Dockerfile.playground',
    target='src',
    live_update=[
        sync('./playground', '/app/playground'),
        sync('./client', '/app/client'),
    ],
    only=[
        './scripts/wait-for-it.sh',
        './playground',
        './client'
    ],
)