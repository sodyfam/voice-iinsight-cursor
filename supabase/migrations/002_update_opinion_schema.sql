-- 의견 테이블 스키마 업데이트
-- 현재상황(asis) 컬럼을 nullable로 변경

ALTER TABLE opinion 
ALTER COLUMN asis DROP NOT NULL;

-- 컬럼에 코멘트 추가
COMMENT ON COLUMN opinion.asis IS '현재상황 (선택사항)';
COMMENT ON COLUMN opinion.tobe IS '개선제안 (필수)';
COMMENT ON COLUMN opinion.effect IS 'AI 분석 - 기대효과';
COMMENT ON COLUMN opinion.case_study IS 'AI 분석 - 적용사례';
COMMENT ON COLUMN opinion.negative_score IS 'AI 분석 - 부정 점수'; 