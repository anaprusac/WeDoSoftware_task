using WeDoSoftware.Application.Statistics;

namespace WeDoSoftware.Application.Common.Interfaces;

public interface IStatisticsService
{
    Task<MonthlyStatisticsDto> GetMonthlyAsync(Guid userId, int year, int month, CancellationToken cancellationToken = default);
}
