-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'UNREAD',
    "user_id" TEXT,
    "animal_id" TEXT,
    "adoption_id" TEXT,
    "task_id" TEXT,
    "action_type" TEXT,
    "action_url" TEXT,
    "action_data" TEXT,
    "read_at" DATETIME,
    "expires_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "notifications_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "notifications_adoption_id_fkey" FOREIGN KEY ("adoption_id") REFERENCES "adoptions" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "notifications_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "created_by_id" TEXT NOT NULL,
    "assigned_to_id" TEXT,
    "animal_id" TEXT,
    "adoption_id" TEXT,
    "metadata" TEXT,
    "due_date" DATETIME,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "tasks_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tasks_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tasks_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tasks_adoption_id_fkey" FOREIGN KEY ("adoption_id") REFERENCES "adoptions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
