-- 계열사 마스터 테이블 생성
CREATE TABLE IF NOT EXISTS company_affiliate (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);

-- 카테고리 마스터 테이블 생성
CREATE TABLE IF NOT EXISTS category (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);

-- 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    company_id VARCHAR(50),
    dept VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES company_affiliate(id)
);

-- 의견 테이블 생성
CREATE TABLE IF NOT EXISTS opinion (
    id VARCHAR(50) PRIMARY KEY,
    seq SERIAL UNIQUE,
    user_id VARCHAR(50),
    company_id VARCHAR(50),
    category_id VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    asis TEXT,
    tobe TEXT NOT NULL,
    effect TEXT,
    case_study TEXT,
    quarter VARCHAR(10),
    status VARCHAR(20) DEFAULT '접수',
    negative_score INT DEFAULT 0,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES company_affiliate(id),
    FOREIGN KEY (category_id) REFERENCES category(id)
);

-- 처리 이력 테이블 생성
CREATE TABLE IF NOT EXISTS processing_history (
    id VARCHAR(50) PRIMARY KEY,
    opinion_id VARCHAR(50),
    processor_id VARCHAR(50),
    status VARCHAR(20),
    processing_content TEXT,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    proc_name VARCHAR(100),
    proc_desc TEXT,
    FOREIGN KEY (opinion_id) REFERENCES opinion(id),
    FOREIGN KEY (processor_id) REFERENCES users(id)
);

-- RLS(Row Level Security) 비활성화 (개발 단계에서)
ALTER TABLE company_affiliate DISABLE ROW LEVEL SECURITY;
ALTER TABLE category DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE opinion DISABLE ROW LEVEL SECURITY;
ALTER TABLE processing_history DISABLE ROW LEVEL SECURITY;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_opinion_user_id ON opinion(user_id);
CREATE INDEX IF NOT EXISTS idx_opinion_company_id ON opinion(company_id);
CREATE INDEX IF NOT EXISTS idx_opinion_category_id ON opinion(category_id);
CREATE INDEX IF NOT EXISTS idx_opinion_status ON opinion(status);
CREATE INDEX IF NOT EXISTS idx_opinion_reg_date ON opinion(reg_date);
CREATE INDEX IF NOT EXISTS idx_processing_history_opinion_id ON processing_history(opinion_id);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id); 