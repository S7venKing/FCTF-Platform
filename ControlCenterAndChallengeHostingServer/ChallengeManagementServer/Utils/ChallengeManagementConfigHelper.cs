using ChallengeManagementServer.K8sServerResponse.ClusterAllocateResponseDTO;
using Newtonsoft.Json;
using ResourceShared.Configs;
using ResourceShared.Utils;

namespace ChallengeManagementServer.Configs
{
    public class ChallengeManagementConfigHelper : SharedConfig
    {
        public override async void InitConfig()
        {
            base.InitConfig();
            // add challenge server from appsettings config to challenge server list config
            ChallengeManagePathConfigs.ChallengeBasePath = configuration["ChallengeConfigs:ChallengeBasePath"] ?? throw new Exception("ChallengeConfigs:ChallengeBasePath");
            MachineConfigs.ServerId = configuration["ServiceConfigs:ServerId"] ?? throw new Exception("ServiceConfigs:ServerId");
            ServiceConfigs.K8sPort = configuration["ServiceConfigs:K8sPort"] ?? throw new Exception("ServiceConfigs:K8sPort");
            ServiceConfigs.CTFdBaseUrl = configuration["ServiceConfigs:BaseCTFdURL"] ?? throw new Exception("ServiceConfigs:BaseCTFdURL");
            CmdHelper.ChallengeBasePath = ChallengeManagePathConfigs.ChallengeBasePath;

            //ClusterAllocateResponseInfo clusterAllocate = await GetClusterAllocate();
            //KCTFUsageConfig.CPUAllocatable = long.TryParse(clusterAllocate.Status.Allocatable.Cpu, out var cpuAllocatable)
            //    ? cpuAllocatable
            //    : throw new Exception("Invalid or missing configuration: KCTFUsageConfig:CPUAllocatable");

            //string memoryInKi = clusterAllocate.Status.Allocatable.Memory;

            ////Extract the numeric value and convert to long
            //long memoryInKiLong = long.TryParse(memoryInKi.Replace("Ki", ""), out var memoryAllocatable) ? memoryAllocatable
            //    : throw new Exception("Invalid or missing configuration MemoryAllocatable");

            //KCTFUsageConfig.MemoryAllocatable = memoryInKiLong;

        }

        //private async Task<ClusterAllocateResponseInfo> GetClusterAllocate()
        //{
        //    try
        //    {
        //        #region get cluster statistice usage
        //        string ServicePath = $"/api/v1/nodes/kctf-cluster-control-plane";
        //        MultiServiceConnector connector = new MultiServiceConnector($"http://localhost:{ServiceConfigs.K8sPort}");
        //        string getJsonClusterStatistic
        //                = await connector.ExecuteNormalRequest(ServicePath, RestSharp.Method.Get, new(), RequestContentType.Query) ?? "";
        //        var clusterAllocate = JsonConvert.DeserializeObject<ClusterAllocateResponseInfo>(getJsonClusterStatistic);
        //        if (clusterAllocate == null || clusterAllocate.Status == null || clusterAllocate.Status.Allocatable == null)
        //        {
        //            throw new Exception("Get Cluster Allocatable failed");
        //        }
        //        #endregion get cluster statistice usage

        //        #region mapping data

        //        #endregion

        //        return clusterAllocate;
        //    }
        //    catch (Exception ex)
        //    {
        //        await Console.Out.WriteLineAsync(ex.Message);
        //        throw;
        //    }
        //}


    }
}
