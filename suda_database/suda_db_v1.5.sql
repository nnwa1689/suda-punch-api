--
-- PostgreSQL database dump
--

\restrict Bpc10Z0UqEsFose1zsIP5X50BwhBySflg9HMypFHurEVp7N7ObBq4Jpjft7DHXY

-- Dumped from database version 18.1 (Postgres.app)
-- Dumped by pg_dump version 18.0

-- Started on 2026-01-11 23:37:42 CST

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
-- TOC entry 3924 (class 0 OID 0)
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
-- TOC entry 228 (class 1259 OID 16978)
-- Name: holidays; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.holidays (
    id uuid NOT NULL,
    date date NOT NULL,
    subject character varying(255) NOT NULL,
    is_holiday boolean DEFAULT true NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.holidays OWNER TO postgres;

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
    is_active boolean DEFAULT true NOT NULL,
    verify_type character varying(10) DEFAULT 'GPS'::character varying NOT NULL,
    wifi_ssid character varying(100),
    wifi_bssid_list character varying(500)[]
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
-- TOC entry 229 (class 1259 OID 17119)
-- Name: suda_base; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suda_base (
    base_id character varying NOT NULL,
    base_value character varying
);


ALTER TABLE public.suda_base OWNER TO postgres;

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
-- TOC entry 3916 (class 0 OID 16623)
-- Dependencies: 227
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.departments (id, name, parent_department_id, is_active) VALUES ('A001', '總開發部', 'A001', true);


--
-- TOC entry 3910 (class 0 OID 16399)
-- Dependencies: 221
-- Data for Name: employee_device; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.employee_device (employee_id, device_uuid, device_type, is_active, created_at, id) VALUES ('0000', 'C38850D8-2C55-47B2-9249-3A37229CC5C7', 'ios', false, '2025-12-31 23:52:08+08', '4ef8aee4-c1d3-47d9-8c0b-ecbb3f2e8a8f');
INSERT INTO public.employee_device (employee_id, device_uuid, device_type, is_active, created_at, id) VALUES ('0000', 'C38850D8-2C55-47B2-9249-3A37229CC5C7', 'ios', false, '2026-01-01 20:10:59.865+08', 'f3053d5c-16c8-4018-a22d-77d10d6e637e');
INSERT INTO public.employee_device (employee_id, device_uuid, device_type, is_active, created_at, id) VALUES ('0000', 'C38850D8-2C55-47B2-9249-3A37229CC5C7', 'ios', false, '2026-01-04 03:07:22.959+08', '418b042b-549f-4ca8-a664-39212ffe19c0');
INSERT INTO public.employee_device (employee_id, device_uuid, device_type, is_active, created_at, id) VALUES ('0000', 'C38850D8-2C55-47B2-9249-3A37229CC5C7', 'ios', true, '2026-01-04 14:06:50.24+08', '76066521-5849-4157-bc0e-46cc30fdf717');
INSERT INTO public.employee_device (employee_id, device_uuid, device_type, is_active, created_at, id) VALUES ('0001', 'B903E63E-3630-419A-B1FD-94ACD52AF049', 'ios', false, '2026-01-01 23:37:45.399+08', 'e2010abc-e0e5-418f-96d6-7992586fc04e');
INSERT INTO public.employee_device (employee_id, device_uuid, device_type, is_active, created_at, id) VALUES ('0001', 'B903E63E-3630-419A-B1FD-94ACD52AF049', 'ios', false, '2026-01-04 20:35:39.758+08', '6e29c49c-d812-4db2-812d-bc3917a473a0');


--
-- TOC entry 3914 (class 0 OID 16471)
-- Dependencies: 225
-- Data for Name: employee_schedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.employee_schedule (id, employee_id, schedule_date, shift_template_id, created_at, updated_at, schedule_type) VALUES ('0d53545e-0d3f-4662-9b86-92279207cc24', '0001', '2026-01-01', 'D2', '2026-01-01 23:41:35.511522+08', '2026-01-01 23:41:35.511522+08', 'fixed');
INSERT INTO public.employee_schedule (id, employee_id, schedule_date, shift_template_id, created_at, updated_at, schedule_type) VALUES ('a725681c-aed0-4392-9710-8434507686c7', '0000', '2026-01-01', 'D3', '2025-12-27 18:23:04.14919+08', '2025-12-27 18:23:04.14919+08', 'fixed');


--
-- TOC entry 3909 (class 0 OID 16391)
-- Dependencies: 220
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.employees (id, name, department_id, is_active, created_at, updated_at, arrival) VALUES ('0000', 'example_user', 'A001', true, '2025-12-14 23:18:23.32341+08', '2025-12-22 01:00:21.691488+08', '2025-12-23 00:00:00+08');
INSERT INTO public.employees (id, name, department_id, is_active, created_at, updated_at, arrival) VALUES ('0001', 'Hazuya', 'A001', true, '2026-01-04 12:57:54.440595+08', '2026-01-04 12:57:54.440595+08', '2026-01-01 00:00:00+08');


--
-- TOC entry 3917 (class 0 OID 16978)
-- Dependencies: 228
-- Data for Name: holidays; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('ca684470-835c-430f-96e8-f218b7040f58', '2026-01-04', '例假日', true, '', '2026-01-05 23:07:10.213935+08', '2026-01-05 23:07:10.213935+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('6e40ba4e-3994-4137-a4ed-86db872d24b8', '2026-02-16', '農曆除夕', true, '農曆除夕放假', '2026-01-05 23:07:10.213935+08', '2026-01-05 23:07:10.213935+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('848ebee4-9c63-47e6-b2c0-f0b634fd1f92', '2026-02-08', '補行上班', false, '補春節調整放假之工作日', '2026-01-05 23:10:51.373442+08', '2026-01-05 23:10:51.373442+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('cdfcd432-e487-41d7-a1fa-456a64b7000c', '2026-01-06', '生日假', false, '放假一天', '2026-01-05 23:07:10.213935+08', '2026-01-06 23:56:40.094466+08');


--
-- TOC entry 3912 (class 0 OID 16430)
-- Dependencies: 223
-- Data for Name: punch_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0001', '2026-01-04 13:00:41.519+08', 'A001', 25.051975, 121.568003, '975a8d50-fb9f-4b97-b4e0-fb569b73ddad', 'CHECK_IN', false, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-04 14:03:31.122+08', 'PP-001', 25.033964, 121.564472, '0d11800a-b6f5-4806-81ea-eee1957ada9a', 'CHECK_IN', false, false, '無排班記錄，請確認是否異常打卡。');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0001', '2026-01-04 14:55:39.205+08', 'A001', 25.051975, 121.568003, '38fd5549-8e21-4432-be50-6a770e3af4f5', 'CHECK_OUT', false, true, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0001', '2026-01-04 15:12:21.32+08', 'A001', 25.052063, 121.567986, 'e0e8f5db-0cb4-421c-906b-4cf51b7ad148', 'CHECK_OUT', false, true, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0001', '2026-01-04 16:00:31.069+08', 'A001', 25.052063, 121.567988, '16910d4e-8695-4e93-930d-acff3db0d852', 'CHECK_OUT', false, true, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0001', '2026-01-04 16:29:26.773+08', 'A001', 25.052064, 121.567987, '8cfec0f3-28b2-4674-8a56-44e0c6286a8e', 'CHECK_OUT', false, true, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-04 17:31:26.286+08', 'PP-001', 25.033964, 121.564472, '368593b8-69a9-498e-8b0b-6a9fc5db9b44', 'CHECK_IN', false, false, '無排班記錄，請確認是否異常打卡。');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0001', '2026-01-04 19:21:46.189+08', 'A001', 25.052002, 121.567950, '2614e2f7-8410-470c-9d9e-a41f693d6ca8', 'CHECK_OUT', false, true, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0001', '2026-01-04 20:42:27.475+08', 'A001', 25.052064, 121.567986, 'a003019f-355b-4a7e-98a7-118c58d31207', 'CHECK_OUT', false, true, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0001', '2026-01-04 20:53:10.905+08', 'A001', 25.052064, 121.567986, 'e80d5db7-22fe-4447-8735-e49b2e4824df', 'CHECK_OUT', false, true, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0001', '2026-01-04 21:03:55.045+08', 'A001', 25.052064, 121.567986, '64df635c-d633-4ad4-9232-fbc24df8a104', 'CHECK_OUT', false, true, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0001', '2026-01-04 21:44:01.441+08', 'A001', 25.051979, 121.568016, 'c98f7468-3270-43b9-92cc-992160202bcd', 'CHECK_IN', true, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0001', '2026-01-04 21:45:07.34+08', 'A001', 25.051979, 121.568016, 'c3fe70f2-b9e8-4fa1-b411-66093c2b7f92', 'CHECK_OUT', false, true, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-04 22:13:51.433+08', 'PP-001', 25.033964, 121.564472, '01cb2e33-142a-402f-a27a-70fdda20308f', 'CHECK_OUT', false, false, '無排班記錄，請確認是否異常打卡。');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-04 23:04:07.723+08', 'PP-001', 25.033964, 121.564472, '6d22d474-22bc-4a94-bdf8-0d050dd52461', 'CHECK_IN', false, false, '無排班記錄，請確認是否異常打卡。');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-04 23:04:18.737+08', 'PP-001', 25.033964, 121.564472, 'ea1f75d6-c47e-4000-9344-ad902fb8c57e', 'CHECK_OUT', false, false, '無排班記錄，請確認是否異常打卡。');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-04 23:06:23.867+08', 'PP-001', 25.033964, 121.564472, 'e353b48c-c5ac-49a8-88c2-72869991532c', 'CHECK_IN', false, false, '無排班記錄，請確認是否異常打卡。');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-04 23:58:06.422+08', 'PP-001', 25.033964, 121.564472, '2f454002-5359-474a-a124-17de35c73d0f', 'CHECK_OUT', false, false, '無排班記錄，請確認是否異常打卡。');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0001', '2026-01-04 23:58:49.31+08', 'A001', 25.051904, 121.567960, '3d671b37-f686-4729-8e3a-01612c5b3f9c', 'CHECK_OUT', false, true, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-06 21:59:50.437+08', 'PP-001', 25.033964, 121.564472, 'e23f1dd4-d3dc-4fb9-b56a-ab3683ba9104', 'CHECK_IN', false, false, '無排班記錄，請確認是否異常打卡。');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-06 23:51:11.068+08', 'PP-001', 25.033964, 121.564472, '53369425-38a4-428f-b2b1-26a7c9384a69', 'CHECK_IN', true, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-06 23:51:15.878+08', 'PP-001', 25.033964, 121.564472, '4bb5c637-c0c7-4b2a-8c42-64b12b19fe77', 'CHECK_OUT', false, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-06 23:51:34.352+08', 'PP-001', 25.033964, 121.564472, '8e2284cb-290d-48e2-83fa-890de3381fe9', 'CHECK_OUT', false, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-06 23:52:12.067+08', 'PP-001', 25.033964, 121.564472, 'd632e5e1-d416-433f-be58-f5a6e3c6e45d', 'CHECK_OUT', false, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-06 23:56:52.75+08', 'PP-001', 25.033964, 121.564472, '99af15b6-d841-4372-b281-db624daddf65', 'CHECK_OUT', false, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-07 22:26:39.268+08', 'PP-001', 25.033964, 121.564472, '3432de57-480e-40fa-8e23-89ad45451463', 'CHECK_IN', true, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-08 23:04:38.249+08', 'PP-001', 25.033964, 121.564472, '4eca60e5-92bb-48a1-979f-57798a470fd6', 'CHECK_OUT', false, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-11 20:53:49.345+08', 'PP-001', 25.033964, 121.564472, '876405a1-2c76-494b-8f4c-a2f0ac1a58e7', 'CHECK_IN', true, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-11 21:00:52.063+08', 'PP-001', 25.033964, 121.564472, 'c9514cc1-292e-457c-be16-ddd35d1b4551', 'CHECK_IN', true, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-11 21:02:56.54+08', 'PP-001', 25.033964, 121.564472, 'a57d9139-c9c7-4ff1-af58-f4c5b5815fb9', 'CHECK_OUT', false, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-11 21:25:14.611+08', 'PP-001', 25.033964, 121.564472, '311dd5ee-c6f7-47ad-92a4-eeb1d86d03f7', 'CHECK_IN', true, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-11 21:43:19.909+08', 'PP-001', 25.033964, 121.564472, 'a31920ef-bac2-45c8-b22f-577d23ee838a', 'CHECK_IN', true, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-11 21:56:42.727+08', 'PP-001', 25.033964, 121.564472, 'e1cf5ceb-cb9c-4902-ae9a-65906f6d2ead', 'CHECK_IN', true, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-11 23:34:35.419+08', 'PP-001', 25.033964, 121.564472, '93b03489-a66d-46a3-afc3-8bc82d18422f', 'CHECK_IN', true, false, '');


