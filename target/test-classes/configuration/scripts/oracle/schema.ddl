REM Script TO CREATE Oracle SCHEMA.

-------------------------------------------------------
-- Create sequences
--------------------------------------------------------
CREATE SEQUENCE "ACL_CLASS_SEQ"
INCREMENT BY 1
MAXVALUE 9999999999999999999999999999
START WITH 1
CACHE 20
NOORDER
NOCYCLE;

CREATE SEQUENCE "ACL_ENTRY_SEQ"
INCREMENT BY 1
MAXVALUE 9999999999999999999999999999
START WITH 1
CACHE 100
NOORDER
NOCYCLE;

CREATE SEQUENCE "ACL_OBJECT_IDENTITY_SEQ"
INCREMENT BY 1
MAXVALUE 9999999999999999999999999999
START WITH 1
CACHE 100
NOORDER
NOCYCLE;

CREATE SEQUENCE "ACL_SID_SEQ"
INCREMENT BY 1
MAXVALUE 9999999999999999999999999999
START WITH 1
CACHE 20
NOORDER
NOCYCLE;

--------------------------------------------------------
-- ACL_CLASS Table
--------------------------------------------------------
CREATE TABLE "ACL_CLASS" (
  "ID"    NUMBER(19, 0)  NOT NULL,
  "CLASS" NVARCHAR2(100) NOT NULL,
  PRIMARY KEY ("ID"),
  CONSTRAINT "ACL_CLASS_CLASS_UQ" UNIQUE ("CLASS")
);

--------------------------------------------------------
-- ACL_ENTRY Table
--------------------------------------------------------
CREATE TABLE "ACL_ENTRY" (
  "ID"                  NUMBER(19, 0) NOT NULL,
  "ACL_OBJECT_IDENTITY" NUMBER(19, 0) NOT NULL,
  "ACE_ORDER"           NUMBER(19, 0) NOT NULL,
  "SID"                 NUMBER(19, 0) NOT NULL,
  "MASK"                NUMBER(19, 0) NOT NULL,
  "GRANTING"            NUMBER(1, 0)  NOT NULL,
  "AUDIT_SUCCESS"       NUMBER(1, 0)  NOT NULL,
  "AUDIT_FAILURE"       NUMBER(1, 0)  NOT NULL,
  PRIMARY KEY ("ID"),
  CONSTRAINT "ACL_ENTRY_IDENT_ORDER_UQ" UNIQUE ("ACL_OBJECT_IDENTITY", "ACE_ORDER")
);

ALTER TABLE "ACL_ENTRY" ADD CONSTRAINT "ACL_ENTRY_GRANTING_CK"
CHECK ("GRANTING" IN (1, 0));
ALTER TABLE "ACL_ENTRY" ADD CONSTRAINT "ACL_ENTRY_AUDIT_SUCCESS_CK"
CHECK ("AUDIT_SUCCESS" IN (1, 0));
ALTER TABLE "ACL_ENTRY" ADD CONSTRAINT "ACL_ENTRY_AUDIT_FAILURE_CK"
CHECK ("AUDIT_FAILURE" IN (1, 0));

--------------------------------------------------------
-- ACL_OBJECT_IDENTITY Table
--------------------------------------------------------
CREATE TABLE "ACL_OBJECT_IDENTITY" (
  "ID"                 NUMBER(19, 0) NOT NULL,
  "OBJECT_ID_CLASS"    NUMBER(19, 0) NOT NULL,
  "OBJECT_ID_IDENTITY" NUMBER(19, 0) NOT NULL,
  "PARENT_OBJECT"      NUMBER(19, 0),
  "OWNER_SID"          NUMBER(19, 0) NOT NULL,
  "ENTRIES_INHERITING" NUMBER(1, 0)  NOT NULL,
  PRIMARY KEY ("ID"),
  CONSTRAINT "ACL_OBJ_ID_CLASS_IDENT_UQ" UNIQUE ("OBJECT_ID_CLASS", "OBJECT_ID_IDENTITY")
);

