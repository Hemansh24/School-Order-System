--
-- PostgreSQL database dump
--

\restrict WYEOetAl55P3Q1AeFFkrWnF7wIXDuEbP2A1aExedWur1s8Bk0I1bKhQMDANBJCC

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: organisations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organisations (
    id bigint NOT NULL,
    group_code text,
    pt_code text,
    pr_code text NOT NULL,
    organisation_name text NOT NULL,
    address text,
    district text,
    state text,
    pin_code character varying(10),
    phone text,
    email text,
    website text,
    action_status text,
    remark text,
    academic_year text,
    strength integer,
    board_type text,
    session_start_from date,
    minority_type text,
    saturday_status text,
    working_status boolean,
    source_sheet_row integer,
    source_hash text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    synced_at timestamp with time zone DEFAULT now()
);


--
-- Name: organisations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.organisations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organisations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.organisations_id_seq OWNED BY public.organisations.id;


--
-- Name: organisations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organisations ALTER COLUMN id SET DEFAULT nextval('public.organisations_id_seq'::regclass);


--
-- Data for Name: organisations; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: organisations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.organisations_id_seq', 2, true);


--
-- Name: organisations organisations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organisations
    ADD CONSTRAINT organisations_pkey PRIMARY KEY (id);


--
-- Name: organisations organisations_pr_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organisations
    ADD CONSTRAINT organisations_pr_code_key UNIQUE (pr_code);


--
-- Name: idx_organisations_district; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_organisations_district ON public.organisations USING btree (district);


--
-- Name: idx_organisations_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_organisations_name ON public.organisations USING btree (organisation_name);


--
-- Name: idx_organisations_pr_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_organisations_pr_code ON public.organisations USING btree (pr_code);


--
-- Name: idx_organisations_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_organisations_state ON public.organisations USING btree (state);


--
-- Name: organisations trg_organisations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_organisations_updated_at BEFORE UPDATE ON public.organisations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- PostgreSQL database dump complete
--

\unrestrict WYEOetAl55P3Q1AeFFkrWnF7wIXDuEbP2A1aExedWur1s8Bk0I1bKhQMDANBJCC

