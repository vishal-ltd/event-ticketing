-- Create system_settings table
create table if not exists public.system_settings (
  key text primary key,
  value text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.system_settings enable row level security;

-- Policies for system_settings

-- Allow public read access to system settings
create policy "Public read access"
  on public.system_settings for select
  using (true);

-- Allow admins to insert/update/delete
create policy "Admins can manage system settings"
  on public.system_settings for all
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create bucket for system assets if not exists
insert into storage.buckets (id, name, public)
values ('system-assets', 'system-assets', true)
on conflict (id) do nothing;

-- Storage policies for system-assets

-- Public read access
create policy "System Assets Public Read"
  on storage.objects for select
  using ( bucket_id = 'system-assets' );

-- Admins can upload
create policy "Admins can upload system assets"
  on storage.objects for insert
  with check (
    bucket_id = 'system-assets'
    and exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can update
create policy "Admins can update system assets"
  on storage.objects for update
  using (
    bucket_id = 'system-assets'
    and exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can delete
create policy "Admins can delete system assets"
  on storage.objects for delete
  using (
    bucket_id = 'system-assets'
    and exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );
