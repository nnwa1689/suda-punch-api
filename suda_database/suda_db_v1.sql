--
-- PostgreSQL database dump
--

\restrict ECfH4IzwM7DzuakvRrZZGmQO0Xa6fzo2NJkHCfiA3sPmLGsgaDm4dUFxO5c1Ebv

-- Dumped from database version 18.1 (Postgres.app)
-- Dumped by pg_dump version 18.0

-- Started on 2025-12-25 00:22:00 CST

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

--
-- TOC entry 2 (class 3079 OID 16501)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 3904 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 227 (class 1259 OID 16623)
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id character varying(100) CONSTRAINT dept_id_not_null NOT NULL,
    name character varying(100) CONSTRAINT dept_name_not_null NOT NULL,
    parent_department_id character varying(100),
    is_active boolean DEFAULT true NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 16399)
-- Name: employee_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_device (
    employee_id character varying(100) CONSTRAINT checkin_devices_employee_id_not_null NOT NULL,
    device_uuid character varying(100) CONSTRAINT checkin_devices_device_uuid_not_null NOT NULL,
    device_type character varying(100),
    is_active boolean DEFAULT true CONSTRAINT checkin_devices_is_active_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    id uuid NOT NULL
);


--
-- TOC entry 225 (class 1259 OID 16471)
-- Name: employee_schedule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_schedule (
    id uuid NOT NULL,
    employee_id character varying(100) NOT NULL,
    schedule_date date NOT NULL,
    shift_template_id character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    schedule_type character varying(100) DEFAULT 'fixed'::character varying NOT NULL
);


--
-- TOC entry 220 (class 1259 OID 16391)
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id character varying(100) NOT NULL,
    name character varying(100) NOT NULL,
    department_id character varying(100) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    arrival timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 16430)
-- Name: punch_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.punch_logs (
    employee_id character varying(100) NOT NULL,
    punch_time timestamp with time zone NOT NULL,
    punch_points_id character varying(100) NOT NULL,
    recorded_lat numeric(10,6) NOT NULL,
    recorded_lng numeric(10,6) NOT NULL,
    id uuid CONSTRAINT punch_logs_log_id_not_null NOT NULL,
    punch_type character varying(100),
    is_late boolean DEFAULT false NOT NULL,
    is_early boolean DEFAULT false NOT NULL,
    remark character varying(100)
);


--
-- TOC entry 222 (class 1259 OID 16409)
-- Name: punch_points; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.punch_points (
    id character varying(100) NOT NULL,
    name character varying(100) NOT NULL,
    latitude numeric(10,6) NOT NULL,
    longitude numeric(10,6) NOT NULL,
    radius_meters numeric(10,0) DEFAULT 10 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true NOT NULL
);


--
-- TOC entry 224 (class 1259 OID 16450)
-- Name: shift_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shift_templates (
    id character varying(100) NOT NULL,
    name character varying(100) NOT NULL,
    is_cross_day boolean DEFAULT false NOT NULL,
    start_time_h smallint NOT NULL,
    start_time_m smallint NOT NULL,
    end_time_h smallint NOT NULL,
    end_time_m smallint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true NOT NULL
);


--
-- TOC entry 226 (class 1259 OID 16605)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    username character varying NOT NULL,
    password character varying,
    is_active boolean DEFAULT true NOT NULL,
    employee_id character varying NOT NULL
);


--
-- TOC entry 3898 (class 0 OID 16623)
-- Dependencies: 227
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, name, parent_department_id, is_active) FROM stdin;
A001	客戶服務部	B000	t
\.


--
-- TOC entry 3892 (class 0 OID 16399)
-- Dependencies: 221
-- Data for Name: employee_device; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_device (employee_id, device_uuid, device_type, is_active, created_at, id) FROM stdin;
\.


--
-- TOC entry 3896 (class 0 OID 16471)
-- Dependencies: 225
-- Data for Name: employee_schedule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_schedule (id, employee_id, schedule_date, shift_template_id, created_at, updated_at, schedule_type) FROM stdin;
a2df48a5-4a13-46bc-93b9-f30cb21a5a28	0001	2025-12-24	D3	2025-12-24 22:46:35.809435+08	2025-12-24 22:46:35.809435+08	daily
\.


--
-- TOC entry 3891 (class 0 OID 16391)
-- Dependencies: 220
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employees (id, name, department_id, is_active, created_at, updated_at, arrival) FROM stdin;
0001	HAZUYA	A001	t	2025-12-14 23:18:23.32341+08	2025-12-22 01:00:21.691488+08	2025-12-23 00:00:00+08
\.


--
-- TOC entry 3894 (class 0 OID 16430)
-- Dependencies: 223
-- Data for Name: punch_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) FROM stdin;
\.


--
-- TOC entry 3893 (class 0 OID 16409)
-- Dependencies: 222
-- Data for Name: punch_points; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.punch_points (id, name, latitude, longitude, radius_meters, created_at, is_active) FROM stdin;
A001	總公司	25.051922	121.567981	10	2025-12-13 00:15:28.594271+08	t
\.


--
-- TOC entry 3895 (class 0 OID 16450)
-- Dependencies: 224
-- Data for Name: shift_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shift_templates (id, name, is_cross_day, start_time_h, start_time_m, end_time_h, end_time_m, created_at, updated_at, is_active) FROM stdin;
D1	總1	f	22	0	23	0	2025-12-13 00:21:24.266018+08	2025-12-13 00:21:24.266018+08	t
D2	日二	t	9	30	18	0	2025-12-16 20:28:37.251624+08	2025-12-16 20:28:37.251624+08	t
D3	日三	f	9	0	18	0	2025-12-23 22:36:50.87892+08	2025-12-23 22:36:50.87892+08	t
\.


--
-- TOC entry 3897 (class 0 OID 16605)
-- Dependencies: 226
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password, is_active, employee_id) FROM stdin;
468ccdc2-951c-4167-8aba-f4f661e194ea	superemp	$2b$10$RSSw.OtCWkVnPWXEweEcieacUXmJP0qO3Q0tNsGOOkvvSPZEyWt2C	t	0001
\.


--
-- TOC entry 3743 (class 2606 OID 16629)
-- Name: departments dept_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT dept_pkey PRIMARY KEY (id);


--
-- TOC entry 3731 (class 2606 OID 16514)
-- Name: employee_device employee_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_device
    ADD CONSTRAINT employee_device_pkey PRIMARY KEY (id);


--
-- TOC entry 3739 (class 2606 OID 16481)
-- Name: employee_schedule employee_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_schedule
    ADD CONSTRAINT employee_schedule_pkey PRIMARY KEY (id);


--
-- TOC entry 3729 (class 2606 OID 16398)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- TOC entry 3735 (class 2606 OID 16444)
-- Name: punch_logs punch_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.punch_logs
    ADD CONSTRAINT punch_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3733 (class 2606 OID 16419)
-- Name: punch_points punch_points_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.punch_points
    ADD CONSTRAINT punch_points_pkey PRIMARY KEY (id);


--
-- TOC entry 3737 (class 2606 OID 16460)
-- Name: shift_templates shift_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_templates
    ADD CONSTRAINT shift_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 3741 (class 2606 OID 16615)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


-- Completed on 2025-12-25 00:22:00 CST

--
-- PostgreSQL database dump complete
--

\unrestrict ECfH4IzwM7DzuakvRrZZGmQO0Xa6fzo2NJkHCfiA3sPmLGsgaDm4dUFxO5c1Ebv

