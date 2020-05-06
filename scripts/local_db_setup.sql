-- Created with pg_dump from the live DB and simplified for local usage by
-- removing the Google Cloud users.
--
-- To reproduce this first set DB_HOST appropriately and then run:
-- pg_dump -t 'queries' -h $DB_HOST -U postgres --schema-only demo > scripts/local_db_setup.sql

CREATE TABLE public.queries (
    id bigint NOT NULL,
    model_name character varying(50),
    request_data text,
    "timestamp" timestamp without time zone,
    requester character varying(255) DEFAULT NULL::character varying
);

CREATE SEQUENCE public.queries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.queries_id_seq OWNED BY public.queries.id;
ALTER TABLE ONLY public.queries ALTER COLUMN id SET DEFAULT nextval('public.queries_id_seq'::regclass);
ALTER TABLE ONLY public.queries
    ADD CONSTRAINT queries_pkey PRIMARY KEY (id);