ALTER TABLE "ACL_OBJECT_IDENTITY" ADD CONSTRAINT "ACL_OBJ_ID_ENTRIES_CK"
CHECK ("ENTRIES_INHERITING" IN (1, 0));

--------------------------------------------------------
-- ACL_SID Table
--------------------------------------------------------
CREATE TABLE "ACL_SID" (
  "ID"        NUMBER(19, 0)  NOT NULL,
  "PRINCIPAL" NUMBER(1, 0)   NOT NULL,
  "SID"       NVARCHAR2(100) NOT NULL,
  PRIMARY KEY ("ID"),
  CONSTRAINT "ACL_SID_PRINCIPAL_SID_UQ" UNIQUE ("SID", "PRINCIPAL")
);

ALTER TABLE "ACL_SID" ADD CONSTRAINT "ACL_SID_PRINCIPAL_CK"
CHECK ("PRINCIPAL" IN (1, 0));

--------------------------------------------------------
-- Relationships
--------------------------------------------------------

ALTER TABLE "ACL_ENTRY" ADD CONSTRAINT "FK_ACL_ENTRY_ACL_OBJECT_ID"
FOREIGN KEY ("ACL_OBJECT_IDENTITY")
REFERENCES "ACL_OBJECT_IDENTITY" ("ID");
ALTER TABLE "ACL_ENTRY" ADD CONSTRAINT "FK_ACL_ENTRY_SID"
FOREIGN KEY ("SID")
REFERENCES "ACL_SID" ("ID");

ALTER TABLE "ACL_OBJECT_IDENTITY" ADD CONSTRAINT "FK_ACL_OBJ_ID_CLASS"
FOREIGN KEY ("OBJECT_ID_CLASS")
REFERENCES "ACL_CLASS" ("ID");
ALTER TABLE "ACL_OBJECT_IDENTITY" ADD CONSTRAINT "FK_ACL_OBJ_ID_SID"
FOREIGN KEY ("OWNER_SID")
REFERENCES "ACL_SID" ("ID");

CREATE INDEX IDX_OBJ_01 ON ACL_OBJECT_IDENTITY (PARENT_OBJECT)
LOGGING
NOPARALLEL;
--------------------------------------------------------
-- Triggers
--------------------------------------------------------
CREATE OR REPLACE TRIGGER "ACL_CLASS_ID"
BEFORE INSERT ON ACL_CLASS
FOR EACH ROW
  BEGIN
    SELECT
      ACL_CLASS_SEQ.NEXTVAL
    INTO :new.id
    FROM dual;
  END;
/

CREATE OR REPLACE TRIGGER "ACL_ENTRY_ID"
BEFORE INSERT ON ACL_ENTRY
FOR EACH ROW
  BEGIN
    SELECT
      ACL_ENTRY_SEQ.NEXTVAL
    INTO :new.id
    FROM dual;
  END;
/

CREATE OR REPLACE TRIGGER "ACL_OBJECT_IDENTITY_ID"
BEFORE INSERT ON ACL_OBJECT_IDENTITY
FOR EACH ROW
  BEGIN
    SELECT
      ACL_OBJECT_IDENTITY_SEQ.NEXTVAL
    INTO :new.id
    FROM dual;
  END;
/

CREATE OR REPLACE TRIGGER "ACL_SID_ID"
BEFORE INSERT ON ACL_SID
FOR EACH ROW
  BEGIN
    SELECT
      ACL_SID_SEQ.NEXTVAL
    INTO :new.id
    FROM dual;
  END;
/


CREATE TABLE groups (
  id               NUMBER(19, 0) NOT NULL,
  deleted          NUMBER(1, 0),
  deletedTimeStamp TIMESTAMP,
  description      NVARCHAR2(255),
  name             NVARCHAR2(255),
  role             NVARCHAR2(255),
  PRIMARY KEY (id)
);

CREATE TABLE tags (
  id              NUMBER(19, 0)  NOT NULL,
  name            NVARCHAR2(255) NOT NULL,
  type            NVARCHAR2(255) NOT NULL,
  contextItemName NVARCHAR2(255),
  PRIMARY KEY (id)
);

