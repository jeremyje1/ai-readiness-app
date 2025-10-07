-- Check which premium tables already exist and their structure
SELECT 
    'Existing premium tables' as info,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('team_members', 'implementation_phases', 'tasks', 'roi_metrics', 'calendar_events')
ORDER BY table_name;

-- Check if any of these tables have an organization column
SELECT 
    'Tables with organization column' as info,
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('team_members', 'implementation_phases', 'tasks', 'roi_metrics', 'calendar_events')
AND column_name = 'organization'
ORDER BY table_name;