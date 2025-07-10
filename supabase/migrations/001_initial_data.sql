-- 카테고리 테이블 데이터 삽입
INSERT INTO category (id, name, code, description, sort_order, status) VALUES 
('cat_01', '업무개선', 'WORK_IMPROVE', '업무 프로세스 및 효율성 개선', 1, 'active'),
('cat_02', '복리후생', 'WELFARE', '직원 복리후생 관련 제안', 2, 'active'),
('cat_03', '교육/훈련', 'EDUCATION', '교육 및 훈련 프로그램 관련', 3, 'active'),
('cat_04', '조직문화', 'CULTURE', '조직문화 및 커뮤니케이션 개선', 4, 'active'),
('cat_05', '시설환경', 'FACILITY', '사무환경 및 시설 개선', 5, 'active'),
('cat_06', '기타', 'ETC', '기타 의견 및 제안', 6, 'active')
ON CONFLICT (id) DO NOTHING;

-- 계열사 테이블 데이터 삽입
INSERT INTO company_affiliate (id, name, code, description, status) VALUES 
('company_01', '오케이캐피탈', 'OKC', '오케이캐피탈 주식회사', 'active'),
('company_02', '오케이저축은행', 'OKB', '오케이저축은행 주식회사', 'active'),
('company_03', '오케이데이터시스템', 'OKD', '오케이데이터시스템 주식회사', 'active'),
('company_04', '기타', 'ETC', '기타 계열사', 'active')
ON CONFLICT (id) DO NOTHING;

-- 사용자 테이블 데이터 삽입 (테스트용)
INSERT INTO users (id, employee_id, name, email, company_id, dept, role, password_hash, status) VALUES 
('user_01', 'EMP001', '김철수', 'kim@example.com', 'company_01', '영업팀', 'user', '$2b$10$example_hash', 'active'),
('user_02', 'EMP002', '이영희', 'lee@example.com', 'company_02', 'IT팀', 'user', '$2b$10$example_hash', 'active'),
('user_03', 'EMP003', '박민수', 'park@example.com', 'company_01', '마케팅팀', 'user', '$2b$10$example_hash', 'active'),
('user_04', 'ADMIN01', '관리자', 'admin@example.com', 'company_01', '관리팀', 'admin', '$2b$10$example_hash', 'active')
ON CONFLICT (id) DO NOTHING;

-- 의견 테이블 데이터 삽입 (테스트용)
INSERT INTO opinion (id, seq, user_id, company_id, category_id, title, asis, tobe, effect, case_study, quarter, status, negative_score, reg_date) VALUES 
('opinion_01', 1, 'user_01', 'company_01', 'cat_01', '업무 프로세스 개선 제안', '현재 승인 절차가 복잡함', '온라인 승인 시스템 도입', '업무 효율성 30% 향상 예상', '타 회사 성공 사례 참고', 'Q4', '접수', 1, NOW()),
('opinion_02', 2, 'user_02', 'company_02', 'cat_02', '직원 복리후생 확대', '현재 복리후생이 부족', '건강검진 지원 확대', '직원 만족도 향상', '대기업 벤치마킹', 'Q4', '검토중', 0, NOW() - INTERVAL '1 day'),
('opinion_03', 3, 'user_03', 'company_01', 'cat_03', '온라인 교육 플랫폼 도입', '오프라인 교육의 한계', '온라인 교육 시스템 구축', '교육 접근성 향상', 'IT 업계 동향', 'Q4', '처리완료', 0, NOW() - INTERVAL '2 days'),
('opinion_04', 4, 'user_01', 'company_01', 'cat_04', '소통 문화 개선', '부서간 소통 부족', '정기 소통 미팅 도입', '협업 효율성 증대', '성공 기업 사례', 'Q4', '접수', 2, NOW() - INTERVAL '3 days'),
('opinion_05', 5, 'user_02', 'company_02', 'cat_05', '사무환경 개선', '노후된 사무용품', '최신 장비로 교체', '업무 생산성 향상', '타 지점 비교', 'Q4', '검토중', 0, NOW() - INTERVAL '4 days'),
('opinion_06', 6, 'user_03', 'company_03', 'cat_01', '시스템 자동화 제안', '수작업이 많음', 'RPA 도입으로 자동화', '인력 절약 및 정확성 향상', 'IT 자동화 트렌드', 'Q4', '처리완료', 1, NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- 처리 이력 테이블 데이터 삽입 (테스트용)
INSERT INTO processing_history (id, opinion_id, processor_id, status, processing_content, processed_at, proc_name, proc_desc) VALUES 
('proc_01', 'opinion_03', 'user_04', '처리완료', '온라인 교육 플랫폼 도입 승인 및 예산 배정 완료', NOW() - INTERVAL '1 day', '관리자', '교육팀과 협의하여 진행'),
('proc_02', 'opinion_06', 'user_04', '처리완료', 'RPA 도입 프로젝트 시작, IT팀에서 담당', NOW() - INTERVAL '2 days', '관리자', 'IT팀 리더와 일정 조율 완료')
ON CONFLICT (id) DO NOTHING; 