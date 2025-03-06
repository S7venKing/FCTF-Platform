using ChallengeManagementServer.Configs;
using ChallengeManagementServer.Middlewares;
using ChallengeManagementServer.ServiceInterfaces;
using ChallengeManagementServer.Utils;
using Microsoft.AspNetCore.Mvc;
using ResourceShared.Configs;
using ResourceShared.DTOs;
using ResourceShared.Models;
using ResourceShared.ResponseViews;
using ResourceShared.Utils;
using SocialSync.Shared.Utils.ResourceShared.Utils;
using StackExchange.Redis;


namespace ChallengeManagementServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [RequireSecretKey]
    public class ChallengeController : ControllerBase
    {
        private readonly IChallengeService _challengeService;
        private readonly IConnectionMultiplexer _connectionMultiplexer;

        public ChallengeController(IChallengeService challengeService, IConnectionMultiplexer connectionMultiplexer)
        {
            _challengeService = challengeService;
            _connectionMultiplexer = connectionMultiplexer;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile([FromForm] int ChallengeId, [FromForm] IFormFile file)
        {
            await Console.Out.WriteLineAsync("Received Upload file for challenge " + ChallengeId);

            try
            {
                RedisHelper redisHelper = new RedisHelper(_connectionMultiplexer);

                // Stop cac instance đang chạy và xóa cache
                var deploymentList = await redisHelper.GetFromCacheAsync<List<DeploymentInfo>>(RedisConfigs.RedisChallengeDeploymentListKey);
                deploymentList = deploymentList?.Where(c => c.ChallengeId == ChallengeId).ToList();

                if (deploymentList != null && deploymentList.Count > 0)
                {
                    await Console.Out.WriteLineAsync("Co instance dang chay");
                    foreach (var deployment in deploymentList)
                    {
                        await Console.Out.WriteLineAsync($"Check deploymentList {deployment.TeamId} - {deployment.ChallengeId}");

                        await StopChallengeAsync(ChallengeId, deployment.TeamId);
                        await Task.Delay(3000);
                    }
                }

                // Deploy
                await Console.Out.WriteLineAsync("Starting Save File");
                await _challengeService.SaveFileAsync(ChallengeId, file);

                _ = Task.Run(async () =>
                {
                    try
                    {
                        await _challengeService.BuildDeployAndUpdatetoCDAsync(ChallengeId);
                    }
                    catch (Exception ex)
                    {
                        await Console.Out.WriteLineAsync("Error in background task: " + ex.Message);
                        #region Update challenge status to CTFd
                        await _challengeService.UpdateChallengeStatusToCTFd(ChallengeId, ex.Message, "DEPLOY_FAILED");
                        #endregion
                    }
                });

                return Ok(new GeneralView
                {
                    Message = "Upload Success. Just waiting deploying",
                    IsSuccess = true,
                });
            }
            catch (Exception ex)
            {
                await Console.Out.WriteLineAsync("Error in Upload file: " + ex.Message);
                await _challengeService.UpdateChallengeStatusToCTFd(ChallengeId, ex.Message, "DEPLOY_FAILED");
                await Console.Out.WriteLineAsync(ex.Message);
                return BadRequest(new GeneralView { Message = ex.Message, IsSuccess = false });
            }
        }

        [HttpPost("delete")]
        public async Task<IActionResult> DeleteChallenge([FromForm] int ChallengeId)
        {
            try
            {
                //Đưa toàn bộ xly vào task bởi vì không cần quan tâm kết quả của task
                _ = Task.Run(async () =>
                {
                    await Console.Out.WriteLineAsync("Receive request delete challenge from control center");
                    K8sHelper k8SHelper = new K8sHelper(ChallengeId, _connectionMultiplexer);
                    RedisHelper redisHelper = new RedisHelper(_connectionMultiplexer);

                    var deploymentList = await redisHelper.GetFromCacheAsync<List<DeploymentInfo>>(RedisConfigs.RedisChallengeDeploymentListKey);
                    deploymentList = deploymentList?.Where(c => c.ChallengeId == ChallengeId).ToList();

                    if (deploymentList != null && deploymentList.Count > 0)
                    {
                        _ = Task.Run(async () =>
                        {
                            foreach (var deployment in deploymentList)
                            {
                                await StopChallengeAsync(ChallengeId, deployment.TeamId);
                            }

                            string ChallengeFolderPath = Path.Combine(ChallengeManagePathConfigs.ChallengeBasePath, $"{ChallengeManagePathConfigs.ChallengeRootName}-{ChallengeId}");
                            if (Directory.Exists(ChallengeFolderPath))
                            {
                                await CmdHelper.ExecuteBashCommandAsync("", $"chmod -R 777 \"{ChallengeFolderPath}\"", false);
                                Directory.Delete(ChallengeFolderPath, true);
                            }
                            await k8SHelper.RemoveImageFromDiskAsync();
                        });
                    }
                    else
                    {
                        _ = Task.Run(async () =>
                        {
                            await StopChallengeAsync(ChallengeId, -1);
                            string extractionDistPath = Path.Combine(ChallengeManagePathConfigs.ChallengeBasePath, $"{ChallengeManagePathConfigs.ChallengeRootName}-{ChallengeId}");
                            await k8SHelper.RemoveImageFromDiskAsync();
                            if (Directory.Exists(extractionDistPath))
                            {
                                await CmdHelper.ExecuteBashCommandAsync("", $"chmod -R 777 \"{extractionDistPath}\"", false);
                                Directory.Delete(extractionDistPath, true);
                            }
                        });
                    }
                });

                //Trick để mất warining thôi :v
                await Task.Delay(0);
                return Ok(new GeneralView { IsSuccess = true, Message = $"Deleted Challenge {ChallengeId}" });
            }
            catch (Exception ex)
            {
                return BadRequest(new GeneralView { IsSuccess = false, Message = ex.Message });
            }

        }

        [HttpPost("start")]
        public async Task<IActionResult> StartChallengeInstance([FromForm] StartChallengeInstanceRequest instance)
        {
            try
            {
                await Console.Out.WriteLineAsync($"Get Request Start Challenge for team {instance.TeamId}");
                await Console.Out.WriteLineAsync($"Time limit {instance.TimeLimit}");

                string teamName = instance.TeamId.ToString();

                if (instance.TeamId == -1)
                {
                    teamName = "preview";
                }

                string instanceURL = await _challengeService.StartAsync(instance.ChallengeId, instance.TeamId);

                DateTime? endTime = DateTime.Now.AddMinutes(instance.TimeLimit);

                if (instance.TeamId == -1 || instance.TimeLimit == -1)
                {
                    endTime = null;
                }
                else
                {
                    endTime = DateTime.Now.AddMinutes(instance.TimeLimit);
                    //_ = Task.Run(async () =>
                    //{
                    //    K8sHelper k8SHelper = new K8sHelper(instance.ChallengeId, _connectionMultiplexer);
                    //    RedisHelper redisHelper = new RedisHelper(_connectionMultiplexer);
                    //    // Wait for the specified time limit
                    //    await Task.Delay(TimeSpan.FromMinutes(instance.TimeLimit));

                    //    // Stop the challenge instance after the time limit
                    //    await Console.Out.WriteLineAsync($"Team {instance.TeamId} Het thoi gian thi cho challenge {instance.ChallengeId}");

                    //    await StopChallengeDeleteDeploymentAndCache(instance.ChallengeId, instance.TeamId);
                    //});

                    //await Console.Out.WriteLineAsync(endTime);
                }

                return Ok(new GenaralViewResponseData<DeploymentInfo>
                {
                    Message = $"Start Challenge {instance.ChallengeId} Instance Success for team {teamName}",
                    IsSuccess = true,
                    data = new DeploymentInfo
                    {
                        ChallengeId = instance.ChallengeId,
                        TeamId = instance.TeamId,
                        DeploymentDomainName = instanceURL,
                        ServerId = MachineConfigs.ServerId,
                        EndTime = endTime,
                    },
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new GeneralView
                {
                    Message = "An error occurred while processing your request." + ex.Message,
                    IsSuccess = false
                });
            }
        }

        [HttpPost("stop")]
        public async Task<IActionResult> StopChallengeInstance([FromForm] StopChallengeInstanceRequest instance)
        {
            try
            {
                string teamName = instance.TeamId.ToString();

                if (instance.TeamId == -1)
                {
                    teamName = "preview";
                }

                await StopChallengeAsync(instance.ChallengeId, instance.TeamId);

                return Ok(new GeneralView
                {
                    Message = $"Stop Challenge {instance.ChallengeId} Instance Success for team {teamName}",
                    IsSuccess = true,
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new GeneralView
                {
                    Message = "An error occurred while processing your request." + ex.Message,
                    IsSuccess = false
                });
            }
        }

        private async Task StopChallengeAsync(int ChallengeId, int TeamId)
        {
            try
            {
                _ = await _challengeService.StopAsync(ChallengeId, TeamId);

                RedisHelper redisHelper = new RedisHelper(_connectionMultiplexer);
                var deploymentList = await redisHelper.GetFromCacheAsync<List<DeploymentInfo>>(RedisConfigs.RedisChallengeDeploymentListKey);

                if (deploymentList != null && deploymentList.Count > 0)
                {
                    var deploymentListInstance = deploymentList?.Where(p => p.ChallengeId == ChallengeId && p.TeamId == TeamId).ToList();
                    if (deploymentListInstance != null && deploymentListInstance.Count > 0)
                    {
                        deploymentList?.RemoveAll(p => p.ChallengeId == ChallengeId && p.TeamId == TeamId);
                        await redisHelper.SetCacheAsync(RedisConfigs.RedisChallengeDeploymentListKey, deploymentList, TimeSpan.FromDays(90));
                    }
                }
            }
            catch (Exception ex)
            {
                await Console.Out.WriteLineAsync("Exception when stop and delete deployment " + ex.Message);
                throw;
            }
        }

        [HttpPost("getLogInstance")]
        // TODO
        public async Task<IActionResult> GetLogInstance([FromForm] int ChallengeId, [FromBody] int TeamId)
        {
            try
            {
                _ = await _challengeService.GetDeploymentLogsAsync(ChallengeId, TeamId);
                throw new NotImplementedException();
            }
            catch (Exception ex)
            {
                return BadRequest(new GeneralView
                {
                    Message = "An error occurred while processing your request." + ex.Message,
                    IsSuccess = false
                });
            }
        }

    }
}
