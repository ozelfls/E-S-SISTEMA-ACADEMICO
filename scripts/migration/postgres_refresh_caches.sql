BEGIN;
SELECT refresh_dashboard_metricas_cache();
SELECT refresh_relatorio_academico_cache();
COMMIT;