CREATE TABLE items (
  discriminator            NVARCHAR2(31)           NOT NULL,
  id                       NUMBER(19, 0)           NOT NULL,
  contextItemName          NVARCHAR2(255)          NOT NULL,
  createdBy                NVARCHAR2(255),
  createdTimestamp         TIMESTAMP,
  lastModifiedBy           NVARCHAR2(255),
  lastModifiedTimestamp    TIMESTAMP,
  lastPublicationTimestamp TIMESTAMP,
  name                     NVARCHAR2(255)          NOT NULL,
  parentItemName           NVARCHAR2(255),
  state                    NVARCHAR2(255)          NOT NULL,
  subType                  NVARCHAR2(255),
  type                     NVARCHAR2(255)          NOT NULL,
  userId                   NVARCHAR2(255),
  extendedItem_id          NUMBER(19, 0),
  template_id              NUMBER(19, 0),
  lockCounter              NUMBER(19, 0) DEFAULT 0 NOT NULL,
  hidden                   NUMBER(1, 0) DEFAULT 0  NOT NULL,
  publicationStatus        NVARCHAR2(25)           NOT NULL,
  nextPublishAction        NVARCHAR2(25) DEFAULT null,
  uuid                     NVARCHAR2(40)           NOT NULL,
  page_id                  NUMBER(19, 0),
  manageable               NUMBER(1, 0),
  PRIMARY KEY (id),
  UNIQUE (name, contextItemName)
);

