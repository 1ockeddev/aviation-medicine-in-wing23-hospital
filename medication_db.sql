--
-- PostgreSQL database dump
--

\restrict CB2mHLY39etSIDx1WXguwJ2zxuIKhTMvCWBcOAOfRC15aZebV8ldgRFwVcz4ZNX

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.3 (Homebrew)

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
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public._prisma_migrations VALUES ('97118cfb-420f-4a5d-ac1e-52174749cdd9', '6612ac2a509c7947f52a984bea1768119c823407d36145aad1ae2089afcc8b32', '2026-07-02 07:40:14.976537+07', '20260702004014_init', NULL, NULL, '2026-07-02 07:40:14.956108+07', 1);
INSERT INTO public._prisma_migrations VALUES ('15ab75b7-985c-421f-9cee-85afedbb885c', '2367c48cbb864985790732f6e171f096662807188d1636cdd83b21726c966902', '2026-07-02 08:21:00.110391+07', '20260702012100_add_category_order', NULL, NULL, '2026-07-02 08:21:00.106794+07', 1);
INSERT INTO public._prisma_migrations VALUES ('378c6545-6131-4464-bdff-cf42228a54c6', '342ebd3c3270b4df51f1fc0e551092d769cd9e4710927e5f8a3dc4605786a1a8', '2026-07-02 10:48:18.369826+07', '20260702034818_change_fda_status_to_medication_status', NULL, NULL, '2026-07-02 10:48:18.366846+07', 1);
INSERT INTO public._prisma_migrations VALUES ('80f72736-8382-446b-b0c1-b937cadf685f', '75d5b7a906c679ae946b2e42e7852dcbd8d02a19ffe6334c52141a9105094461', '2026-07-03 05:57:48.311914+07', '20260702225733_add_composite_index_parent_order', NULL, NULL, '2026-07-03 05:57:48.308598+07', 1);
INSERT INTO public._prisma_migrations VALUES ('796dba5e-ee60-4aaf-94f4-a47c63d7aad4', '1444404bf69dfdf3f688d7406aab9c3f372d83c4e8541bc20a27e654db9e1a40', '2026-07-03 21:32:09.744204+07', '20260703143209_change_medication_status_to_string', NULL, NULL, '2026-07-03 21:32:09.742432+07', 1);
INSERT INTO public._prisma_migrations VALUES ('b016e6a3-32d7-433e-bea2-6169c3752288', 'e68abfacc718114b5a8cb849bc13e7b1a1ddbea62e0e938c2cc3208f159454cc', '2026-07-04 14:09:06.386497+07', '20260704070906_add_dose_fields', NULL, NULL, '2026-07-04 14:09:06.384715+07', 1);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES ('cmr2s2t2m0000xgopzd9pwg2r', 'admin', '$2b$10$MUPnDftD/9yz0xlYdhHKTu.Pn3OCNnh9I2GU5XE3KjxuT81j446by', 'admin', '2026-07-02 00:40:25.774', '2026-07-06 17:43:19.352');


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.categories VALUES ('cmr4ksbs8000ti8w6vj4qgvoe', '3.6 Cough preparations', 'cmr2tab6g0005r1rd1dfrp2m7', '2026-07-03 06:51:51.849', '2026-07-06 02:27:31.978', 3);
INSERT INTO public.categories VALUES ('cmr8lry690001hgt0pcpihx3s', '3.6.1 Cough suppressants', 'cmr4ksbs8000ti8w6vj4qgvoe', '2026-07-06 02:30:38.529', '2026-07-06 02:30:42.618', 1);
INSERT INTO public.categories VALUES ('cmr4ksvg4000vi8w6wfq7wh5e', '3.6.2 Expectorant and demulcent cough preparations', 'cmr4ksbs8000ti8w6vj4qgvoe', '2026-07-03 06:52:17.332', '2026-07-06 02:31:03.747', 2);
INSERT INTO public.categories VALUES ('cmr2u50bq00057zpymtxdpxda', '4. Central nervous system', NULL, '2026-07-02 01:38:07.718', '2026-07-06 02:52:08.137', 4);
INSERT INTO public.categories VALUES ('cmr2tb0la0007r1rdtgs5vmp9', 'Antacids and other drugs for dyspepsia', 'cmr2t7hj90001r1rdbhqacdam', '2026-07-02 01:14:48.382', '2026-07-02 01:23:05.527', 0);
INSERT INTO public.categories VALUES ('cmr4ku299000xi8w6tn3r9hge', '4.1 Hypnotics and anxiolytics', 'cmr2u50bq00057zpymtxdpxda', '2026-07-03 06:53:12.814', '2026-07-06 02:52:17.227', 0);
INSERT INTO public.categories VALUES ('cmr4kugmx000zi8w68d74o8kd', '4.3 Antidepressant drugs', 'cmr2u50bq00057zpymtxdpxda', '2026-07-03 06:53:31.449', '2026-07-06 02:52:35.332', 1);
INSERT INTO public.categories VALUES ('cmr4kuqay0011i8w6nfzpzay5', '4.5 Drugs used in nausea and vertigo', 'cmr2u50bq00057zpymtxdpxda', '2026-07-03 06:53:43.978', '2026-07-06 02:52:49.248', 2);
INSERT INTO public.categories VALUES ('cmr4l2aa90015i8w6bb2z9mfx', '4.5.2 Drugs used in vestibular disorders', 'cmr2u50bq00057zpymtxdpxda', '2026-07-03 06:59:36.466', '2026-07-06 02:53:04.699', 3);
INSERT INTO public.categories VALUES ('cmr36s10l0003nsu6ssovcquh', 'Antispasmodics and other drugs altering gut motility', 'cmr2t7hj90001r1rdbhqacdam', '2026-07-02 07:31:57.094', '2026-07-03 02:15:10.215', 1);
INSERT INTO public.categories VALUES ('cmr2tc1rz000br1rdyr07qav3', 'Drugs used in acute diarrhea', 'cmr2t7hj90001r1rdbhqacdam', '2026-07-02 01:15:36.575', '2026-07-03 02:15:15.939', 3);
INSERT INTO public.categories VALUES ('cmr4aw7or00031022q870r8yz', 'Ulcer-healing drugs and drugs used in variceal bleeding', 'cmr2t7hj90001r1rdbhqacdam', '2026-07-03 02:14:57.004', '2026-07-03 02:15:15.939', 2);
INSERT INTO public.categories VALUES ('cmr4l5wnv0017i8w6bdcc47io', '4.6 Analgesics and antipyretics', 'cmr2u50bq00057zpymtxdpxda', '2026-07-03 07:02:25.436', '2026-07-06 02:53:12.831', 4);
INSERT INTO public.categories VALUES ('cmr4axv1h00051022qec614ie', 'Drugs used in chronic bowel disorders', 'cmr2t7hj90001r1rdbhqacdam', '2026-07-03 02:16:13.925', '2026-07-03 02:16:23.707', 4);
INSERT INTO public.categories VALUES ('cmr2tbl2o0009r1rdlzptctwx', 'Laxatives', 'cmr2t7hj90001r1rdbhqacdam', '2026-07-02 01:15:14.929', '2026-07-03 02:16:35.475', 5);
INSERT INTO public.categories VALUES ('cmr4ayssq00071022tavpqlg3', 'Local preparations for anal and rectal disorders', 'cmr2t7hj90001r1rdbhqacdam', '2026-07-03 02:16:57.675', '2026-07-03 02:16:57.675', 6);
INSERT INTO public.categories VALUES ('cmr4fcoxr0001h9j3mh1o8vbo', '2.4 Beta-adrenoceptor blocking drugs', 'cmr2t9r6l0003r1rd0gnlq05s', '2026-07-03 04:19:44.319', '2026-07-06 01:40:06.121', 4);
INSERT INTO public.categories VALUES ('cmr2u5ark00077zpym8jh8ij9', '5. Infections', NULL, '2026-07-02 01:38:21.248', '2026-07-06 02:57:49.594', 6);
INSERT INTO public.categories VALUES ('cmr2u5o1r00097zpyw2764ucp', '6. Endocrine system', NULL, '2026-07-02 01:38:38.464', '2026-07-06 03:01:59.891', 7);
INSERT INTO public.categories VALUES ('cmr2u67wl000b7zpyp4g1huo8', '7. Obstetrics, gynaecology and urinary-tract disorders', NULL, '2026-07-02 01:39:04.198', '2026-07-06 03:03:40.143', 8);
INSERT INTO public.categories VALUES ('cmr4knpj0000hi8w6h1n2nkse', '2.12 Lipid-regulating drugs', 'cmr2t9r6l0003r1rd0gnlq05s', '2026-07-03 06:48:16.381', '2026-07-06 02:02:59.086', 9);
INSERT INTO public.categories VALUES ('cmr2t7hj90001r1rdbhqacdam', 'Gastro-intestinal system', 'cmr2t7hj90001r1rdbhqacdam', '2026-07-02 01:12:03.716', '2026-07-03 06:25:53.76', 0);
INSERT INTO public.categories VALUES ('cmr4kir4k000di8w6gedhe9u1', '1.7 Local preparations for anal and rectal disorders', 'cmr4kf9hk0001i8w68lq0yi3p', '2026-07-03 06:44:25.172', '2026-07-06 01:36:51.374', 5);
INSERT INTO public.categories VALUES ('cmr2t9r6l0003r1rd0gnlq05s', '2. Cardiovascular system', NULL, '2026-07-02 01:13:49.533', '2026-07-06 02:27:13.962', 1);
INSERT INTO public.categories VALUES ('cmr4kgi780003i8w6yby4d9pz', '1.1. Antacids and other drugs for dyspepsia', 'cmr4kf9hk0001i8w68lq0yi3p', '2026-07-03 06:42:40.293', '2026-07-05 08:46:10.442', 0);
INSERT INTO public.categories VALUES ('cmr4khj1o0005i8w69jwzkor1', '1.2 Antispasmodics and other drugs altering gut motility', 'cmr4kf9hk0001i8w68lq0yi3p', '2026-07-03 06:43:28.044', '2026-07-05 08:52:33.769', 1);
INSERT INTO public.categories VALUES ('cmr4khsuh0007i8w6rhts5t1a', '1.3 Ulcer-healing drugs and drugs used in variceal bleeding', 'cmr4kf9hk0001i8w68lq0yi3p', '2026-07-03 06:43:40.746', '2026-07-05 08:56:02.026', 2);
INSERT INTO public.categories VALUES ('cmr4ki1vd0009i8w6cms7eaqx', '1.4 Drugs used in acute diarrhea', 'cmr4kf9hk0001i8w68lq0yi3p', '2026-07-03 06:43:52.441', '2026-07-05 08:56:31.198', 3);
INSERT INTO public.categories VALUES ('cmr4ki986000bi8w68nlj00s5', '1.6 Laxatives', 'cmr4kf9hk0001i8w68lq0yi3p', '2026-07-03 06:44:01.974', '2026-07-05 08:56:53.527', 4);
INSERT INTO public.categories VALUES ('cmr36t34d0007nsu60zoq7cuy', '2.2 Diuretics', 'cmr2t9r6l0003r1rd0gnlq05s', '2026-07-02 07:32:46.478', '2026-07-06 01:39:44.457', 2);
INSERT INTO public.categories VALUES ('cmr4f08tb000146y9txv5kkzs', '2.3 Anti-arrhythmic drugs', 'cmr2t9r6l0003r1rd0gnlq05s', '2026-07-03 04:10:03.551', '2026-07-06 01:39:55.972', 3);
INSERT INTO public.categories VALUES ('cmr4fdkf20003h9j39u8pmyci', '2.5 Drugs affecting the renin-angiotensin system and some other antihypertensive drugs', 'cmr2t9r6l0003r1rd0gnlq05s', '2026-07-03 04:20:25.118', '2026-07-06 01:41:06.973', 5);
INSERT INTO public.categories VALUES ('cmr4fe4q10005h9j3ire7gi0e', '2.5.1 Vasodilator antihypertensive drugs', 'cmr4fdkf20003h9j39u8pmyci', '2026-07-03 04:20:51.433', '2026-07-06 01:41:31.07', 0);
INSERT INTO public.categories VALUES ('cmr4ffgdg0009h9j3cko16zpg', '2.5.3 Alpha-adrenoceptor blocking drugs', 'cmr4fdkf20003h9j39u8pmyci', '2026-07-03 04:21:53.188', '2026-07-06 01:41:53.747', 2);
INSERT INTO public.categories VALUES ('cmr4fftot000bh9j3byy9ovhr', '2.5.4 Angiotensin-converting enzyme inhibitors', 'cmr4fdkf20003h9j39u8pmyci', '2026-07-03 04:22:10.445', '2026-07-06 01:42:04.609', 3);
INSERT INTO public.categories VALUES ('cmr4fg729000dh9j38330wc2w', '2.5.5 Angiotensin-II receptor antagonists', 'cmr4fdkf20003h9j39u8pmyci', '2026-07-03 04:22:27.777', '2026-07-06 01:42:23.136', 4);
INSERT INTO public.categories VALUES ('cmr4fgk2e000fh9j32mlv3dyy', '2.6 Nitrates, calcium-channel blockers and other vasodilators', 'cmr2t9r6l0003r1rd0gnlq05s', '2026-07-03 04:22:44.63', '2026-07-06 01:42:44.756', 6);
INSERT INTO public.categories VALUES ('cmr4fhsoa000hh9j3v9mn8uwh', '2.6.1 Nitrates', 'cmr4fgk2e000fh9j32mlv3dyy', '2026-07-03 04:23:42.442', '2026-07-06 02:01:18.441', 0);
INSERT INTO public.categories VALUES ('cmr4fij5p000jh9j3mbgpb6dq', '2.6.2 Calcium-channel blockers', 'cmr4fgk2e000fh9j32mlv3dyy', '2026-07-03 04:24:16.765', '2026-07-06 02:01:26.346', 1);
INSERT INTO public.categories VALUES ('cmr4g3w640001fvc98lhv41lh', '2.7 Sympathomimetics', 'cmr2t9r6l0003r1rd0gnlq05s', '2026-07-03 04:40:53.405', '2026-07-06 02:02:06.027', 7);
INSERT INTO public.categories VALUES ('cmr4g4a5z0003fvc93jnt5ddq', '2.7.1 Inotropic sympathomimetics', 'cmr4g3w640001fvc98lhv41lh', '2026-07-03 04:41:11.543', '2026-07-06 02:02:19.26', 0);
INSERT INTO public.categories VALUES ('cmr4g4jhf0005fvc9v290suls', '2.7.3 Drugs used in cardiopulmonary resuscitation', 'cmr4g3w640001fvc98lhv41lh', '2026-07-03 04:41:23.619', '2026-07-06 02:02:33.574', 1);
INSERT INTO public.categories VALUES ('cmr4g9qsu0007fvc95i52xkk0', '2.9 Antiplatelet drugs', 'cmr2t9r6l0003r1rd0gnlq05s', '2026-07-03 04:45:26.382', '2026-07-06 02:02:43.897', 8);
INSERT INTO public.categories VALUES ('cmr4kolmg000ji8w60de1xq4u', '3.1 Bronchodilators', 'cmr2tab6g0005r1rd1dfrp2m7', '2026-07-03 06:48:57.977', '2026-07-06 02:04:32.888', 0);
INSERT INTO public.categories VALUES ('cmr4kp3r6000li8w6tr44x3kb', '3.1.1 Adrenoceptor agonists', 'cmr4kolmg000ji8w60de1xq4u', '2026-07-03 06:49:21.474', '2026-07-06 02:05:31.017', 0);
INSERT INTO public.categories VALUES ('cmr4kpuud000ni8w6ls7x8hzx', '3.1.2 Compound antimuscarinic bronchodilators', 'cmr4kolmg000ji8w60de1xq4u', '2026-07-03 06:49:56.582', '2026-07-06 02:05:43.537', 1);
INSERT INTO public.categories VALUES ('cmr4kqu8h000pi8w68rx4bqas', '3.4 Antihistamines', 'cmr2tab6g0005r1rd1dfrp2m7', '2026-07-03 06:50:42.449', '2026-07-06 02:24:59.083', 2);
INSERT INTO public.categories VALUES ('cmr4kf9hk0001i8w68lq0yi3p', '1. Gastro-intestinal system', NULL, '2026-07-03 06:41:42.344', '2026-07-06 02:27:03.868', 0);
INSERT INTO public.categories VALUES ('cmr2tab6g0005r1rd1dfrp2m7', '3. Respiratory system', NULL, '2026-07-02 01:14:15.448', '2026-07-06 02:27:13.962', 2);
INSERT INTO public.categories VALUES ('cmr8mmjzv0001dnmxiz631dyi', '4.7 Analgesics', 'cmr2u50bq00057zpymtxdpxda', '2026-07-06 02:54:26.491', '2026-07-06 02:54:31.068', 5);
INSERT INTO public.categories VALUES ('cmr4l0lt30013i8w6455nheb2', 'Drugs used in vestibular disorders', 'cmr4kuqay0011i8w6nfzpzay5', '2026-07-03 06:58:18.088', '2026-07-03 06:58:58.965', 5);
INSERT INTO public.categories VALUES ('cmr4ln7fy002di8w6tw0p5am0', '7.4 Drugs for genito-urinary disorders', 'cmr2u67wl000b7zpyp4g1huo8', '2026-07-03 07:15:52.558', '2026-07-06 03:03:58.426', 0);
INSERT INTO public.categories VALUES ('cmr4l6ewb0019i8w6m1i87u62', '4.7.1 Opioid analgesics', 'cmr8mmjzv0001dnmxiz631dyi', '2026-07-03 07:02:49.067', '2026-07-06 02:54:46.036', 0);
INSERT INTO public.categories VALUES ('cmr627f6o000n4ljpzv8m4s07', '3.2 Corticosteroids', 'cmr2tab6g0005r1rd1dfrp2m7', '2026-07-04 07:47:15.744', '2026-07-06 02:05:57.65', 1);
INSERT INTO public.categories VALUES ('cmr4l7803001bi8w6edoj2qdq', '4.7.2 Drugs for neuropathic pain', 'cmr8mmjzv0001dnmxiz631dyi', '2026-07-03 07:03:26.787', '2026-07-06 02:55:01.479', 1);
INSERT INTO public.categories VALUES ('cmr4l7qz9001di8w67smxd2md', '4.8 Antiepileptics', 'cmr2u50bq00057zpymtxdpxda', '2026-07-03 07:03:51.381', '2026-07-06 02:55:39.245', 6);
INSERT INTO public.categories VALUES ('cmr4l83fx001fi8w6qcgxy1a9', '4.8.2 Drugs used in status epilepticus', 'cmr4l7qz9001di8w67smxd2md', '2026-07-03 07:04:07.533', '2026-07-06 02:55:55.997', 0);
INSERT INTO public.categories VALUES ('cmr4l94lc001hi8w6g1uhe0lm', '5.1 Antibacterial drugs', 'cmr2u5ark00077zpym8jh8ij9', '2026-07-03 07:04:55.681', '2026-07-06 02:58:12.343', 0);
INSERT INTO public.categories VALUES ('cmr4l9kv5001ji8w6c9oq6vja', '5.1.1 Penicillins', 'cmr4l94lc001hi8w6g1uhe0lm', '2026-07-03 07:05:16.769', '2026-07-06 02:58:43.486', 0);
INSERT INTO public.categories VALUES ('cmr4la5n8001li8w6xncoa4d8', '5.1.2 Cephalosporins, cephamycins and other beta-lactams', 'cmr4l94lc001hi8w6g1uhe0lm', '2026-07-03 07:05:43.7', '2026-07-06 02:58:58.812', 1);
INSERT INTO public.categories VALUES ('cmr4lfofc001ni8w62cky5gh2', '5.1.3 Tetracyclines', 'cmr4l94lc001hi8w6g1uhe0lm', '2026-07-03 07:10:01.32', '2026-07-06 02:59:06.009', 2);
INSERT INTO public.categories VALUES ('cmr4lhrv1001ri8w61b6bi3yu', '5.1.6 Quinolones', 'cmr4l94lc001hi8w6g1uhe0lm', '2026-07-03 07:11:39.086', '2026-07-06 02:59:50.818', 4);
INSERT INTO public.categories VALUES ('cmr4lhdbw001pi8w6ev6799bb', '5.1.5 Macrolides', 'cmr4l94lc001hi8w6g1uhe0lm', '2026-07-03 07:11:20.252', '2026-07-06 02:59:42.344', 3);
INSERT INTO public.categories VALUES ('cmr4li4ms001ti8w67m0dup1m', '5.1.7 Some other antibacterials', 'cmr4l94lc001hi8w6g1uhe0lm', '2026-07-03 07:11:55.636', '2026-07-06 03:00:00.846', 5);
INSERT INTO public.categories VALUES ('cmr4lihyy001vi8w6t80i73al', '5.2 Antifungal drugs', 'cmr2u5ark00077zpym8jh8ij9', '2026-07-03 07:12:12.923', '2026-07-06 03:00:26.507', 1);
INSERT INTO public.categories VALUES ('cmr4lityx001xi8w6j2tfi6oo', '5.3 Antiviral drugs', 'cmr2u5ark00077zpym8jh8ij9', '2026-07-03 07:12:28.473', '2026-07-06 03:00:41.988', 2);
INSERT INTO public.categories VALUES ('cmr4lj5a6001zi8w6ces1awq5', '5.3.1 Non-antiretrovirals', 'cmr4lityx001xi8w6j2tfi6oo', '2026-07-03 07:12:43.134', '2026-07-06 03:00:59.175', 0);
INSERT INTO public.categories VALUES ('cmr4ljlrm0021i8w6ehocs9ll', '5.5 Anthelmintics', 'cmr2u5ark00077zpym8jh8ij9', '2026-07-03 07:13:04.498', '2026-07-06 03:01:27.204', 3);
INSERT INTO public.categories VALUES ('cmr4ljtt20023i8w6gqtmf1d2', '5.6 Antiseptics', 'cmr2u5ark00077zpym8jh8ij9', '2026-07-03 07:13:14.919', '2026-07-06 03:01:36.209', 4);
INSERT INTO public.categories VALUES ('cmr4lkig20025i8w6dirh83br', '6.1 Drugs used in diabetes', 'cmr2u5o1r00097zpyw2764ucp', '2026-07-03 07:13:46.851', '2026-07-06 03:02:19.578', 0);
INSERT INTO public.categories VALUES ('cmr4ll3ii0027i8w6g2e2wysd', '6.1.1 Insulins', 'cmr4lkig20025i8w6dirh83br', '2026-07-03 07:14:14.154', '2026-07-06 03:02:32.99', 0);
INSERT INTO public.categories VALUES ('cmr4llgvx0029i8w641k7l1nd', '6.1.2 Oral antidiabetic drugs', 'cmr4lkig20025i8w6dirh83br', '2026-07-03 07:14:31.486', '2026-07-06 03:02:43.74', 1);
INSERT INTO public.categories VALUES ('cmr4lm5m7002bi8w61sk5sd3q', '6.3 Corticosteroids', 'cmr2u5o1r00097zpyw2764ucp', '2026-07-03 07:15:03.535', '2026-07-06 03:03:14.595', 1);
INSERT INTO public.categories VALUES ('cmr31rbpo0003temalyw1i0tn', '9. Nutrition and blood', NULL, '2026-07-02 05:11:26.221', '2026-07-06 03:04:19.038', 10);
INSERT INTO public.categories VALUES ('cmr4lo9lx002fi8w6jtn197w3', '9.2 Fluids and electrolytes', 'cmr31rbpo0003temalyw1i0tn', '2026-07-03 07:16:42.021', '2026-07-06 03:04:29.774', 0);
INSERT INTO public.categories VALUES ('cmr4lollu002hi8w6ugve3wl2', '9.3 Vitamins', 'cmr31rbpo0003temalyw1i0tn', '2026-07-03 07:16:57.57', '2026-07-06 03:04:38.724', 1);
INSERT INTO public.categories VALUES ('cmr4lotnm002ji8w6dl8234js', '9.5 Minerals', 'cmr31rbpo0003temalyw1i0tn', '2026-07-03 07:17:08.002', '2026-07-06 03:04:46.895', 2);
INSERT INTO public.categories VALUES ('cmr31rhd90005tema485jh7q8', '10. Musculoskeletal and joint diseases', NULL, '2026-07-02 05:11:33.55', '2026-07-06 03:05:04.392', 11);
INSERT INTO public.categories VALUES ('cmr4lpgak002li8w6beh0j3yo', '10.1 Drugs used in rheumatic diseases and gout', 'cmr31rhd90005tema485jh7q8', '2026-07-03 07:17:37.34', '2026-07-06 03:05:16.693', 0);
INSERT INTO public.categories VALUES ('cmr4lpwtq002ni8w67kkxn0ku', '10.1.1 Non-steroidal anti-inflammatory drugs (NSAIDs)', 'cmr4lpgak002li8w6beh0j3yo', '2026-07-03 07:17:58.766', '2026-07-06 03:05:27.66', 0);
INSERT INTO public.categories VALUES ('cmr4lq6xr002pi8w6smgr633h', '10.1.3 Drugs for treatment of gout and hyperuricaemia', 'cmr4lpgak002li8w6beh0j3yo', '2026-07-03 07:18:11.871', '2026-07-06 03:05:44.987', 1);
INSERT INTO public.categories VALUES ('cmr4lqms5002ri8w623fhb81c', '10.2 Drugs used in neuromuscular disorders', 'cmr31rhd90005tema485jh7q8', '2026-07-03 07:18:32.405', '2026-07-06 03:05:59.841', 1);
INSERT INTO public.categories VALUES ('cmr4lqxcm002ti8w6l6fx9p3s', '10.2.2 Skeletal muscle relaxants', 'cmr4lqms5002ri8w623fhb81c', '2026-07-03 07:18:46.103', '2026-07-06 03:06:11.679', 0);
INSERT INTO public.categories VALUES ('cmr31rncy0007tema3gozc35f', '11. Eye', NULL, '2026-07-02 05:11:41.314', '2026-07-06 03:06:34.451', 12);
INSERT INTO public.categories VALUES ('cmr51ijbr000510tjc3did91l', '11.1 Anti-infective eye preparations', 'cmr31rncy0007tema3gozc35f', '2026-07-03 14:40:08.536', '2026-07-06 03:06:48.545', 0);
INSERT INTO public.categories VALUES ('cmr51jcdl000710tjznj49m6s', '11.1.1 Antibacterials and eye wash solution', 'cmr51ijbr000510tjc3did91l', '2026-07-03 14:40:46.185', '2026-07-06 03:07:02.995', 0);
INSERT INTO public.categories VALUES ('cmr51k34e000910tj25iz3hoc', '11.2 Corticosteroids and other anti-inflammatory preparations', 'cmr31rncy0007tema3gozc35f', '2026-07-03 14:41:20.847', '2026-07-06 03:07:20.192', 1);
INSERT INTO public.categories VALUES ('cmr51kh13000b10tjuu2jke0y', '11.5 Local anaesthetics', 'cmr31rncy0007tema3gozc35f', '2026-07-03 14:41:38.872', '2026-07-06 03:07:29.595', 2);
INSERT INTO public.categories VALUES ('cmr51l11c000d10tj74ic6uk6', '11.6 Tear deficiency, ocular lubricants and astringents', 'cmr31rncy0007tema3gozc35f', '2026-07-03 14:42:04.801', '2026-07-06 03:07:39.289', 3);
INSERT INTO public.categories VALUES ('cmr31rsd20009temabp8x701m', '12. Ear, nose, oropharynx and oral cavity', NULL, '2026-07-02 05:11:47.798', '2026-07-06 03:08:00.642', 13);
INSERT INTO public.categories VALUES ('cmr51lye9000f10tjjvfn2cl9', '12.1 Drugs acting on the ear', 'cmr31rsd20009temabp8x701m', '2026-07-03 14:42:48.033', '2026-07-06 03:08:17.078', 0);
INSERT INTO public.categories VALUES ('cmr51mbfe000h10tjxbpwgsid', '12.2 Drugs acting on the nose', 'cmr31rsd20009temabp8x701m', '2026-07-03 14:43:04.923', '2026-07-06 03:08:29.794', 1);
INSERT INTO public.categories VALUES ('cmr51mo71000j10tjrtyu2qfb', '12.2.1 Drugs used in nasal allergy', 'cmr51mbfe000h10tjxbpwgsid', '2026-07-03 14:43:21.47', '2026-07-06 03:08:38.125', 0);
INSERT INTO public.categories VALUES ('cmr51n0ne000l10tjlos9oxzr', '12.2.2 Topical nasal decongestants', 'cmr51mbfe000h10tjxbpwgsid', '2026-07-03 14:43:37.611', '2026-07-06 03:08:48.191', 1);
INSERT INTO public.categories VALUES ('cmr31rwwj000btemawkhecnd7', '13. Skin', NULL, '2026-07-02 05:11:53.683', '2026-07-06 03:09:10.193', 14);
INSERT INTO public.categories VALUES ('cmr51nh49000n10tjq5tkl3f3', '13.1 Anti-infective skin preparations', 'cmr31rwwj000btemawkhecnd7', '2026-07-03 14:43:58.953', '2026-07-06 03:09:25.915', 0);
INSERT INTO public.categories VALUES ('cmr51nxu2000p10tjg6wkjqzu', '13.1.1 Antibacterial preparations', 'cmr51nh49000n10tjq5tkl3f3', '2026-07-03 14:44:20.619', '2026-07-06 03:09:35.009', 0);
INSERT INTO public.categories VALUES ('cmr51p40l000r10tj5w6ewxcy', '13.1.2 Antifungal preparations', 'cmr51nh49000n10tjq5tkl3f3', '2026-07-03 14:45:15.285', '2026-07-06 03:09:42.333', 1);
INSERT INTO public.categories VALUES ('cmr51rney000t10tjvs63wmz0', '13.2 Emollient and barrier preparations', 'cmr31rwwj000btemawkhecnd7', '2026-07-03 14:47:13.739', '2026-07-06 03:09:58.155', 1);
INSERT INTO public.categories VALUES ('cmr51shh9000v10tj3jm5e73q', '13.3 Topical antipruritics', 'cmr31rwwj000btemawkhecnd7', '2026-07-03 14:47:52.701', '2026-07-06 03:10:05.68', 2);
INSERT INTO public.categories VALUES ('cmr51t1lg000x10tj2274tnea', '13.4 Topical corticosteroids', 'cmr31rwwj000btemawkhecnd7', '2026-07-03 14:48:18.772', '2026-07-06 03:10:13.74', 3);
INSERT INTO public.categories VALUES ('cmr51tyuu000z10tj74eemt03', '13.6 Preparations for warts and calluses', 'cmr31rwwj000btemawkhecnd7', '2026-07-03 14:49:01.878', '2026-07-06 03:10:22.559', 4);
INSERT INTO public.categories VALUES ('cmr31s2r5000dtema7mx33qvv', '17. อื่นๆ', NULL, '2026-07-02 05:12:01.265', '2026-07-06 03:10:43.776', 15);


