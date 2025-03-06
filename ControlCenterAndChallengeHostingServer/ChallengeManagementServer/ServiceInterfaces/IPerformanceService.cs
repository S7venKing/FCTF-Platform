using ChallengeManagementServer.K8sServerResponse.GetClusterStatisticResponseDTO;
using ResourceShared.Models;
using ChallengeManagementServer.DTO.PerformanceStatDTO;
using StackExchange.Redis;

namespace ChallengeManagementServer.ServiceInterfaces
{
    public interface IPerformanceService
    {
       public Task<CpuUsageDTO> GetCpuUsageAsync();

        public Task<MemoryStatsDTO> GetMemoryUsageAsync();

        public Task<PodStatisticInfo?> GetPerformancePod(int ChallengeId, int TeamId);

        public Task<ClusterStatisticResponseInfo> GetClusterStatistic();

        public Task<ClusterStatisticInfo> GetClusterCPUAndRAMUsage();

        public Task<List<PodStatisticInfo>> GetAllPodStatistic(IConnectionMultiplexer _connectionMultiplexer);

        public Task<ClusterUsageByPercent> GetClusterUsageByPercent();
    }
}
