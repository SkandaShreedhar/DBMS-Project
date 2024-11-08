CREATE DATABASE ChatSystem;

USE ChatSystem;

-- Table for Users
CREATE TABLE Users (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    UserName VARCHAR(100) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    ProfilePicture BLOB,
    About TEXT
);

-- Table for Groups
CREATE TABLE `Groups` (
    GroupID INT PRIMARY KEY AUTO_INCREMENT,
    GroupName VARCHAR(100) NOT NULL,
    UserID INT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Table for Media
CREATE TABLE Media (
    MediaID INT PRIMARY KEY AUTO_INCREMENT,
    MediaType VARCHAR(50) NOT NULL,
    MediaData BLOB
);

-- Table for Messages
CREATE TABLE Messages (
    MessageID INT PRIMARY KEY AUTO_INCREMENT,
    Message TEXT NOT NULL,
    SenderID INT,
    ReceiverID INT,
    MediaID INT,
    FOREIGN KEY (SenderID) REFERENCES Users(UserID),
    FOREIGN KEY (ReceiverID) REFERENCES Users(UserID),
    FOREIGN KEY (MediaID) REFERENCES Media(MediaID)
);

-- Table for Audit Logs
CREATE TABLE AuditLogs (
    AuditID INT PRIMARY KEY AUTO_INCREMENT,
    Log TEXT NOT NULL,
    UserID INT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Relationship Table for Users and `Groups` (Many-to-Many relationship)
CREATE TABLE UserGroups (
    UserID INT,
    GroupID INT,
    PRIMARY KEY (UserID, GroupID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (GroupID) REFERENCES `Groups`(GroupID)
);

-- Chats 
CREATE TABLE Chats (
    ChatId INT PRIMARY KEY,
    UserId1 INT,
    UserId2 INT,
    FOREIGN KEY (UserId1) REFERENCES Users(UserID),
    FOREIGN KEY (UserId2) REFERENCES Users(UserID)
);

INSERT INTO Chats (ChatId, UserId1, UserId2)
VALUES 
(1, 1, 2),  
(2, 1, 3),  
(3, 2, 4),  
(4, 3, 4);

-- INSERT INTO Messages (MessageID, Message, SenderID, ReceiverID, MediaID)
-- VALUES 
-- ();