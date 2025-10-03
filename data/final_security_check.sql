-- ================================
-- VERIFICACIÓN FINAL DE SEGURIDAD
-- ================================

-- 1. Confirmar que TODAS las tablas tienen RLS habilitado
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ HABILITADO'
        ELSE '❌ DESHABILITADO'
    END as estado_rls
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Verificar que no hay tablas sin políticas
SELECT 
    t.tablename,
    COALESCE(p.total_politicas, 0) as total_politicas,
    CASE 
        WHEN COALESCE(p.total_politicas, 0) = 0 THEN '⚠️ SIN POLÍTICAS'
        ELSE '✅ CON POLÍTICAS'
    END as estado_politicas
FROM pg_tables t
LEFT JOIN (
    SELECT tablename, COUNT(*) as total_politicas
    FROM pg_policies 
    WHERE schemaname = 'public'
    GROUP BY tablename
) p ON t.tablename = p.tablename
WHERE t.schemaname = 'public'
ORDER BY t.tablename;

-- 3. Test rápido de funcionalidad (ejecutar solo si tienes datos de prueba)
-- SELECT 'Test de lectura pública funcionando' as test_result, COUNT(*) as registros
-- FROM public.logros;

-- 4. Resumen ejecutivo
SELECT 
    COUNT(*) as total_tablas,
    SUM(CASE WHEN rowsecurity THEN 1 ELSE 0 END) as tablas_con_rls,
    (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public') as tablas_con_politicas
FROM pg_tables 
WHERE schemaname = 'public';