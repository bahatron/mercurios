docker_compose(['./docker-compose.yml'])

docker_build(
    'mercurios-playground',
    '.',
    dockerfile='Dockerfile.playground',
    live_update(
        fall_back_on('package.json'),
        sync('src', '/app/src')
    )
)