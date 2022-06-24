@echo off

rem #############################
rem ##                         ##
rem ##  Written by: David Shin ##
rem ##                         ##
rem #############################

sqlcmd -S .\REST -d eRES15 -Q "ALTER DATABASE eRES15 SET ENABLE_BROKER WITH ROLLBACK IMMEDIATE;"
sqlcmd -S .\REST -d eRES15 -Q "EXEC sp_updatestats"
sqlcmd -S .\REST -d eRES15 -Q "EXEC sp_changedbowner 'sa'"
sqlcmd -S .\REST -d eRES15 -Q "ALTER TABLE dbo.BestSeller ADD BestSellerID int not null PRIMARY KEY IDENTITY(1, 1)"

sqlcmd -S .\REST -d eRES15 -Q "ALTER TABLE MenuItem ALTER COLUMN LargeMenuImage VARBINARY(MAX)"
sqlcmd -S .\REST -d eRES15 -Q "ALTER TABLE MenuItem ALTER COLUMN MenuImage VARBINARY(MAX)"

sqlcmd -S .\REST -d eRES15 -Q "ALTER TABLE MenuGroup ALTER COLUMN GroupImage VARBINARY(MAX)"

sqlcmd -S .\REST -d eRES15 -Q "ALTER TABLE StoreSetting ALTER COLUMN StoreImage VARBINARY(MAX)"
sqlcmd -S .\REST -d eRES15 -Q "ALTER TABLE StoreSetting ALTER COLUMN ADImage VARBINARY(MAX)"
sqlcmd -S .\REST -d eRES15 -Q "ALTER TABLE StoreSetting ALTER COLUMN DualImage VARBINARY(MAX)"
sqlcmd -S .\REST -d eRES15 -Q "ALTER TABLE StoreSetting ALTER COLUMN POSDisplayMessage nvarchar(MAX)"
sqlcmd -S .\REST -d eRES15 -Q "ALTER TABLE StoreSetting ALTER COLUMN Printer13COMIP VARCHAR (20)"


sqlcmd -S .\REST -d eRES15 -Q "ALTER TABLE MenuModifier ALTER COLUMN ModifierImage VARBINARY(MAX)"
sqlcmd -S .\REST -d eRES15 -Q "IF NOT EXISTS(SELECT * FROM sys.symmetric_keys) BEGIN CREATE MASTER KEY ENCRYPTION BY PASSWORD = 'encetfos' END"

echo.
pause