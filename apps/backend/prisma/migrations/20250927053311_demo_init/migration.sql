-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "municipality_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "users_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "municipalities" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "municipalities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "email" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "animals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "sex" TEXT NOT NULL,
    "age" INTEGER,
    "weight" REAL,
    "size" TEXT,
    "color" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DISPONIVEL',
    "municipality_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "animals_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "municipalities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "adoptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "animal_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "adoptions_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "adoptions_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agent_interactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "agent_name" TEXT NOT NULL,
    "user_input" TEXT NOT NULL,
    "agent_response" TEXT NOT NULL,
    "response_time_ms" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "agent_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agent_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agent_name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "total_interactions" INTEGER NOT NULL DEFAULT 0,
    "successful_interactions" INTEGER NOT NULL DEFAULT 0,
    "average_response_time" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "system_analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "metric_name" TEXT NOT NULL,
    "metric_value" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "agent_metrics_agent_name_date_key" ON "agent_metrics"("agent_name", "date");

-- CreateIndex
CREATE UNIQUE INDEX "system_analytics_date_metric_name_key" ON "system_analytics"("date", "metric_name");
