@echo off

rem #############################
rem ##                         ##
rem ##  Written by: David Shin ##
rem ##                         ##
rem #############################
sqlcmd -S .\REST -d eRES15 -Q "DECLARE @TriggerName AS VARCHAR(500) DECLARE DropTrigger CURSOR FOR SELECT TRG.name AS TriggerName FROM   sys.triggers TRG INNER JOIN sys.tables TBL ON TBL.OBJECT_ID = TRG.parent_id OPEN DropTrigger FETCH Next FROM DropTrigger INTO @TriggerName WHILE @@FETCH_STATUS = 0 BEGIN DECLARE @SQL VARCHAR(MAX)=NULL SET @SQL='Drop Trigger [dbo].[' + @TriggerName +']' PRINT 'Trigger ::' + @TriggerName + ' Droped Successfully' EXEC (@SQL) PRINT @SQL FETCH Next FROM DropTrigger INTO @TriggerName END CLOSE DropTrigger DEALLOCATE DropTrigger"