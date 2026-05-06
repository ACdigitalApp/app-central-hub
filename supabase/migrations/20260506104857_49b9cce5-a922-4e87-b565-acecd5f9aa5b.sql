
CREATE TABLE IF NOT EXISTS public.app_visit_counters (
  app_key text PRIMARY KEY,
  count bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_visit_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read visit counters"
ON public.app_visit_counters FOR SELECT
USING (true);

INSERT INTO public.app_visit_counters (app_key, count)
VALUES ('gestione-scadenze', 0)
ON CONFLICT (app_key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.increment_app_visit(p_app_key text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count bigint;
BEGIN
  INSERT INTO public.app_visit_counters (app_key, count, updated_at)
  VALUES (p_app_key, 1, now())
  ON CONFLICT (app_key) DO UPDATE
    SET count = app_visit_counters.count + 1,
        updated_at = now()
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_app_visit_count(p_app_key text)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT count FROM public.app_visit_counters WHERE app_key = p_app_key), 0);
$$;

GRANT EXECUTE ON FUNCTION public.increment_app_visit(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_visit_count(text) TO anon, authenticated;
