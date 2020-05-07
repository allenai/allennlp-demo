CREATE TABLE queries (
    id bigint NOT NULL,
    model_name character varying(50),
    request_data text,
    "timestamp" timestamp without time zone,
    requester character varying(255) DEFAULT NULL::character varying
);

CREATE SEQUENCE queries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE queries_id_seq OWNED BY queries.id;
ALTER TABLE ONLY queries ALTER COLUMN id SET DEFAULT nextval('queries_id_seq'::regclass);
ALTER TABLE ONLY queries
    ADD CONSTRAINT queries_pkey PRIMARY KEY (id);
