import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yrhdzsbzhmnzfxcesmrt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyaGR6c2J6aG1uemZ4Y2VzbXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDgxMjMsImV4cCI6MjA1OTg4NDEyM30.QnzoGW9mWIH9YOwnNiJOPoEy4iwTtxhWlFyPZW3qWPA'; // ← wklej tu rzeczywisty anon public key z Supabase

export const supabase = createClient(supabaseUrl, supabaseKey);
