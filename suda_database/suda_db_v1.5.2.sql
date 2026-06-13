--
-- PostgreSQL database dump
--

\restrict eWBLDqqIddkll6sbTCVGN7YwQhb7Jko6EYNtIrwrPZ5eTBNLVE6r0DLpptsj6as

-- Dumped from database version 18.1 (Postgres.app)
-- Dumped by pg_dump version 18.0

-- Started on 2026-06-13 23:58:23 CST

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
-- TOC entry 3925 (class 1262 OID 16390)
-- Name: suda; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE suda WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = icu LOCALE = 'en_US.UTF-8' ICU_LOCALE = 'en-US';


ALTER DATABASE suda OWNER TO postgres;

\unrestrict eWBLDqqIddkll6sbTCVGN7YwQhb7Jko6EYNtIrwrPZ5eTBNLVE6r0DLpptsj6as
\connect suda
\restrict eWBLDqqIddkll6sbTCVGN7YwQhb7Jko6EYNtIrwrPZ5eTBNLVE6r0DLpptsj6as

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
-- TOC entry 3926 (class 0 OID 0)
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
    is_active boolean DEFAULT true NOT NULL,
    manager_id character varying(100) DEFAULT 0 NOT NULL
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
    wifi_bssid_list character varying(500)[],
    bluetooth_service_uuid character varying(100)
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
-- TOC entry 3917 (class 0 OID 16623)
-- Dependencies: 227
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.departments (id, name, parent_department_id, is_active, manager_id) VALUES ('B201', '資訊處', 'A001', true, '0');
INSERT INTO public.departments (id, name, parent_department_id, is_active, manager_id) VALUES ('B101', '總務處', 'A001', false, '0');
INSERT INTO public.departments (id, name, parent_department_id, is_active, manager_id) VALUES ('B2011', '軟體與網路管理部', 'B201', true, '0');
INSERT INTO public.departments (id, name, parent_department_id, is_active, manager_id) VALUES ('B301', '軟體研發與產品處', 'A001', true, '0');
INSERT INTO public.departments (id, name, parent_department_id, is_active, manager_id) VALUES ('A0011', '總管理部', 'A001', true, '0');
INSERT INTO public.departments (id, name, parent_department_id, is_active, manager_id) VALUES ('A0012', '總經理室', 'A001', true, '0');
INSERT INTO public.departments (id, name, parent_department_id, is_active, manager_id) VALUES ('A001', '總經理與總管理處', '000', true, '0001');
INSERT INTO public.departments (id, name, parent_department_id, is_active, manager_id) VALUES ('B3011', '軟體研發一部', 'B301', true, 'EMP0001');


--
-- TOC entry 3911 (class 0 OID 16399)
-- Dependencies: 221
-- Data for Name: employee_device; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.employee_device (employee_id, device_uuid, device_type, is_active, created_at, id) VALUES ('0000', 'C38850D8-2C55-47B2-9249-3A37229CC5C7', 'ios', false, '2025-12-31 23:52:08+08', '4ef8aee4-c1d3-47d9-8c0b-ecbb3f2e8a8f');
INSERT INTO public.employee_device (employee_id, device_uuid, device_type, is_active, created_at, id) VALUES ('0000', 'C38850D8-2C55-47B2-9249-3A37229CC5C7', 'ios', false, '2026-01-01 20:10:59.865+08', 'f3053d5c-16c8-4018-a22d-77d10d6e637e');
INSERT INTO public.employee_device (employee_id, device_uuid, device_type, is_active, created_at, id) VALUES ('0000', 'C38850D8-2C55-47B2-9249-3A37229CC5C7', 'ios', false, '2026-01-04 03:07:22.959+08', '418b042b-549f-4ca8-a664-39212ffe19c0');
INSERT INTO public.employee_device (employee_id, device_uuid, device_type, is_active, created_at, id) VALUES ('0001', 'B903E63E-3630-419A-B1FD-94ACD52AF049', 'ios', false, '2026-01-01 23:37:45.399+08', 'e2010abc-e0e5-418f-96d6-7992586fc04e');
INSERT INTO public.employee_device (employee_id, device_uuid, device_type, is_active, created_at, id) VALUES ('0001', 'B903E63E-3630-419A-B1FD-94ACD52AF049', 'ios', false, '2026-01-04 20:35:39.758+08', '6e29c49c-d812-4db2-812d-bc3917a473a0');
INSERT INTO public.employee_device (employee_id, device_uuid, device_type, is_active, created_at, id) VALUES ('0000', 'C38850D8-2C55-47B2-9249-3A37229CC5C7', 'ios', false, '2026-01-04 14:06:50.24+08', '76066521-5849-4157-bc0e-46cc30fdf717');
INSERT INTO public.employee_device (employee_id, device_uuid, device_type, is_active, created_at, id) VALUES ('0000', '99170348-560A-4E72-831B-D86ACE55590A', 'ios', false, '2026-03-26 23:33:13.248+08', '80463b33-5375-4409-9c71-01019832c475');
INSERT INTO public.employee_device (employee_id, device_uuid, device_type, is_active, created_at, id) VALUES ('EMP0001', 'B0C51848-73D7-4D62-8574-33E00ED66A06', 'ios', true, '2026-06-13 23:25:26.82+08', '0dd9d0d3-c379-4a18-8651-9cc525e8c7b3');


