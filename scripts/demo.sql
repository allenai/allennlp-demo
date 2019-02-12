--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.6
-- Dumped by pg_dump version 10.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: queries; Type: TABLE; Schema: public; Owner: cloudsqlsuperuser
--

CREATE TABLE public.queries (
    id bigint NOT NULL,
    model_name character varying(50),
    headers text,
    request_data text,
    response_data text,
    "timestamp" timestamp without time zone,
    requester character varying(255) DEFAULT NULL::character varying
);


ALTER TABLE public.queries OWNER TO cloudsqlsuperuser;

--
-- Name: queries_id_seq; Type: SEQUENCE; Schema: public; Owner: cloudsqlsuperuser
--

CREATE SEQUENCE public.queries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.queries_id_seq OWNER TO cloudsqlsuperuser;

--
-- Name: queries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cloudsqlsuperuser
--

ALTER SEQUENCE public.queries_id_seq OWNED BY public.queries.id;


--
-- Name: queries id; Type: DEFAULT; Schema: public; Owner: cloudsqlsuperuser
--

ALTER TABLE ONLY public.queries ALTER COLUMN id SET DEFAULT nextval('public.queries_id_seq'::regclass);


--
-- Name: queries queries_pkey; Type: CONSTRAINT; Schema: public; Owner: cloudsqlsuperuser
--

ALTER TABLE ONLY public.queries
    ADD CONSTRAINT queries_pkey PRIMARY KEY (id);


--
-- Name: TABLE queries; Type: ACL; Schema: public; Owner: cloudsqlsuperuser
--

GRANT SELECT,INSERT ON TABLE public.queries TO proxyuser;


--
-- Name: SEQUENCE queries_id_seq; Type: ACL; Schema: public; Owner: cloudsqlsuperuser
--

GRANT USAGE ON SEQUENCE public.queries_id_seq TO proxyuser;


--
-- PostgreSQL database dump complete
--

