USE [ComicsDb];
GO

CREATE OR ALTER PROCEDURE BestsellerLogic
    @MinPages INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION [gyiujgyu];

    BEGIN TRY
        DECLARE @BestsellerGenreId INT;

        SELECT TOP 1 @BestsellerGenreId = Id 
        FROM Genres 
        WHERE TRIM(Name) LIKE 'Bestseller%';

        INSERT INTO ComicDetails (ComicId, ShopId, Price, Quantity)
        SELECT 
            ComicId,
            ShopId,
            SUM(Price * Quantity) AS TotalSum,
            ROUND(AVG(CAST(Quantity AS FLOAT)), 0) AS AvgQty
        FROM ComicDetails
        GROUP BY ComicId, ShopId;

        MERGE INTO ComicGenres AS Target
        USING (
            SELECT Id AS ComicId 
            FROM Comics 
            WHERE Pages >= @MinPages 

              AND Id IN (SELECT DISTINCT ComicId FROM ComicDetails)
        ) AS Source
        ON (Target.ComicId = Source.ComicId AND Target.GenresId = @BestsellerGenreId)
        
        WHEN MATCHED THEN
            UPDATE SET Target.TimeAssigmant = GETUTCDATE()
            
        WHEN NOT MATCHED THEN
            INSERT (ComicId, GenresId, TimeAssigmant)
            VALUES (Source.ComicId, @BestsellerGenreId, GETUTCDATE());

        COMMIT TRANSACTION;

        SELECT 
            ComicId,
            ShopId,
            SUM(Price * Quantity) AS TotalSum,
            ROUND(AVG(CAST(Quantity AS FLOAT)), 0) AS AvgQty
        FROM ComicDetails
        GROUP BY ComicId, ShopId;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH;
END;
GO