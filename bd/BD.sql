-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.debug_logs (
  id integer NOT NULL DEFAULT nextval('debug_logs_id_seq'::regclass),
  message text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT debug_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.dictionary (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  word text NOT NULL,
  variants ARRAY,
  grammar_info text,
  definition text NOT NULL,
  scientific_name text,
  examples jsonb,
  synonyms ARRAY,
  roots ARRAY,
  see_also ARRAY,
  alt_spellings ARRAY,
  notes ARRAY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  CONSTRAINT dictionary_pkey PRIMARY KEY (id),
  CONSTRAINT dictionary_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general'::text CHECK (category = ANY (ARRAY['suggestion'::text, 'question'::text, 'issue'::text, 'other'::text, 'bug_report'::text, 'feature_request'::text, 'general'::text])),
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'implemented'::text, 'declined'::text])),
  priority text DEFAULT 'medium'::text CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])),
  likes_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT feedback_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.feedback_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  feedback_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT feedback_likes_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT feedback_likes_feedback_id_fkey FOREIGN KEY (feedback_id) REFERENCES public.feedback(id)
);
CREATE TABLE public.feedback_replies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  feedback_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  is_admin_reply boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT feedback_replies_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_replies_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT feedback_replies_feedback_id_fkey FOREIGN KEY (feedback_id) REFERENCES public.feedback(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  username text UNIQUE,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_beta_tester boolean DEFAULT false,
  feedback_count integer DEFAULT 0,
  password text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.saved_words (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dictionary_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT saved_words_pkey PRIMARY KEY (id),
  CONSTRAINT saved_words_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT saved_words_dictionary_id_fkey FOREIGN KEY (dictionary_id) REFERENCES public.dictionary(id)
);