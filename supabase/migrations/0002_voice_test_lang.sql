-- 딥보이스 체험을 언어별로 분리 집계
--
-- 영어 페이지는 다른 음성 샘플을 쓴다. 같은 표본에 섞이면 두 수치가 모두
-- 의미를 잃으므로 lang 으로 나눈다.
--
-- 설계 요점
--  * lang 은 default 'ko' 다. 기존 행과, lang 을 보내지 않는 기존 클라이언트가
--    그대로 동작한다. 즉 이 마이그레이션은 배포 순서를 가리지 않는다.
--  * voice_test_stats 는 인자에 기본값을 둔다. 지금 배포된 페이지가 보내는
--    빈 본문 {} 도 계속 한국어 집계를 받는다.
--  * 같은 이름의 0-인자 함수가 남아 있으면 PostgREST 가 어느 쪽인지 정하지
--    못한다. 먼저 지운다.

alter table public.voice_test_results
  add column if not exists lang text not null default 'ko';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'voice_test_results_lang_check'
  ) then
    alter table public.voice_test_results
      add constraint voice_test_results_lang_check check (lang in ('ko', 'en'));
  end if;
end $$;

create index if not exists voice_test_results_lang_age_idx
  on public.voice_test_results (lang, age_band);

drop function if exists public.voice_test_stats();

create or replace function public.voice_test_stats(p_lang text default 'ko')
returns table (age_band text, total bigint, wrong bigint)
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select
    r.age_band,
    count(*)::bigint as total,
    count(*) filter (where not r.is_correct)::bigint as wrong
  from public.voice_test_results r
  where r.lang = p_lang
  group by r.age_band;
$$;

revoke all on function public.voice_test_stats(text) from public;
grant execute on function public.voice_test_stats(text) to anon, authenticated;
