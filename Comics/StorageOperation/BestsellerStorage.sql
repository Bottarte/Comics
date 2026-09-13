CREATE OR ALTER PROCEDURE ExecuteBestsellerLogic
    @MinPages INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @BestsellerGenreId INT;

        SELECT TOP 1 @BestsellerGenreId = Id 
        FROM Genres 
        WHERE Name = 'Bestseller';

        IF @BestsellerGenreId IS NULL
        BEGIN
            RAISERROR('Жанр "Bestseller" не знайдено в таблиці Genres', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        WITH GroupedDetails AS (
            SELECT 
                Id,
                ShopId,
                ComicId,
                Price,
                Quantity,
                ROW_NUMBER() OVER (PARTITION BY ComicId, ShopId ORDER BY Id) as RowNum,
                MAX(Price) OVER (PARTITION BY ComicId, ShopId) as MaxPrice,
                AVG(CAST(Quantity AS FLOAT)) OVER (PARTITION BY ComicId, ShopId) as AvgQuantity
            FROM ComicDetails
        )
        UPDATE cd
        SET 
            cd.Price = gd.MaxPrice,
            cd.Quantity = ROUND(gd.AvgQuantity, 0)
        FROM ComicDetails cd
        JOIN GroupedDetails gd ON cd.Id = gd.Id
        WHERE gd.RowNum = 1;

        WITH Duplicates AS (
            SELECT Id, ROW_NUMBER() OVER (PARTITION BY ComicId, ShopId ORDER BY Id) as RowNum
            FROM ComicDetails
        )
        DELETE FROM ComicDetails 
        WHERE Id IN (SELECT Id FROM Duplicates WHERE RowNum > 1);

        DELETE FROM ComicGenres
        WHERE GenresId = @BestsellerGenreId
          AND ComicId IN (SELECT Id FROM Comics WHERE Pages < @MinPages);

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
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH;
END;