--
-- TOC entry 3915 (class 0 OID 16471)
-- Dependencies: 225
-- Data for Name: employee_schedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.employee_schedule (id, employee_id, schedule_date, shift_template_id, created_at, updated_at, schedule_type) VALUES ('0d53545e-0d3f-4662-9b86-92279207cc24', '0001', '2026-01-01', 'D2', '2026-01-01 23:41:35.511522+08', '2026-01-01 23:41:35.511522+08', 'fixed');
INSERT INTO public.employee_schedule (id, employee_id, schedule_date, shift_template_id, created_at, updated_at, schedule_type) VALUES ('a725681c-aed0-4392-9710-8434507686c7', '0000', '2026-01-01', 'D3', '2025-12-27 18:23:04.14919+08', '2025-12-27 18:23:04.14919+08', 'fixed');


--
-- TOC entry 3910 (class 0 OID 16391)
-- Dependencies: 220
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.employees (id, name, department_id, is_active, created_at, updated_at, arrival) VALUES ('0001', 'Hazuya', 'A001', true, '2026-01-04 12:57:54.440595+08', '2026-01-04 12:57:54.440595+08', '2026-01-01 00:00:00+08');
INSERT INTO public.employees (id, name, department_id, is_active, created_at, updated_at, arrival) VALUES ('0000', 'TedTest', 'B3011', true, '2025-12-14 23:18:23.32341+08', '2025-12-22 01:00:21.691488+08', '2025-12-23 00:00:00+08');
INSERT INTO public.employees (id, name, department_id, is_active, created_at, updated_at, arrival) VALUES ('EMP0001', '測試帳號001', 'B2011', true, '2026-06-13 23:20:58.519623+08', '2026-06-13 23:20:58.519623+08', '2026-06-13 08:00:00+08');