--
-- TOC entry 3911 (class 0 OID 16409)
-- Dependencies: 222
-- Data for Name: punch_points; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.punch_points (id, name, latitude, longitude, radius_meters, created_at, is_active, verify_type, wifi_ssid, wifi_bssid_list) VALUES ('PP-002', '台北 102 大樓', 25.033964, 121.564472, 10, '2026-01-11 21:56:23.13602+08', true, 'WIFI', 'RTEST', '{0000,12345}');
INSERT INTO public.punch_points (id, name, latitude, longitude, radius_meters, created_at, is_active, verify_type, wifi_ssid, wifi_bssid_list) VALUES ('A001', '總公司', 25.051842, 121.568051, 200, '2025-12-13 00:15:28.594271+08', true, 'GPS', NULL, '{abc,aasdf}');
INSERT INTO public.punch_points (id, name, latitude, longitude, radius_meters, created_at, is_active, verify_type, wifi_ssid, wifi_bssid_list) VALUES ('PP-001', '台北 101 大樓', 25.033964, 121.564472, 200, '2025-12-27 17:05:17.369002+08', true, 'GPS', 'RTEST', '{0000,12345}');


--
-- TOC entry 3913 (class 0 OID 16450)
-- Dependencies: 224
-- Data for Name: shift_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.shift_templates (id, name, is_cross_day, start_time_h, start_time_m, end_time_h, end_time_m, created_at, updated_at, is_active) VALUES ('D1', '總1', false, 22, 0, 23, 0, '2025-12-13 00:21:24.266018+08', '2025-12-13 00:21:24.266018+08', true);
INSERT INTO public.shift_templates (id, name, is_cross_day, start_time_h, start_time_m, end_time_h, end_time_m, created_at, updated_at, is_active) VALUES ('D3', '日三', false, 10, 0, 18, 0, '2025-12-23 22:36:50.87892+08', '2025-12-23 22:36:50.87892+08', true);
INSERT INTO public.shift_templates (id, name, is_cross_day, start_time_h, start_time_m, end_time_h, end_time_m, created_at, updated_at, is_active) VALUES ('D2', '日二', true, 20, 0, 23, 0, '2025-12-16 20:28:37.251624+08', '2025-12-16 20:28:37.251624+08', true);


