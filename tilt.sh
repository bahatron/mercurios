#!/bin/bash

if [ $1 = "up" ]; then
    tilt up --hud=TRUE
fi

if [ $1 = "down" ]; then
    tilt down
fi