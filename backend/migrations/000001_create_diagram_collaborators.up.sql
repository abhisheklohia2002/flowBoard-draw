CREATE TABLE IF NOT EXISTS diagram_collaborators (
    id BIGSERIAL PRIMARY KEY,

    diagram_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'editor',
    invited_by_id BIGINT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_diagram_collaborators_diagram
        FOREIGN KEY (diagram_id)
        REFERENCES diagrams(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_diagram_collaborators_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_diagram_collaborators_invited_by
        FOREIGN KEY (invited_by_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_diagram_collaborators_role
        CHECK (role IN ('editor', 'viewer')),

    CONSTRAINT uq_diagram_collaborators_diagram_user
        UNIQUE (diagram_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_diagram_collaborators_diagram_id
    ON diagram_collaborators(diagram_id);

CREATE INDEX IF NOT EXISTS idx_diagram_collaborators_user_id
    ON diagram_collaborators(user_id);

CREATE INDEX IF NOT EXISTS idx_diagram_collaborators_invited_by_id
    ON diagram_collaborators(invited_by_id);


CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,

    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    diagram_id BIGINT NULL,
    project_id BIGINT NULL,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notifications_diagram
        FOREIGN KEY (diagram_id)
        REFERENCES diagrams(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_notifications_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id
    ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read
    ON notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_diagram_id
    ON notifications(diagram_id);

CREATE INDEX IF NOT EXISTS idx_notifications_project_id
    ON notifications(project_id);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
    ON notifications(created_at DESC);