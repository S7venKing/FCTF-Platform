using ChallengeManagementServer.DTO;
using ChallengeManagementServer.Middlewares;
using ChallengeManagementServer.ServiceInterfaces;
using Microsoft.AspNetCore.Mvc;
using ResourceShared.Configs;
using ResourceShared.DTOs;
using ResourceShared.Models;
using ResourceShared.ResponseViews;
using SocialSync.Shared.Utils.ResourceShared.Utils;
using StackExchange.Redis;

namespace ChallengeManagementServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [RequireSecretKey]
    public class PerformanceController : ControllerBase
    {
        private readonly IPerformanceService _performanceService;
        private readonly IConnectionMultiplexer _connectionMultiplexer;

        public PerformanceController(IPerformanceService performanceService, IConnectionMultiplexer connectionMultiplexer)
        {
            _performanceService = performanceService;
            _connectionMultiplexer = connectionMultiplexer;
        }

        [HttpPost("monitoring")]
        public async Task<IActionResult> GetAllPodPerfomanceStat()
        {
            try
            {
                await Console.Out.WriteLineAsync("Get request to get statistic");
                var podStatisticList = await _performanceService.GetAllPodStatistic(_connectionMultiplexer);
                await Console.Out.WriteLineAsync("End request to get statistic");
                return Ok(new GenaralViewResponseData<List<PodStatisticInfo>>
                {
                    IsSuccess = true,
                    Message = "Get Cluster Statistic Success",
                    data = podStatisticList
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new GeneralView
                {
                    IsSuccess = false,
                    Message = ex.Message,
                });
            }
        }

        [HttpPost("stat")]
        public async Task<IActionResult> GetClusterPerfomanceStat()
        {
            try
            {
                await Console.Out.WriteLineAsync("Get request to get statistic");
                var clusterStatistic = await _performanceService.GetClusterUsageByPercent();
                await Console.Out.WriteLineAsync("End request to get statistic");
                return Ok(new GenaralViewResponseData<ClusterUsageByPercent>
                {
                    IsSuccess = true,
                    Message = "Get Cluster Statistic Success",
                    data = clusterStatistic
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new GeneralView
                {
                    IsSuccess = false,
                    Message = ex.Message,
                });
            }

        }

        [HttpPost("challengePerformance")]
        public async Task<IActionResult> GetPerfomanceStat([FromForm]int ChallengeId)
        {
            try
            {
                // Team Id = -1 is admin/challenge writter
                List<Task> tasks = new List<Task>();

                var challengePerformance =  await _performanceService.GetPerformancePod(ChallengeId, -1);

                return Ok(new GenaralViewResponseData<PodStatisticInfo>
                {
                    IsSuccess = true,
                    Message = "Get Challenge Stat success",
                    data = challengePerformance
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new GeneralView
                {
                    IsSuccess = false,
                    Message = ex.Message,
                });
            }
        }
    }
}