--
-- Data for Name: medications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.medications VALUES ('cmr60dm8y000hk94lyuzxpufj', 'Doxazosin mesilate immediate release tab', 'PENCOR 2 MG', NULL, 'immediate release 22 hr
extended release 15-19 hr', NULL, NULL, 'cmr4ffgdg0009h9j3cko16zpg', '2026-07-04 06:56:05.593', '2026-07-04 06:58:15.391', 'N', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr60ilx80001fdnizjyuetlx', 'Captopril', '**บริจาค**', NULL, '1.9 hr', NULL, NULL, 'cmr4fftot000bh9j3byy9ovhr', '2026-07-04 06:59:58.46', '2026-07-04 06:59:58.46', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr60kvk80005fdni6eezocch', 'Isosorbide dinitrate', 'sublingual tab', NULL, '1 hr', NULL, NULL, 'cmr4fhsoa000hh9j3v9mn8uwh', '2026-07-04 07:01:44.249', '2026-07-04 07:01:44.249', 'ยาฉุกเฉิน', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr52cggt0005npwoi11pwsln', 'Simeticone (Simethicone) TAB', 'ANTACIL-GEL', NULL, '9.1-14.4 hr', NULL, NULL, 'cmr4kgi780003i8w6yby4d9pz', '2026-07-03 15:03:24.508', '2026-07-06 15:15:48.081', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr52808k0001npwowzbukdbi', 'Aluminium hydroxide + Magnesium hydroxide + Simeticone 25-50 mg', 'ANTACIL-GEL 240 ML', NULL, NULL, NULL, NULL, 'cmr4kgi780003i8w6yby4d9pz', '2026-07-03 14:59:56.837', '2026-07-06 03:46:28.482', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr55lstq00094e7uq5reic94', 'Oral rehydration salts (ORS)', 'ผู้ใหญ่', NULL, NULL, NULL, NULL, 'cmr4ki1vd0009i8w6cms7eaqx', '2026-07-03 16:34:39.278', '2026-07-03 16:34:39.278', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr55mhwn000b4e7uz2wjtnar', '(สสต) Loperamide hydrochloride', NULL, NULL, '7-14 hr', NULL, NULL, 'cmr4ki1vd0009i8w6cms7eaqx', '2026-07-03 16:35:11.783', '2026-07-03 16:35:11.783', 'N', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr55nta7000d4e7u6fbx6mnu', 'Activated charcoal', 'CA-R-Bon', NULL, NULL, NULL, NULL, 'cmr4ki1vd0009i8w6cms7eaqx', '2026-07-03 16:36:13.184', '2026-07-03 16:36:13.184', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr55phwv000f4e7uzm34aky3', 'Magnesium hydroxide', 'MOM 240', NULL, '0.5-6 hr', NULL, NULL, 'cmr4ki986000bi8w68nlj00s5', '2026-07-03 16:37:31.745', '2026-07-03 16:37:31.745', 'N', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr55qicp000h4e7uihqdpp87', 'Senna tab (ยาเข้าใหม่)', 'SENOKOT', NULL, '6-10 hr', NULL, NULL, 'cmr4ki986000bi8w68nlj00s5', '2026-07-03 16:38:18.985', '2026-07-03 16:48:09.882', 'N', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr56evvw0001k94lnbynmq58', 'DIOSMIN', 'DAFLON', NULL, NULL, NULL, NULL, 'cmr4kir4k000di8w6gedhe9u1', '2026-07-03 16:57:16.267', '2026-07-03 16:57:16.267', 'N', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr56vvf80007k94lcmt3eteq', 'Adenosine', 'HAD', NULL, '<10 sec', NULL, NULL, 'cmr4f08tb000146y9txv5kkzs', '2026-07-03 17:10:28.82', '2026-07-03 17:10:28.82', 'ยาฉุกเฉิน', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr56woyb0009k94lpzdmi2em', 'Atropine sulfate', 'HAD', NULL, '2.5 hr', NULL, NULL, 'cmr4f08tb000146y9txv5kkzs', '2026-07-03 17:11:07.091', '2026-07-03 17:11:07.091', 'ยาฉุกเฉิน', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr616pfp00014ljp50f9sg21', 'Dopamine hydrochloride sterile sol', 'HAD', NULL, '2 min', NULL, NULL, 'cmr4g4a5z0003fvc93jnt5ddq', '2026-07-04 07:18:42.757', '2026-07-04 07:18:42.757', 'ยาฉุกเฉิน', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr617l2h00034ljp44t29nsb', 'Epinephrine (Adrenaline)', 'HAD', NULL, NULL, NULL, NULL, 'cmr4g4jhf0005fvc9v290suls', '2026-07-04 07:19:23.753', '2026-07-04 07:19:23.753', 'ยาฉุกเฉิน', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr61gpqo00094ljpwux8gv9v', 'Fenofibrate cap', 'Fenomed - 200 (Abbott)', NULL, '20 hr', NULL, NULL, 'cmr4knpj0000hi8w6h1n2nkse', '2026-07-04 07:26:29.698', '2026-07-04 07:26:29.698', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr61uks2000f4ljpsnwstxsz', 'Salbutamol sulfate', 'tab 2 MG', NULL, NULL, NULL, NULL, 'cmr4kp3r6000li8w6tr44x3kb', '2026-07-04 07:37:16.466', '2026-07-04 07:37:16.466', 'case by case', 'Tab 2 mg', NULL);
INSERT INTO public.medications VALUES ('cmr61wodv000h4ljp5cdm8gni', 'Salbutamol sulfate', 'Ventolin 2.5 mg', NULL, NULL, NULL, NULL, 'cmr4kp3r6000li8w6tr44x3kb', '2026-07-04 07:38:54.451', '2026-07-04 07:38:54.451', 'case by case', '2.5 mg', 'Nebule');
INSERT INTO public.medications VALUES ('cmr61y2n2000j4ljpc4l213gy', 'Salbutamol sulfate', 'Salvo Inhaler MDI', NULL, NULL, NULL, NULL, 'cmr4kp3r6000li8w6tr44x3kb', '2026-07-04 07:39:59.567', '2026-07-04 07:39:59.567', 'case by case', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr61z82p000l4ljpqqztbt6o', 'Ipratropium bromide + Fenoterol hydrobromide', 'BERODUAL NEB', NULL, NULL, NULL, NULL, 'cmr4kpuud000ni8w6ls7x8hzx', '2026-07-04 07:40:53.281', '2026-07-04 07:40:53.281', 'case by case', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr62bc7l000p4ljp1czw7k7w', 'Fluticasone + Salmeterol', 'SERETIDE ACCU 50/250', NULL, 'fluticasone 11-12 hr
salbutamol 5.5 hr', NULL, NULL, 'cmr627f6o000n4ljpzv8m4s07', '2026-07-04 07:50:18.513', '2026-07-04 07:50:18.513', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr62eikc000r4ljp0xspjdrb', 'Chlorpheniramine maleate', 'CPM 4 MG', NULL, NULL, NULL, '*งดบิน5วัน', 'cmr4kqu8h000pi8w68rx4bqas', '2026-07-04 07:52:46.701', '2026-07-04 07:52:46.701', 'N*', '4 mg', NULL);
INSERT INTO public.medications VALUES ('cmr62igir000t4ljpv5eyctfk', 'Chlorpheniramine maleate', 'CPM 4 MG INJ', NULL, NULL, NULL, '*งดบิน5วัน', 'cmr4kqu8h000pi8w68rx4bqas', '2026-07-04 07:55:50.691', '2026-07-04 07:55:50.691', 'N*', '4 mg', 'Injection (INJ)');
INSERT INTO public.medications VALUES ('cmr6348xq0001y7aq34vxkb6a', 'Cetirizine hydrochloride', 'Ormist syr', NULL, NULL, NULL, NULL, 'cmr4kqu8h000pi8w68rx4bqas', '2026-07-04 08:12:47.294', '2026-07-04 08:12:47.294', 'N', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6358ei0003y7aqea3wa8fy', 'Loratadine', 'Loratadine GPO', NULL, '12-15 hr', NULL, NULL, 'cmr4kqu8h000pi8w68rx4bqas', '2026-07-04 08:13:33.258', '2026-07-04 08:13:33.258', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr2z48mc00012g7dh3cgx5gq', 'Domperidone TAB', 'DOMINOX 10 MG', NULL, NULL, NULL, NULL, 'cmr4khj1o0005i8w69jwzkor1', '2026-07-02 03:57:29.892', '2026-07-06 03:49:16', 'N', '10 mg', NULL);
INSERT INTO public.medications VALUES ('cmr5318b40001121oaz4a7y3a', 'Hyoscine-n-butylbromide', 'BUSCOPAN 10 MG', NULL, NULL, NULL, NULL, 'cmr4khj1o0005i8w69jwzkor1', '2026-07-03 15:22:40.336', '2026-07-06 03:51:36.645', 'N', '10 mg', NULL);
INSERT INTO public.medications VALUES ('cmr552vsm00014e7ur7ehqaei', 'Omeprazole CAP', NULL, NULL, '0.5-1 hr', NULL, NULL, 'cmr4khsuh0007i8w6rhts5t1a', '2026-07-03 16:19:56.646', '2026-07-06 03:53:16.527', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr555exh00034e7uuhwyzr7d', 'Omeprazole sodium sterile powder', NULL, NULL, '0.4-3.2 hr', NULL, NULL, 'cmr4khsuh0007i8w6rhts5t1a', '2026-07-03 16:21:54.773', '2026-07-06 03:54:02.556', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr55fikb00074e7ul8a4b3v9', 'Rabeprazole Na', 'RABEPRAZOLE SANDOZ', NULL, '1-2 hr', NULL, NULL, 'cmr4khsuh0007i8w6rhts5t1a', '2026-07-03 16:29:46.041', '2026-07-06 03:55:27.471', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr5625dk000j4e7uj8ogma9q', 'Local anesthetic + Corticosteroid with/without astringent', 'DOPROCT', NULL, NULL, NULL, NULL, 'cmr4kir4k000di8w6gedhe9u1', '2026-07-03 16:47:21.537', '2026-07-06 04:04:14.128', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr56g86u0003k94lre2n9n9e', 'Furosemide INJ', NULL, NULL, '30-120 min', NULL, NULL, 'cmr36t34d0007nsu60zoq7cuy', '2026-07-03 16:58:18.87', '2026-07-06 04:04:43.969', 'N', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr56ii760005k94lkqnai6f1', 'Hydrochlorothiazide (HCTZ) 25 mgTAB', 'Hydrochlorothiazide', NULL, '5.6-14.8 hr', NULL, NULL, 'cmr36t34d0007nsu60zoq7cuy', '2026-07-03 17:00:05.154', '2026-07-06 04:07:03.144', 'Y', '25 mg', NULL);
INSERT INTO public.medications VALUES ('cmr56z6e1000bk94l6vai622m', 'Amiodarone hydrochloride', 'HAD CORDARONE INJ', NULL, '26-107 day', NULL, NULL, 'cmr4f08tb000146y9txv5kkzs', '2026-07-03 17:13:03.001', '2026-07-06 04:08:38.099', 'ยาฉุกเฉิน', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr605wp9000dk94lzq24fpgk', 'Atenolol 50 MG', 'B-Tension', NULL, '6-7 hr', NULL, NULL, 'cmr4fcoxr0001h9j3mh1o8vbo', '2026-07-04 06:50:05.89', '2026-07-06 04:09:29.428', 'Y', '50 mg', NULL);
INSERT INTO public.medications VALUES ('cmr607nn1000fk94lokk11rbp', 'Hydralazine hydrochloride (ยาเข้าใหม่)', ' 25 MG', NULL, '2-8 hr', NULL, NULL, 'cmr4fe4q10005h9j3ire7gi0e', '2026-07-04 06:51:27.469', '2026-07-06 04:09:58.468', 'Y', '25 mg', NULL);
INSERT INTO public.medications VALUES ('cmr60k22y0003fdnian7myp83', 'Losartan potassium (50', 'Losartan 50 MG', NULL, '1.5-2 hr', NULL, NULL, 'cmr4fg729000dh9j38330wc2w', '2026-07-04 07:01:06.058', '2026-07-06 04:12:17.865', 'Y', '50 mg', NULL);
INSERT INTO public.medications VALUES ('cmr60lrs80007fdni8sh22ygp', 'Amlodipine besilate', 'AMLODIPINE 5 MG (GPO)', NULL, '30-50 hr', NULL, NULL, 'cmr4fij5p000jh9j3mbgpb6dq', '2026-07-04 07:02:26.024', '2026-07-06 04:14:15.517', 'Y', '5 mg', '(GPO)');
INSERT INTO public.medications VALUES ('cmr60no810009fdniqyvfgte9', 'Amlodipine besilate', 'AMLODIPINE 10 MG', NULL, '30-50 hr', NULL, NULL, 'cmr4fij5p000jh9j3mbgpb6dq', '2026-07-04 07:03:54.72', '2026-07-06 04:14:29.576', 'Y', '10 mg', NULL);
INSERT INTO public.medications VALUES ('cmr60s5sj000bfdnihlhs7u62', 'Manidipine 20 MG ทน SE amlo ไม่ได้', 'MADIPLOT 20 MG', NULL, NULL, NULL, NULL, 'cmr4fij5p000jh9j3mbgpb6dq', '2026-07-04 07:07:24.103', '2026-07-06 04:15:49.083', 'Y', '20 mg', 'ทน SE amlo ไม่ได้');
INSERT INTO public.medications VALUES ('cmr61durh00074ljpkvb5tfmr', 'Simvastatin', 'TRIO 20 MG', NULL, NULL, NULL, NULL, 'cmr4knpj0000hi8w6h1n2nkse', '2026-07-04 07:24:16.253', '2026-07-06 04:18:21.469', 'Y', '20 mg', NULL);
INSERT INTO public.medications VALUES ('cmr61imfq000b4ljp2j5u6yqb', 'Atorvastatin 40 mg', 'Xarator 40 MG', NULL, '14 hr', NULL, NULL, 'cmr4knpj0000hi8w6h1n2nkse', '2026-07-04 07:27:58.742', '2026-07-06 04:20:54.642', 'Y', '40 mg', NULL);
INSERT INTO public.medications VALUES ('cmr61mbkv000d4ljpnvf6r64v', 'PITAVASTATIN CA 2 MG', 'LIVALO 2 MG', NULL, '12 hr', NULL, NULL, 'cmr4knpj0000hi8w6h1n2nkse', '2026-07-04 07:30:51.294', '2026-07-06 04:21:32.119', 'Y', '2 mg', NULL);
INSERT INTO public.medications VALUES ('cmr636hl60005y7aq0gw523ao', 'FEXOFENADINE 60 mg', 'Fenafex 60 MG', NULL, '14.4 hr', NULL, NULL, 'cmr4kqu8h000pi8w68rx4bqas', '2026-07-04 08:14:31.818', '2026-07-06 04:26:22.888', 'Y', '60 mg', NULL);
INSERT INTO public.medications VALUES ('cmr2z74pe00032g7dn0j2f7k4', 'ขมิ้นชัน', 'ขมิ้นชัน PDF', NULL, NULL, NULL, '*ผนวก1', 'cmr4kgi780003i8w6yby4d9pz', '2026-07-02 03:59:44.786', '2026-07-06 05:07:01.824', 'N/A', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr66z7op000by7aqmzxpyug6', 'Codeine phosphate + Glyceryl guaiacolate', 'ROPECT  **NEW**', NULL, NULL, NULL, '* งดบิน 48 ช.ม.', 'cmr8lry690001hgt0pcpihx3s', '2026-07-04 10:00:50.857', '2026-07-06 02:50:20.987', 'N*', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr637ij90007y7aq9ftht5gq', 'FEXOFENADINE 180 mg', 'Fenaflex 180 mg', NULL, '14.4 hr', NULL, NULL, 'cmr4kqu8h000pi8w68rx4bqas', '2026-07-04 08:15:19.701', '2026-07-06 04:26:05.861', 'Y', '180 mg', NULL);
INSERT INTO public.medications VALUES ('cmr673dv3000fy7aqgnvtq08o', 'CARBOCYSTEINE TAB', 'CARBOCYS 375', NULL, NULL, NULL, NULL, 'cmr4ksvg4000vi8w6wfq7wh5e', '2026-07-04 10:04:05.487', '2026-07-04 10:04:05.487', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6755l0000hy7aqj3xh6bql', 'CARBOCYSTEINE Lysine Salt 2.7 g', 'Fluifort sachet', NULL, NULL, NULL, NULL, 'cmr4ksvg4000vi8w6wfq7wh5e', '2026-07-04 10:05:28.054', '2026-07-04 10:05:28.054', 'Y', '2.7 g', NULL);
INSERT INTO public.medications VALUES ('cmr6768qq000jy7aqbbnmrz0u', 'ยาอมแก้ไอมะแว้ง รสบ๊วย', NULL, NULL, NULL, NULL, '* ผนวก1', 'cmr4ksvg4000vi8w6wfq7wh5e', '2026-07-04 10:06:18.818', '2026-07-04 10:06:18.818', 'N/A', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr677fch000ly7aq78kdn2e2', 'ยาน้ำแก้ไอมะขามป้อม', NULL, NULL, NULL, 'diarrhea', '* ผนวก1', 'cmr4ksvg4000vi8w6wfq7wh5e', '2026-07-04 10:07:14.033', '2026-07-04 10:07:14.033', 'N/A', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr67a6vu000ny7aqdk2k1ebo', 'Diazepam TAB (สสต)', 'Diazepam 5 mg', NULL, '20-70 hr', NULL, NULL, 'cmr4ku299000xi8w6tn3r9hge', '2026-07-04 10:09:23.034', '2026-07-04 10:09:23.034', 'N', '5 mg', 'TAB');
INSERT INTO public.medications VALUES ('cmr67dqin000py7aq6kuucdty', 'Diazepam INJ', 'HAD', NULL, NULL, NULL, NULL, 'cmr4ku299000xi8w6tn3r9hge', '2026-07-04 10:12:08.432', '2026-07-04 10:12:08.432', 'ยาฉุกเฉิน', NULL, 'Injection (INJ)');
INSERT INTO public.medications VALUES ('cmr67eo8x000ry7aq2wl7mubr', 'Lorazepam (ยาเข้าใหม่)', 'Lorazepam ', NULL, NULL, NULL, NULL, 'cmr4ku299000xi8w6tn3r9hge', '2026-07-04 10:12:52.161', '2026-07-04 10:12:52.161', 'N', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6sikw0000ty7aq47nxoz1d', 'Amitriptyline HCL', 'TRIPTA 25 mg', NULL, NULL, NULL, NULL, 'cmr4kugmx000zi8w68d74o8kd', '2026-07-04 20:03:46.354', '2026-07-04 20:03:46.354', 'N', '25 mg', NULL);
INSERT INTO public.medications VALUES ('cmr6sm3kp000xy7aqdy754c7a', 'Metoclopramide', 'Metoclopramide', NULL, NULL, NULL, NULL, 'cmr4kuqay0011i8w6nfzpzay5', '2026-07-04 20:06:30.553', '2026-07-04 20:06:30.553', 'N', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6snkqe000zy7aqqg8axkrz', 'Dimenhydrinate', 'TAB', NULL, NULL, NULL, NULL, 'cmr4l0lt30013i8w6455nheb2', '2026-07-04 20:07:39.446', '2026-07-04 20:07:39.446', 'N', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6so9av0011y7aqua31yqi7', 'Dimenhydrinate', 'INJ', NULL, NULL, NULL, NULL, 'cmr4l0lt30013i8w6455nheb2', '2026-07-04 20:08:11.287', '2026-07-04 20:08:11.287', 'N', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6sri560013y7aq0258xz99', 'Betahistine mesilate tab (เฉพาะ 6)', 'MERISLON', NULL, NULL, NULL, NULL, 'cmr4l0lt30013i8w6455nheb2', '2026-07-04 20:10:42.701', '2026-07-04 20:10:42.701', 'N', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6suda70017y7aqp7uuyk43', 'Paracetamol (Acetaminophen)', 'PDF 500', NULL, '2-3 hr', NULL, NULL, 'cmr4l2aa90015i8w6bb2z9mfx', '2026-07-04 20:12:56.383', '2026-07-04 20:12:56.383', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6svl6i0019y7aqm8gbd6cc', 'ฟ้าทะลายโจรแคปซูล', 'ฟ้าทะลายโจรแคปซูล', NULL, NULL, NULL, '* ผนวก ๑', 'cmr4l2aa90015i8w6bb2z9mfx', '2026-07-04 20:13:53.274', '2026-07-04 20:13:53.274', 'N/A', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6sx3eo001by7aq2rmcot6d', 'Tramadol hydrochloride', 'TRAMADOL 50 MG', NULL, NULL, NULL, NULL, 'cmr4l6ewb0019i8w6m1i87u62', '2026-07-04 20:15:03.552', '2026-07-04 20:15:03.552', 'N', '50 mg', NULL);
INSERT INTO public.medications VALUES ('cmr6vfdbf001dy7aqxt2eca70', 'Tramadol hydrochloride', 'TRAMADOL INJ 100MG/2ML', NULL, NULL, NULL, NULL, 'cmr4l6ewb0019i8w6m1i87u62', '2026-07-04 21:25:15.423', '2026-07-04 21:25:15.423', 'N', '100 mg/2 ml', NULL);
INSERT INTO public.medications VALUES ('cmr6xol6y001hy7aq888a3hmi', 'Gabapentin cap 100', 'GABA SANDOZ', NULL, '5-7 hr', NULL, NULL, 'cmr4l7803001bi8w6edoj2qdq', '2026-07-04 22:28:24.767', '2026-07-04 22:28:24.767', 'N', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6xq0i3001jy7aqqpuqipbr', '(สสต) DIAZEPAM', 'DIAZEPAM', NULL, '20-70 hr', NULL, NULL, 'cmr4l83fx001fi8w6qcgxy1a9', '2026-07-04 22:29:31.274', '2026-07-04 22:29:31.274', 'N', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6xsf0u001ly7aqh9m3yo5i', 'Amoxicillin', 'TAB 500', NULL, '0.7-1.4 hr', NULL, NULL, 'cmr4l9kv5001ji8w6c9oq6vja', '2026-07-04 22:31:23.407', '2026-07-04 22:31:23.407', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6xtmsn001ny7aq6lucsbx5', 'Dicloxacillin sodium', 'Dicloxa 500 mg', NULL, '0.6-0.8 hr', NULL, NULL, 'cmr4l9kv5001ji8w6c9oq6vja', '2026-07-04 22:32:20.135', '2026-07-04 22:32:20.135', 'Y', '500 mg', NULL);
INSERT INTO public.medications VALUES ('cmr6xzub0001py7aqenz98645', 'Amoxicillin trihydrate + Potassium clavulanate (Co-amoxiclav)', 'AUGMENTIN 1 g', NULL, '0.7-1.4 hr/0.8-1.4 hr', NULL, NULL, 'cmr4l9kv5001ji8w6c9oq6vja', '2026-07-04 22:37:09.789', '2026-07-04 22:37:09.789', 'Y', '1 g', NULL);
INSERT INTO public.medications VALUES ('cmr6y0shb001ry7aq5sjs2uqu', 'Amoxicillin trihydrate + Potassium clavulanate (Co-amoxiclav)', 'AMOXICLAV 1 g', NULL, '0.7-1.4 hr/0.8-1.4 hr', NULL, NULL, 'cmr4l9kv5001ji8w6c9oq6vja', '2026-07-04 22:37:54.095', '2026-07-04 22:37:54.095', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6y26kx001ty7aqtss9vcmu', 'Ceftriaxone sodium', 'CEF-3 IV', NULL, '5.9 hr', NULL, NULL, 'cmr4la5n8001li8w6xncoa4d8', '2026-07-04 22:38:59.025', '2026-07-04 22:38:59.025', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6y2zka001vy7aq97h3fkj0', 'Doxycycline 100', 'DOXY CAP', NULL, '15-25 hr', NULL, NULL, 'cmr4lfofc001ni8w62cky5gh2', '2026-07-04 22:39:36.586', '2026-07-04 22:39:36.586', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6y3xi8001xy7aqzdqxykrs', '(สสต) Roxithromycin 100,150', 'Roxithromycin 150', NULL, NULL, NULL, NULL, 'cmr4lhdbw001pi8w6ev6799bb', '2026-07-04 22:40:20.576', '2026-07-04 22:40:20.576', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6y4vub001zy7aqza7n75fs', 'Azithromycin (ยาเข้าใหม่)', 'cap', NULL, 'immediate release 70 hr
extended release 59 hr', NULL, NULL, 'cmr4lhdbw001pi8w6ev6799bb', '2026-07-04 22:41:05.075', '2026-07-04 22:41:05.075', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6y9l8i0021y7aqmcvnqk0d', 'Norfloxacin', 'Norfloxacin 400 mg', NULL, '3-4.5 hr', NULL, NULL, 'cmr4lhrv1001ri8w61b6bi3yu', '2026-07-04 22:44:44.596', '2026-07-04 22:44:44.596', 'Y', '400 mg', NULL);
INSERT INTO public.medications VALUES ('cmr6yb8pm0023y7aqziv9mkkq', 'Ciprofloxacin', 'Ciprofloxacin 500 mg', NULL, '3-5 hr', NULL, NULL, 'cmr4lhrv1001ri8w61b6bi3yu', '2026-07-04 22:46:01.69', '2026-07-04 22:46:01.69', 'Y', '500 mg', NULL);
INSERT INTO public.medications VALUES ('cmr6ycxh00025y7aq9u5h0alk', 'Metronidazole', 'Metronidazole 200 mg', NULL, '8 hr', NULL, NULL, 'cmr4li4ms001ti8w67m0dup1m', '2026-07-04 22:47:20.436', '2026-07-04 22:47:20.436', 'Y', '200 mg', NULL);
INSERT INTO public.medications VALUES ('cmr6ydpj60027y7aq9gx72sah', 'Clindamycin', 'Clindamycin 300 mg', NULL, '2-3 hr', NULL, NULL, 'cmr4li4ms001ti8w67m0dup1m', '2026-07-04 22:47:56.802', '2026-07-04 22:47:56.802', 'Y', '300 mg', NULL);
INSERT INTO public.medications VALUES ('cmr6yg7s60029y7aqerqaua46', 'Itraconazole', 'Itraconazole 100 mg', NULL, '32-42 hr', NULL, NULL, 'cmr4lihyy001vi8w6t80i73al', '2026-07-04 22:49:53.753', '2026-07-04 22:49:53.753', 'case by case', '100 mg', NULL);
INSERT INTO public.medications VALUES ('cmr6ylsm3002by7aqxj5x1l8o', 'Aciclovir (Acyclovir)', 'tab 400 mg', NULL, '3 hr', NULL, NULL, 'cmr4lj5a6001zi8w6ces1awq5', '2026-07-04 22:54:14.043', '2026-07-04 22:54:14.043', 'case by case', '400 mg', NULL);
INSERT INTO public.medications VALUES ('cmr6ymr81002dy7aqr1niria9', 'Aciclovir (Acyclovir)', 'oral paste', NULL, NULL, NULL, NULL, 'cmr4lj5a6001zi8w6ces1awq5', '2026-07-04 22:54:58.881', '2026-07-04 22:54:58.881', 'case by case', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6yo05k002fy7aqi4lbhsaz', 'Albendazole', 'Albendazole 200 mg', NULL, '8-12 hr', NULL, NULL, 'cmr4ljlrm0021i8w6ehocs9ll', '2026-07-04 22:55:57.128', '2026-07-04 22:55:57.128', 'Y', '200 mg', NULL);
INSERT INTO public.medications VALUES ('cmr6yyjnk002ly7aqh9q4rkq3', 'Regular Insulin', 'Actrapid', NULL, NULL, NULL, NULL, 'cmr4ll3ii0027i8w6g2e2wysd', '2026-07-04 23:04:08.96', '2026-07-04 23:04:08.96', 'N', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6z0i6i002ny7aqag6hpkbu', 'Insulin aspart + insulin aspart protamine', 'NOVOMIX 70/30', NULL, '2-5 hr', NULL, NULL, 'cmr4ll3ii0027i8w6g2e2wysd', '2026-07-04 23:05:40.346', '2026-07-04 23:06:07.148', 'N', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6z8qg8002ty7aq9149hhvk', 'Alogliptin', 'Nesina', NULL, '21 hr', NULL, NULL, 'cmr4llgvx0029i8w641k7l1nd', '2026-07-04 23:12:04.328', '2026-07-04 23:12:04.328', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr6zs8of002vy7aqsj2m2c48', 'DAPAGLIFLOZIN 10 mg', 'FORXIGA', NULL, '12.9 hr', NULL, NULL, 'cmr4llgvx0029i8w641k7l1nd', '2026-07-04 23:27:14.404', '2026-07-04 23:27:14.404', 'N', '10 mg', NULL);
INSERT INTO public.medications VALUES ('cmr670spu000dy7aqt2ukpfx5', 'ACETYLCYSTEINE 600 mg', 'Fluimucil A 600', NULL, NULL, NULL, NULL, 'cmr4ksvg4000vi8w6wfq7wh5e', '2026-07-04 10:02:04.77', '2026-07-06 04:27:31.69', 'Y', '600 mg', NULL);
INSERT INTO public.medications VALUES ('cmr6slcq1000vy7aqgm54ex0e', 'Domperidone 10 mg', 'Domperidone 10 mg', NULL, NULL, NULL, NULL, 'cmr4kuqay0011i8w6nfzpzay5', '2026-07-04 20:05:55.753', '2026-07-06 04:29:59.612', 'N', '10 mg', NULL);
INSERT INTO public.medications VALUES ('cmr6st7zh0015y7aqfcmjvi9n', 'Betahistine 24 mg', 'Serc', NULL, NULL, NULL, NULL, 'cmr4l0lt30013i8w6455nheb2', '2026-07-04 20:12:02.862', '2026-07-06 04:30:56.717', 'N', '24 mg', NULL);
INSERT INTO public.medications VALUES ('cmr6xl1w7001fy7aq7ek1tn1a', 'Amitriptyline 25 mg', 'Amitriptyline 25 mg', NULL, '9-27 hr', NULL, NULL, 'cmr4l7803001bi8w6edoj2qdq', '2026-07-04 22:25:39.799', '2026-07-06 04:32:43.385', 'N', '25 mg', NULL);
INSERT INTO public.medications VALUES ('cmr6yr66s002hy7aquplc4pz0', 'Ethyl alcohol 450 ml', '70% ALC', NULL, NULL, NULL, NULL, 'cmr4ljtt20023i8w6gqtmf1d2', '2026-07-04 22:58:24.916', '2026-07-06 04:39:43.299', 'Y', '450 ml', NULL);
INSERT INTO public.medications VALUES ('cmr6ytakp002jy7aq3rqnzcxt', 'Povidone-iodine 30 ml', 'Povidone-iodine', NULL, NULL, NULL, NULL, 'cmr4ljtt20023i8w6gqtmf1d2', '2026-07-04 23:00:03.896', '2026-07-06 04:40:01.578', 'Y', '30 ml', NULL);
INSERT INTO public.medications VALUES ('cmr6z348l002py7aq16gwe73m', 'Glipizide 5 mg', 'Glipizide 5 mg', NULL, '2-5 hr', NULL, NULL, 'cmr4llgvx0029i8w641k7l1nd', '2026-07-04 23:07:42.262', '2026-07-06 04:40:46.027', 'N', '5 mg', NULL);
INSERT INTO public.medications VALUES ('cmr6z71aj002ry7aq9vzy3yl7', 'Metformin', '500 mg', NULL, '4-9 hr', NULL, NULL, 'cmr4llgvx0029i8w641k7l1nd', '2026-07-04 23:10:45.05', '2026-07-06 04:41:12.992', 'Y', '500 mg', NULL);
INSERT INTO public.medications VALUES ('cmr7izxzk002xy7aqprrscj76', 'Metformin', 'Glucophage XR 1000 mg', NULL, '4-9 hr', NULL, NULL, 'cmr4llgvx0029i8w641k7l1nd', '2026-07-05 08:25:06.498', '2026-07-05 08:25:06.498', 'Y', '1000 mg', NULL);
INSERT INTO public.medications VALUES ('cmr7j1nbj002zy7aq0dfdl2qg', 'Empagliflozin', 'Jardiance 10 mg', NULL, '12.4 hr', NULL, NULL, 'cmr4llgvx0029i8w641k7l1nd', '2026-07-05 08:26:25.999', '2026-07-05 08:26:25.999', 'N', '10 mg', NULL);
INSERT INTO public.medications VALUES ('cmr7j2nv50031y7aqrs9sfgns', 'Dexamethasone', 'Dexamethasone INJ', NULL, NULL, NULL, NULL, 'cmr4lm5m7002bi8w61sk5sd3q', '2026-07-05 08:27:13.361', '2026-07-05 08:27:13.361', 'N', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr7j426a0033y7aq0ktkr7fy', 'Prednisolone', 'Prednisolone 5 mg', NULL, NULL, NULL, NULL, 'cmr4lm5m7002bi8w61sk5sd3q', '2026-07-05 08:28:18.562', '2026-07-05 08:28:18.562', '≤20mg/day', '5 mg', NULL);
INSERT INTO public.medications VALUES ('cmr7j8ejz0037y7aqngwsfqef', 'Glucose with/without sodium chloride', '50% Glucose 20 ML INJ', NULL, NULL, NULL, NULL, 'cmr4lo9lx002fi8w6jtn197w3', '2026-07-05 08:31:41.216', '2026-07-05 08:31:41.216', 'ยาฉุกเฉิน', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr7jbqpl0039y7aq8xbd5pci', 'Glucose with/without sodium chloride', 'D-5-W 1000 ML', NULL, NULL, NULL, NULL, 'cmr4lo9lx002fi8w6jtn197w3', '2026-07-05 08:34:16.953', '2026-07-05 08:34:16.953', 'Y', '1000 ml', NULL);
INSERT INTO public.medications VALUES ('cmr7jcqlr003by7aqpxf33tu9', 'Glucose with/without sodium chloride', 'D-5-S     1000 ML', NULL, NULL, NULL, NULL, 'cmr4lo9lx002fi8w6jtn197w3', '2026-07-05 08:35:03.471', '2026-07-05 08:35:03.471', 'Y', '1000 ml', NULL);
INSERT INTO public.medications VALUES ('cmr7jf3ud003dy7aqm4bri7r6', 'Glucose with/without sodium chloride', 'D-5-S/2 1000 ML', NULL, NULL, NULL, NULL, 'cmr4lo9lx002fi8w6jtn197w3', '2026-07-05 08:36:53.926', '2026-07-05 08:36:53.926', 'Y', '1000 ml', NULL);
INSERT INTO public.medications VALUES ('cmr7jg2rz003fy7aqcg075owl', 'Sodium chloride', '0.9 % NSS 100 ML', NULL, NULL, NULL, NULL, 'cmr4lo9lx002fi8w6jtn197w3', '2026-07-05 08:37:39.215', '2026-07-05 08:37:39.215', 'Y', '100 ml', NULL);
INSERT INTO public.medications VALUES ('cmr7jgsak003hy7aqw6188anx', 'Sodium chloride', '0.9 % NSS 1000 ML', NULL, NULL, NULL, NULL, 'cmr4lo9lx002fi8w6jtn197w3', '2026-07-05 08:38:12.284', '2026-07-05 08:38:19.309', 'Y', '1000 ml', NULL);
INSERT INTO public.medications VALUES ('cmr7ji0ef003jy7aq4ww4i3mc', 'Water for injection', 'SWI 5 ML', NULL, NULL, NULL, NULL, 'cmr4lo9lx002fi8w6jtn197w3', '2026-07-05 08:39:09.447', '2026-07-05 08:39:09.447', 'Y', '5 ml', NULL);
INSERT INTO public.medications VALUES ('cmr7jiw2f003ly7aqaug2xgt8', 'Water for injection', 'SWI 1000 ML', NULL, NULL, NULL, NULL, 'cmr4lo9lx002fi8w6jtn197w3', '2026-07-05 08:39:50.487', '2026-07-05 08:39:50.487', 'Y', '1000 ml', NULL);
INSERT INTO public.medications VALUES ('cmr7jke7c003ny7aqgw2czd7x', 'Folic acid', 'Folic acid 5 mg', NULL, NULL, NULL, NULL, 'cmr4lollu002hi8w6ugve3wl2', '2026-07-05 08:41:00.648', '2026-07-05 08:41:00.648', 'Y', '5 mg', NULL);
INSERT INTO public.medications VALUES ('cmr7jkyn1003py7aq3tsd1l1f', 'Vitamin B complex', 'Vitamin B complex', NULL, NULL, NULL, NULL, 'cmr4lollu002hi8w6ugve3wl2', '2026-07-05 08:41:27.133', '2026-07-05 08:41:27.133', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr7jlwfo003ry7aqjowjlp9i', '(อุดหนุน) Vitamin C', 'Vitamin C 50', NULL, NULL, NULL, NULL, 'cmr4lollu002hi8w6ugve3wl2', '2026-07-05 08:42:10.917', '2026-07-05 08:42:10.917', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr7jo6tc003ty7aquxvhjlkp', 'Calcium carbonate', 'Calcium', NULL, NULL, NULL, NULL, 'cmr4lotnm002ji8w6dl8234js', '2026-07-05 08:43:57.695', '2026-07-05 08:43:57.695', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr7jp77n003vy7aqyvr7hy8j', 'Ferrous fumarate (ยาเข้าใหม่)', 'Ferrous fumarate 200', NULL, NULL, NULL, '* ระวังN/V', 'cmr4lotnm002ji8w6dl8234js', '2026-07-05 08:44:44.867', '2026-07-05 08:44:44.867', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr66y0md0009y7aqgxuuv9d7', 'Opium and Glycyrrhiza Mixture Compound', 'BROWN MIXTURE, M.TUSSUS', NULL, NULL, NULL, '* งดบิน 48 ช.ม.', 'cmr8lry690001hgt0pcpihx3s', '2026-07-04 09:59:55.035', '2026-07-06 02:46:42.13', 'N*', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8n8xmp0003dnmx9kjsa8sz', 'Diclofenac sodium EC tab, sterile sol', 'INJ', NULL, '1.2-2 hr', NULL, NULL, 'cmr4lpwtq002ni8w67kkxn0ku', '2026-07-06 03:11:50.594', '2026-07-06 03:11:50.594', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8na03n0005dnmxjedov393', 'Diclofenac sodium EC tab, sterile sol', 'DifeleneTAB 25 mg', NULL, '1.2-2 hr', NULL, NULL, 'cmr4lpwtq002ni8w67kkxn0ku', '2026-07-06 03:12:40.451', '2026-07-06 03:12:40.451', 'Y', '25 mg', NULL);
INSERT INTO public.medications VALUES ('cmr8nbhfl0007dnmxlnukx6h3', 'Meloxicam 7.5 mg (ยาหมดตัดออกบัญชี)', 'Mel-OD 7.5', NULL, '15-20 hr', NULL, NULL, 'cmr4lpwtq002ni8w67kkxn0ku', '2026-07-06 03:13:49.569', '2026-07-06 03:13:49.569', 'Y', '7.5 mg', NULL);
INSERT INTO public.medications VALUES ('cmr8ncm1b0009dnmxmdkquv3r', 'Celecoxib 60 mg', 'CELECOXIB', NULL, '11 hr', NULL, NULL, 'cmr4lpwtq002ni8w67kkxn0ku', '2026-07-06 03:14:42.191', '2026-07-06 03:14:42.191', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8ndlat000bdnmxrnn4tdty', 'Ibuprofen 400 mg', '400 mg', NULL, '2-4 hr', NULL, NULL, 'cmr4lpwtq002ni8w67kkxn0ku', '2026-07-06 03:15:27.879', '2026-07-06 03:15:27.879', 'Y', '400 mg', NULL);
INSERT INTO public.medications VALUES ('cmr8neoq0000ddnmxjw2k3n4h', 'Naproxen compressed tab (as base)', 'Naproxen GPO', NULL, '12-17 hr', NULL, NULL, 'cmr4lpwtq002ni8w67kkxn0ku', '2026-07-06 03:16:18.984', '2026-07-06 03:16:18.984', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8nfrfg000fdnmxd5qtm4e8', 'Etoricoxib', 'Eberil แทน Arcoxia', NULL, NULL, NULL, NULL, 'cmr4lpwtq002ni8w67kkxn0ku', '2026-07-06 03:17:09.148', '2026-07-06 03:17:09.148', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8ngzfc000hdnmxf0qz4tyh', 'Colchicine', 'Colchicine 0.6', NULL, '18-24 hr', NULL, NULL, 'cmr4lq6xr002pi8w6smgr633h', '2026-07-06 03:18:06.168', '2026-07-06 03:18:06.168', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8nia2z000jdnmxzbqk47r3', 'Allopurinol', 'Allopurinol 100', NULL, '1-3 hr', NULL, NULL, 'cmr4lq6xr002pi8w6smgr633h', '2026-07-06 03:19:06.635', '2026-07-06 03:19:06.635', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8nj8sl000ldnmxjyw1z5zw', 'Sulfinpyrazone', 'SULFIN', NULL, NULL, NULL, NULL, 'cmr4lq6xr002pi8w6smgr633h', '2026-07-06 03:19:51.621', '2026-07-06 03:19:51.621', 'N/A', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8ntqgq000pdnmx7r95u83s', 'TOLPERISONE', 'MYDOCALM', NULL, NULL, NULL, NULL, 'cmr4lqxcm002ti8w6l6fx9p3s', '2026-07-06 03:28:01.083', '2026-07-06 03:28:01.083', 'N', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8nvcym000rdnmxb2ppbcte', '(สสต) Polymyxin B sulfate + Neomycin sulfate + Gramicidin', 'XANALIN 5 ML', NULL, NULL, NULL, NULL, 'cmr51jcdl000710tjznj49m6s', '2026-07-06 03:29:16.894', '2026-07-06 03:29:16.894', 'Y', '5 ml', NULL);
INSERT INTO public.medications VALUES ('cmr8nwxlo000tdnmx3h12nj3e', 'Oxytetracycline - polymycin B', 'TERRAMYCIN', NULL, NULL, NULL, NULL, 'cmr51jcdl000710tjznj49m6s', '2026-07-06 03:30:30.3', '2026-07-06 03:30:30.3', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8nxbqr000vdnmx7fxcdcet', 'Chloramphenicol  eye ointment', 'Cogetine', NULL, NULL, NULL, NULL, 'cmr51jcdl000710tjznj49m6s', '2026-07-06 03:30:48.627', '2026-07-06 03:30:48.627', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8ny8sd000xdnmxcs95dwor', 'Antazoline hydrochloride + Tetrahydrozoline hydrochloride', 'Opsil-A 10 ml', NULL, NULL, NULL, NULL, 'cmr51k34e000910tj25iz3hoc', '2026-07-06 03:31:31.439', '2026-07-06 03:31:31.439', 'Y', '10 ml', NULL);
INSERT INTO public.medications VALUES ('cmr8nz9xc000zdnmxwbuq1b2q', 'Tetracaine hydrochloride', 'ห้ามให้ผู้ป่วยนากลับบ้าน', NULL, NULL, NULL, '* สำหรับทำหัตถการเท่านั้น', 'cmr51kh13000b10tjuu2jke0y', '2026-07-06 03:32:19.583', '2026-07-06 03:32:19.583', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8o0g110011dnmxlqff2974', 'Hypromellose (with preservative)', 'NATEAR', NULL, NULL, NULL, NULL, 'cmr51l11c000d10tj74ic6uk6', '2026-07-06 03:33:14.149', '2026-07-06 03:33:14.149', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8o1buf0013dnmxrx6u7020', '(สสต) Chloramphenicol', 'ear drop', NULL, NULL, NULL, NULL, 'cmr51lye9000f10tjjvfn2cl9', '2026-07-06 03:33:55.383', '2026-07-06 03:33:55.383', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8o1uox0015dnmxblykmvag', 'Fluticasone furoate', 'AVAMYS', NULL, '7.8 hr', NULL, NULL, 'cmr51mo71000j10tjrtyu2qfb', '2026-07-06 03:34:19.809', '2026-07-06 03:34:19.809', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8o2qsx0017dnmxj12g23ri', 'Oxymetazoline hydrochloride', 'Metzodin Nasal Spray', NULL, 'within seconds', NULL, NULL, 'cmr51n0ne000l10tjlos9oxzr', '2026-07-06 03:35:01.425', '2026-07-06 03:35:01.425', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8o45qx0019dnmxjgqaaaa8', 'Sulfadiazine silver (Silver sulfadiazine)', 'Sulfadiazine silver (Silver sulfadiazine)', NULL, NULL, NULL, NULL, 'cmr51nxu2000p10tjg6wkjqzu', '2026-07-06 03:36:07.449', '2026-07-06 03:36:07.449', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8o4i8e001bdnmxusadbs3m', 'Fusidic acid', 'Fusidic acid', NULL, NULL, NULL, NULL, 'cmr51nxu2000p10tjg6wkjqzu', '2026-07-06 03:36:23.63', '2026-07-06 03:36:23.63', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8o4xoy001ddnmxovonr49d', 'Clotrimazole', 'Clotrimazole 1 %CREAM', NULL, NULL, NULL, NULL, 'cmr51p40l000r10tj5w6ewxcy', '2026-07-06 03:36:43.651', '2026-07-06 03:36:43.651', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8o5okg001fdnmxmq7xd4nl', 'Urea', '10% UREA CREAM', NULL, NULL, NULL, NULL, 'cmr51rney000t10tjvs63wmz0', '2026-07-06 03:37:18.496', '2026-07-06 03:37:18.496', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8o69we001hdnmxzahlrshl', 'Calamine', 'Calamine', NULL, NULL, NULL, NULL, 'cmr51shh9000v10tj3jm5e73q', '2026-07-06 03:37:46.143', '2026-07-06 03:37:46.143', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8o6s2o001jdnmxly8h56po', 'Triamcinolone acetonide', '0.02', NULL, NULL, NULL, NULL, 'cmr51t1lg000x10tj2274tnea', '2026-07-06 03:38:09.696', '2026-07-06 03:38:09.696', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8o73nq001ldnmx0g0mo09e', 'Triamcinolone acetonide', '0.1', NULL, NULL, NULL, NULL, 'cmr51t1lg000x10tj2274tnea', '2026-07-06 03:38:24.71', '2026-07-06 03:38:24.71', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8o7ksc001ndnmxcavo1qxp', 'Triamcinolone acetonide', 'Lotion', NULL, NULL, NULL, NULL, 'cmr51t1lg000x10tj2274tnea', '2026-07-06 03:38:46.908', '2026-07-06 03:38:46.908', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8o82gm001pdnmxxrlcxl2l', 'Triamcinolone acetonide', 'ORAL PASTE', NULL, NULL, NULL, NULL, 'cmr51t1lg000x10tj2274tnea', '2026-07-06 03:39:09.814', '2026-07-06 03:39:09.814', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8o8n91001rdnmxr0wmuyke', 'Clobetasol propionate', 'P-VATE 15 g', NULL, NULL, NULL, NULL, 'cmr51t1lg000x10tj2274tnea', '2026-07-06 03:39:36.757', '2026-07-06 03:39:36.757', 'Y', '15 g', NULL);
INSERT INTO public.medications VALUES ('cmr8o92w4001tdnmx5hnxvdio', 'Salicylic acid + Lactic acid', 'COLLOMAK TOPICAL', NULL, NULL, NULL, NULL, 'cmr51tyuu000z10tj74eemt03', '2026-07-06 03:39:57.028', '2026-07-06 03:39:57.028', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8o9jgm001vdnmxzd4q9pty', 'ยานวด', 'RTAF BALM', NULL, NULL, NULL, NULL, 'cmr31s2r5000dtema7mx33qvv', '2026-07-06 03:40:18.502', '2026-07-06 03:40:18.502', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8o9yek001xdnmxjyxyzxnu', 'น้ำยาบ้วนปาก', 'B-mouth wash', NULL, NULL, NULL, NULL, 'cmr31s2r5000dtema7mx33qvv', '2026-07-06 03:40:37.868', '2026-07-06 03:40:37.868', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8oan2o0021dnmxn78za1x6', '(สสต) ผงโรยเท้า', NULL, NULL, NULL, NULL, NULL, 'cmr31s2r5000dtema7mx33qvv', '2026-07-06 03:41:09.84', '2026-07-06 03:41:09.84', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8oad7n001zdnmx7sermimf', 'Metadoxime', 'Metadoxil', NULL, NULL, NULL, NULL, 'cmr31s2r5000dtema7mx33qvv', '2026-07-06 03:40:57.059', '2026-07-06 03:40:57.059', 'N/A', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8ob1gv0023dnmx2tlxa8ds', '(สสต) ยาทากันยุง', NULL, NULL, NULL, NULL, NULL, 'cmr31s2r5000dtema7mx33qvv', '2026-07-06 03:41:28.495', '2026-07-06 03:41:28.495', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8ojybp0025dnmxti24gbir', 'Mist Carminative', 'M.Car', NULL, NULL, NULL, NULL, 'cmr4kgi780003i8w6yby4d9pz', '2026-07-06 03:48:24.311', '2026-07-06 03:48:24.311', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr2ygryo000d7zpyjtzknz07', 'Metoclopramide INJ', 'Metoclopramide INJ', NULL, '4 hr', NULL, NULL, 'cmr4khj1o0005i8w69jwzkor1', '2026-07-02 03:39:15.205', '2026-07-06 03:49:48.409', 'N', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8op9wt0027dnmxh48cq3vv', 'Hyoscine-n-butylbromide', 'BUSCOPAN INJ', NULL, NULL, NULL, NULL, 'cmr4khj1o0005i8w69jwzkor1', '2026-07-06 03:52:32.621', '2026-07-06 03:52:32.621', 'N', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8os9010029dnmxg8cen1vr', 'Calcium carbonate,sodium alginate,sodium bicarbonate', 'Gaviscon', NULL, NULL, NULL, NULL, 'cmr4khsuh0007i8w6rhts5t1a', '2026-07-06 03:54:51.409', '2026-07-06 03:54:51.409', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr619obp00054ljpyz33f4b0', 'Aspirin (Acetylsalicylic acid) tab (เฉพาะ 75-325 mg),', 'ASA 81', NULL, 'lowdose 2-3 hr
high dose 15-30 hr', NULL, '*สวบ.สั่งจ่ายเท่านั้น', 'cmr4g9qsu0007fvc95i52xkk0', '2026-07-04 07:21:01.272', '2026-07-06 04:17:43.542', 'Y*', 'Tab', '(เฉพาะ 75-325 mg)');
INSERT INTO public.medications VALUES ('cmr8poxo6002bdnmxp0hgy95o', 'Fenofibrate cap', 'Adfen-200 (Kaspa)', NULL, '20 hr', NULL, NULL, 'cmr4knpj0000hi8w6h1n2nkse', '2026-07-06 04:20:16.363', '2026-07-06 04:20:16.363', 'Y', NULL, NULL);
INSERT INTO public.medications VALUES ('cmr8pu79u002ddnmx7mzd4cyz', 'Hydroxyzine hydrochloride', 'Hydroxyzine 10 MG', NULL, NULL, NULL, NULL, 'cmr4kqu8h000pi8w68rx4bqas', '2026-07-06 04:24:22.098', '2026-07-06 04:24:22.098', 'N', '10 mg', NULL);
INSERT INTO public.medications VALUES ('cmr7j68uq0035y7aqjor7usza', 'Doxazosin 2 mg', 'PENCOR', NULL, '22 hr', NULL, NULL, 'cmr4ln7fy002di8w6tw0p5am0', '2026-07-05 08:30:00.53', '2026-07-06 04:42:58.023', 'N', '2 mg', NULL);
INSERT INTO public.medications VALUES ('cmr8nrs3u000ndnmxeoijw3v0', 'PARACET + ORPHENADRIN', 'Orphetamol PDF', NULL, 'orphenadrine 14-16 hr', NULL, NULL, 'cmr4lqxcm002ti8w6l6fx9p3s', '2026-07-06 03:26:29.886', '2026-07-06 04:47:49.797', 'N', NULL, NULL);


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: verification_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- PostgreSQL database dump complete
--

\unrestrict CB2mHLY39etSIDx1WXguwJ2zxuIKhTMvCWBcOAOfRC15aZebV8ldgRFwVcz4ZNX

