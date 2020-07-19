docker_compose(['./docker-compose.yml'])

# update_settings(max_parallel_updates=2)

docker_build('mercurios_server', '.', dockerfile = 'Dockerfile.server',
    live_update=[
        sync('./server', '/app/server'),
    ],
    only=[
        "./server",
        "./scripts"
    ],
    ignore=[
        "./client/**/*",
    ]
)


docker_build('mercurios_client', '.', dockerfile = 'Dockerfile.client',
    live_update=[
        sync('./client', '/app/client'),
        # restart_container(), # docker-compose only
    ],
    only=[
        "./client",
        "./scripts",
    ],
    ignore=[
        "./server/**/*"
    ]
)