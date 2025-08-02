import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://npxqbgysjxykcykaiutm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weHFiZ3lzanh5a2N5a2FpdXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTU5NjMsImV4cCI6MjA2OTY5MTk2M30.MrJMmF147Dz4yHocET99zsKQFR-QTKW7JLU3mGefkAk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
