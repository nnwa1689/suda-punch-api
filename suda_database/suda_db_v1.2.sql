--
-- PostgreSQL database dump
--

\restrict VQbXNEZodJi2kBazEXx3TZwaljD0Q0dAeFUM6t2ipckIsEi6cShneLy6VsMvtyN

-- Dumped from database version 18.1 (Postgres.app)
-- Dumped by pg_dump version 18.0

-- Started on 2026-01-04 13:17:06 CST

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
-- TOC entry 3905 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 227 (class 1259 OID 16623)
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id character varying(100) CONSTRAINT dept_id_not_null NOT NULL,
    name character varying(100) CONSTRAINT dept_name_not_null NOT NULL,
    parent_department_id character varying(100),
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16399)
-- Name: employee_device; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_device (
    employee_id character varying(100) CONSTRAINT checkin_devices_employee_id_not_null NOT NULL,
    device_uuid character varying(100) CONSTRAINT checkin_devices_device_uuid_not_null NOT NULL,
    device_type character varying(100),
    is_active boolean DEFAULT true CONSTRAINT checkin_devices_is_active_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    id uuid NOT NULL
);


ALTER TABLE public.employee_device OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16471)
-- Name: employee_schedule; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.employee_schedule OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16391)
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.employees OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16430)
-- Name: punch_logs; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.punch_logs OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16409)
-- Name: punch_points; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.punch_points OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16450)
-- Name: shift_templates; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.shift_templates OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16605)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    username character varying NOT NULL,
    password character varying,
    is_active boolean DEFAULT true NOT NULL,
    employee_id character varying NOT NULL,
    is_admin boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 3899 (class 0 OID 16623)
-- Dependencies: 227
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.departments (id, name, parent_department_id, is_active) VALUES ('A001', '總開發部', 'A001', true);


--
-- TOC entry 3893 (class 0 OID 16399)
-- Dependencies: 221
-- Data for Name: employee_device; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.employee_device (employee_id, device_uuid, device_type, is_active, created_at, id) VALUES ('0000', 'C38850D8-2C55-47B2-9249-3A37229CC5C7', 'ios', false, '2025-12-31 23:52:08+08', '4ef8aee4-c1d3-47d9-8c0b-ecbb3f2e8a8f');
INSERT INTO public.employee_device (employee_id, device_uuid, device_type, is_active, created_at, id) VALUES ('0001', 'B903E63E-3630-419A-B1FD-94ACD52AF049', 'ios', true, '2026-01-01 23:37:45.399+08', 'e2010abc-e0e5-418f-96d6-7992586fc04e');
INSERT INTO public.employee_device (employee_id, device_uuid, device_type, is_active, created_at, id) VALUES ('0000', 'C38850D8-2C55-47B2-9249-3A37229CC5C7', 'ios', false, '2026-01-01 20:10:59.865+08', 'f3053d5c-16c8-4018-a22d-77d10d6e637e');
INSERT INTO public.employee_device (employee_id, device_uuid, device_type, is_active, created_at, id) VALUES ('0000', 'C38850D8-2C55-47B2-9249-3A37229CC5C7', 'ios', true, '2026-01-04 03:07:22.959+08', '418b042b-549f-4ca8-a664-39212ffe19c0');


--
-- TOC entry 3897 (class 0 OID 16471)
-- Dependencies: 225
-- Data for Name: employee_schedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.employee_schedule (id, employee_id, schedule_date, shift_template_id, created_at, updated_at, schedule_type) VALUES ('a725681c-aed0-4392-9710-8434507686c7', '0000', '2025-12-26', 'D3', '2025-12-27 18:23:04.14919+08', '2025-12-27 18:23:04.14919+08', 'daily');
INSERT INTO public.employee_schedule (id, employee_id, schedule_date, shift_template_id, created_at, updated_at, schedule_type) VALUES ('0d53545e-0d3f-4662-9b86-92279207cc24', '0001', '2026-01-01', 'D2', '2026-01-01 23:41:35.511522+08', '2026-01-01 23:41:35.511522+08', 'fixed');


--
-- TOC entry 3892 (class 0 OID 16391)
-- Dependencies: 220
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.employees (id, name, department_id, is_active, created_at, updated_at, arrival) VALUES ('0000', 'example_user', 'A001', true, '2025-12-14 23:18:23.32341+08', '2025-12-22 01:00:21.691488+08', '2025-12-23 00:00:00+08');
INSERT INTO public.employees (id, name, department_id, is_active, created_at, updated_at, arrival) VALUES ('0001', 'Hazuya', 'A001', true, '2026-01-04 12:57:54.440595+08', '2026-01-04 12:57:54.440595+08', '2026-01-01 00:00:00+08');


