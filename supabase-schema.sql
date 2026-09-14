-- Supabase Schema for AFM Apps

CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable users
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable personas
CREATE TABLE IF NOT EXISTS "personas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "niches" JSONB NOT NULL,
    "description" TEXT,
    "avatar_url" TEXT,
    "platforms" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable products
CREATE TABLE IF NOT EXISTS "products" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "variant" TEXT,
    "affiliate_link" TEXT NOT NULL,
    "original_link" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "commission_rate" DECIMAL(5,2) NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "campaign" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable platforms
CREATE TABLE IF NOT EXISTS "platforms" (
    "id" TEXT NOT NULL,
    "platform_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Sebar link shopee affiliate',
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable distributions
CREATE TABLE IF NOT EXISTS "distributions" (
    "id" TEXT NOT NULL,
    "platform_id" TEXT NOT NULL,
    "persona_id" TEXT NOT NULL,
    "distribution_type" TEXT NOT NULL DEFAULT 'comment',
    "post_url" TEXT NOT NULL,
    "posted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'posted',
    "campaign" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable distribution_items
CREATE TABLE IF NOT EXISTS "distribution_items" (
    "id" TEXT NOT NULL,
    "distribution_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "distribution_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable distribution_engagements
CREATE TABLE IF NOT EXISTS "distribution_engagements" (
    "id" TEXT NOT NULL,
    "distribution_id" TEXT NOT NULL,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "shares_count" INTEGER NOT NULL DEFAULT 0,
    "clicks_count" INTEGER NOT NULL DEFAULT 0,
    "orders_count" INTEGER,
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distribution_engagements_pkey" PRIMARY KEY ("id")
);

-- CreateTable contents
CREATE TABLE IF NOT EXISTS "contents" (
    "id" TEXT NOT NULL,
    "persona_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "platform_url" TEXT NOT NULL,
    "campaign" TEXT,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'published',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable content_products
CREATE TABLE IF NOT EXISTS "content_products" (
    "id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "content_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable content_metrics
CREATE TABLE IF NOT EXISTS "content_metrics" (
    "id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "comments_count" INTEGER NOT NULL DEFAULT 0,
    "shares_count" INTEGER NOT NULL DEFAULT 0,
    "saves_count" INTEGER,
    "clicks_count" INTEGER,
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable schedules
CREATE TABLE IF NOT EXISTS "schedules" (
    "id" TEXT NOT NULL,
    "persona_id" TEXT,
    "title" TEXT NOT NULL,
    "schedule_type" TEXT NOT NULL DEFAULT 'one_time',
    "recurrence_rule" TEXT,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- Unique Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "distribution_items_distribution_id_product_id_key" ON "distribution_items"("distribution_id", "product_id");
CREATE UNIQUE INDEX IF NOT EXISTS "content_products_content_id_product_id_key" ON "content_products"("content_id", "product_id");

-- Foreign Keys
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'distributions_platform_id_fkey') THEN
        ALTER TABLE "distributions" ADD CONSTRAINT "distributions_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'distributions_persona_id_fkey') THEN
        ALTER TABLE "distributions" ADD CONSTRAINT "distributions_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'distribution_items_distribution_id_fkey') THEN
        ALTER TABLE "distribution_items" ADD CONSTRAINT "distribution_items_distribution_id_fkey" FOREIGN KEY ("distribution_id") REFERENCES "distributions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'distribution_items_product_id_fkey') THEN
        ALTER TABLE "distribution_items" ADD CONSTRAINT "distribution_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'distribution_engagements_distribution_id_fkey') THEN
        ALTER TABLE "distribution_engagements" ADD CONSTRAINT "distribution_engagements_distribution_id_fkey" FOREIGN KEY ("distribution_id") REFERENCES "distributions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contents_persona_id_fkey') THEN
        ALTER TABLE "contents" ADD CONSTRAINT "contents_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_products_content_id_fkey') THEN
        ALTER TABLE "content_products" ADD CONSTRAINT "content_products_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_products_product_id_fkey') THEN
        ALTER TABLE "content_products" ADD CONSTRAINT "content_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_metrics_content_id_fkey') THEN
        ALTER TABLE "content_metrics" ADD CONSTRAINT "content_metrics_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'schedules_persona_id_fkey') THEN
        ALTER TABLE "schedules" ADD CONSTRAINT "schedules_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
