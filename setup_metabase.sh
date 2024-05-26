#!/bin/bash

# Pull the latest Metabase image
docker pull metabase/metabase:latest

# Create a directory for Metabase data
mkdir -p ~/metabase-data

# Run Metabase with Docker Compose
docker-compose up -d