--
-- TOC entry 3895 (class 0 OID 16430)
-- Dependencies: 223
-- Data for Name: punch_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0001', '2026-01-04 13:00:41.519+08', 'A001', 25.051975, 121.568003, '975a8d50-fb9f-4b97-b4e0-fb569b73ddad', 'CHECK_IN', false, false, '');


--
-- TOC entry 3894 (class 0 OID 16409)
-- Dependencies: 222
-- Data for Name: punch_points; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.punch_points (id, name, latitude, longitude, radius_meters, created_at, is_active) VALUES ('PP-001', '台北 101 大樓', 25.033964, 121.564472, 10, '2025-12-27 17:05:17.369002+08', true);
INSERT INTO public.punch_points (id, name, latitude, longitude, radius_meters, created_at, is_active) VALUES ('A001', '總公司', 25.051842, 121.568051, 200, '2025-12-13 00:15:28.594271+08', true);


--
-- TOC entry 3896 (class 0 OID 16450)
-- Dependencies: 224
-- Data for Name: shift_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.shift_templates (id, name, is_cross_day, start_time_h, start_time_m, end_time_h, end_time_m, created_at, updated_at, is_active) VALUES ('D1', '總1', false, 22, 0, 23, 0, '2025-12-13 00:21:24.266018+08', '2025-12-13 00:21:24.266018+08', true);
INSERT INTO public.shift_templates (id, name, is_cross_day, start_time_h, start_time_m, end_time_h, end_time_m, created_at, updated_at, is_active) VALUES ('D3', '日三', false, 10, 0, 18, 0, '2025-12-23 22:36:50.87892+08', '2025-12-23 22:36:50.87892+08', true);
INSERT INTO public.shift_templates (id, name, is_cross_day, start_time_h, start_time_m, end_time_h, end_time_m, created_at, updated_at, is_active) VALUES ('D2', '日二', true, 20, 0, 23, 0, '2025-12-16 20:28:37.251624+08', '2025-12-16 20:28:37.251624+08', true);


--
-- TOC entry 3898 (class 0 OID 16605)
-- Dependencies: 226
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, username, password, is_active, employee_id, is_admin) VALUES ('468ccdc2-951c-4167-8aba-f4f661e194ea', '0000', '$2b$10$RSSw.OtCWkVnPWXEweEcieacUXmJP0qO3Q0tNsGOOkvvSPZEyWt2C', true, '0000', true);
INSERT INTO public.users (id, username, password, is_active, employee_id, is_admin) VALUES ('02fa93cf-08e7-4869-b2fd-3be5fcd0e52b', '0001', '$2b$10$Q5KtSUMOxJR6lxlnyMoUM.kpJJegH29/mIZygAGzvlNOpxzWCWCZu', true, '0001', false);


--
-- TOC entry 3744 (class 2606 OID 16629)
-- Name: departments dept_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT dept_pkey PRIMARY KEY (id);


--
-- TOC entry 3732 (class 2606 OID 16514)
-- Name: employee_device employee_device_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_device
    ADD CONSTRAINT employee_device_pkey PRIMARY KEY (id);


--
-- TOC entry 3740 (class 2606 OID 16481)
-- Name: employee_schedule employee_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_schedule
    ADD CONSTRAINT employee_schedule_pkey PRIMARY KEY (id);


--
-- TOC entry 3730 (class 2606 OID 16398)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- TOC entry 3736 (class 2606 OID 16444)
-- Name: punch_logs punch_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.punch_logs
    ADD CONSTRAINT punch_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3734 (class 2606 OID 16419)
-- Name: punch_points punch_points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.punch_points
    ADD CONSTRAINT punch_points_pkey PRIMARY KEY (id);


--
-- TOC entry 3738 (class 2606 OID 16460)
-- Name: shift_templates shift_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shift_templates
    ADD CONSTRAINT shift_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 3742 (class 2606 OID 16615)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


-- Completed on 2026-01-04 13:17:06 CST

--
-- PostgreSQL database dump complete
--

\unrestrict VQbXNEZodJi2kBazEXx3TZwaljD0Q0dAeFUM6t2ipckIsEi6cShneLy6VsMvtyN

