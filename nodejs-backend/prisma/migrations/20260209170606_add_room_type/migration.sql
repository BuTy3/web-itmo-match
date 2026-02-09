-- CreateEnum
CREATE TYPE "status_enum" AS ENUM ('OPEN', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "type_enum" AS ENUM ('SINGLE', 'COMBINED', 'WALK_AROUND_CITY', 'DATE', 'DINNER', 'MOVIE_NIGHT', 'COFFEE_TALK', 'TRAVEL', 'MUSEUM', 'SPORTS', 'PARTY', 'DEFAULT');

-- CreateEnum
CREATE TYPE "access_enum" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "match_enum" AS ENUM ('FIRST_MATCH', 'WATCH_ALL');

-- CreateTable
CREATE TABLE "collection" (
    "id" BIGSERIAL NOT NULL,
    "owner_id" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "image_url" TEXT,
    "type" "type_enum" NOT NULL DEFAULT 'DEFAULT',

    CONSTRAINT "collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item" (
    "id" BIGSERIAL NOT NULL,
    "collection_id" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room" (
    "id" BIGSERIAL NOT NULL,
    "creator_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "topic" TEXT,
    "type" "type_enum" NOT NULL DEFAULT 'SINGLE',
    "match_mode" "match_enum" NOT NULL,
    "status" "status_enum" NOT NULL,
    "password_hash" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" JSONB,
    "closed_at" TIMESTAMPTZ(6),
    "access_mode" "access_enum" NOT NULL DEFAULT 'PUBLIC',

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_participant" (
    "room_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ(6),

    CONSTRAINT "pk_room_participant" PRIMARY KEY ("room_id","user_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "display_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password_hash" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "collection" ADD CONSTRAINT "fk_collection_owner" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "fk_item_collection" FOREIGN KEY ("collection_id") REFERENCES "collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "fk_room_creator" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room_participant" ADD CONSTRAINT "fk_room_participant_room" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room_participant" ADD CONSTRAINT "fk_room_participant_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
