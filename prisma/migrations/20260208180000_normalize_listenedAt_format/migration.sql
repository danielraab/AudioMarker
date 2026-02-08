-- Normalize listenedAt column from mixed text/integer format to consistent integer (milliseconds)
-- This fixes comparison issues in queries due to SQLite's type affinity

-- Convert text-formatted listenedAt values to integer (milliseconds) in AudioListenRecord
UPDATE AudioListenRecord 
SET listenedAt = CAST(strftime('%s', listenedAt) AS INTEGER) * 1000 + 
                 CAST(COALESCE(SUBSTR(listenedAt, 21, 3), '0') AS INTEGER)
WHERE typeof(listenedAt) = 'text';

-- Convert text-formatted listenedAt values to integer (milliseconds) in PlaylistListenRecord  
UPDATE PlaylistListenRecord
SET listenedAt = CAST(strftime('%s', listenedAt) AS INTEGER) * 1000 +
                 CAST(COALESCE(SUBSTR(listenedAt, 21, 3), '0') AS INTEGER)
WHERE typeof(listenedAt) = 'text';
