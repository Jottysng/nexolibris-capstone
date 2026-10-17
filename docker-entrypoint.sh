#!/bin/sh
set -eu
npx prisma migrate deploy
npx prisma db seed
exec node build-server/server/index.js
