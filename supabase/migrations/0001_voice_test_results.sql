-- 딥보이스 체험 응답 수집
--
-- 설계 요점
--  * is_correct는 생성 열이다. 정답 여부를 클라이언트가 보내지 않으므로 조작할 수 없다.
--  * 익명 사용자에게는 INSERT만 허용한다. SELECT 정책이 없으므로 원본 응답은 읽히지 않는다.
--  * 화면에 필요한 집계는 voice_test_stats() 함수로만 노출한다.

create table if not exists public.voice_test_results (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  age_band text not null check (age_band in ('1020', '3040', '5060', '70')),
  choice text not null check (choice in ('a', 'b')),
  -- 진짜 가족 목소리는 A. 정답 여부는 서버에서 계산한다.
  is_correct boolean generated always as (choice = 'a') stored,
  listened_a boolean not null default false,
  listened_b boolean not null default false
);

-- 연령대별 집계 조회용
create index if not exists voice_test_results_age_band_idx
  on public.voice_test_results (age_band);

alter table public.voice_test_results enable row level security;

-- 익명 사용자는 응답 제출만 가능하다
drop policy if exists "anon can submit result" on public.voice_test_results;
create policy "anon can submit result"
  on public.voice_test_results
  for insert
  to anon
  with check (true);

-- 집계만 반환한다. security definer로 RLS를 우회하되 원본 행은 노출하지 않는다.
create or replace function public.voice_test_stats()
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
  group by r.age_band;
$$;

revoke all on function public.voice_test_stats() from public;
grant execute on function public.voice_test_stats() to anon, authenticated;
