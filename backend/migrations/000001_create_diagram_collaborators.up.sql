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