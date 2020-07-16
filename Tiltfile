docker_compose(['./docker-compose.yml'])

# update_settings(max_parallel_updates=2)

docker_build('mercurios_http', '.', dockerfile = 'Dockerfile.server',
    live_update=[
        sync('./server', '/app/server'),
    ],
    only=[
        "./server",
        "./scripts",
    ],
)

docker_build('mercurios_web', '.', dockerfile = 'Dockerfile.web',
    live_update=[
        sync('./web', '/app/web'),
    ],
    only=[
        "./web",
        "./client",
        "./scripts",
    ],
    target="src"
)

docker_build('mercurios_client', '.', dockerfile = 'Dockerfile.client',
    live_update=[
        sync('./client', '/app/client'),
        # restart_container(), # docker-compose only
    ],
    only=[
        "./client",
        "./scripts",
    ]
)