--
-- TOC entry 3918 (class 0 OID 17119)
-- Dependencies: 229
-- Data for Name: suda_base; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.suda_base (base_id, base_value) VALUES ('company_name', '速打開源科技有限公司');


--
-- TOC entry 3915 (class 0 OID 16605)
-- Dependencies: 226
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, username, password, is_active, employee_id, is_admin) VALUES ('468ccdc2-951c-4167-8aba-f4f661e194ea', '0000', '$2b$10$RSSw.OtCWkVnPWXEweEcieacUXmJP0qO3Q0tNsGOOkvvSPZEyWt2C', true, '0000', true);
INSERT INTO public.users (id, username, password, is_active, employee_id, is_admin) VALUES ('02fa93cf-08e7-4869-b2fd-3be5fcd0e52b', '0001', '$2b$10$Q5KtSUMOxJR6lxlnyMoUM.kpJJegH29/mIZygAGzvlNOpxzWCWCZu', true, '0001', false);


--
-- TOC entry 3756 (class 2606 OID 16629)
-- Name: departments dept_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT dept_pkey PRIMARY KEY (id);


--
-- TOC entry 3744 (class 2606 OID 16514)
-- Name: employee_device employee_device_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_device
    ADD CONSTRAINT employee_device_pkey PRIMARY KEY (id);


