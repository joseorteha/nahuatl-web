-- Tabla para almacenar suscripciones de push notifications
CREATE TABLE public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- Un usuario solo puede tener una suscripción activa
);

-- Índices para optimizar consultas
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_created_at ON public.push_subscriptions(created_at);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_push_subscriptions_updated_at 
  BEFORE UPDATE ON public.push_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE public.push_subscriptions IS 'Almacena las suscripciones de push notifications de los usuarios';
COMMENT ON COLUMN public.push_subscriptions.endpoint IS 'URL del endpoint de push notification del navegador';
COMMENT ON COLUMN public.push_subscriptions.p256dh IS 'Clave pública P-256 para encriptación';
COMMENT ON COLUMN public.push_subscriptions.auth IS 'Clave de autenticación para la suscripción';