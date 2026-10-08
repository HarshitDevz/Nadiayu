import os
from supabase import create_client, Client

url = ''
key = ''
with open('.env', 'r') as f:
    for line in f:
        if line.startswith('VITE_SUPABASE_URL='):
            url = line.split('=', 1)[1].strip()
        elif line.startswith('VITE_SUPABASE_ANON_KEY='):
            key = line.split('=', 1)[1].strip()

supabase = create_client(url, key)
r = supabase.table('user_profiles').select('*').execute()
print('USER_PROFILES')
for p in r.data:
    print(p.get('id'), p.get('googleUserId'), p.get('email'), p.get('aadhaarHash'))

r2 = supabase.table('patients').select('*').execute()
print('PATIENTS')
for p in r2.data:
    print(p.get('id'), p.get('uhid'), p.get('name'))