--
-- TOC entry 3752 (class 2606 OID 16481)
-- Name: employee_schedule employee_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_schedule
    ADD CONSTRAINT employee_schedule_pkey PRIMARY KEY (id);


--
-- TOC entry 3742 (class 2606 OID 16398)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- TOC entry 3759 (class 2606 OID 16991)
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (id);


--
-- TOC entry 3748 (class 2606 OID 16444)
-- Name: punch_logs punch_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.punch_logs
    ADD CONSTRAINT punch_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3746 (class 2606 OID 16419)
-- Name: punch_points punch_points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.punch_points
    ADD CONSTRAINT punch_points_pkey PRIMARY KEY (id);


--
-- TOC entry 3750 (class 2606 OID 16460)
-- Name: shift_templates shift_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shift_templates
    ADD CONSTRAINT shift_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 3761 (class 2606 OID 17126)
-- Name: suda_base suda_base_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suda_base
    ADD CONSTRAINT suda_base_pkey PRIMARY KEY (base_id);


--
-- TOC entry 3754 (class 2606 OID 16615)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3757 (class 1259 OID 16992)
-- Name: IDX_HOLIDAY_DATE; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_HOLIDAY_DATE" ON public.holidays USING btree (date);


-- Completed on 2026-01-11 23:37:42 CST

--
-- PostgreSQL database dump complete
--

\unrestrict Bpc10Z0UqEsFose1zsIP5X50BwhBySflg9HMypFHurEVp7N7ObBq4Jpjft7DHXY

