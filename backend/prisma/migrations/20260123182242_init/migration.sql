-- CreateEnum
CREATE TYPE "Role" AS ENUM ('staff', 'admin', 'superAdmin');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('ai_technology', 'design', 'development', 'mobile', 'business', 'product');

-- CreateEnum
CREATE TYPE "Project_Category" AS ENUM ('web', 'mobile_app', 'ai_agent', 'ai_chatbot', 'saas');

-- CreateTable
CREATE TABLE "users" (
    "user_id" UUID NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'staff',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "projects" (
    "project_id" UUID NOT NULL,
    "project_name" VARCHAR(200) NOT NULL,
    "tech_stack" TEXT[],
    "project_description" TEXT,
    "project_thumbnail" TEXT[],
    "live_demo" TEXT,
    "git_repo" TEXT,
    "duration" VARCHAR(50),
    "cost" INTEGER,
    "category" "Project_Category" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "blogs" (
    "blog_id" UUID NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "excerpt" TEXT,
    "publish_date" TIMESTAMP(3),
    "read_time" VARCHAR(50),
    "category" "Category" NOT NULL,
    "author" VARCHAR(150),
    "image" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("blog_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "projects_project_name_key" ON "projects"("project_name");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_key" ON "blogs"("slug");
