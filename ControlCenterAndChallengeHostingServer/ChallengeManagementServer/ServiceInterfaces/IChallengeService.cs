using StackExchange.Redis;

namespace ChallengeManagementServer.ServiceInterfaces
{
    public interface IChallengeService
    {
        public Task<bool> SaveFileAsync(int ChallengeId, IFormFile file);

        // Trả ra image link
        // Nếu không trả ra image link => build challenge fail
        public Task BuildDeployAndUpdatetoCDAsync(int ChallengeId);

        // Method use to run instance challenge by challenge id
        // If TeamId = -1, run preview instance for challenge writter 
        public Task<string> StartAsync(int ChallengeId, int TeamId);

        // Method use to run instance challenge by challenge id
        // If TeamId = -1, run preview instance for challenge writter 
        public Task<bool> StopAsync(int ChallengeId, int TeamId);
 
        public Task<string> GetDeploymentLogsAsync(int ChallengeId, int TeamId);

        public Task UpdateChallengeStatusToCTFd(int ChallengeId, string DeployLogs, string status, string ImageLink = "{}");

    }
}
