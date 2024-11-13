DELIMITER //

CREATE PROCEDURE AddAuditLog(
    IN p_log VARCHAR(255),
    IN p_userid INT
)
BEGIN
    INSERT INTO AuditLogs (log, userid)
    VALUES (p_log, p_userid);
END //

DELIMITER ;
