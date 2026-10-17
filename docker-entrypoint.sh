#!/bin/sh
set -eu
npx prisma migrate deploy
npx prisma db seed
exec ./node_modules/.bin/tsx server/index.ts