CREATE TABLE item_tags (
  id        NUMBER(19, 0)          NOT NULL,
  item_id   NUMBER(19, 0)          NOT NULL,
  tag_id    NUMBER(19, 0)          NOT NULL,
  blacklist NUMBER(1, 0) DEFAULT 0 NOT NULL,
  manageable    NUMBER(1, 0) DEFAULT 1  NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE property_definition (
  id            NUMBER(19, 0)  NOT NULL,
  label         NVARCHAR2(255),
  name          NVARCHAR2(255) NOT NULL,
  internalValue NVARCHAR2(2000),
  type          NVARCHAR2(255),
  versioning    NVARCHAR2(255),
  viewHint      NVARCHAR2(255),
  user_id       NUMBER(19, 0),
  item_id       NUMBER(19, 0),
  manageable    NUMBER(1, 0) DEFAULT 1  NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE user_property_definition (
  id            NUMBER(19, 0)  NOT NULL,
  label         NVARCHAR2(255),
  name          NVARCHAR2(255) NOT NULL,
  internalValue NVARCHAR2(2000),
  type          NVARCHAR2(255),
  versioning    NVARCHAR2(255),
  viewHint      NVARCHAR2(255),
  user_id       NUMBER(19, 0),
  item_id       NUMBER(19, 0),
  PRIMARY KEY (id)
);

CREATE TABLE users (
  id           NUMBER(19, 0) NOT NULL,
  lastLoggedIn TIMESTAMP,
  enabled      NUMBER(1, 0)  NOT NULL,
  password     NVARCHAR2(255),
  username     NVARCHAR2(255),
  PRIMARY KEY (id)
);

CREATE TABLE users_groups (
  users_id  NUMBER(19, 0) NOT NULL,
  groups_id NUMBER(19, 0) NOT NULL
);

CREATE TABLE deleted_page_item (
  id        NUMBER(19, 0)  NOT NULL,
  uuid      NVARCHAR2(255) NOT NULL,
  pageUuid  NVARCHAR2(255) NOT NULL,
  itemName  NVARCHAR2(255) NOT NULL,
  itemTitle NVARCHAR2(255),
  itemType  NVARCHAR2(255) NOT NULL,
  PRIMARY KEY (id)
);

ALTER TABLE item_tags
ADD CONSTRAINT FK_ITA_ITE_ID
FOREIGN KEY (item_id)
REFERENCES items (id);

ALTER TABLE item_tags
ADD CONSTRAINT FK_ITA_TAG_ID
FOREIGN KEY (tag_id)
REFERENCES tags (id);


ALTER TABLE property_definition ADD CONSTRAINT FKF00C25FDA7A14068 FOREIGN KEY (item_id) REFERENCES items;
ALTER TABLE property_definition ADD CONSTRAINT FKF00C25FDA6F68767 FOREIGN KEY (user_id) REFERENCES users;
ALTER TABLE user_property_definition ADD CONSTRAINT FK_USER_PROP_DEF_USER_ID FOREIGN KEY (user_id) REFERENCES users;

ALTER TABLE users_groups ADD CONSTRAINT FKD034EFEBEE9B51F8 FOREIGN KEY (groups_id) REFERENCES groups;
ALTER TABLE users_groups ADD CONSTRAINT FKD034EFEB9FE7600A FOREIGN KEY (users_id) REFERENCES users;

CREATE SEQUENCE hibernate_sequence
INCREMENT BY 1
MAXVALUE 9999999999999999999999999999
START WITH 1
CACHE 1000
NOORDER
NOCYCLE;

-- Indexes
CREATE UNIQUE INDEX IDX_USERS_USERNAME ON USERS
(USERNAME)
LOGGING
NOPARALLEL;

CREATE INDEX IDX_USERS_GROUPS_USERS_ID ON USERS_GROUPS
(USERS_ID)
LOGGING
NOPARALLEL;

CREATE INDEX IDX_USERS_GROUPS_GROUPS_ID ON USERS_GROUPS
(GROUPS_ID)
LOGGING
NOPARALLEL;

CREATE INDEX IDX_ITEMS_USER_ID ON ITEMS
(USERID)
LOGGING
NOPARALLEL;

CREATE INDEX IDX_ITEMS_PARENTITEMNAME ON ITEMS
(PARENTITEMNAME)
LOGGING
NOPARALLEL;

CREATE INDEX IDX_ITEMS_EXTENDEDITEM_ID ON ITEMS
(EXTENDEDITEM_ID)
LOGGING
NOPARALLEL;

CREATE INDEX IDX_ITEMS_DISCRIMINATOR ON ITEMS
(DISCRIMINATOR)
LOGGING
NOPARALLEL;

CREATE INDEX IDX_PROPERTY_DEF_ITEM_ID ON PROPERTY_DEFINITION
(ITEM_ID)
LOGGING
NOPARALLEL;

CREATE UNIQUE INDEX IDX_PROPERTY_DEF_NAME_ITEM_ID ON PROPERTY_DEFINITION
(NAME, ITEM_ID)
LOGGING
NOPARALLEL;

CREATE INDEX IDX_PROPERTY_DEF_USER_ID ON PROPERTY_DEFINITION
(USER_ID)
LOGGING
NOPARALLEL;

CREATE INDEX IDX_USER_PROP_DEF_USER_ID ON USER_PROPERTY_DEFINITION
(USER_ID)
LOGGING
NOPARALLEL;

CREATE INDEX IDX_ITA_01 ON item_tags (item_id)
LOGGING
NOPARALLEL;

CREATE INDEX IDX_ITA_02 ON item_tags (tag_id)
LOGGING
NOPARALLEL;

CREATE INDEX IDX_ITE_01 ON items (uuid)
LOGGING
NOPARALLEL;

CREATE INDEX IDX_ITE_02 ON items (template_id)
LOGGING
NOPARALLEL;

CREATE INDEX IDX_ITE_03 ON items (userId, parentItemName, contextItemName)
LOGGING
NOPARALLEL;

CREATE INDEX IDX_PDN_01 ON property_definition (name)
LOGGING
NOPARALLEL;

CREATE INDEX IDX_USER_PROP_DEF_NAME ON user_property_definition (name)
LOGGING
NOPARALLEL;

create unique index IDX_TAG_NAME_CTX_TYPE on tags (upper(name), contextItemName, type)
LOGGING
NOPARALLEL;

  exit;