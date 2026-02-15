import { createClient } from '@supabase/supabase-js';

// আপনার সুপাবেস ক্রেডেনশিয়াল সরাসরি এখানে বসিয়ে দেওয়া হলো
const supabaseUrl = "https://dghsinxeyovouorfyrgh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnaHNpbnhleW92b3VvcmZ5cmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzA4MzIsImV4cCI6MjA4NjMwNjgzMn0.ohsNRurZqtmuUzfv4z1aC7MxwE87BQORKWMw2PleuOg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);