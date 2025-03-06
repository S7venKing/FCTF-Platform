using ControlCenterServer.DTOs.ChallengeDTOs;
using ResourceShared.Configs;
using ResourceShared.Models;
using ResourceShared.Utils;

namespace ControlCenterServer.Configs
{
    public class ControlCenterConfigHelper : SharedConfig
    {
        public override void InitConfig()
        {
            base.InitConfig();

            // add challenge server from appsettings config to challenge server list config
            var challengeServerSection = configuration.GetSection("ChallengeServer").GetChildren();
            foreach (var serverSection in challengeServerSection)
            {
                var serverPath = serverSection.Path;
                var serverConfig = new ChallengeServerInfo
                {
                    ServerId = serverSection["ServerId"] ?? throw new Exception($"ServerId is missing in {serverPath}"),
                    ServerName = serverSection["ServerName"] ?? throw new Exception($"Server name is missing in {serverPath}"),
                    ServerPort = int.TryParse(serverSection["ServerPort"], out var port) ? port : throw new Exception($"Invalid Port in {serverPath}"),
                    ServerHost = serverSection["ServerHost"] ?? throw new Exception($"Server host is missing in {serverPath}"),
                };
                ControlCenterServiceConfig.ChallengeServerInfoList.Add(serverConfig);

                ServiceConfigs.MaxInstanceAtTime = int.TryParse(configuration["ServiceConfigs:MaxInstanceAtTime"], out var maxInstance)
                    ? maxInstance
                    : throw new Exception("Invalid or missing configuration: ServiceConfig:MaxInstanceAtTime");
            }
        }
    }
}
