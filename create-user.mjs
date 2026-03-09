import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://uykknbawmullmfikqyxq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5a2tuYmF3bXVsbG1maWtxeXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NjkyNjUsImV4cCI6MjA4NzU0NTI2NX0.GJc3i4Udhi7o-_miIMkO7a4ZWwPGvXuwpUeV_JWBeYY'
);

async function main() {
    const { data, error } = await supabase.auth.signUp({
        email: 'admin.housing.test@gmail.com',
        password: 'password123',
    });
    console.log('Signup Result:', data, error);
}

main();
