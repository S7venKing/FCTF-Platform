namespace ChallengeManagementServer.K8sServerResponse.ClusterAllocateResponseDTO
{
    public class ClusterAllocateResponseInfo
    {
        public string Kind { get; set; } = string.Empty;
        public string ApiVersion { get; set; } = string.Empty;
        public Status Status { get; set; } = new Status();
    }

    public class Status
    {
        public Capacity Capacity { get; set; } = new Capacity();
        public Allocatable Allocatable { get; set; } = new Allocatable();
    }

    public class Capacity
    {
        public string Cpu { get; set; } = string.Empty;
        public string Ephemeralstorage { get; set; } = string.Empty;
        public string Hugepages1Gi { get; set; } = string.Empty;
        public string Hugepages2Mi { get; set; } = string.Empty;
        public string Memory { get; set; } = string.Empty;
        public string Pods { get; set; } = string.Empty;
    }

    public class Allocatable
    {
        public string Cpu { get; set; } = string.Empty;
        public string Ephemeralstorage { get; set; } = string.Empty;
        public string Hugepages1Gi { get; set; } = string.Empty;
        public string Hugepages2Mi { get; set; } = string.Empty;
        public string Memory { get; set; } = string.Empty;
        public string Pods { get; set; } = string.Empty;
    }

}
