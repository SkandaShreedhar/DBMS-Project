CREATE TRIGGER after_message_insert
AFTER INSERT ON messages
FOR EACH ROW
BEGIN
    INSERT INTO AuditLogs (log, userid)
    VALUES (NEW.message, NEW.senderid);
END;
