-- Bettwäsche auf 2 Tage überfällig setzen (zum Testen der Anzeige)
-- Setzt last_completed so, dass (last_completed + 14 Tage) = heute minus 2 Tage
-- → Countdown zeigt "Überfällig!" mit 2 Tagen Verzug

UPDATE public.household_tasks
SET last_completed = now() - interval '1 day' * (interval_days + 2)
WHERE name = 'Bettwäsche';