--
-- TOC entry 3918 (class 0 OID 16978)
-- Dependencies: 228
-- Data for Name: holidays; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('31859aad-6175-4863-a848-eb4dde89d43f', '2026-01-01', '中華民國開國紀念日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('407b1983-8e06-4d26-b295-d00439f00af2', '2026-01-03', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('0d8d873c-5a10-4034-ae76-4cda89bc6385', '2026-01-04', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('af15b04c-dea3-455a-9c38-49ad2a4d20e4', '2026-01-10', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('ec445096-70f6-40a8-800f-358006ea6fff', '2026-01-11', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('296c4060-bf0e-41ca-9647-48156ade3758', '2026-01-17', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('95e54641-5e7e-45e4-9d5e-ff5620ce41a5', '2026-01-18', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('5f266132-5084-468c-bf24-38ea1c601fb2', '2026-01-24', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('1a3a459c-f64f-4ef0-b874-d1444f523501', '2026-01-25', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('c418b608-a14e-4e3b-9e08-1624b0b75819', '2026-01-31', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('5a26feec-93d7-498b-8a04-ab9865dd7e59', '2026-02-01', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('17a4bf7a-38f0-4471-b029-753e35166710', '2026-02-07', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('ca3b72ee-565a-4c6c-b4b3-b4cd8cb54590', '2026-02-08', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('afc26d71-ef66-45ca-9918-54954bc73f1d', '2026-02-14', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('70dcef36-514a-4346-a47f-605a61427d12', '2026-02-15', '小年夜', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('9649410f-a6dc-416b-8438-f9392f2eab16', '2026-02-16', '農曆除夕', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('9da30c0e-0697-457b-a6e3-ac52736d26bf', '2026-02-17', '春節', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('5499ade0-4f75-452f-8fe2-701d52907a65', '2026-02-18', '春節', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('4204eddd-d463-4280-a2ed-139a5b1d2235', '2026-02-19', '春節', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('e5bf3b21-2aaa-4b7e-b79c-039934bc17eb', '2026-02-20', '補假', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('f30cf640-a061-42c7-bf93-0c7abe4965a8', '2026-02-21', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('763a007b-4f06-44e0-89e8-fd675858cfa8', '2026-02-22', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('985bc58d-d986-45f8-8799-c903bec044e5', '2026-02-27', '補假', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('ad285004-cc3a-461b-8b4d-3a99f03dc457', '2026-02-28', '和平紀念日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('0b752371-256a-4205-b88b-9213bf7f124e', '2026-03-01', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('ef1d3a09-265f-4a77-aacf-092b839a4349', '2026-03-07', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('49cef787-a381-4b04-8e8f-e192d474f7c6', '2026-03-08', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('d4d56905-8579-4218-b19f-3fe662f37b60', '2026-03-14', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('3850c334-c287-4993-9545-eaca07ae77ad', '2026-03-15', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('d57eadc7-1db6-4149-965e-8e0ea72402a5', '2026-03-21', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('09aefb2a-97b2-4115-b7e9-d4489d1d6c82', '2026-03-22', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('d60e0c65-ba6d-4a80-a5bd-8415a496ef99', '2026-03-28', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('8020cdcd-7cc4-41af-bd92-756e80c33eca', '2026-03-29', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('5c9e7288-6c29-4ecf-9809-05c71d6a54c9', '2026-04-03', '補假', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('6b7c7ede-7b1b-49c0-9ec6-1379d927b1ea', '2026-04-04', '兒童節', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('92b00b47-5044-4200-afbf-76c7d2e08ae3', '2026-04-05', '清明節', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('a8f3f4af-9c6d-4ab4-854e-2a0ab8eb724d', '2026-04-06', '補假', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('95f9841f-3b05-4e1a-9ca6-f3eb920c222e', '2026-04-11', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('48d7d9a6-a18f-4a5e-bd22-1500db27c4e4', '2026-04-12', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('a403382e-2826-45b9-8eb0-0e74ff692469', '2026-04-18', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('b9c2049b-d7a5-478d-a12e-a6e354af6824', '2026-04-19', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('7ae4f2b5-eef6-4f70-9a1b-c9b7d8e0b70b', '2026-04-25', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('e88fd58c-4e1b-4d86-937f-886dec00a063', '2026-04-26', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('f05881fa-5d27-4253-886c-acfe1bfbc7ac', '2026-05-01', '勞動節', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('f606d004-7c04-43c1-a713-37b6f78d4e1e', '2026-05-02', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('50345989-0ad1-46e5-bc35-4cbdb6b47735', '2026-05-03', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('2245e23d-be19-43ab-95da-8f8946f33245', '2026-05-09', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('c105fafb-4101-49f1-ab50-ba29715bb811', '2026-05-10', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('c7af3832-ff96-495b-9b55-9c6e373d388a', '2026-05-16', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('a795dfdc-d969-415b-979e-b7a747599f9c', '2026-05-17', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('f9f9d27a-77cc-40de-addb-fa99010c7da2', '2026-05-23', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('2431426e-3697-4387-9e17-a1732c72ded7', '2026-05-24', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('e2f050e5-267b-46ee-862f-8c35d5a0e24a', '2026-05-30', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('95206b6b-be8e-41ee-a6af-fa384a48d5c7', '2026-05-31', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('8d2782d7-c5cf-41bf-a72a-91767027aec7', '2026-06-06', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('8f4b81ff-26f0-40dc-adaf-f18cd6c1a188', '2026-06-07', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('0a35c627-9ce2-4628-abd7-447db706fd8f', '2026-06-13', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('07154b06-acde-43cc-bf7c-6655c505382a', '2026-06-14', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('ac2b9919-8349-4b0e-8b88-5fc44606af09', '2026-06-19', '端午節', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('7ed5ba4e-c24c-4dc5-ace3-a938997e3d9b', '2026-06-20', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('872759ff-f576-410c-af33-bb3ee7d10386', '2026-06-21', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('9859f14d-7f58-4a46-9572-ba8d481d6bd9', '2026-06-27', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('18184c33-cc54-4991-b86a-343c52a4ff8b', '2026-06-28', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('58b63900-be42-4540-bec5-f28ea9dece17', '2026-07-04', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('51aaa5a3-3e6f-4f19-9ed3-8f5744d03d4b', '2026-07-05', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('1309e339-ca0c-4d1a-bd59-0a0f5af1a7b6', '2026-07-11', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('d6c4f5d6-1aa5-4a7e-a655-aaa68fcd55a3', '2026-07-12', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('8353465f-04b2-475c-a972-5cddf6a335d3', '2026-07-18', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('a525375a-00fd-44db-ab4b-aeac6d03b502', '2026-07-19', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('aad55193-d236-4e81-b14c-d48e8b857ccf', '2026-07-25', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('17b564b8-b74e-4a07-9f7a-ce4b6951fe23', '2026-07-26', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('46dffd11-077a-4874-a5da-dcddccb3bd78', '2026-08-01', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('0beeed86-b9d9-4e38-804d-c41049012088', '2026-08-02', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('8964241f-aaee-4904-9e13-45345f457edb', '2026-08-08', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('dbbc1197-5f89-47d7-b207-e8b05e7c9986', '2026-08-09', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('b837a10a-570b-4d59-92f9-f90a652a1a5d', '2026-08-15', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('28a70483-288f-4963-af34-1be84694c85f', '2026-08-16', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('ba65637a-5bc9-43f7-a615-683a8bd37972', '2026-08-22', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('3a0fc16e-0037-4db6-bc44-a4e4137f70ee', '2026-08-23', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('cda0db9e-af1d-4ef7-adb2-e3d121f2d198', '2026-08-29', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('dbf2e966-ca7f-4b25-bf66-3df816fe3b2a', '2026-08-30', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('edda9c1a-07cf-4cbf-b443-e64fe6fdf438', '2026-09-05', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('dbbee8db-4795-4b65-98aa-e055aebef99b', '2026-09-06', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('2682734f-1d73-4927-87b2-b2f8bef329d2', '2026-09-12', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('8ff946cd-b1ce-480f-a5b8-63706a93310b', '2026-09-13', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('83a7ee1c-9fcf-4806-98d5-751b0e736c4c', '2026-09-19', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('3e2b77d6-ebbb-48e7-91fc-3257242ceb32', '2026-09-20', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('78c19afc-2b56-4240-b173-c376beee322d', '2026-09-25', '中秋節', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('b7aaa6b5-a743-4964-b23f-986db98e84eb', '2026-09-26', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('4da4d204-162c-42f6-8192-50cc26c0eaa3', '2026-09-27', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('30a91f3e-bfe4-4ef9-b380-f49dcc47713e', '2026-09-28', '教師節', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('0ec8083a-10d0-4ee6-8e4d-48ca0f16abec', '2026-10-03', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('07cbbb7f-d83f-4c1f-9075-dcfac01d03af', '2026-10-04', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('3c2051f1-42a9-4987-8de6-c0faa702f3bb', '2026-10-09', '補假', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('bb3d5545-11c1-4fc6-8ffa-1841602a0496', '2026-10-10', '國慶日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('cf449e3a-36a8-4fed-8d48-528cfdcc773f', '2026-10-11', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('90b8bcb7-3c29-4528-86d0-009c94095a6e', '2026-10-17', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('0805f633-f8e1-48c0-849b-03e8c47ce0d6', '2026-10-18', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('e6fc086e-63bf-48d7-92a6-6d8f4ff72173', '2026-10-24', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('80e509d2-7900-44dc-928c-996dcdee4af1', '2026-10-25', '臺灣光復暨金門古寧頭大捷紀念日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('6d9521bf-1f75-433f-b63f-d3e6571d4dae', '2026-10-26', '補假', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('cf177a6c-cdf6-45a0-8289-871fbc23fafd', '2026-10-31', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('fca64bfa-02c2-4be7-b8d0-a6c0a404e0b2', '2026-11-01', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('16898dfc-f442-4ae0-b8d1-384a2d75fb95', '2026-11-07', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('c69f1f10-d4b3-460e-82b8-11c20598059c', '2026-11-08', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('10b03a42-d17e-4979-81c5-56ecca2b36af', '2026-11-14', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('77016feb-6f0a-4ead-a0d5-bdf6b7995b0f', '2026-11-15', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('322a9c51-94c1-4c24-9a18-fe1a8ad5d863', '2026-11-21', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('be42c6fc-943f-46f1-b690-a9fc3acbe8a1', '2026-11-22', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('9ce68ff1-026f-491e-81ac-914309520d4b', '2026-11-28', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('b3857e3d-d4cb-4d35-8ad8-6c77db755e23', '2026-11-29', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('16d2fa9c-a782-4706-87df-ba58b5bd2bac', '2026-12-05', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('dec20ab5-3010-4dda-a671-0bb258bc8246', '2026-12-06', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('bf41717a-bcb9-4434-ab30-5024c74181f9', '2026-12-12', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('4fcdd2fb-317d-44f8-9405-b813cfb69f8f', '2026-12-13', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('a92ff0ea-5a1b-46ac-a826-161869fd2f64', '2026-12-19', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('35f888aa-662f-47fe-8f66-23d6aa93873e', '2026-12-20', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('07025654-486d-4ced-b0b1-baa7fb16eb81', '2026-12-25', '行憲紀念日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('14321031-8d36-4147-ade7-474a93d8a38a', '2026-12-26', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');
INSERT INTO public.holidays (id, date, subject, is_holiday, description, created_at, updated_at) VALUES ('0a37a213-9388-4a4b-ab42-7e211cf33d44', '2026-12-27', '例假日', true, '', '2026-01-18 21:57:09.421569+08', '2026-01-18 21:57:09.421569+08');


--
-- TOC entry 3913 (class 0 OID 16430)
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
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-14 00:48:37.191+08', 'PP-001', 25.033964, 121.564472, '61fc7f99-ccfe-4545-aa7c-7c14dc8f891d', 'CHECK_IN', false, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-14 00:48:48.402+08', 'A001Blue', 25.033964, 121.564472, 'a008feca-551a-4fb0-ad6e-a7411c651cc8', 'CHECK_IN', false, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-14 23:54:21.281+08', 'A001Blue', 25.033964, 121.564472, 'acc37622-d126-4246-b96a-882c76582742', 'CHECK_IN', true, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-18 02:14:35.094+08', 'PP-001', 25.033964, 121.564472, '6f1c84a8-0317-4003-868b-beae69784a30', 'CHECK_IN', false, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-24 22:55:19.922+08', 'PP-001', 25.033964, 121.564472, '950b6f0b-8d18-404c-8d2c-61759c5324fb', 'CHECK_IN', true, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-24 22:59:13.532+08', 'PP-001', 25.033964, 121.564472, 'f9cf50b1-c4f1-4993-8223-c5bcd075e24f', 'CHECK_IN', true, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-24 22:59:39.813+08', 'PP-001', 25.033964, 121.564472, '618943e9-0ea5-4237-8b92-483bc6900855', 'CHECK_OUT', false, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-24 23:09:53.521+08', 'PP-001', 25.033964, 121.564472, '05cdca6a-551a-4a97-8800-82cd29f5e3d3', 'CHECK_IN', true, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-24 23:19:06.127+08', 'PP-001', 25.033964, 121.564472, '17f418bd-2707-4b90-b85f-9619ad8568f1', 'CHECK_IN', true, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-25 00:04:54.148+08', 'PP-001', 25.033964, 121.564472, '62c2060d-0199-462e-81b5-1522b4bc67fe', 'CHECK_IN', false, false, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-01-25 00:05:06.644+08', 'PP-001', 25.033964, 121.564472, '191f3702-2199-4176-9c25-b2af1429b165', 'CHECK_OUT', false, true, '');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('0000', '2026-03-26 23:33:31.461+08', 'PP-001', 25.033964, 121.564472, 'f38d3c00-6677-445f-8f76-cb5cab7c571f', 'CHECK_IN', false, false, '無排班記錄，請確認是否異常打卡。');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('EMP0001', '2026-06-13 23:25:48.133+08', 'PP-001', 25.033964, 121.564472, 'fedec0bf-d1d5-4874-9d89-02659b1f5c84', 'CHECK_IN', false, false, '無排班記錄，請確認是否異常打卡。');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('EMP0001', '2026-06-13 23:26:23.137+08', 'PP-001', 25.033964, 121.564472, '29e35aa5-ba4f-4599-88a0-81a5cccb1503', 'CHECK_OUT', false, false, '無排班記錄，請確認是否異常打卡。');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('EMP0001', '2026-06-13 23:31:00.205+08', 'PP-001', 25.033964, 121.564472, 'cf8300ec-d551-4c0e-b088-63aef99c7008', 'CHECK_IN', false, false, '無排班記錄，請確認是否異常打卡。');
INSERT INTO public.punch_logs (employee_id, punch_time, punch_points_id, recorded_lat, recorded_lng, id, punch_type, is_late, is_early, remark) VALUES ('EMP0001', '2026-06-13 23:34:01.258+08', 'PP-001', 25.033964, 121.564472, 'b3a872b8-372e-4466-9d17-0b4270de4459', 'CHECK_OUT', false, false, '無排班記錄，請確認是否異常打卡。');


--
-- TOC entry 3912 (class 0 OID 16409)
-- Dependencies: 222
-- Data for Name: punch_points; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.punch_points (id, name, latitude, longitude, radius_meters, created_at, is_active, verify_type, wifi_ssid, wifi_bssid_list, bluetooth_service_uuid) VALUES ('A001', '總公司', 25.051842, 121.568051, 200, '2025-12-13 00:15:28.594271+08', true, 'GPS', NULL, '{abc,aasdf}', NULL);
INSERT INTO public.punch_points (id, name, latitude, longitude, radius_meters, created_at, is_active, verify_type, wifi_ssid, wifi_bssid_list, bluetooth_service_uuid) VALUES ('PP-001', '台北 101 大樓', 25.033964, 121.564472, 200, '2025-12-27 17:05:17.369002+08', true, 'GPS', 'RTEST', '{0000,12345}', NULL);
INSERT INTO public.punch_points (id, name, latitude, longitude, radius_meters, created_at, is_active, verify_type, wifi_ssid, wifi_bssid_list, bluetooth_service_uuid) VALUES ('PP-002', '台北 102 大樓', 25.033964, 121.564472, 10, '2026-01-11 21:56:23.13602+08', true, 'WIFI', 'RTEST', '{0000,12345}', NULL);
INSERT INTO public.punch_points (id, name, latitude, longitude, radius_meters, created_at, is_active, verify_type, wifi_ssid, wifi_bssid_list, bluetooth_service_uuid) VALUES ('A001Blue', '總公司Bluetooth', 25.033964, 121.564472, 10, '2026-01-14 00:33:11.839265+08', true, 'Bluetooth', NULL, NULL, NULL);


--
-- TOC entry 3914 (class 0 OID 16450)
-- Dependencies: 224
-- Data for Name: shift_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.shift_templates (id, name, is_cross_day, start_time_h, start_time_m, end_time_h, end_time_m, created_at, updated_at, is_active) VALUES ('D1', '總1', false, 22, 0, 23, 0, '2025-12-13 00:21:24.266018+08', '2025-12-13 00:21:24.266018+08', true);
INSERT INTO public.shift_templates (id, name, is_cross_day, start_time_h, start_time_m, end_time_h, end_time_m, created_at, updated_at, is_active) VALUES ('D3', '日三', false, 10, 0, 18, 0, '2025-12-23 22:36:50.87892+08', '2025-12-23 22:36:50.87892+08', true);
INSERT INTO public.shift_templates (id, name, is_cross_day, start_time_h, start_time_m, end_time_h, end_time_m, created_at, updated_at, is_active) VALUES ('D2', '日二', true, 20, 0, 23, 0, '2025-12-16 20:28:37.251624+08', '2025-12-16 20:28:37.251624+08', true);


--
-- TOC entry 3919 (class 0 OID 17119)
-- Dependencies: 229
-- Data for Name: suda_base; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.suda_base (base_id, base_value) VALUES ('company_name', '速打智慧科技有限公司');


--
-- TOC entry 3916 (class 0 OID 16605)
-- Dependencies: 226
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, username, password, is_active, employee_id, is_admin) VALUES ('02fa93cf-08e7-4869-b2fd-3be5fcd0e52b', '0001', '$2b$10$Q5KtSUMOxJR6lxlnyMoUM.kpJJegH29/mIZygAGzvlNOpxzWCWCZu', true, '0001', false);
INSERT INTO public.users (id, username, password, is_active, employee_id, is_admin) VALUES ('468ccdc2-951c-4167-8aba-f4f661e194ea', '0000', '$2b$10$RSSw.OtCWkVnPWXEweEcieacUXmJP0qO3Q0tNsGOOkvvSPZEyWt2C', true, '0000', true);
INSERT INTO public.users (id, username, password, is_active, employee_id, is_admin) VALUES ('8dd870c1-319b-4432-894e-a59c8da44efd', 'EMP0001', '$2b$10$XrRyZ6h0NhLpWUNuLI/N4uGvfpitn7OOzO9rxskqqthoegFgvR6JC', true, 'EMP0001', false);


--
-- TOC entry 3757 (class 2606 OID 16629)
-- Name: departments dept_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT dept_pkey PRIMARY KEY (id);


--
-- TOC entry 3745 (class 2606 OID 16514)
-- Name: employee_device employee_device_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_device
    ADD CONSTRAINT employee_device_pkey PRIMARY KEY (id);


--
-- TOC entry 3753 (class 2606 OID 16481)
-- Name: employee_schedule employee_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_schedule
    ADD CONSTRAINT employee_schedule_pkey PRIMARY KEY (id);


--
-- TOC entry 3743 (class 2606 OID 16398)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- TOC entry 3760 (class 2606 OID 16991)
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (id);


--
-- TOC entry 3749 (class 2606 OID 16444)
-- Name: punch_logs punch_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.punch_logs
    ADD CONSTRAINT punch_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3747 (class 2606 OID 16419)
-- Name: punch_points punch_points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.punch_points
    ADD CONSTRAINT punch_points_pkey PRIMARY KEY (id);


--
-- TOC entry 3751 (class 2606 OID 16460)
-- Name: shift_templates shift_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shift_templates
    ADD CONSTRAINT shift_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 3762 (class 2606 OID 17126)
-- Name: suda_base suda_base_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suda_base
    ADD CONSTRAINT suda_base_pkey PRIMARY KEY (base_id);


--
-- TOC entry 3755 (class 2606 OID 16615)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3758 (class 1259 OID 16992)
-- Name: IDX_HOLIDAY_DATE; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_HOLIDAY_DATE" ON public.holidays USING btree (date);


-- Completed on 2026-06-13 23:58:24 CST

--
-- PostgreSQL database dump complete
--

\unrestrict eWBLDqqIddkll6sbTCVGN7YwQhb7Jko6EYNtIrwrPZ5eTBNLVE6r0DLpptsj6as

