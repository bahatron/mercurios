docker_compose(['./docker-compose.yml'])
# update_settings(max_parallel_updates=2)

docker_build('mercurios_server', '.', dockerfile = 'Dockerfile.server',
    live_update=[
        sync('./server', '/app/server'),
    ],
    only=[
        "./server",
        "./scripts"
    ]
)

docker_build('mercurios_client', '.', dockerfile = 'Dockerfile.client',
    live_update=[
        sync('./client', '/app/client'),
    ],
    only=[
        "./client",
    ]
)

docker_build('mercurios_playground', '.', dockerfile = 'Dockerfile.playground',
    live_update=[
        sync('./playground', '/app/playground'),
    ],
    only=[
        "./playground",
        "./scripts",
        "./client"
    ],
)