-- Created with pg_dump from the live DB and simplified for local usage by
-- removing the Google Cloud users.
--
-- To set up a local DB do the following:
-- 1. brew install postgresql
-- 2. pg_ctl -D /usr/local/var/postgres start
-- 3. psql -d postgres -a -f scripts/local_db_setup.sql

CREATE TABLE public.queries (
    id bigint NOT NULL,
    model_name character varying(50),
    headers text,
    request_data text,
    response_data text,
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
