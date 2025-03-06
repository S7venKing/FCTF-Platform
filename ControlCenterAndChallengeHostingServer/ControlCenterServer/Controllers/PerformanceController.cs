using ControlCenterServer.Configs;
using ControlCenterServer.Middlewares;
using ResourceShared.Models;
using Microsoft.AspNetCore.Mvc;
using ResourceShared.Configs;
using ResourceShared.ResponseViews;
using ResourceShared.Utils;
using RestSharp;
using SocialSync.Shared.Utils.ResourceShared.Utils;
using StackExchange.Redis;

namespace ControlCenterServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [RequireSecretKey]
    public class PerformanceController : ControllerBase
    {
        private readonly IConnectionMultiplexer _connectionMultiplexer;
        public PerformanceController(IConnectionMultiplexer connectionMultiplexer)
        {
            _connectionMultiplexer = connectionMultiplexer;
        }

        [HttpPost("monitoring")]
        public async Task<IActionResult> GetAllPodStatistic()
        {
            try
            {
                var challengeHostServer = ControlCenterServiceConfig.ChallengeServerInfoList;
                if (challengeHostServer == null) return BadRequest(new GeneralView()
                {
                    Message = "ChallengeHostServer is null, check config machine id",
                    IsSuccess = false
                });

                var monitoringRequest = new RestRequest();
                monitoringRequest.Method = Method.Post;
                monitoringRequest.Resource = "api/performance/monitoring";

                long unixTime = DateTimeHelper.GetDateTimeNowInUnix();

                string secretKeymonitoringRequest = SecretKeyHelper.CreateSecretKey(unixTime, new());

                monitoringRequest.AddHeader("SecretKey", secretKeymonitoringRequest);

                List<PodStatisticInfo> podStatisticsList = new List<PodStatisticInfo>();

                var tasks = new List<Task>();
                var statisticPodsList = new List<PodStatisticInfo>();
                string message = string.Empty;
                foreach (var server in challengeHostServer)
                {
                    await Task.Delay(50);
                    tasks.Add(Task.Run(async () =>
                    {
                        try
                        {
                            var statRequest = new RestRequest();
                            statRequest.Method = Method.Post;
                            statRequest.Resource = "api/performance/monitoring";

                            long unixTime = DateTimeHelper.GetDateTimeNowInUnix();
                            Dictionary<string, object> DictMultiService = new Dictionary<string, object>()
                            {
                                { "UnixTime",unixTime }
                            };

                            string secretKeyStartChallenge = SecretKeyHelper.CreateSecretKey(unixTime, new());

                            statRequest.AddHeader("SecretKey", secretKeyStartChallenge);

                            string baseDeployUrl = server.ServerHost + ":" + server.ServerPort;
                            MultiServiceConnector multiServiceDeployConnector = new MultiServiceConnector(baseDeployUrl);
                            var startResult
                              = await multiServiceDeployConnector.ExecuteRequest<GenaralViewResponseData<List<PodStatisticInfo>>>(statRequest, DictMultiService, RequestContentType.Form);

                            if (startResult != null && startResult.data != null && startResult.data.Count > 0)
                            {
                                var deployment = startResult.data;
                                lock (statisticPodsList) // Lock để tránh xung đột khi truy cập vào danh sách
                                {
                                    statisticPodsList.AddRange(deployment);
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            await Console.Out.WriteLineAsync(ex.Message);
                        }

                    }));
                }

                await Task.WhenAll(tasks);
                return Ok(new GenaralViewResponseData<List<PodStatisticInfo>>()
                {
                    Message = "Get Statistic Successfull",
                    IsSuccess = true,
                    data = statisticPodsList
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new GeneralView
                {
                    Message = ex.InnerException != null ? ex.InnerException.Message : ex.Message,
                    IsSuccess = false
                });
            }
        }

        [HttpPost("estimate")]
        public async Task<IActionResult> EstimateResource([FromForm] List<int> ChallengeIdList, [FromForm] int TeamCount)
        {
            try
            {
                RedisHelper redisHelper = new RedisHelper(_connectionMultiplexer);

                var challengeHostServer = ControlCenterServiceConfig.ChallengeServerInfoList;
                if (challengeHostServer == null) return BadRequest(new GeneralView()
                {
                    Message = "ChallengeHostServer is null, check config machine id",
                    IsSuccess = false
                });

                List<PodStatisticInfo> challengePerformanceList = new List<PodStatisticInfo>();

                List<Task> tasks = new List<Task>();
                string message = "";
                foreach (var challengeId in ChallengeIdList)
                {
                    // Set giá trị cho redis deploy key
                    string redisDeployKey = $"{RedisConfigs.RedisDeployKey}{challengeId}";

                    // Get value từ redis deploy key
                    var redisGetDeployInfo = await redisHelper.GetFromCacheAsync<DeploymentInfo>(redisDeployKey);

                    if (redisGetDeployInfo == null)
                    {
                        message += $"Challenge {challengeId} not yet deployed. \n";
                        continue;
                    }

                    string serverId = redisGetDeployInfo.ServerId;

                    var challengeServer = challengeHostServer.FirstOrDefault(p => p.ServerId == serverId);

                    if (challengeServer == null)
                    {
                        message += $"Challenge {challengeId} not yet deployed. \n";
                        continue;
                    }
                    // Tạo Task cho mỗi ChallengeId và thêm vào danh sách

                    tasks.Add(Task.Run(async () =>
                    {
                        try
                        {
                            var statRequest = new RestRequest();
                            statRequest.Method = Method.Post;
                            statRequest.Resource = "api/performance/challengePerformance";

                            long unixTime = DateTimeHelper.GetDateTimeNowInUnix();
                            Dictionary<string, object> DictMultiService = new Dictionary<string, object>()
                                {
                                    { "UnixTime",unixTime },
                                    { "ChallengeId", challengeId.ToString()}
                                };

                            Dictionary<string, string> DictSercretKey = new Dictionary<string, string>()
                                {
                                    { "ChallengeId", challengeId.ToString()}
                                };

                            string secretKeyStartChallenge = SecretKeyHelper.CreateSecretKey(unixTime, DictSercretKey);

                            statRequest.AddHeader("SecretKey", secretKeyStartChallenge);

                            string baseDeployUrl = challengeServer.ServerHost + ":" + challengeServer.ServerPort;
                            MultiServiceConnector multiServiceDeployConnector = new MultiServiceConnector(baseDeployUrl);
                            var result
                              = await multiServiceDeployConnector.ExecuteRequest<GenaralViewResponseData<PodStatisticInfo>>(statRequest, DictMultiService, RequestContentType.Form);

                            if (result != null && result.data != null)
                            {
                                var challengePerformance = result.data;
                                lock (challengePerformanceList) // Lock để tránh xung đột khi truy cập vào danh sách
                                {
                                    challengePerformanceList.Add(challengePerformance);
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            await Console.Out.WriteLineAsync(ex.Message);
                        }
                    }));
                }
                message += "Get all challenge performance";
                await Task.WhenAll(tasks);

                if (challengePerformanceList.Count <= 0)
                {
                    return BadRequest(new GeneralView()
                    {
                        Message = "Can't get statistic all challenge to estimate",
                        IsSuccess = false,
                    });
                }

                int maxInstanceAtTime = challengePerformanceList.Count >= ServiceConfigs.MaxInstanceAtTime
                                        ? ServiceConfigs.MaxInstanceAtTime : challengePerformanceList.Count;

                var topCpuUsage = challengePerformanceList.OrderByDescending(p => p.CpuUsage).Take(maxInstanceAtTime).ToList();

                var topRamUsage = challengePerformanceList.OrderByDescending(p => p.RAMUsage).Take(maxInstanceAtTime).ToList();

                EstimationInfo estimationInfo = new EstimationInfo();
                estimationInfo.TopCPUUsage = topCpuUsage;
                estimationInfo.TopRAMUsage = topRamUsage;

                double minCPUUsageNeed = (double)topCpuUsage.Sum(p => p.CpuUsage) / Math.Pow(10, 9);

                double minRAMUsageNeed = (double)topRamUsage.Sum(p => p.RAMUsage) / Math.Pow(1024, 2);

                minCPUUsageNeed = minCPUUsageNeed * TeamCount;

                minRAMUsageNeed = minRAMUsageNeed * TeamCount;

                estimationInfo.MinCPUUsageNeed = Math.Ceiling(minCPUUsageNeed);

                estimationInfo.MinRAMUsageNeed = Math.Round(minRAMUsageNeed, 2);

                estimationInfo.RecommendCPUUsageNeed = Math.Ceiling(minCPUUsageNeed * 1.3);

                estimationInfo.RecommendRAMUsageNeed = Math.Round(minRAMUsageNeed * 1.3, 2);


                return Ok(new GenaralViewResponseData<EstimationInfo>()
                {
                    Message = message,
                    IsSuccess = true,
                    data = estimationInfo
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new GeneralView
                {
                    Message = ex.InnerException != null ? ex.InnerException.Message : ex.Message,
                    IsSuccess = false
                });
            }
        }
    }
}

