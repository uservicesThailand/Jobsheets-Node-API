-- FormVibrationAC tables + skip log
-- Run directly on DB (db3)

CREATE TABLE IF NOT EXISTS form_skip_log (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  insp_no     VARCHAR(50) NOT NULL,
  form_key    VARCHAR(100) NOT NULL,
  skipped_by  INT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_skip_log (insp_no, form_key)
);

-- common header fields → form_scm_inspection_headers (shared with SCM)
-- VAC-specific fields only:
CREATE TABLE IF NOT EXISTS form_vac_header_extras (
  vac_he_id                INT AUTO_INCREMENT PRIMARY KEY,
  insp_no                  VARCHAR(50) NOT NULL,
  business_from            VARCHAR(50),
  circuit                  VARCHAR(100),
  coil_fan                 VARCHAR(100),
  bearing                  VARCHAR(100),
  monitoring               VARCHAR(100),
  transformer              VARCHAR(100),
  problem_analysis         TEXT,
  customer_acceptable      VARCHAR(255),
  customer_acceptable_date DATE,
  result_status            ENUM('N','W','D'),
  remark                   TEXT,
  created_by               INT,
  updated_by               INT,
  created_at               DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at               DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_vac_he_insp_no (insp_no)
);

-- form_vac_driven_equipment → reuse form_scm_driven_equipment (shared with SCM)

CREATE TABLE IF NOT EXISTS form_vac_general_info (
  vac_gi_id         INT AUTO_INCREMENT PRIMARY KEY,
  insp_no           VARCHAR(50) NOT NULL,
  vac_gi_rotation   VARCHAR(10),
  vac_gi_mounting   VARCHAR(20),
  vac_gi_foundation VARCHAR(20),
  vac_gi_connection VARCHAR(20),
  created_by        INT,
  updated_by        INT,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_vac_gi_insp_no (insp_no)
);

CREATE TABLE IF NOT EXISTS form_vac_measurements (
  vac_m_id        INT AUTO_INCREMENT PRIMARY KEY,
  insp_no         VARCHAR(50) NOT NULL,
  no              INT,
  time            VARCHAR(20),
  voltage_uv      VARCHAR(20),
  voltage_uw      VARCHAR(20),
  voltage_vw      VARCHAR(20),
  current_u       VARCHAR(20),
  current_v       VARCHAR(20),
  current_w       VARCHAR(20),
  pressure_load   VARCHAR(20),
  temp_motor_nde  VARCHAR(20),
  temp_frame      VARCHAR(20),
  temp_motor_de   VARCHAR(20),
  temp_load_de    VARCHAR(20),
  temp_load_nde   VARCHAR(20),
  temp_amb        VARCHAR(20),
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_vac_m_insp_no (insp_no)
);

CREATE TABLE IF NOT EXISTS form_vac_mech_measurements (
  vac_mm_id   INT AUTO_INCREMENT PRIMARY KEY,
  insp_no     VARCHAR(50) NOT NULL,
  no          INT,
  time        VARCHAR(20),
  m_nde_h     VARCHAR(20), m_nde_v VARCHAR(20), m_nde_a VARCHAR(20),
  m_nde_dbm   VARCHAR(20), m_nde_dbc VARCHAR(20), m_nde_dbi VARCHAR(20), m_nde_g VARCHAR(20),
  m_de_h      VARCHAR(20), m_de_v VARCHAR(20), m_de_a VARCHAR(20),
  m_de_dbm    VARCHAR(20), m_de_dbc VARCHAR(20), m_de_dbi VARCHAR(20), m_de_g VARCHAR(20),
  l_de_h      VARCHAR(20), l_de_v VARCHAR(20), l_de_a VARCHAR(20),
  l_de_dbm    VARCHAR(20), l_de_dbc VARCHAR(20), l_de_dbi VARCHAR(20), l_de_g VARCHAR(20),
  l_nde_h     VARCHAR(20), l_nde_v VARCHAR(20), l_nde_a VARCHAR(20),
  l_nde_dbm   VARCHAR(20), l_nde_dbc VARCHAR(20), l_nde_dbi VARCHAR(20), l_nde_g VARCHAR(20),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_vac_mm_insp_no (insp_no)
);

CREATE TABLE IF NOT EXISTS form_vac_lubricant (
  vac_lub_id  INT AUTO_INCREMENT PRIMARY KEY,
  insp_no     VARCHAR(50) NOT NULL,
  de_status   VARCHAR(20),
  de_remarks  TEXT,
  de_oil_type VARCHAR(100),
  de_regrease VARCHAR(100),
  nde_status  VARCHAR(20),
  nde_remarks TEXT,
  nde_oil_type VARCHAR(100),
  nde_regrease VARCHAR(100),
  created_by  INT,
  updated_by  INT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_vac_lub_insp_no (insp_no)
);
