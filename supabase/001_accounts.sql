begin;
create table public.accounts (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check (kind in ('netflix','week','disney')),
 email text, password_ciphertext text, tipe_sharing text, deskripsi text,
 tanggal_reset date, tanggal_terjual date, durasi_habis date,
 nomor text, profil text, device text, lokasi text,
 durasi integer check (durasi between 1 and 3650),
 import_key text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint unique_import unique(owner_id,kind,import_key),
 constraint valid_week_dates check (kind <> 'week' or durasi_habis >= tanggal_terjual),
 constraint valid_disney_dates check (kind <> 'disney' or tanggal_reset >= tanggal_terjual),
 constraint netflix_fields check (kind='disney' or (email is not null and email <> '' and password_ciphertext is not null)),
 constraint netflix_sharing check (kind <> 'netflix' or (tipe_sharing is not null and tipe_sharing in ('1P1U 1 Bulan','1P2U 1 Bulan','1P1U 1 Week','DIBELI','7 HARI 1P1U'))),
 constraint disney_fields check (kind <> 'disney' or (coalesce(length(nomor),0)>0 and coalesce(length(profil),0)>0 and coalesce(length(device),0)>0 and coalesce(length(lokasi),0)>0 and durasi is not null and tanggal_reset is not null and tanggal_terjual is not null))
);
create index accounts_owner_kind on public.accounts(owner_id,kind);
create index accounts_reset on public.accounts(owner_id,tanggal_reset);
create index accounts_expiry on public.accounts(owner_id,durasi_habis);
alter table public.accounts enable row level security;
revoke all on public.accounts from anon;
grant select,insert,update,delete on public.accounts to authenticated;
create policy own_admin_records on public.accounts for all to authenticated
 using ((select auth.uid())=owner_id and (select auth.jwt()->'app_metadata'->>'role')='admin')
 with check ((select auth.uid())=owner_id and (select auth.jwt()->'app_metadata'->>'role')='admin');
create function public.set_account_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at=now();return new;end; $$;
create trigger account_updated before update on public.accounts for each row execute function public.set_account_updated_at();
commit;
-- Setelah membuat pengguna di Authentication > Users, jalankan terpisah dengan UUID pengguna yang benar:
-- update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb where id = 'UUID_ADMIN';
-- Login ulang setelah pemberian role. Tidak ada pendaftaran publik di aplikasi.
