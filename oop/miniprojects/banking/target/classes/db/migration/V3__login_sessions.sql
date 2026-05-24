CREATE TABLE login_sessions (
    id           UUID PRIMARY KEY,
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address   VARCHAR(64),
    user_agent   VARCHAR(512),
    session_id   VARCHAR(128),
    logged_in_at  TIMESTAMP NOT NULL DEFAULT now(),
    logged_out_at TIMESTAMP NULL
);

CREATE INDEX idx_login_sessions_user ON login_sessions(user_id, logged_in_at DESC);
CREATE INDEX idx_login_sessions_session ON login_sessions(session_id);
